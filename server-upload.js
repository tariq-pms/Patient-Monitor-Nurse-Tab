import express from "express";
import multer from "multer";
import fs from "fs";
import * as mupdf from "mupdf"; 
import cors from "cors"; 

const app = express();
const PORT = 5001; 

app.use(cors({ origin: "*" })); 

const upload = multer({ dest: "uploads/" });

// --- CONFIGURATION ---
const LABELS = [
  "Name",
  "UHID",
  "Age/Gender",
  "Admission No.",
  "Mobile Number",
  "Nationality",
  "DOB",
  "Marital Status",
  "Bed No. / Ward",
  "Patient with special needs",
  "Address",
  "Next of kin name",
  "Relationship",
  "Phones",
  "DOA",
  "Treating Doctor",
  "Admitting Doctor",
  "Referring Doctor",
];

// --- HELPER FUNCTIONS ---

function normalize(text) {
  if (!text) return null;
  return text
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function preprocessText(text) {
  let cleaned = text.replace(/\r/g, "").trim();
  const consentRegex = /Consent for Admission\s*&\s*Treatment/i;
  const consentMatch = cleaned.match(consentRegex);
  if (consentMatch) {
    cleaned = cleaned.slice(0, consentMatch.index).trim();
  }
  cleaned = cleaned.replace(/^\s*ADMISSION\s+RECORD\s*\n?/i, "");
  return cleaned;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findLabelPositions(text) {
  const positions = {};
  LABELS.forEach(label => {
    const escapedLabel = escapeRegExp(label);
    const regex = new RegExp(`${escapedLabel}\\s*[:.-]?`, "i");
    const match = text.match(regex);
    if (match) {
      positions[label] = match.index;
    }
  });
  return Object.fromEntries(Object.entries(positions).sort((a, b) => a[1] - b[1]));
}

function extractBlocks(text) {
  const positions = findLabelPositions(text);
  const blocks = {};
  const labels = Object.keys(positions);

  labels.forEach((label, i) => {
    const start = positions[label];
    const end = i + 1 < labels.length ? positions[labels[i + 1]] : text.length;
    let block = text.slice(start, end);
    const escapedLabel = escapeRegExp(label);
    const regex = new RegExp(`^${escapedLabel}\\s*[:.-]?\\s*`, "i");
    block = block.replace(regex, "");
    blocks[label] = normalize(block);
  });
  return blocks;
}

function parseAgeGender(value) {
  if (!value) return {};
  const ageMatch = value.match(/(\d+)\s*([A-Za-z]+)/);
  const genderMatch = value.match(/\/\s*([A-Za-z]+)/);
  return {
    Age: ageMatch ? ageMatch[1] : null,
    "Age Unit": ageMatch ? ageMatch[2].toUpperCase() : null,
    Gender: genderMatch ? genderMatch[1] : null,
  };
}

function parseAdmissionRecord(rawText) {
  const cleanText = preprocessText(rawText);
  const text = normalize(cleanText);
  const blocks = extractBlocks(text);
  const data = {};

  // Map Basic Fields
  data.Name = blocks["Name"];
  data.Uhid = blocks["UHID"];
  if (blocks["Age/Gender"]) Object.assign(data, parseAgeGender(blocks["Age/Gender"]));
  data["Admission Number"] = blocks["Admission No."];
  data["Mobile Number"] = blocks["Mobile Number"];
  data["Nationality"] = blocks["Nationality"];
  data["Date Of Birth"] = blocks["DOB"];
  data["Marital Status"] = blocks["Marital Status"];
  data.Address = blocks["Address"];
  data["Bed Number"] = blocks["Bed No. / Ward"];
  data["Special Needs"] = blocks["Patient with special needs"];
  data["Date Of Admission"] = blocks["DOA"];
  data["Kin Name"] = blocks["Next of kin name"];
  data["Kin Phone"] = blocks["Phones"];
  data["Treating Doctor"] = blocks["Treating Doctor"];
  data["Admitting Doctor"] = blocks["Admitting Doctor"];
  data["Referring Doctor"] = blocks["Referring Doctor"];

  // Handle Relationship / Kin Address Split
  let rawRelationship = blocks["Relationship"];
  if (rawRelationship) {
    const splitParts = rawRelationship.split(/Address\s*[:.-]?\s*/i);
    if (splitParts.length > 1) {
      data["Relationship"] = normalize(splitParts[0]);
      data["Kin Address"] = normalize(splitParts[1]);
    } else {
      data["Relationship"] = normalize(rawRelationship);
      data["Kin Address"] = null;
    }
  }

  return data;
}

// --- SERVER ROUTES ---

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });

  try {
    const buffer = fs.readFileSync(req.file.path);
    
    // ✅ FIXED: Use correct 'openDocument' API instead of 'Document.open'
    const doc = mupdf.PDFDocument.openDocument(buffer, "application/pdf");
    
    let fullText = "";
    const count = doc.countPages();
    
    for (let i = 0; i < count; i++) {
      const page = doc.loadPage(i);
      // ✅ Use 'toStructuredText' to preserve layout and spaces
      const stext = page.toStructuredText(); 
      fullText += stext.asText() + "\n";
    }

    console.log("--- SMART TEXT EXTRACTION ---");
    console.log(fullText);
    console.log("-----------------------------");

    const extracted = parseAdmissionRecord(fullText); 
    console.log("Extracted Data:", extracted);

    fs.unlinkSync(req.file.path);
    res.json(extracted);

  } catch (err) {
    console.error(err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "PDF parse failed" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ PDF Parser running on http://localhost:${PORT}`);
});