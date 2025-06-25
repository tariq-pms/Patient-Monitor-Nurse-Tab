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
    patterns: ['mother\'s name', 'Mothers Name', 'Name of Infant', 'Patient Name'],
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
  dob: {
    patterns: ['dob', 'date of birth', 'birth date'],
    extractRegex: /(?:dob|date of birth|birth date):?\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4})/i,
    valuePattern: /\d{2}[-/]\d{2}[-/]\d{4}/,
  },
  
  gender: {
    patterns: ['gender', 'sex'],
    extractRegex: /(?:gender|sex):?\s*(male|female|m|f)/i,
    valuePattern: /^(male|female|m|f)$/i,
  },
  
};

const IGNORE_SECTIONS = [
  'hospital name',
  'diagnosis',
  'assessment sheet',
  'maternal details',
  'provisional diagnosis',
  'final diagnosis',
];

// OCR for Admission Forms
// app.post('/ocr', async (req, res) => {
//   const start = Date.now();
//   console.log('\n--- OCR API CALLED ---');

//   try {
//     const { imageBase64 } = req.body;
//     if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' });

//     const base64Data = imageBase64.split(',')[1];

//     const [result] = await client.textDetection({ image: { content: base64Data } });
//     const text = result.textAnnotations?.[0]?.description || '';

//     const { structuredData, debugInfo, confidence } = await parseStructuredData(text);

//     const totalTime = Date.now() - start;
//     res.json({ text, structuredData, debugInfo, confidence, timings: { totalTime } });
//   } catch (err) {
//     console.error('❌ Error in /ocr:', err);
//     res.status(500).json({ error: 'Processing failed' });
//   }
// });
app.post('/ocr', async (req, res) => {
  const start = Date.now();
  console.log('\n--- OCR API CALLED ---');

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      console.warn('⚠️ Missing imageBase64 in request body');
      return res.status(400).json({ error: 'Missing imageBase64' });
    }

    const base64Data = imageBase64.split(',')[1];
    console.log('📤 Image data received, sending to Vision API...');

    const [result] = await client.textDetection({ image: { content: base64Data } });
    const text = result.textAnnotations?.[0]?.description || '';
    console.log('📄 Extracted text:', text.slice(0, 200), '...');

    const { structuredData, debugInfo, confidence } = await parseStructuredData(text);
    console.log('✅ Structured data parsed:', structuredData);

    const totalTime = Date.now() - start;
    console.log(`⏱️ Total processing time: ${totalTime}ms`);
    res.json({ text, structuredData, debugInfo, confidence, timings: { totalTime } });
  } catch (err) {
    console.error('❌ Error in /ocr:', err);
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

  console.log('🔍 Filtered lines for parsing:', filteredLines);

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
        console.log(`🔧 Extracted ${field} (regex):`, result[field]);
        break;
      }

      for (const pattern of config.patterns) {
        const index = lower.indexOf(pattern.toLowerCase());
        if (index >= 0) {
          const value = line.slice(index + pattern.length).replace(/^[:\s\-]+/, '').trim();
          if (value && config.valuePattern.test(value)) {
            result[field] = value;
            confidence[field] = 0.8;
            debugInfo[field] = { source: 'pattern', line };
            found = true;
            console.log(`🔧 Extracted ${field} (pattern):`, result[field]);
            break;
          }
        }
      }

      if (found) break;
    }

    if (!found) {
      console.log(`❓ Missing field: ${field}`);
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    console.log('🧠 Attempting to fill missing fields using Ollama:', missingFields);
    const gptResults = await getValuesFromOllama(text, missingFields);
    for (const field of missingFields) {
      const value = gptResults[field] || '';
      result[field] = value;
      confidence[field] = value ? 0.6 : 0.0;
      debugInfo[field] = { source: value ? 'ollama' : 'not found' };
      console.log(`💡 Ollama filled ${field}:`, value);
    }
  }

  return { structuredData: result, confidence, debugInfo };
}


// === Ollama Integration for Missing Fields ===
// async function getValuesFromOllama(text, missingFields) {
//   const prompt = `
// You are an expert in analyzing neonatal admission forms.

// Your task is to extract these fields:
// - mothersName
// - patientId
// - dob
// - gender
// - gestation

// If a field is not directly mentioned, try to infer it. Otherwise, leave it empty.
// Return ONLY a valid JSON with keys: ${missingFields.join(', ')}

// Text:
// ${text}
// `;

