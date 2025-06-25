import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const client = new ImageAnnotatorClient({
  keyFilename: path.join(__dirname, 'src', 'assets', 'ocr.json'),
});

const FIELD_CONFIG = {
  mothersName: {
    patterns: ['mother\'s name', 'mothers name', 'name of infant', 'maternal name'],
    extractRegex: /mother'?s? name:\s*([^\n]+)/i,
    valuePattern: /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/,
    contextExclusions: ['details', 'sheet', 'form'],
  },
  patientId: {
    patterns: ['patient id', 'hosp id', 'mr#', 'case no'],
    extractRegex: /(?:patient id|medical record|mr#|case no):\s*([A-Z0-9\-]+)/i,
    valuePattern: /[A-Z0-9\-]{6,}/,
    contextExclusions: ['hospital', 'pvt', 'ltd'],
  },
  gestation: {
    patterns: ['gestation', 'gestational age', 'ga'],
    extractRegex: /(?:gestation|gestational age|ga):\s*(\d+\s*weeks?)/i,
    valuePattern: /\d+\s*weeks?/i,
  },
  bedPosition: {
    patterns: ['bed', 'bed position', 'location'],
    extractRegex: /(?:bed|bed position|location):\s*([A-Z0-9]+)/i,
    valuePattern: /[A-Z0-9]+/,
  },
  assignedNurse: {
    patterns: ['assigned nurse', 'primary nurse', 'nurse'],
    extractRegex: /(?:assigned nurse|primary nurse|nurse):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    valuePattern: /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/,
    contextExclusions: ['sheet', 'assessment'],
  }
};

const IGNORE_SECTIONS = [
  'hospital name',
  'diagnosis',
  'assessment sheet',
  'maternal details',
  'provisional diagnosis',
  'final diagnosis',
];

app.post('/ocr', async (req, res) => {
  const start = Date.now();
  console.log('\n--- OCR API CALLED ---');

  try {
    console.log('1️⃣ Decoding image...');
    const decodeStart = Date.now();
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });

    const base64Data = imageBase64.split(',')[1];
    console.log(`✅ Image decoding took ${Date.now() - decodeStart}ms`);

    console.log('2️⃣ Performing OCR...');
    const ocrStart = Date.now();
    const [result] = await client.textDetection({ image: { content: base64Data } });
    const ocrTime = Date.now() - ocrStart;
    console.log(`✅ OCR completed in ${ocrTime}ms`);

    const text = result.textAnnotations?.[0]?.description || '';

    console.log('3️⃣ Parsing structured data...');
    const parseStart = Date.now();
    const { structuredData, debugInfo, confidence } = await parseStructuredData(text);
    const parseTime = Date.now() - parseStart;
    console.log(`✅ Parsing completed in ${parseTime}ms`);

    const totalTime = Date.now() - start;
    console.log(`🎯 TOTAL TIME: ${totalTime}ms`);
    console.log('🔍 Structured Data:', structuredData);

    res.json({ text, structuredData, debugInfo, confidence, timings: { ocrTime, parseTime, totalTime } });
  } catch (err) {
    console.error('❌ Error in OCR API:', err);
    res.status(500).json({ error: 'Processing failed' });
  }
});

