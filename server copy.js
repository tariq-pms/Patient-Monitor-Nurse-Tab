import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { createRequire } from 'module';
import sharp from 'sharp';
import cors from 'cors';z

const require = createRequire(import.meta.url);
const app = express();
const port = 5001;

const UPLOAD_FOLDER = 'uploads';
const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'pdf']);
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '10mb' }));
// Create upload folder if it doesn't exist
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}


// Initialize Gemini model
const genAI = new GoogleGenerativeAI('AIzaSyBlEZro_Pq3KzSBsIxceg1fKTzkkzw3b2I'); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory instead of disk
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    ALLOWED_EXTENSIONS.has(ext) ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});

// Process medical report image
async function processMedicalImage(imagePath) {
  try {
    const imageBuffer = await sharp(imagePath).toFormat('jpeg').toBuffer();
    const imageBase64 = imageBuffer.toString('base64');

    const prompt = `Analyze this LAB REPORT and extract: test names, results, units, reference ranges, and status. Return JSON format:
    {
      "tests": [
        {
          "testName": "Test Name",
          "result": "Result Value",
          "units": "Measurement Units",
          "referenceRange": "Normal Range",
          "status": "Normal/Abnormal"
        }
      ],
      "metadata": {
        "reportDate": "DD-MM-YYYY",
        "labName": "Lab Name",
        "patientName": "Patient Name"
      }
    }`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
        ]
      }]
    });

    const response = await result.response;
    return parseGeminiResponse(response.text());
  } catch (error) {
    console.error('Processing error:', error);
    return { error: `Processing failed: ${error.message}` };
  }
}

function parseGeminiResponse(text) {
  try {
    // Try to extract JSON from markdown if present
    const jsonStr = text.replace(/^```json|```$/g, '').trim();
    const data = JSON.parse(jsonStr);
    
    // Format data for frontend
    return {
      table: data.tests.map(test => ({
        test: test.testName || 'Unknown',
        result: test.result || '',
        unit: test.units || '',
        referenceRange: test.referenceRange || 'N/A',
        status: test.status || 'Unknown'
      })),
      metadata: data.metadata || {}
    };
  } catch (error) {
    console.error('Parsing error:', error);
    return { error: 'Failed to parse response' };
  }
}
async function processMedicalBuffer(buffer) {
  try {
    const imageBuffer = await sharp(buffer).toFormat('jpeg').toBuffer();
    const imageBase64 = imageBuffer.toString('base64');

    const prompt = `Analyze this LAB REPORT and extract: test names, results, units, reference ranges, and status. Return JSON format:
    {
      "tests": [
        {
          "testName": "Test Name",
          "result": "Result Value",
          "units": "Measurement Units",
          "referenceRange": "Normal Range",
          "status": "Normal/Abnormal"
        }
      ],
      "metadata": {
        "reportDate": "DD-MM-YYYY",
        "labName": "Lab Name",
        "patientName": "Patient Name"
      }
    }`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
        ]
      }]
    });

    const response = await result.response;
    return parseGeminiResponse(response.text());
  } catch (error) {
    console.error('Processing error:', error);
    return { error: `Processing failed: ${error.message}` };
  }
}

async function extractPatientAdmissionData(buffer) {
  try {
    const imageBuffer = await sharp(buffer).toFormat('jpeg').toBuffer();
    const imageBase64 = imageBuffer.toString('base64');

    const prompt = `Extract patient admission details from the document image below. The format may vary by hospital. Return structured JSON in this format:
{
  "mothersName": "Full name of the mother if present",
  "patientId": "Patient ID or MRD number",
  "dob": "YYYY-MM-DD format",
  "gender": "male/female",
  "gestation": "Gestational age (weeks or description)"
}`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
        ]
      }]
    });

    const response = await result.response;
    return parseStructuredPatientInfo(response.text());
  } catch (error) {
    console.error('Autofill processing error:', error);
    return { error: `Autofill failed: ${error.message}` };
  }
}

function parseStructuredPatientInfo(text) {
  try {
    const jsonStr = text.replace(/^```json|```$/g, '').trim();
    const structuredData = JSON.parse(jsonStr);
    return { structuredData };
  } catch (error) {
    console.error('Parsing patient info failed:', error);
    return { error: 'Failed to parse structured patient info' };
  }
}

// API Endpoints
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer)
      return res.status(400).json({ error: 'No file uploaded or file buffer missing' });

    const result = await processMedicalBuffer(req.file.buffer);

    result.error
      ? res.status(400).json(result)
      : res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

app.post('/api/autofill', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image data' });

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const result = await extractPatientAdmissionData(buffer);

    result.error
      ? res.status(400).json(result)
      : res.json(result);
  } catch (error) {
    console.error('Autofill endpoint error:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

app.post('/api/scan', async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) return res.status(400).json({ error: 'No image data' });

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const result = await processMedicalBuffer(buffer); // 🧠 Direct buffer processing

    result.error
      ? res.status(400).json(result)
      : res.json(result);
  } catch (error) {
    console.error('🔴 Backend error:', error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});


// --- HTTPS Server Setup ---
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
};

https.createServer(sslOptions, app).listen(port, () => {
  console.log(` HTTPS server running on https://localhost:${port}`);
});