//   try {
//     const response = await fetch('http://192.168.0.113:11434/api/generate', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         model: 'gemma:2b',
//         prompt,
//         stream: false,
//       }),
//     });

//     const data = await response.json();
//     const jsonStart = data.response.indexOf('{');
//     const jsonEnd = data.response.lastIndexOf('}');
//     const jsonString = data.response.substring(jsonStart, jsonEnd + 1);

//     return JSON.parse(jsonString);
//   } catch (error) {
//     console.error('❌ Ollama error:', error);
//     return {};
//   }
// }
async function getValuesFromOllama(text, missingFields) {
  const prompt = `
You are an expert in analyzing neonatal admission forms.

Your task is to extract these fields:
- mothersName
- patientId
- dob
- gender
- gestation

If a field is not directly mentioned, try to infer it. Otherwise, leave it empty.
Return ONLY a valid JSON with keys: ${missingFields.join(', ')}

Text:
${text}
`;

  try {
    console.log('🌐 Sending prompt to Ollama for fields:', missingFields);
    const response = await fetch('http://192.168.0.113:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    const jsonStart = data.response.indexOf('{');
    const jsonEnd = data.response.lastIndexOf('}');
    const jsonString = data.response.substring(jsonStart, jsonEnd + 1);

    console.log('🧾 Ollama response JSON:', jsonString);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('❌ Ollama error:', error);
    return {};
  }
}




// OCR for Lab Reports
app.post('/ocr-lab-report', async (req, res) => {
  const start = Date.now();
  try {
    console.log('\n--- OCR lab-report API CALLED ---');
    const { imageBase64 } = req.body;
    console.log('➡️ Received imageBase64:', !!imageBase64);

    if (!imageBase64) {
      console.warn('⚠️ Missing imageBase64 in request');
      return res.status(400).json({ error: 'Missing imageBase64' });
    }

    const base64Data = imageBase64.split(',')[1];
    console.log('🔍 Starting OCR text detection...');
    const [result] = await client.textDetection({ image: { content: base64Data } });

    const text = result.textAnnotations?.[0]?.description || '';
    console.log('📝 OCR extracted text:', text.slice(0, 200), '...');

    console.log('🔎 Attempting local parsing...');
    let labTable = tryLocalParsing(text);
    console.log('📋 Local parsing result:', labTable);

    if (!labTable.length) {
      console.log('⚙️ Local parsing failed — falling back to AI parsing...');
      labTable = await parseWithAI(text);
      console.log('🤖 AI parsing result:', labTable);
    }

    const totalTime = `${Date.now() - start}ms`;
    console.log('✅ Processing complete. Total time:', totalTime);
    res.json({
      text,
      table: labTable,
      processingTime: totalTime,
    });

  } catch (err) {
    console.error('❌ Error in /ocr-lab-report:', err);
    res.status(500).json({ error: 'Failed to process lab report' });
  }
});

// function tryLocalParsing(text) {
//   console.log('🧪 Running tryLocalParsing...');
//   const results = [];
//   const lines = text.split('\n')
//     .map(line => line.trim())
//     .filter(line => line.length > 0);

//   console.log(`📄 Total non-empty lines: ${lines.length}`);

//   for (let i = 0; i < lines.length - 3; i++) {
//     if (
//       lines[i].match(/[a-zA-Z]/) &&         // Test name
//       lines[i + 1].match(/[\d\.]/) &&       // Result
//       lines[i + 2].match(/[a-zA-Z%]/) &&    // Unit
//       lines[i + 3].match(/[\d\-]/)          // Reference range
//     ) {
//       const parsed = {
//         test: lines[i],
//         result: lines[i + 1],
//         unit: lines[i + 2],
//         referenceRange: lines[i + 3]
//       };
//       console.log('🧾 Parsed test block:', parsed);
//       results.push(parsed);
//       i += 3;
//     }
//   }
//   return results;
// }
function tryLocalParsing(text) {
  const results = [];
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Strict validation patterns
  const testNamePattern = /^[A-Za-z][A-Za-z\s\/\-]+$/; // Letters, spaces, /, -
  const resultPattern = /^[\d\.]+$/;                  // Numbers and decimals
  const unitPattern = /^(g\/dL|%|million\/μL|×10\^3\/μL)$/i; // Common lab units
  const rangePattern = /^[\d\.]+\s*-\s*[\d\.]+$/;     // 12.0-15.0 format

  for (let i = 0; i < lines.length - 3; i++) {
    if (testNamePattern.test(lines[i]) &&      // Strict test name check
        resultPattern.test(lines[i+1]) &&      // Numeric result
        unitPattern.test(lines[i+2]) &&        // Valid unit
        rangePattern.test(lines[i+3])) {       // Valid reference range
      
      results.push({
        test: lines[i],
        result: lines[i+1],
        unit: lines[i+2],
        referenceRange: lines[i+3]
      });
      i += 3; // Skip processed lines
    }
  }
  return results;
}
async function parseWithAI(text) {
  console.log('🧠 Calling AI model for parsing...');
  const prompt = `Extract lab tests from this text and return ONLY JSON:
[
  {"test":"TestName","result":"Value","unit":"Unit","referenceRange":"Range"}
]

Data:
${text.split('\n').filter(l => l.trim()).join('\n')}`;

  try {
    const response = await fetch('http://192.168.0.113:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt,
        stream: false,
        options: { temperature: 0.1 }
      }),
    });

    console.log('📨 Sent request to Ollama AI model...');
    const data = await response.json();
    console.log('📥 Received response from AI:', data.response.slice(0, 300), '...');

    const raw = data.response.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(raw);
      console.log('✅ Parsed AI JSON successfully');
      return Array.isArray(parsed) ? parsed : [];
    } catch (jsonErr) {
      console.error('❌ Failed to parse AI JSON:', jsonErr);
      return [];
    }

  } catch (fetchErr) {
    console.error('❌ Failed to fetch from AI service:', fetchErr);
    return [];
  }
}