async function parseStructuredData(text) {
  const result = {};
  const confidence = {};
  const debugInfo = {};
  const missingFields = [];

  const lines = text.split('\n');
  let currentSection = null;

  const filteredLines = lines.filter(line => {
    const lower = line.toLowerCase().trim();
    for (const section of IGNORE_SECTIONS) {
      if (lower.includes(section)) {
        currentSection = section;
        return false;
      }
    }
    if (currentSection && lower) return false;
    if (!lower) currentSection = null;
    return true;
  });

  for (const [field, config] of Object.entries(FIELD_CONFIG)) {
    let found = false;

    for (const line of filteredLines) {
      const lower = line.toLowerCase();

      if (config.contextExclusions?.some(ex => lower.includes(ex))) continue;

      const match = line.match(config.extractRegex);
      if (match && match[1]) {
        result[field] = match[1].trim();
        confidence[field] = 1.0;
        debugInfo[field] = { source: 'direct', line };
        found = true;
        break;
      }

      if (!found) {
        for (const pattern of config.patterns) {
          const index = lower.indexOf(pattern.toLowerCase());
          if (index >= 0) {
            const value = line.slice(index + pattern.length).replace(/^[:\s\-]+/, '').trim();
            if (value && config.valuePattern.test(value)) {
              result[field] = value;
              confidence[field] = 0.8;
              debugInfo[field] = { source: 'pattern', line };
              found = true;
              break;
            }
          }
        }
      }

      if (found) break;
    }

    if (!found) missingFields.push(field);
  }

  if (missingFields.length > 0) {
    console.log(`⚠️ Missing fields: ${missingFields.join(', ')}`);
    console.log('🧠 Calling Ollama to infer missing fields...');
    const ollamaStart = Date.now();
    const gptResults = await getValuesFromOllama(text, missingFields);
    console.log(`✅ Ollama returned in ${Date.now() - ollamaStart}ms`);

    for (const field of missingFields) {
      const value = gptResults[field] || '';
      result[field] = value;
      confidence[field] = value ? 0.6 : 0.0;
      debugInfo[field] = { source: value ? 'ollama' : 'not found' };
    }
  }

  return { structuredData: result, confidence, debugInfo };
}

// async function getValuesFromOllama(text, fields) {
//    const prompt = `
//     You are an expert in analyzing medical admission forms, particularly for neonatal patients.
    
//     Your task is to extract the following fields from the admission form text below. Note that formats may vary across hospitals, and some fields may be implied rather than explicitly labeled.
    
//     Instructions:
//     - mothersName: Usually labeled as "Mother's Name". However, in neonatal admission forms, the patient's name often refers to the mother. If "Mother's Name" is not explicitly mentioned but "Patient's Name" is present, infer it as the mother's name.
//     - patientId: Usually labeled as "MRD No.", "Patient ID", etc. Clean the value by removing extra dots or formatting characters. Example: "MRD No....2.8.34 567..." should be returned as "2.8.34 567".
//     - gestation: Indicates gestational age (e.g., "28 weeks", "28"). It is **often close to the age field** and usually between 24–40. Do not confuse with room or bed numbers.
//     - bedPosition: Usually labeled "Room No.", "Bed No.", etc. If a number appears after such labels, treat it as the bed position. Do not confuse this with gestational age.
//     - assignedNurse: A name or code that often follows "Assigned Nurse", "Nurse", or "Caregiver". If not labeled, try to infer the name if a possible candidate appears near those terms.
    
//     Text:
//     ${text}
    
//     If any field is missing from the text, try to infer its value contextually. Otherwise, return it as an empty string.
    
//     Return ONLY a valid JSON object with fields: ${fields.join(', ')}.
//     `;
//   try {
//     const response = await fetch('http://192.168.0.113:11434/api/generate', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ model: 'mistral', prompt, stream: false }),
//     });

//     const data = await response.json();
//     return JSON.parse(data.response.trim());
//   } catch (err) {
//     console.error('❌ Ollama failed:', err);
//     return {};
//   }
// }


export const getValuesFromOllama = async (text, missingFields) => {
  const fields = ['mothersName', 'patientId', 'gestation', 'bedPosition', 'assignedNurse'];

  const topLines = text.split('\n').slice(0, 15).join('\n'); // Only use the top 15 lines to reduce load

  const prompt = `
You are a medical assistant AI. Extract the following fields from the patient monitoring report:

- mothersName
- patientId
- gestation
- bedPosition
- assignedNurse

The report text:
"""
${topLines}
"""

Return only the JSON object with keys: ${fields.join(', ')}.
Only include values if they are present. If unknown, use an empty string.
`;

  console.log('🤖 Calling Ollama with model: mistral');
  const ollamaStart = Date.now();

  try {
    const response = await fetch('http://192.168.0.113:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt,
        stream: false,
      }),
    });

    const duration = Date.now() - ollamaStart;
    console.log(`✅ Ollama returned in ${duration}ms`);

    const data = await response.json();
    const responseText = data.response;

    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    const jsonString = responseText.substring(jsonStart, jsonEnd + 1);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error('❌ Error in getValuesFromOllama:', error);
    return {};
  }
};

app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