// === Lab Report Parser ===
// async function parseLabReportToTable(text) {
//   const prompt = `
// You are an expert in analyzing lab reports.
// From the following text, extract tabular data with:
// - test
// - result
// - unit
// - referenceRange

// Return ONLY a valid JSON array like:
// [
//   { "test": "Hemoglobin", "result": "13.2", "unit": "g/dL", "referenceRange": "12-16" },
//   ...
// ]

// Lab Report:
// ${text}
// `;

//   try {
//     const response = await fetch('http://192.168.0.113:11434/api/generate', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         model: 'gemma:2b',
//         prompt,
//         stream: false,
//       }),
//     });

//     const data = await response.json();
//     const jsonStart = data.response.indexOf('[');
//     const jsonEnd = data.response.lastIndexOf(']');
//     const jsonString = data.response.substring(jsonStart, jsonEnd + 1);

//     return JSON.parse(jsonString);
//   } catch (error) {
//     console.error('❌ Lab report parsing error:', error);
//     return [];
//   }
// }
// async function parseLabReportToTable(text) {
//   console.log('🔍 Starting parseLabReportToTable...');
  
//   const prompt = `
// You are an expert in analyzing lab reports.
// From the following text, extract tabular data with:
// - test
// - result
// - unit
// - referenceRange

// Return ONLY a valid JSON array like:
// [
//   { "test": "", "result": "", "unit": "", "referenceRange": "" },
//   ...
// ]

// Lab Report:
// ${text}
// `;

//   console.log('📋 Prompt prepared for AI:', prompt);

//   try {
//     console.log('🚀 Sending request to AI API...');
//     const response = await fetch('http://192.168.0.113:11434/api/generate', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         model: 'gemma:2b',
//         prompt,
//         stream: false,
//       }),
//     });

//     console.log('📨 Awaiting AI API response...');
//     const data = await response.json();
//     console.log('✅ AI API responded:', data);

//     const raw = data.response || '';
//     console.log('🔎 Raw AI response text:', raw);

//     const jsonStart = raw.indexOf('[');
//     const jsonEnd = raw.lastIndexOf(']');
//     console.log('🔢 JSON array start index:', jsonStart, ', end index:', jsonEnd);

//     if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
//       console.error('❌ Could not find valid JSON array in AI response:', raw);
//       return [];
//     }

//     const jsonString = raw.substring(jsonStart, jsonEnd + 1);
//     console.log('📦 Extracted JSON string:', jsonString);

//     try {
//       const parsed = JSON.parse(jsonString);
//       console.log('🎉 Successfully parsed JSON array:', parsed);
//       return parsed;
//     } catch (parseError) {
//       console.error('❌ JSON parsing failed:', parseError);
//       console.error('🧾 JSON string that caused error:', jsonString);
//       return [];
//     }
//   } catch (error) {
//     console.error('❌ Lab report parsing error:', error);
//     return [];
//   }
// }






app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
