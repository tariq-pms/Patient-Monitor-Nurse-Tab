import {
  Box, Typography, Button, TableRow, Table, TableBody,
  TableCell, TableHead, IconButton, Paper,
  Chip, Snackbar, Alert, ToggleButton, Checkbox, Divider, ToggleButtonGroup, Dialog, DialogContent, DialogTitle, DialogActions, TextField, MenuItem, useTheme, Autocomplete,
} from "@mui/material";
import { AddCircleOutline, DeleteOutline, ArrowUpward, ArrowDownward, InsertDriveFile, Check as CheckIcon, Settings as SettingsIcon } from "@mui/icons-material";

import { LinearProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import { useEffect, useState, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useAuth0 } from "@auth0/auth0-react";

import { alpha } from "@material-ui/core";
import Menu from "@mui/material/Menu";
import Webcam from "react-webcam";
// import { active } from "d3";
interface DashboardProps {

  patient: any;
 patient_name: string;
  patient_id: string;
  patient_resource_id: string;
  birth_date: string;     // e.g., "2025-12-30"
  gestational_age: string; // e.g., "15W 02D"
  UserRole: string;
  current_weight?: string | number;
};


// Constants for Reference Ranges
const CBC_REFERENCE_RANGES = {
  "Hemoglobin (Hb)": [
    { maxDays: 3, range: "13.5 - 22.5", unit: "g/dL" },
    { maxDays: 7, range: "13.5 - 19.5", unit: "g/dL" },
    { maxDays: 14, range: "12.5 - 20.5", unit: "g/dL" },
    { maxDays: 30, range: "10.0 - 18.0", unit: "g/dL" },
  ],
  "Total RBC Count (T-RBC)": [
    { maxDays: 3, range: "3.90 - 6.60", unit: "million/µL" },
    { maxDays: 7, range: "3.90 - 6.30", unit: "million/µL" },
    { maxDays: 14, range: "3.60 - 6.20", unit: "million/µL" },
    { maxDays: 30, range: "3.00 - 5.40", unit: "million/µL" },
  ],
  "Hematocrit": [
    { maxDays: 3, range: "42.0 - 67.0", unit: "%" },
    { maxDays: 7, range: "42.0 - 66.0", unit: "%" },
    { maxDays: 14, range: "39.0 - 63.0", unit: "%" },
    { maxDays: 30, range: "31.0 - 55.0", unit: "%" },
  ],
  "Mean Corpuscular Volume": [
    { maxDays: 3, range: "98 - 121", unit: "fL" },
    { maxDays: 7, range: "88 - 126", unit: "fL" },
    { maxDays: 14, range: "86 - 124", unit: "fL" },
    { maxDays: 30, range: "85 - 123", unit: "fL" },
  ],
  "Mean Corpuscular Hemoglobin": [
    { maxDays: 3, range: "31 - 37", unit: "pg" },
    { maxDays: 30, range: "28 - 40", unit: "pg" },
  ],
  "Mean Corpuscular Hemoglobin Concentration": [
    { maxDays: 3, range: "30 - 37", unit: "g/dL" },
    { maxDays: 14, range: "28 - 38", unit: "g/dL" },
    { maxDays: 30, range: "29 - 37", unit: "g/dL" },
  ],
  "WBC Count": [ // WBC (Renamed from Total Leucocyte Count)
    { maxDays: 14, sex: "Male", range: "8.0 - 15.4", unit: "×10³/µL" },
    { maxDays: 14, sex: "Female", range: "8.2 - 14.6", unit: "×10³/µL" },
    { maxDays: 14, sex: "Unknown", range: "8.2 - 14.6", unit: "×10³/µL" },
    { maxDays: 30, sex: "Male", range: "7.8 - 15.9", unit: "×10³/µL" },
    { maxDays: 30, sex: "Female", range: "8.4 - 14.4", unit: "×10³/µL" },
    { maxDays: 30, sex: "Unknown", range: "8.4 - 14.4", unit: "×10³/µL" },
  ],
  "Neutrophils": [
    { maxDays: 14, range: "20.2 - 46.2", unit: "%" },
    { maxDays: 30, range: "14.0 - 54.6", unit: "%" },
  ],
  "Lymphocytes": [ // LYM% (Percentage)
    { maxDays: 14, sex: "Male", range: "33.7 - 67.6", unit: "%" },
    { maxDays: 14, sex: "Female", range: "24.9 - 68.5", unit: "%" },
    { maxDays: 14, sex: "Unknown", range: "33.7 - 67.6", unit: "%" },
    { maxDays: 30, sex: "Male", range: "33.6 - 76.8", unit: "%" },
    { maxDays: 30, sex: "Female", range: "31.9 - 82.7", unit: "%" },
    { maxDays: 30, sex: "Unknown", range: "33.6 - 76.8", unit: "%" },
  ],
  "Absolute Lymphocyte Count": [ // LYM (Absolute)
    { maxDays: 14, sex: "Male", range: "2.0 - 7.5", unit: "×10³/µL" },
    { maxDays: 14, sex: "Female", range: "1.75 - 8.0", unit: "×10³/µL" },
    { maxDays: 14, sex: "Unknown", range: "2.0 - 7.5", unit: "×10³/µL" },
    { maxDays: 30, sex: "Male", range: "2.1 - 8.3", unit: "×10³/µL" },
    { maxDays: 30, sex: "Female", range: "2.4 - 8.2", unit: "×10³/µL" },
    { maxDays: 30, sex: "Unknown", range: "2.4 - 8.2", unit: "×10³/µL" },
  ],
  "Mid-Sized cells / Monocytes": [ // MID
    { maxDays: 14, sex: "Male", range: "10.2 - 11.9", unit: "×10³/µL" },
    { maxDays: 14, sex: "Female", range: "10.4 - 12.0", unit: "×10³/µL" },
    { maxDays: 14, sex: "Unknown", range: "10.4 - 11.9", unit: "×10³/µL" },
    { maxDays: 30, sex: "Male", range: "10.1 - 12.1", unit: "×10³/µL" },
    { maxDays: 30, sex: "Female", range: "10.0 - 12.2", unit: "×10³/µL" },
    { maxDays: 30, sex: "Unknown", range: "10.1 - 12.1", unit: "×10³/µL" },
  ],
  "Red Cell Distribution Width (CV)": [ // RDWC
    { maxDays: 14, sex: "Male", range: "14.8 - 17.0", unit: "%" },
    { maxDays: 14, sex: "Female", range: "14.6 - 17.3", unit: "%" },
    { maxDays: 14, sex: "Unknown", range: "14.6 - 17.3", unit: "%" },
    { maxDays: 30, sex: "Male", range: "14.3 - 16.8", unit: "%" },
    { maxDays: 30, sex: "Female", range: "14.4 - 16.2", unit: "%" },
    { maxDays: 30, sex: "Unknown", range: "14.3 - 16.8", unit: "%" },
  ],
  "Red Cell Distribution Width (SD)": [ // RDWS
    { maxDays: 14, sex: "Male", range: "51.0 - 61.7", unit: "fL" },
    { maxDays: 14, sex: "Female", range: "51.4 - 65.7", unit: "fL" },
    { maxDays: 14, sex: "Unknown", range: "51.4 - 61.7", unit: "fL" },
    { maxDays: 30, sex: "Male", range: "46.3 - 57.3", unit: "fL" },
    { maxDays: 30, sex: "Female", range: "47.2 - 59.8", unit: "fL" },
    { maxDays: 30, sex: "Unknown", range: "47.2 - 57.3", unit: "fL" },
  ],
  "Eosinophils": [
    { maxDays: 14, range: "0.0 - 5.2", unit: "%" },
    { maxDays: 30, range: "0.0 - 5.3", unit: "%" },
  ],
  "Monocytes": [
    { maxDays: 14, range: "6.7 - 19.9", unit: "%" },
    { maxDays: 30, range: "4.3 - 18.3", unit: "%" },
  ],
  "Platelet Count": [
    { maxDays: 9999, range: "150 - 450", unit: "×10³/µL" },
  ],
  "Mean Platelet Volume": [ // MPV
    { maxDays: 14, sex: "Male", range: "10.2 - 11.9", unit: "fL" },
    { maxDays: 14, sex: "Female", range: "10.4 - 12.0", unit: "fL" },
    { maxDays: 14, sex: "Unknown", range: "10.4 - 11.9", unit: "fL" },
    { maxDays: 30, sex: "Male", range: "10.1 - 12.1", unit: "fL" },
    { maxDays: 30, sex: "Female", range: "10.0 - 12.2", unit: "fL" },
    { maxDays: 30, sex: "Unknown", range: "10.1 - 12.1", unit: "fL" },
  ],
};

const ELECTROLYTE_REFERENCE_RANGES = {
  "Sodium (Na+)": [
    { maxDays: 28, range: "134 - 146", unit: "mmol/L" },
  ],
  "Potassium (K+)": [
    { maxDays: 28, range: "3.4 - 4.5", unit: "mmol/L" },
  ],
  "Chloride (Cl-)": [
    { maxDays: 28, range: "96 - 108", unit: "mmol/L" },
  ],
  "Total Calcium (Ca2+)": [
    { maxDays: 28, range: "1.95 - 2.83", unit: "mmol/L" },
  ],
  "Ionized Calcium (Ca2+)": [
    { maxDays: 28, range: "1.05 - 1.37", unit: "mmol/L" },
  ],
  "Magnesium (Mg2+)": [
    { maxDays: 28, range: "0.62 - 0.91", unit: "mmol/L" },
  ],
  "Phosphorus (PO43-)": [
    { maxDays: 28, range: "1.55 - 2.65", unit: "mmol/L" },
  ],
};

const TOTAL_BILIRUBIN_RANGES = [
  { maxDays: 1, range: "< 6.0", unit: "mg/dL" },
  { maxDays: 2, range: "< 10.0", unit: "mg/dL" },
  { maxDays: 5, range: "< 15.0", unit: "mg/dL" },
  { maxDays: 28, range: "< 1.0 – 2.0", unit: "mg/dL" },
];

const CRP_REFERENCE_RANGES = {
  "C-Reactive Protein - Quantitative": [
    { maxDays: 9999, range: "0-6 or < 10", unit: "mg/L" },
  ]
};

const DIFFERENTIAL_COUNT_REFERENCE_RANGES = {
  "Neutrophils": [
    { maxDays: 99999, range: "14.0 – 54.6", unit: "%" },
  ],
  "Lymphocytes": [
    { maxDays: 99999, range: "36-45", unit: "%" },
  ],
  "Monocytes": [
    { maxDays: 99999, range: "4.3 – 18.3", unit: "%" },
  ],
  "Eosinophils": [
    { maxDays: 99999, range: "0-2", unit: "%" },
  ],
  "Basophils": [
    { maxDays: 99999, range: "0 - 1", unit: "%" }
  ],
  "Platelet Count": [
    { maxDays: 99999, range: "1.5 - 4.5", unit: "lakhs/cumm" },
  ],
};


const CBC_REPORT_TEMPLATE = [
  { test: "WBC Count", value: "", unit: "×10³/µL", referenceRange: "", isEditing: false },
  { test: "Absolute Lymphocyte Count", value: "", unit: "×10³/µL", referenceRange: "", isEditing: false },
  { test: "Mid-Sized cells / Monocytes", value: "", unit: "×10³/µL", referenceRange: "", isEditing: false },
  { test: "Lymphocytes", value: "", unit: "%", referenceRange: "", isEditing: false }, // LYM%
  { test: "Hemoglobin (Hb)", value: "", unit: "g/dL", referenceRange: "", isEditing: false },
  { test: "Hematocrit", value: "", unit: "%", referenceRange: "", isEditing: false },
  { test: "Mean Corpuscular Volume", value: "", unit: "fL", referenceRange: "", isEditing: false },
  { test: "Mean Corpuscular Hemoglobin", value: "", unit: "pg", referenceRange: "", isEditing: false },
  { test: "Mean Corpuscular Hemoglobin Concentration", value: "", unit: "g/dL", referenceRange: "", isEditing: false },
  { test: "Red Cell Distribution Width (CV)", value: "", unit: "%", referenceRange: "", isEditing: false },
  { test: "Red Cell Distribution Width (SD)", value: "", unit: "fL", referenceRange: "", isEditing: false },
  { test: "Platelet Count", value: "", unit: "×10³/µL", referenceRange: "", isEditing: false },
  { test: "Mean Platelet Volume", value: "", unit: "fL", referenceRange: "", isEditing: false },
  // Keep core ones that might be standard
  { test: "RBC Count", value: "", unit: "million/µL", referenceRange: "3.90 - 5.90", isEditing: false },
  { test: "Neutrophils", value: "", unit: "%", referenceRange: "45 – 75", isEditing: false },
];

const CRP_REPORT_TEMPLATE = [
  {
    test: "C-Reactive Protein - Quantitative",
    value: "",
    unit: "mg/L",
    referenceRange: "0-6 or < 10",
    isEditing: false,
  },
];

const DIFFERENTIAL_COUNT_TEMPLATE = [
  { test: "Neutrophils", value: "", unit: "%", referenceRange: "14.0 – 54.6", isEditing: false },
  { test: "Lymphocytes", value: "", unit: "%", referenceRange: "36-45", isEditing: false },
  { test: "Monocytes", value: "", unit: "%", referenceRange: "4.3 – 18.3", isEditing: false },
  { test: "Eosinophils", value: "", unit: "%", referenceRange: "0-2", isEditing: false },
  { test: "Platelet Count", value: "", unit: "lakhs/cumm", referenceRange: "1.5 - 4.5", isEditing: false },
];

const TOTAL_BILIRUBIN_TEMPLATE = [
  { test: "Total Bilirubin", value: "", unit: "mg/dL", referenceRange: "", isEditing: false },
];

const ELECTROLYTES_REPORT_TEMPLATE = [
  {
    test: "Sodium (Na+)",
    value: "",
    unit: "mmol/L",
    referenceRange: "",
    isEditing: false,
  },
  {
    test: "Potassium (K+)",
    value: "",
    unit: "mmol/L",
    referenceRange: "",
    isEditing: false,
  },
  {
    test: "Chloride (Cl-)",
    value: "",
    unit: "mmol/L",
    referenceRange: "",
    isEditing: false,
  },
  {
    test: "Total Calcium (Ca2+)",
    value: "",
    unit: "mmol/L",
    referenceRange: "",
    isEditing: false,
  },
  {
    test: "Ionized Calcium (Ca2+)",
    value: "",
    unit: "mmol/L",
    referenceRange: "",
    isEditing: false,
  },
  {
    test: "Magnesium (Mg2+)",
    value: "",
    unit: "mmol/L",
    referenceRange: "",
    isEditing: false,
  },
  {
    test: "Phosphorus (PO43-)",
    value: "",
    unit: "mmol/L",
    referenceRange: "",
    isEditing: false,
  },
];



const getDynamicCBCRanges = (pnaDays: number, gender: string = "unknown", configSource: any = CBC_REFERENCE_RANGES) => {
  const template = JSON.parse(JSON.stringify(CBC_REPORT_TEMPLATE));

  return template.map((item: any) => {
    let config = configSource[item.test];

    // Initial mapping fallbacks based on template names vs constant keys
    if (!config && item.test === "RBC Count") config = configSource["Total RBC Count (T-RBC)"];

    if (config) {
      // 1. Filter by Max Days to find valid age buckets
      const ageCandidates = config.filter((c: any) => pnaDays <= c.maxDays && (c.minDays === undefined || pnaDays >= c.minDays));

      if (ageCandidates.length > 0) {
        // Find the tightest maxDays constraint (smallest maxDays that is >= pnaDays)
        ageCandidates.sort((a: any, b: any) => a.maxDays - b.maxDays);
        const bestMaxDays = ageCandidates[0].maxDays;

        // Filter specifically for this maxDays bucket
        const bucket = ageCandidates.filter((c: any) => c.maxDays === bestMaxDays);

        // 2. Find Best Sex Match
        // Try exact match (Male/Female) -> then Unknown -> then fallback to first
        let match = bucket.find((c: any) => c.sex?.toLowerCase() === gender.toLowerCase());
        if (!match) match = bucket.find((c: any) => c.sex?.toLowerCase() === "unknown");
        if (!match) match = bucket.find((c: any) => !c.sex); // fallback to generic
        if (!match) match = bucket[0]; // fallback to whatever is there

        if (match) {
          item.referenceRange = match.range;
        }
      } else {
        // Fallback to the largest available MaxDays if no constraint met (e.g. older than max range)
        const sorted = [...config].sort((a: any, b: any) => a.maxDays - b.maxDays);
        const maxAvailable = sorted[sorted.length - 1];
        item.referenceRange = maxAvailable.range;
      }
    }
    return item;
  });
};

const getDynamicElectrolyteRanges = (pnaDays: number, configSource: any = ELECTROLYTE_REFERENCE_RANGES) => {
  const template = JSON.parse(JSON.stringify(ELECTROLYTES_REPORT_TEMPLATE));

  return template.map((item: any) => {
    // Exact match lookup
    const config = configSource[item.test];

    if (config) {
      const match = config.find((c: any) => pnaDays <= c.maxDays && (c.minDays === undefined || pnaDays >= c.minDays));
      if (match) {
        item.referenceRange = match.range;
      } else {
        item.referenceRange = config[config.length - 1].range;
      }
    }
    return item;
  });
};

const getDynamicBilirubinRanges = (pnaDays: number, configSource: any = TOTAL_BILIRUBIN_RANGES) => {
  const template = JSON.parse(JSON.stringify(TOTAL_BILIRUBIN_TEMPLATE));
  // configSource is an array here, unlike the objects above
  const match = configSource.find((c: any) => pnaDays <= c.maxDays && (c.minDays === undefined || pnaDays >= c.minDays));

  if (template[0]) {
    if (match) {
      template[0].referenceRange = match.range;
    } else {
      // Default to the last available range if older
      template[0].referenceRange = configSource[configSource.length - 1].range;
    }
  }
  return template;
};

interface DiagnosticOrder {
  fullResource: any;
  id: string;
  testName: string;
  specimen: string;
  priority: string;
  frequency: string;
  status: string;
  orderedAt: string;
  orderedBy: string;
  verifiedBy?: string;
  attachment?: string; // Base64 data
  contentType?: string; // mime type
  reportData?: typeof CBC_REPORT_TEMPLATE;
}



const COMMON_UNITS = [
  "g/dL", "million/µL", "%", "fL", "pg", "×10³/µL", "mmol/L", "mg/dL", "mg/L", "lakhs/cumm", "IU/L", "ng/mL"
];

const parseDaysInput = (input: string) => {
  const lower = input.toLowerCase().trim();
  if (!lower || lower === "all ages" || lower === "all") return { minDays: 0, maxDays: 99999 };
  const rangeMatch = lower.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (rangeMatch) {
    return { minDays: parseInt(rangeMatch[1]), maxDays: parseInt(rangeMatch[2]) };
  }
  const single = parseInt(lower);
  if (!isNaN(single)) {
    return { minDays: 0, maxDays: single };
  }
  return null;
};

const formatDaysDisplay = (min: number | undefined, max: number) => {
  if (max >= 9999) return "All Ages";
  if (min !== undefined && min > 0) return `${min}-${max}`;
  return `${max}`; // Implies "Max Days"
};

export const Dashboard: React.FC<DashboardProps> = ({
  patient,
  patient_name,
  patient_resource_id,
  
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { user } = useAuth0();
  const [patientData, setPatientData] = useState<any>(patient);

  // --- DEMO: Dummy Hospital Selector ---
  // Currently uses a manual dropdown for testing. To switch to real Auth0:
  //
  // OPTION 1: Auth0 Organizations (recommended)
  //   - Enable "Organizations" in Auth0 Dashboard > Organizations
  //   - Create orgs for each hospital (e.g., org_hosp1234, org_hosp5678)
  //   - Assign users to their hospital org
  //   - The org ID is available via: user?.org_id
  //   - Replace the line below with:
  //     const selectedHospitalId = user?.org_id || 'default';
  //   - Then remove the dropdown UI (lines ~1531-1564) and setSelectedHospitalId entirely
  //
  // OPTION 2: Custom claim in Auth0 (if not using Organizations)
  //   - Add a custom claim via Auth0 Actions/Rules, e.g.:
  //     event.accessToken["https://yourapp.com/hospital_id"] = user.app_metadata.hospital_id;
  //   - Then read it here:
  //     const selectedHospitalId = user?.["https://yourapp.com/hospital_id"] || 'default';
  //
  // OPTION 3: From FHIR Practitioner resource
  //   - Fetch the Practitioner linked to the Auth0 user
  //   - Read the managingOrganization reference
  //   - Use that Organization ID as hospitalId
  //


  // Reference Range Configuration State
  const [refRangeConfig, setRefRangeConfig] = useState<any>(() => {
    const saved = localStorage.getItem("refRangeConfig");
    return saved ? JSON.parse(saved) : {
      CBC: CBC_REFERENCE_RANGES,
      Electrolytes: ELECTROLYTE_REFERENCE_RANGES,
      Bilirubin: TOTAL_BILIRUBIN_RANGES,
      CRP: CRP_REFERENCE_RANGES,
      "Differential Count": DIFFERENTIAL_COUNT_REFERENCE_RANGES,
    };
  });
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [selectedSettingsTab, setSelectedSettingsTab] = useState("CBC");

  // New states for adding items in Settings
  const [isAddingOrderType, setIsAddingOrderType] = useState(false);
  const [newOrderTypeName, setNewOrderTypeName] = useState("");
  const [isAddingParameter, setIsAddingParameter] = useState(false);
  const [newParameterData, setNewParameterData] = useState({ name: "", unit: "", range: "" });

  // Persist Reference Range Configuration
  useEffect(() => {
    localStorage.setItem("refRangeConfig", JSON.stringify(refRangeConfig));
  }, [refRangeConfig]);

  // Migration: Update Differential Count to All Ages (fix old 14 days default)
  useEffect(() => {
    setRefRangeConfig((prev: any) => {
      const diffCount = prev["Differential Count"];
      // Check if Neutrophils exists and has the old 14-day limit
      if (diffCount && diffCount["Neutrophils"] && diffCount["Neutrophils"].some((item: any) => item.maxDays === 14)) {
        console.log("Migrating Differential Count to All Ages...");
        const newConfig = { ...prev };
        const newDiff = JSON.parse(JSON.stringify(diffCount)); // Deep copy

        Object.keys(newDiff).forEach(key => {
          if (Array.isArray(newDiff[key])) {
            newDiff[key] = newDiff[key].map((item: any) =>
              item.maxDays === 14 ? { ...item, maxDays: 99999 } : item
            );
          }
        });
        newConfig["Differential Count"] = newDiff;
        return newConfig;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if ((!patientData || !patientData.birthDate) && patient_resource_id) {
      // Fetch patient if not passed or missing DOB
      fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Patient/${patient_resource_id}`, {
        headers: { Authorization: "Basic " + btoa("fhiruser:change-password") }
      })
        .then(res => res.json())
        .then(data => setPatientData(data))
        .catch(err => console.error("Error fetching patient:", err));
    }
  }, [patient_resource_id, patientData]);

  const [showScanner, setShowScanner] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // const [ setCapturedImage] = useState<string | null>(null);
 
  const fileOCRInputRef = useRef<HTMLInputElement>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [cbcResults, setCbcResults] = useState<any[]>(CBC_REPORT_TEMPLATE);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // State for adding new item
  const [newItem, setNewItem] = useState({ test: "", value: "", unit: "", referenceRange: "" });

  const handleAddItem = () => {
    if (!newItem.test.trim()) return; // Don't add empty rows
    setCbcResults([...cbcResults, { ...newItem, isEditing: false }]);
    setNewItem({ test: "", value: "", unit: "", referenceRange: "" }); // Reset form
  };

  // const handleDeleteTest = (testToDelete: string) => {
  //   setAvailableTests(prev => prev.filter(t => t !== testToDelete));
  //   setSelectedTests(prev => prev.filter(t => t !== testToDelete));

  //   // Sync: Also remove from refRangeConfig if it exists as a key there
  //   // This handles the case where a "Custom Test" (which is also an Order Type) is deleted from chips
  //   setRefRangeConfig((prev: any) => {
  //     if (prev[testToDelete]) {
  //       const newConfig = { ...prev };
  //       delete newConfig[testToDelete];
  //       return newConfig;
  //     }
  //     return prev;
  //   });
  // };

  const handleDeleteOrderType = (typeToDelete: string) => {
    // Prevent deleting minimal defaults if needed, but user requested delete so allowing all
    setRefRangeConfig((prev: any) => {
      const newConfig = { ...prev };
      delete newConfig[typeToDelete];
      return newConfig;
    });

    // Sync: Remove from availableTests
    setAvailableTests(prev => prev.filter(t => t !== typeToDelete));

    // If the currently selected tab is deleted, switch to another
    if (selectedSettingsTab === typeToDelete) {
      setSelectedSettingsTab(Object.keys(refRangeConfig).find(k => k !== typeToDelete) || "CBC");
    }
  };


  const processOCR = async (base64Data: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Use localhost:5000 for the local Node server handling OCR
      console.log(`🏥 [Frontend] Sending scan request for ${activeOrder?.testName || 'CBC'}`);
      const response = await fetch('https://pmsind.co.in/api/scan-paddle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          orderType: activeOrder?.testName || 'CBC',
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'OCR Processing failed');
      }

      const data = await response.json();
      console.log("PaddleOCR Result:", data);

      if (data.table && Array.isArray(data.table)) {
        // Map the python response to our table structure
        // Python response: { test, fullForm, result, unit, flag } 

        const nameMap: Record<string, string> = {
          "White Blood Cell Count": "WBC Count",
          "WBC": "WBC Count",
          "Red Blood Cell Count": "RBC Count",
          "RBC": "RBC Count",
          "Hemoglobin": "Hemoglobin (Hb)",
          "HGB": "Hemoglobin (Hb)",
          "Hematocrit": "Hematocrit",
          "HCT": "Hematocrit",
          "Mean Corpuscular Volume": "Mean Corpuscular Volume",
          "MCV": "Mean Corpuscular Volume",
          "Mean Corpuscular Hemoglobin": "Mean Corpuscular Hemoglobin",
          "MCH": "Mean Corpuscular Hemoglobin",
          "Mean Corpuscular Hemoglobin Concentration": "Mean Corpuscular Hemoglobin Concentration",
          "MCHC": "Mean Corpuscular Hemoglobin Concentration",
          "Red Cell Distribution Width (CV)": "Red Cell Distribution Width (CV)",
          "RDW-CV": "Red Cell Distribution Width (CV)",
          "Red Cell Distribution Width (SD)": "Red Cell Distribution Width (SD)",
          "RDW-SD": "Red Cell Distribution Width (SD)",
          "Platelets": "Platelet Count",
          "Platelet Count": "Platelet Count",
          "PLT": "Platelet Count",
          "Mean Platelet Volume": "Mean Platelet Volume",
          "MPV": "Mean Platelet Volume",

          // Map Percentages to Template Fields (which are %)
          "Lymphocyte Percentage": "Lymphocytes",
          "LYM%": "Lymphocytes",
          "Granulocyte Percentage": "Neutrophils",
          "NEUT%": "Neutrophils",

          // Rename Absolute counts so they DON'T incorrectly match the Percentage template fields
          "Lymphocytes": "Absolute Lymphocyte Count",
          "LYM": "Absolute Lymphocyte Count", // Short code usually means Abs if % is separate
          "Granulocytes": "Absolute Granulocyte Count",

          // Mid/Monocytes
          "Mid-Sized cells": "Mid-Sized cells / Monocytes",
          "Mid-Sized": "Mid-Sized cells / Monocytes",
          "MID": "Mid-Sized cells / Monocytes",
          "Monocytes": "Mid-Sized cells / Monocytes", // Careful: if Monocytes matches this, it overrides existing "Monocytes" key?
          // Wait, "Monocytes" in template?
          // I replaced "Monocytes" in template with "Mid-Sized cells / Monocytes" for CBC? No.
          // In "CBC_REPORT_TEMPLATE", I REMOVED "Monocytes" and added "Mid-Sized cells / Monocytes".
          // So I should map "Monocytes" to "Mid-Sized cells / Monocytes" if it appears in OCR for CBC.
          // BUT, Differential Count Template HAS "Monocytes".
          // This processOCR uses `activeOrder.testName` to select template.
          // But here nameMap is shared?
          // This nameMap is inside processOCR.
          // If I map "Monocytes" -> "Mid-Sized cells / Monocytes", then Differential Count's "Monocytes" row will handle it?
          // No, Differential Count Template has "Monocytes". If I map "Monocytes" -> "Mid-Sized...", there is no "Mid-Sized..." in Differential Template.
          // So "Monocytes" -> "Mid-Sized..." works for CBC (where "Mid-Sized..." exists) but breaks Differential (where "Monocytes" exists).
          // Solution: Conditional Mapping? Or just generic map to "Monocytes" and let CBC template alias "Mid-Sized..." to "Monocytes"?
          // No, template item.test is "Mid-Sized cells / Monocytes".
          // I should add "Mid-Sized cells / Monocytes" to Differential template? User said "Monocytes" for Differential.
          // User said "Mid-Sized cells / Monocytes" for CBC.
          // This implies the same biological parameter might have different names in different templates.
          // The `nameMap` logic needs to be aware of the target template.

          // For now, I'll map "MID" to "Mid-Sized cells / Monocytes".
          // And "Monocytes" to "Monocytes".

          "Mid-Sized cells / Monocytes": "Mid-Sized cells / Monocytes",

          // Electrolyte Mappings
          "Sodium": "Sodium (Na+)",
          "Na": "Sodium (Na+)",
          "Potassium": "Potassium (K+)",
          "K": "Potassium (K+)",
          "Chloride": "Chloride (Cl-)",
          "Cl": "Chloride (Cl-)",
          "Calcium": "Total Calcium (Ca2+)",
          "Total Calcium": "Total Calcium (Ca2+)",
          "Ionized Calcium": "Ionized Calcium (Ca2+)",
          "Magnesium": "Magnesium (Mg2+)",
          "Mg": "Magnesium (Mg2+)",
          "Phosphorus": "Phosphorus (PO43-)",
          "Phosphate": "Phosphorus (PO43-)",
        };

        const matchedOcrIndices = new Set<number>();


        // 1. Reset results to fresh template (keeping existing PNA-based Ref Ranges if needed, 
        // but "Scan Auto-fill" implies a fresh start for values. 
        // To preserve "Dynamic Ranges" based on age, we re-calculate them or just use the current template state *without* the values/renames).

        // Better approach: Re-build the template basis from CBC_REPORT_TEMPLATE
        // but we need to re-apply the dynamic ranges currently in use if we want to be safe,
        // OR just rely on getDynamicCBCRanges again if we had patient info.

        // Determine which template we are using based on the active order
        const isElectrolyteOrder = activeOrder?.testName?.toLowerCase().includes("electrolyte");
        const isBilirubinOrder = activeOrder?.testName?.toLowerCase().includes("bilirubin");

        let RAW_TEMPLATE = CBC_REPORT_TEMPLATE;
        if (isElectrolyteOrder) {
          RAW_TEMPLATE = ELECTROLYTES_REPORT_TEMPLATE;
        } else if (isBilirubinOrder) {
          RAW_TEMPLATE = TOTAL_BILIRUBIN_TEMPLATE;
        }

        // Reset to base + Merge
        // Use the RAW_TEMPLATE structure


        // Filter current results to only keep items that match the Template Test Names


        // We'll use the *structure* of RAW_TEMPLATE but take Reference Ranges
        // from the current state IF they match, to preserve the Age-based ranges.
        const resetResults = RAW_TEMPLATE.map(tempItem => {
          const existing = cbcResults.find(r => r.test === tempItem.test);
          return {
            ...tempItem,
            // Preserve range if it exists and looks valid, otherwise use template default
            referenceRange: existing ? existing.referenceRange : tempItem.referenceRange,
            value: "", // Clear value for new scan
            // Unit might have been changed by OCR previously? Let's reset to standard from template for safety,
            unit: tempItem.unit
          };
        });

        console.log("Processing OCR Data:", data);
        if (data.debug) {
          console.warn("🐍 Server/Python Debug Log:\n", data.debug);
        }
        console.log("Using Template:", RAW_TEMPLATE);

        const mergedResults = resetResults.map((templateItem) => {
          const ocrIndex = data.table.findIndex((d: any) => {
            const rawName = d.fullForm || d.test || "";
            const normName = nameMap[rawName] || rawName;

            // Debug matching
            const isMatch = normName.toLowerCase() === templateItem.test.toLowerCase();
            if (isMatch) console.log(`Matched OCR item '${rawName}' to Template '${templateItem.test}'`);

            return isMatch;
          });

          if (ocrIndex !== -1) {
            matchedOcrIndices.add(ocrIndex);
            const ocrItem = data.table[ocrIndex];
            return {
              ...templateItem,
              value: ocrItem.result || templateItem.value,
              unit: ocrItem.unit || templateItem.unit
            };
          }
          return null; // Return null if not found in OCR, to be filtered out
        }).filter((item) => item !== null); // Filter out nulls

        const unmatchedItems = data.table
          .filter((_: any, index: number) => !matchedOcrIndices.has(index))
          .map((item: any) => {
            const rawName = item.fullForm || item.test;
            return {
              test: nameMap[rawName] || rawName, // Apply renaming to unmatched items too
              value: item.result || "",
              unit: item.unit || "",
              referenceRange: "",
              isEditing: false
            };
          });

        const finalResults = [...mergedResults, ...unmatchedItems];

        if (finalResults.some((r: any) => r.value)) {
          setCbcResults(finalResults);
          setSaveSuccess(true);
        } else {
          setError("No interpretable data found in scan.");
        }
      }

    } catch (err) {
      console.error("OCR Error:", err);
      setError(err instanceof Error ? err.message : "Failed to scan image");
    } finally {
      setIsProcessing(false);
      setShowScanner(false);
    }
  };

  const handlePaddleOCR = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input
    event.target.value = "";

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      await processOCR(base64Data);
    };
    reader.readAsDataURL(file);
  };



  const captureAndProcess = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Failed to capture image. Please try again.");
      return;
    }

    // setCapturedImage(imageSrc);
    await processOCR(imageSrc);
  };

  // Menu state for Scan button
  const [scanMenuAnchor, setScanMenuAnchor] = useState<null | HTMLElement>(null);
  const openScanMenu = Boolean(scanMenuAnchor);
  const handleScanMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setScanMenuAnchor(event.currentTarget);
  };
  const handleScanMenuClose = () => {
    setScanMenuAnchor(null);
  };


  const [availableTests, setAvailableTests] = useState<string[]>(() => {
    const saved = localStorage.getItem("availableTests");
    return saved ? JSON.parse(saved) : [
      "CBC",
      "Serum Electrolytes",
      "CRP",
      "Differential Count",
      "Total Bilirubin",
    ];
  });

  // Persist Available Tests
  useEffect(() => {
    localStorage.setItem("availableTests", JSON.stringify(availableTests));
  }, [availableTests]);

  const [testSearch, setTestSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [openReportDialog, setOpenReportDialog] = useState<boolean>(false);
  const isExpanded = selectedTests.length > 0;



  // --- Direct Upload State ---
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadReportedBy, setUploadReportedBy] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const toggleTest = (testName: string) => {
    setSelectedTests(prev => {
      if (prev.includes(testName)) {
        // remove
        setTestConfigs(cfg => {
          const copy = { ...cfg };
          delete copy[testName];
          return copy;
        });
        return prev.filter(t => t !== testName);
      } else {
        // add
        setTestConfigs(cfg => ({
          ...cfg,
          [testName]: {
            specimen: "Venous",
            priority: "Routine",
            frequency: "Once",
          },
        }));
        return [...prev, testName];
      }
    });
  };


  // --- State inside your component ---
  const handleDirectUploadSubmit = async () => {
    if (!uploadTitle || !uploadFile || !patient_resource_id) {
      setError("Please fill all fields and select a file.");
      return;
    }

    setIsSaving(true);
    try {
      // Convert file to Base64
      const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          let encoded = reader.result?.toString() || "";
          // remove data:image/png;base64, prefix
          encoded = encoded.split(',')[1];
          resolve(encoded);
        };
        reader.onerror = error => reject(error);
      });

      const base64Data = await toBase64(uploadFile);
      const contentType = uploadFile.type;

      const diagnosticReport = {
        resourceType: "DiagnosticReport",
        status: "final", // Indirectly final
        code: {
          coding: [{
            system: "http://loinc.org",
            code: "11502-2",
            display: "Laboratory report"
          }],
          text: uploadTitle
        },
        subject: {
          reference: `Patient/${patient_resource_id}`
        },
        effectiveDateTime: new Date().toISOString(),
        issued: new Date().toISOString(),
        performer: [{ display: uploadReportedBy || user?.name || "External Lab" }],
        presentedForm: [
          {
            contentType: contentType,
            data: base64Data,
            title: uploadFile.name
          }
        ],
        conclusion: `[Direct Upload] Verified By: ${user?.name || "System"}`
      };

      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(diagnosticReport)
      });

      if (!response.ok) throw new Error("Failed to upload report.");

      setOpenUploadDialog(false);
      setOpen(false); // Close parent dialog too? User asked "reflected under order type cards", so yes.
      fetchPatientReports();

      // Reset
      setUploadTitle("");
      setUploadReportedBy("");
      setUploadFile(null);
      setUploadPreview(null);

    } catch (err) {
      console.error(err);
      setError("Error uploading report.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const [patientVerified, setPatientVerified] = useState(false);
  const [openCBCDialog, setOpenCBCDialog] = useState(false);
  const [collectionSite, setCollectionSite] = useState("");

  const [diagnosticOrders, setDiagnosticOrders] = useState<DiagnosticOrder[]>([]);
  const [testConfigs, setTestConfigs] = useState<Record<string, {
    specimen: string;
    priority: string;
    frequency: string;
  }>>({});


  const handleOpenSampleDialog = (order: DiagnosticOrder) => {
    setActiveOrder(order); // store reference from diagnosticOrders
    setOpenSampleDialog(true);
  };


  // const handlePlaceOrder = async () => {
  //   if (selectedTests.length === 0 || !patient_resource_id) {
  //     setError('Missing selected tests or patient ID');
  //     return;
  //   }

  //   // setIsSaving(true);
  //   setError(null);

  //   try {
  //     const diagnosticReport = {
  //       resourceType: "DiagnosticReport",
  //       status: "registered", 
  //       code: {
  //         coding: [{
  //           system: "http://loinc.org",
  //           code: "11502-2",
  //           display: "Laboratory report"
  //         }],
  //         text: selectedTests.join(", ") 
  //       },
  //       subject: {
  //         reference: `Patient/${patient_resource_id}`
  //       },
  //       effectiveDateTime: new Date().toISOString(),
  //       issued: new Date().toISOString(),
  //       conclusion: selectedTests.map(test => {
  //         const config = testConfigs[test] || {};
  //         return `${test}: [Specimen: ${config.specimen || 'N/A'}] [Priority: ${config.priority || 'Routine'}] [Freq: ${config.frequency || 'Once'}]`;
  //       }).join('\n')
  //     };

  //     const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport`, {
  //       method: 'POST',
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //       body: JSON.stringify(diagnosticReport)
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       throw new Error(errorText || `Server error: ${response.status}`);
  //     }

  //     console.log('Successfully saved report:', diagnosticReport);

  //     setSaveSuccess(true);
  //     setOpen(false); // Close the dialog
  //     // if (typeof fetchPatientReports === 'function') {
  //     //   fetchPatientReports(); 
  //     // }

  //   } catch (err) {
  //     console.error('Detailed error:', err);
  //     setError(err instanceof Error ? err.message : 'An unknown error occurred');
  //   } finally {
  //     // setIsSaving(false);
  //   }
  // };
  const handlePlaceOrder = async () => {
    if (selectedTests.length === 0 || !patient_resource_id) {
      setError('Missing selected tests or patient ID');
      return;
    }

    setError(null);
    // setIsSaving(true);

    try {
      // We map over each test and create a separate fetch promise
      const promises = selectedTests.map(test => {
        const config = testConfigs[test] || {};

        const diagnosticReport = {
          resourceType: "DiagnosticReport",
          status: "registered",
          code: {
            coding: [{
              system: "http://loinc.org",
              // You might want a lookup table for actual LOINC codes per test
              code: "11502-2",
              display: "Laboratory report"
            }],
            text: test // Individual test name
          },
          subject: {
            reference: `Patient/${patient_resource_id}`
          },
          effectiveDateTime: new Date().toISOString(),
          issued: new Date().toISOString(),
          performer: [{ display: user?.name || "Dr. System" }],
          // Store the specific metadata here
          extension: [
            { url: "specimen-type", valueString: config.specimen || 'N/A' },
            { url: "priority", valueString: config.priority || 'Routine' }
          ],
          conclusion: `Specimen: ${config.specimen || 'N/A'}, Priority: ${config.priority || 'Routine'}, Freq: ${config.frequency || 'Once'}`
        };

        return fetch(`${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
          body: JSON.stringify(diagnosticReport)
        });
      });

      // Wait for all reports to save
      const responses = await Promise.all(promises);

      // Check if any response failed
      const failed = responses.find(r => !r.ok);
      if (failed) throw new Error("One or more tests failed to save.");

      setSaveSuccess(true);
      setOpen(false);
      fetchPatientReports();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  const isSupportedOrder = (order: DiagnosticOrder | null) =>
    !!order; // Allow all orders to open the result entry dialog


  const [reportData, setReportData] = useState<any[]>([]);
  const parseFHIRConclusion = (conclusion: string) => {
    // Split the string into lines and find lines containing test results
    const lines = conclusion.split('\n');
    const results: any[] = [];

    // Regex to match "Test Name: Value Unit (Ref: Range)"
    const resultRegex = /^(.*?):\s*([\d.]+)\s*([^\(]+)\s*\(Ref:\s*([^\)]+)\)/;

    lines.forEach(line => {
      const match = line.match(resultRegex);
      if (match) {
        results.push({
          test: match[1].trim(),
          result: match[2].trim(),
          unit: match[3].trim(),
          ref: match[4].trim()
        });
      }
    });
    return results;
  };

  const [isSaving, setIsSaving] = useState(false);
  const [openSampleDialog, setOpenSampleDialog] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [sampleQty, setSampleQty] = useState("");
  const handleOpenResultDialog = (order: DiagnosticOrder) => {
    if (!isSupportedOrder(order)) return;

    setActiveOrder(order);
    setOpenCBCDialog(true);

    if (order.testName.toLowerCase().includes("cbc")) {
      if (patientData?.birthDate) {
        const birthDate = new Date(patientData.birthDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - birthDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        console.log("Patient PNA (days):", diffDays);
        setCbcResults(getDynamicCBCRanges(diffDays, patientData.gender, refRangeConfig.CBC));
      } else {
        console.warn("No patient DOB found, using default CBC ranges");
        setCbcResults(getDynamicCBCRanges(0, "unknown", refRangeConfig.CBC));
      }
    } else if (order.testName.toLowerCase().includes("electrolyte")) {
      if (patientData?.birthDate) {
        const birthDate = new Date(patientData.birthDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - birthDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setCbcResults(getDynamicElectrolyteRanges(diffDays, refRangeConfig.Electrolytes));
      } else {
        // Default to template if no DOB
        setCbcResults(getDynamicElectrolyteRanges(0, refRangeConfig.Electrolytes));
      }
    } else if (order.testName.toLowerCase().includes("crp")) {
      setCbcResults(CRP_REPORT_TEMPLATE);
    } else if (order.testName.toLowerCase().includes("differential")) {
      setCbcResults(DIFFERENTIAL_COUNT_TEMPLATE);
    } else if (order.testName.toLowerCase().includes("bilirubin")) {
      if (patientData?.birthDate) {
        const birthDate = new Date(patientData.birthDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - birthDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setCbcResults(getDynamicBilirubinRanges(diffDays, refRangeConfig.Bilirubin));
      } else {
        setCbcResults(getDynamicBilirubinRanges(0, refRangeConfig.Bilirubin)); // Default to day 0
      }
    } else {
      // Fallback for Custom Orders
      // Check if we have a learned config for this test
      const learnedConfig = refRangeConfig[order.testName as keyof typeof refRangeConfig] as any;
      if (learnedConfig && !Array.isArray(learnedConfig)) {
        // Reconstruct template from learned config
        const rows = Object.entries(learnedConfig)
          .filter(([_, ranges]: [string, any]) => Array.isArray(ranges) && ranges.length > 0)
          .map(([testItem, ranges]: [string, any]) => {
            // Use the most generic range (usually the one we saved with 99999)
            // or just the first one.
            const match = ranges[0] || {};
            return {
              test: testItem,
              value: "",
              unit: match.unit || "",
              referenceRange: match.range || "",
              isEditing: true // Allow immediate editing
            };
          });
        setCbcResults(rows);
      } else {
        // Totally new, empty state
        setCbcResults([{ test: "", value: "", unit: "", referenceRange: "", isEditing: true }]);
      }
    }

    console.log("activeOrderId", activeOrder);
    console.log("orders", diagnosticOrders.map(o => o.id));

  };

  const handleOrderClick = (order: DiagnosticOrder) => {
    if (order.status !== "final") return; // Only open for final reports

    const parsedResults = parseFHIRConclusion(order.fullResource.conclusion || "");
    setReportData(parsedResults);
    setActiveOrder(order);
    setOpenReportDialog(true);
  };

  const getStatusChipStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "final":
      case "report ready":
        return {
          bg: alpha("#16A34A", 0.15),
          color: "#16A34A",
        };

      case "preliminary":
        return {
          bg: alpha("#228BE6", 0.15), // Blue for Sample Collected
          color: "#228BE6",
        };

      case "testing in progress":
        return {
          bg: alpha("#7C3AED", 0.15),
          color: "#7C3AED",
        };

      case "registered":
        return {
          bg: alpha("#FAB005", 0.15), // Yellow/Gold for Waiting
          color: "#FAB005",
        };

      default:
        return {
          bg: alpha("#94A3B8", 0.15),
          color: "#64748B",
        };
    }
  };
  const mockCBCData = [
    { test: "Hemoglobin (Hb)", result: "12.1", unit: "g/dL", ref: "13.4 - 19.9", method: "Method 1", flag: "low" },
    { test: "Hematocrit", result: "48", unit: "%", ref: "42 - 65", method: "Method 2" },
    { test: "RBC Count", result: "4.80", unit: "million/µL", ref: "3.90 - 5.90", method: "Method 3" },
    { test: "WBC Count", result: "20.0", unit: "×10³/µL", ref: "9.0 - 30.0", method: "Method 3" },
    { test: "Neutrophils", result: "80", unit: "%", ref: "45 - 75", method: "Method 6", flag: "high" },
    { test: "Lymphocytes", result: "30", unit: "%", ref: "20 - 50", method: "Method 5" },
    { test: "Platelet Count", result: "450", unit: "×10³/µL", ref: "150 - 450", method: "Method 7" },
  ];
  console.log("selectorder", selectedOrder);

  const fetchPatientReports = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport?subject=Patient/${patient_resource_id}&_sort=-issued`,
        {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        }
      );
      const data = await response.json();

      if (data.entry) {
        const formattedOrders = data.entry.map((item: { resource: any; }) => {
          const resource = item.resource;

          // Helper to extract data from the conclusion string: 
          // "Test: [Specimen: X] [Priority: Y] [Freq: Z]"
          const conclusion = resource.conclusion || "";
          const specimenMatch = conclusion.match(/Specimen:?\s*\[?([^,\]\n]+)\]?/i);
          const priorityMatch = conclusion.match(/Priority:?\s*\[?([^,\]\n]+)\]?/i);
          const verifiedMatch = conclusion.match(/Verified By:?\s*\[?([^,\]\n]+)\]?/i);
          const attachment = resource.presentedForm?.[0]; // Get the first attachment if exists

          return {
            id: resource.id,
            testName: resource.code?.text || "Unknown Test",
            specimen: specimenMatch ? specimenMatch[1].trim() : "N/A",
            priority: priorityMatch ? priorityMatch[1] : "Routine",
            status: resource.status, // e.g., 'registered'
            orderedAt: new Date(resource.issued).toLocaleString([], {
              dateStyle: 'short',
              timeStyle: 'short'
            }),
            orderedBy: resource.performer?.[0]?.display || "Dr. System",
            verifiedBy: verifiedMatch ? verifiedMatch[1].trim() : undefined,
            attachment: attachment?.data,
            contentType: attachment?.contentType,
            fullResource: resource // Keep this for the "View Details" click
          };
        });

        setDiagnosticOrders(formattedOrders);
      }
    } catch (err) {
      console.error("Error fetching FHIR reports:", err);
    }
  };

  // Call this in a useEffect when patient_resource_id changes
  useEffect(() => {
    if (patient_resource_id) fetchPatientReports();
  }, [patient_resource_id]);

  const handleUpdateSampleStatus = async () => {
    if (!activeOrder || !activeOrder.fullResource) {
      setError("No active order found to update.");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Clone the original resource and update specific fields
      const updatedResource = {
        ...activeOrder.fullResource, // Keep all existing FHIR fields (id, subject, code, etc.)
        status: "preliminary", // "preliminary" or "partial" is the FHIR equivalent of 'Testing Pending'

        // Update the conclusion to include the new sample data
        conclusion: `${activeOrder.fullResource.conclusion}\n[Sample Qty: ${sampleQty}] [Site: ${collectionSite}] [Verified: ${patientVerified}]`,

        // Update the issued date to the collection time
        issued: new Date().toISOString(),
      };

      // 2. Send the PUT request using the specific resource ID
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport/${activeOrder.id}`,
        {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
          body: JSON.stringify(updatedResource)
        }
      );

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      console.log("FHIR response (after PUT):", updatedResource);
      // 3. Update local UI state
      setDiagnosticOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === activeOrder.id
            ? {
              ...order,
              status: "preliminary",
              fullResource: updatedResource
            }
            : order
        )
      );

      // 4. Close and Reset
      setOpenSampleDialog(false);
      setPatientVerified(false);
      setSampleQty("");
      setCollectionSite("");

      // Refresh the list from server to ensure sync
      fetchPatientReports();

    } catch (err) {
      console.error("Error updating sample status:", err);
      // setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCBCResults = async () => {
    if (!activeOrder || !activeOrder.fullResource) {
      setError("No active order found to update results.");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Prepare the result string from your table state
      const resultsString = cbcResults
        .filter(r => r.value) // Only include items with values
        .map(r => `${r.test}: ${r.value} ${r.unit} (Ref: ${r.referenceRange})`)
        .join('\n');

      // 2. Clone and update the resource
      const updatedResource = {
        ...activeOrder.fullResource,
        status: "final", // Status is now final as results are ready
        conclusion: `RESULTS:\n${resultsString}\n\n${activeOrder.fullResource.conclusion}\n[Verified By: ${user?.name || "Unknown"}]`,
        issued: new Date().toISOString(),
      };

      // 3. PUT request to the specific ID
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport/${activeOrder.id}`,
        {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
          body: JSON.stringify(updatedResource)
        }
      );

      if (!response.ok) throw new Error("Failed to save laboratory results.");

      // 4. Update UI State
      setDiagnosticOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === activeOrder.id
            ? { ...order, status: "final", fullResource: updatedResource }
            : order
        )
      );
      console.log("updatedResource value entered", updatedResource);

      // 4. Smart Learning: Update Reference Config for Custom Orders
      const testName = activeOrder.testName;
      // Check if it's a known stock type (simple check)
      const isStock = ["CBC", "Serum Electrolytes", "Bilirubin", "CRP", "Differential Count"].includes(testName);

      if (!isStock) {
        setRefRangeConfig((prev: any) => {
          const existingTestConfig = prev[testName] || {};
          const newTestConfig = { ...existingTestConfig };
          let hasChanges = false;

          cbcResults.forEach((row: any) => {
            if (row.test && row.value) { // Only learn from populated rows
              if (!newTestConfig[row.test]) {
                // Add new parameter with default catch-all range AND unit
                newTestConfig[row.test] = [{
                  maxDays: 99999,
                  range: row.referenceRange || "",
                  unit: row.unit || "" // Persist unit
                }];
                hasChanges = true;
              }
            }
          });

          if (hasChanges) {
            return { ...prev, [testName]: newTestConfig };
          }
          return prev;
        });

        // Ensure it remains in availableTests (persistence logic)
        setAvailableTests(prev => {
          if (!prev.includes(testName)) return [...prev, testName];
          return prev;
        });
      }

      setOpenCBCDialog(false);
      fetchPatientReports();
      setCbcResults(CBC_REPORT_TEMPLATE); // Refresh list

    } catch (err) {
      console.error("Save Error:", err);
      setError(err instanceof Error ? err.message : "Error saving results");
    } finally {
      setIsSaving(false);
    }
  };

  const isOutOfRange = (value: string, rangeStr: string) => {
    if (!value || !rangeStr) return false;

    // Extract numbers from range string like "13.4 - 19.9" or "9.0 – 30.0"
    const parts = rangeStr.split(/[-–—]/).map(s => parseFloat(s.trim()));
    const numValue = parseFloat(value);

    if (isNaN(numValue) || parts.length !== 2) return false;

    const [min, max] = parts;
    return numValue < min || numValue > max;
  };
  const formatFHIRDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', ''); // Removes the comma between date and time
  };
  return (


    <Box sx={{ flexGrow: 1, padding: 2, justifyContent: 'center' }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          borderRadius: "10px",
          padding: "12px 20px",

          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={(theme) => ({
            color: theme.palette.mode === 'dark' ? theme.palette.text.primary : "#0F3B61",
            fontWeight: "bold",
            fontSize: "1rem",
          })}
        >
          Diagnostic Report
        </Typography>

        <Box display="flex" alignItems="center">
          <Button
            onClick={() => setOpen(true)}
            sx={{
              backgroundColor: alpha("#228BE6", 0.1),
              color: "#228BE6",
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              justifyContent: "flex-start", // Left align text
              "&:hover": {},
            }}
          >
            + Order
          </Button>

          <IconButton
            onClick={() => setOpenSettingsDialog(true)}
            sx={{
              ml: 1,
              backgroundColor: isDarkMode ? alpha("#58A6FF", 0.1) : alpha("#228BE6", 0.1),
              color: isDarkMode ? "#58A6FF" : "#228BE6",
              borderRadius: "8px",
              height: 36,
              width: 36,
              "&:hover": {
                backgroundColor: isDarkMode ? alpha("#58A6FF", 0.2) : alpha("#228BE6", 0.2),
              },
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>

      </Box>
      {/* Diagnostics Header */}

      {!selectedOrder ? (
        <>
          {/* Header */}
          <Box
            sx={(theme) => ({
              mb: 1,
              px: 2,
              py: 1,
              backgroundColor: theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : alpha("#868E96", 0.12),
              borderRadius: "8px",
              display: { xs: "none", md: "grid" },
              gridTemplateColumns: "2fr 1fr 1fr 2fr auto",
              alignItems: "center",
              color: theme.palette.text.secondary,
              fontSize: "0.75rem",
              fontWeight: 500,
            })}
          >
            <Typography variant="caption">Order type</Typography>
            <Typography variant="caption">Specimen</Typography>
            <Typography variant="caption">Status</Typography>
            <Typography variant="caption">Ordered time</Typography>
            <Typography variant="caption">Action</Typography>
            <Box /> {/* empty for arrow column */}
          </Box>

          {/* Orders List */}
          <Box sx={{ mt: 1 }}>
            {diagnosticOrders.map((order) => (
              <Paper
                key={order.id}

                sx={(theme) => ({
                  mb: 1,
                  px: 2,
                  py: 1.25,
                  borderRadius: "10px",
                  boxShadow: "none",
                  backgroundColor: theme.palette.mode === 'dark'
                    ? theme.palette.background.paper
                    : "#FFFFFF",
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "3fr 1.5fr 1.5fr 3fr 120px" },
                  gap: { xs: 1, md: 0 },
                  alignItems: "center",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                })}
              >
                {/* Order type */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={600} noWrap sx={(theme) => ({ color: theme.palette.text.primary })}>
                    {order.testName}
                  </Typography>
                  <Typography variant="caption" sx={{
                    color: order.priority === "Emergency" ? "#F97316" : undefined,
                    fontWeight: order.priority === "Emergency" ? 700 : 400
                  }}>
                    {order.priority}
                  </Typography>
                </Box>
                {/* Specimen */}
                <Box display="flex" justifyContent="flex-start">
                  <Chip
                    size="small"
                    label={order.specimen}
                    sx={(theme) => ({
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.selected : "#E5E7EB",
                      color: theme.palette.text.primary,
                      height: 22
                    })}
                  />
                </Box>

                {/* Status + optional Test button stacked vertically */}
                <Box >
                  <Chip
                    size="small"
                    label={(() => {
                      switch (order.status?.toLowerCase()) {
                        case 'registered': return "Sample Collection Pending";
                        case 'preliminary': return "Sample collected";
                        case 'final': return "Report Ready";
                        default: return order.status;
                      }
                    })()}
                    sx={{
                      backgroundColor: getStatusChipStyles(order.status).bg,
                      color: getStatusChipStyles(order.status).color,
                      height: 22,
                      fontSize: '11px',
                      fontWeight: 600,
                      maxWidth: 200, // Increased slightly to fit "Waiting for sample collection"
                      '& .MuiChip-label': {
                        px: 1,
                      },
                    }}
                  />
                </Box>

                {/* Ordered time + by */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" display="block" sx={(theme) => ({ color: theme.palette.text.primary })}>
                    {order.orderedAt}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    justifyContent: "flex-end",
                  }}
                >
                  {/* Show the 'Test' Button ONLY for Preliminary status */}
                  {order.status?.toLowerCase() === 'preliminary' && (
                    <Button
                      size="small"
                      sx={{
                        mt: 1,
                        color: "#228BE6",
                        backgroundColor: alpha("#228BE6", 0.1),
                        height: 28,
                        textTransform: "none",
                        minWidth: 80, // Changed from maxWidth to ensure text fits
                        '&:hover': {
                          backgroundColor: alpha("#228BE6", 0.2),
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenResultDialog(order);
                      }}
                    >
                      Add Result
                    </Button>
                  )}

                  {/* Show the Arrow Icon ONLY for Registered status */}
                  {order.status?.toLowerCase() === 'registered' && (
                    <Button

                      sx={{
                        mt: 1,
                        color: "#228BE6",
                        backgroundColor: alpha("#228BE6", 0.1),
                        height: 28,
                        textTransform: "none",

                        '&:hover': {
                          backgroundColor: alpha("#228BE6", 0.2),
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSampleDialog(order);
                        setSelectedOrder(null);
                      }}
                    >
                      Collect Sample
                    </Button>

                  )}
                  {order.status?.toLowerCase() === 'final' && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (order.status === 'final') {
                          handleOrderClick(order);
                        }
                      }}
                    >
                      <ArrowForwardIosIcon sx={{ color: "#228BE6" }} fontSize="inherit" />
                    </IconButton>

                  )}


                </Box>


                {/* Arrow */}

              </Paper>
            ))}
          </Box>

        </>
      ) : (<>
        {/* Meta */}
        <Paper elevation={0}
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            p: { xs: 2, md: 3 },
          }}>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} color={"black"}>
            <Typography variant="caption"><b>Collection</b><br />15/05/2025 07:45 AM</Typography>
            <Typography variant="caption"><b>Received</b><br />15/05/2025 11:45 AM</Typography>
            <Typography variant="caption"><b>Report</b><br />16/06/2025 11:45 AM</Typography>
            <Typography variant="caption"><b>Reported by</b><br />{activeOrder?.orderedBy || "--"}</Typography>
            <Typography variant="caption"><b>Verified by</b><br />{activeOrder?.verifiedBy || "--"}</Typography>
          </Box>
        </Paper>
        {/* ================= TABLE (mockCBCData USED HERE) ================= */}
        <Paper elevation={0}
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            p: { xs: 2, md: 3 },
            mt: 2
          }}>
          <Typography sx={{ px: 2, py: 1, fontWeight: 600, color: "#228BE6" }}>
            Complete Blood Count (CBC)
          </Typography>

          <Table size="small">
            <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ color: "black" }}>Test</TableCell>
                <TableCell sx={{ color: "black" }}>Result</TableCell>
                <TableCell sx={{ color: "black" }}>Unit</TableCell>
                <TableCell sx={{ color: "black" }}>Reference Range</TableCell>
                <TableCell sx={{ color: "black" }}>Method</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {mockCBCData.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ color: row.flag ? "#DC2626" : "#111827" }}>
                    {row.test}
                  </TableCell>
                  <TableCell sx={{ color: row.flag ? "#DC2626" : "#111827" }}>
                    {row.result}
                  </TableCell>

                  <TableCell sx={{ color: "#000 !important" }}>{row.unit}</TableCell>
                  <TableCell sx={{ color: "#111827" }}>{row.ref}</TableCell>
                  <TableCell sx={{ color: "#111827" }}>{row.method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </>)}

      <Dialog
        open={openSampleDialog}
        onClose={() => setOpenSampleDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 2,
            backgroundColor: isDarkMode ? theme.palette.background.paper : "#fff",
          },
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={600} color={isDarkMode ? theme.palette.text.primary : "black"}>
            Sample Collection
          </Typography>
          <IconButton onClick={() => setOpenSampleDialog(false)}>
            <CloseIcon sx={{ color: isDarkMode ? theme.palette.text.secondary : "black" }} />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Patient Verified */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
            borderRadius: "10px",
            px: 2,
            py: 1.5,
            mb: 2,
          }}
        >
          <Typography color={isDarkMode ? theme.palette.text.primary : "black"}>Patient Verified?</Typography>
          <Checkbox
            sx={{ color: isDarkMode ? theme.palette.text.secondary : "black" }}
            checked={patientVerified}
            onChange={(e) => setPatientVerified(e.target.checked)}
          />
        </Box>

        {/* Sample Qty */}
        <Box mb={2}>
          <Typography variant="caption" color={isDarkMode ? theme.palette.text.secondary : "black"}>
            Sample qty
          </Typography>

          <TextField
            fullWidth
            placeholder="Collected Sample qty"
            value={sampleQty}
            onChange={(e) => setSampleQty(e.target.value)}
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                pr: 1,
                color: isDarkMode ? theme.palette.text.primary : "#000",
                borderColor: isDarkMode ? theme.palette.divider : undefined,
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? theme.palette.divider : undefined },
              backgroundColor: isDarkMode ? theme.palette.background.default : "#F9FAFB",
            }}
            InputProps={{
              endAdornment: (
                <Box display="flex" gap={1}>
                  {["0.5mL", "1.0mL", "1.5mL", "2.0mL"].map((qty) => (
                    <Chip
                      key={qty}
                      label={qty}
                      clickable
                      onClick={() => setSampleQty(qty)}
                      sx={{
                        height: 28,
                        borderRadius: "16px",
                        fontWeight: 500,
                        backgroundColor: sampleQty === qty
                          ? (isDarkMode ? "#58A6FF" : "#228BE6")
                          : (isDarkMode ? alpha("#58A6FF", 0.2) : "#E8F1FD"),
                        color: sampleQty === qty
                          ? "#fff"
                          : (isDarkMode ? "#58A6FF" : "#228BE6"),
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Box>
              ),
            }}
          />
        </Box>

        {/* Collection Site */}
        <Typography variant="caption" color={isDarkMode ? theme.palette.text.secondary : "grey"}>
          Collection site
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={collectionSite}
          fullWidth
          onChange={(_, value) => value && setCollectionSite(value)}
          sx={{ mt: 1, mb: 2 }}
        >
          {["Left Heel", "Right Heel", "UAC", "PIV"].map((site) => (
            <ToggleButton
              key={site}
              value={site}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: isDarkMode ? theme.palette.text.secondary : "#7A8899",
                height: "48px",
                border: `1px solid ${isDarkMode ? theme.palette.divider : "#D0D7E2"}`,
                borderRadius: "8px",
                "&.Mui-selected": {
                  backgroundColor: isDarkMode ? alpha("#58A6FF", 0.2) : alpha("#228BE6", 0.1),
                  color: isDarkMode ? "#58A6FF" : "#228BE6",
                },
              }}
            >
              {site}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Footer */}
        <Box mt={4} display="flex" gap={2}>
          <Button fullWidth variant="outlined" onClick={() => setOpenSampleDialog(false)}>
            Back
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ backgroundColor: "#228BE6" }}
            disabled={!patientVerified || !sampleQty || !collectionSite || isSaving}
            onClick={handleUpdateSampleStatus} // Use the new async function
          >
            {isSaving ? "Updating..." : "Sample Collected →"}
          </Button>

        </Box>
      </Dialog>

      <Dialog
        open={openSettingsDialog}
        onClose={() => setOpenSettingsDialog(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            backgroundColor: isDarkMode ? theme.palette.background.paper : "#fff",
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight="bold" color={isDarkMode ? "text.primary" : "inherit"}>
            Reference Range Settings
          </Typography>
          <IconButton onClick={() => setOpenSettingsDialog(false)}>
            <CloseIcon sx={{ color: isDarkMode ? "text.secondary" : "inherit" }} />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box mb={3} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              pb: 1,
              maxWidth: "100%",
              "&::-webkit-scrollbar": { height: 4 },
              "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: isDarkMode ? "#333" : "#ddd", borderRadius: 2 }
            }}>
              {Object.keys(refRangeConfig).map(key => (
                <Box key={key} position="relative" display="inline-block" sx={{ flexShrink: 0 }}>
                  <Button
                    variant={selectedSettingsTab === key ? "contained" : "outlined"}
                    onClick={() => setSelectedSettingsTab(key)}
                    sx={{ textTransform: "none", pr: 4 }} // Padding right for close icon
                  >
                    {key}
                  </Button>
                  <IconButton
                    size="small"
                    disabled={["CBC", "Electrolytes", "Bilirubin", "CRP", "Differential Count"].includes(key)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOrderType(key);
                    }}
                    sx={{
                      position: "absolute",
                      right: 2,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 20,
                      height: 20,
                      color: selectedSettingsTab === key ? "inherit" : "text.secondary",
                      display: ["CBC", "Electrolytes", "Bilirubin", "CRP", "Differential Count"].includes(key) ? "none" : "flex"
                    }}
                  >
                    <CloseIcon fontSize="inherit" sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
              {/* Add Order Type Button - Fixed on the right */}
              {!isAddingOrderType ? (
                <IconButton onClick={() => setIsAddingOrderType(true)} size="small" sx={{ border: "1px dashed grey", flexShrink: 0 }}>
                  <AddCircleOutline />
                </IconButton>
              ) : (
                <Box display="flex" gap={1} alignItems="center" flexShrink={0}>
                  <TextField
                    size="small"
                    placeholder="New Order Type"
                    value={newOrderTypeName}
                    onChange={(e) => setNewOrderTypeName(e.target.value)}
                  />
                  <IconButton onClick={() => {
                    if (newOrderTypeName.trim()) {
                      setRefRangeConfig((prev: any) => ({ ...prev, [newOrderTypeName]: {} }));
                      setAvailableTests((prev: any) => [...prev, newOrderTypeName]);
                      setSelectedSettingsTab(newOrderTypeName);
                      setNewOrderTypeName("");
                      setIsAddingOrderType(false);
                    }
                  }}>
                    <CheckIcon color="success" />
                  </IconButton>
                  <IconButton onClick={() => setIsAddingOrderType(false)}>
                    <CloseIcon color="error" />
                  </IconButton>
                </Box>
              )}
            </Box>

          </Box>

          <Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
            {(() => {
              const currentConfig = refRangeConfig[selectedSettingsTab as keyof typeof refRangeConfig] as any;
              // Flatten data for display
              // For CBC/Electrolytes (Objects with arrays)
              if (selectedSettingsTab !== "Bilirubin") {
                if (!currentConfig) return null; // Handle empty config
                return (
                  <>
                    {(Object.entries(currentConfig) as [string, any[]][]).map(([testName, ranges]) => (
                      <Paper
                        key={testName}
                        variant="outlined"
                        sx={{
                          p: 2, mb: 2,
                          backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.5) : "#f8fafc",
                          borderColor: isDarkMode ? theme.palette.divider : undefined
                        }}
                      >
                        <TextField
                          variant="standard"
                          defaultValue={testName}
                          fullWidth
                          onBlur={(e) => {
                            const newName = e.target.value.trim();
                            if (newName && newName !== testName) {
                              setRefRangeConfig((prev: any) => {
                                const newConfig = { ...prev };
                                const category = newConfig[selectedSettingsTab as keyof typeof refRangeConfig] as any;
                                // Basic rename: add new, delete old. Warning: overwrites if exists.
                                if (!category[newName]) {
                                  category[newName] = category[testName];
                                  delete category[testName];
                                }
                                return newConfig;
                              });
                            }
                          }}
                          InputProps={{
                            disableUnderline: true,
                            style: {
                              fontSize: '1rem',
                              fontWeight: 'bold',
                              color: isDarkMode ? theme.palette.text.primary : "inherit"
                            }
                          }}
                          sx={{ mb: 1 }}
                        />

                        <Box display="grid" gridTemplateColumns="1fr 1fr 1fr auto" gap={2} alignItems="center">
                          <Typography variant="caption" color="text.secondary">Condition (Days)</Typography>
                          <Typography variant="caption" color="text.secondary">Range</Typography>
                          <Typography variant="caption" color="text.secondary">Unit</Typography>
                          <Typography variant="caption" color="text.secondary">Actions</Typography>
                        </Box>
                        {ranges.map((rangeItem: any, idx: number) => (
                          <Box key={idx} display="grid" gridTemplateColumns="1fr 1fr 1fr auto" gap={2} mt={1} alignItems="flex-start">
                            <TextField
                              size="small"
                              defaultValue={formatDaysDisplay(rangeItem.minDays, rangeItem.maxDays)}
                              fullWidth
                              onBlur={(e) => {
                                const parsed = parseDaysInput(e.target.value);
                                if (parsed) {
                                  setRefRangeConfig((prev: any) => {
                                    const newConfig = { ...prev };
                                    const category = newConfig[selectedSettingsTab as keyof typeof refRangeConfig] as any;
                                    const newTestRanges = [...category[testName]];
                                    newTestRanges[idx] = {
                                      ...newTestRanges[idx],
                                      maxDays: parsed.maxDays,
                                      minDays: parsed.minDays
                                    };
                                    category[testName] = newTestRanges;
                                    return newConfig;
                                  });
                                } else {
                                  // Invalid input, reset to current value
                                  e.target.value = formatDaysDisplay(rangeItem.minDays, rangeItem.maxDays);
                                }
                              }}
                              helperText="e.g. '2-10' or '14'"
                              sx={{
                                "& .MuiInputBase-input": { color: isDarkMode ? "text.primary" : "inherit" },
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? theme.palette.divider : undefined }
                              }}
                            />

                            <TextField
                              size="small"
                              value={rangeItem.range}
                              fullWidth
                              onChange={(e) => {
                                const newRange = e.target.value;
                                setRefRangeConfig((prev: any) => {
                                  const newConfig = { ...prev };
                                  const category = newConfig[selectedSettingsTab as keyof typeof refRangeConfig] as any;
                                  const newTestRanges = [...category[testName]];
                                  newTestRanges[idx] = { ...newTestRanges[idx], range: newRange };
                                  category[testName] = newTestRanges;
                                  return newConfig;
                                });
                              }}
                              sx={{
                                "& .MuiInputBase-input": { color: isDarkMode ? "text.primary" : "inherit" },
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? theme.palette.divider : undefined }
                              }}
                            />

                            <Autocomplete
                              freeSolo
                              options={COMMON_UNITS}
                              value={rangeItem.unit || ""}
                              onInputChange={(_event, newInputValue) => {
                                setRefRangeConfig((prev: any) => {
                                  const newConfig = { ...prev };
                                  const category = newConfig[selectedSettingsTab as keyof typeof refRangeConfig] as any;
                                  const newTestRanges = [...category[testName]];
                                  newTestRanges[idx] = { ...newTestRanges[idx], unit: newInputValue };
                                  category[testName] = newTestRanges;
                                  return newConfig;
                                });
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  placeholder="Unit"
                                  sx={{
                                    "& .MuiInputBase-input": { color: isDarkMode ? "text.primary" : "inherit" },
                                    "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? theme.palette.divider : undefined }
                                  }}
                                />
                              )}
                            />

                            <IconButton size="small" color="error" onClick={() => {
                              setRefRangeConfig((prev: any) => {
                                const newConfig = { ...prev };
                                const category = newConfig[selectedSettingsTab as keyof typeof refRangeConfig] as any;
                                const newTestRanges = [...category[testName]];
                                newTestRanges.splice(idx, 1);
                                if (newTestRanges.length === 0) {
                                  delete category[testName];
                                } else {
                                  category[testName] = newTestRanges;
                                }
                                return newConfig;
                              });
                            }}>
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Paper>
                    ))}
                    {/* Add Parameter Section */}
                    {!isAddingParameter ? (
                      <Button
                        startIcon={<AddCircleOutline />}
                        onClick={() => setIsAddingParameter(true)}
                        sx={{ textTransform: "none", mt: 2 }}
                      >
                        Add Parameter
                      </Button>
                    ) : (
                      <Paper variant="outlined" sx={{ p: 2, mb: 2, mt: 2, borderColor: isDarkMode ? theme.palette.divider : undefined }}>
                        <Typography variant="subtitle2" gutterBottom>Add New Parameter</Typography>
                        <Box display="flex" gap={2} alignItems="center">
                          <TextField
                            size="small"
                            label="Parameter Name"
                            value={newParameterData.name}
                            onChange={(e) => setNewParameterData({ ...newParameterData, name: e.target.value })}
                          />
                          <TextField
                            size="small"
                            label="Range"
                            value={newParameterData.range}
                            onChange={(e) => setNewParameterData({ ...newParameterData, range: e.target.value })}
                          />
                          <TextField
                            size="small"
                            label="Unit"
                            value={newParameterData.unit}
                            onChange={(e) => setNewParameterData({ ...newParameterData, unit: e.target.value })}
                          />
                          <IconButton onClick={() => {
                            if (newParameterData.name && newParameterData.range) {
                              setRefRangeConfig((prev: any) => {
                                const newConfig = { ...prev };
                                const category = { ...newConfig[selectedSettingsTab] };
                                // Add new parameter with default structure
                                category[newParameterData.name] = [{
                                  range: newParameterData.range,
                                  unit: newParameterData.unit,
                                  maxDays: 99999, // All Ages default
                                  sex: "" // Both sexes default
                                }];
                                return { ...newConfig, [selectedSettingsTab]: category };
                              });
                              setIsAddingParameter(false);
                              setNewParameterData({ name: "", unit: "", range: "" });
                            }
                          }}>
                            <CheckIcon color="success" />
                          </IconButton>
                          <IconButton onClick={() => setIsAddingParameter(false)}>
                            <CloseIcon color="error" />
                          </IconButton>
                        </Box>
                      </Paper>
                    )}
                  </>
                );
              } else {
                // Bilirubin (Array direct)
                return (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2, mb: 2,
                      backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.5) : "#f8fafc",
                      borderColor: isDarkMode ? theme.palette.divider : undefined
                    }}
                  >
                    <Typography fontWeight="bold" gutterBottom color={isDarkMode ? "text.primary" : "inherit"}>
                      Total Bilirubin Levels
                    </Typography>
                    {(currentConfig as any[]).map((rangeItem: any, idx: number) => (
                      <Box key={idx} display="grid" gridTemplateColumns="1fr 1fr 1fr auto" gap={2} mt={1} alignItems="center">
                        <Typography variant="body2" color={isDarkMode ? "text.primary" : "inherit"}>
                          Max Days: {rangeItem.maxDays}
                        </Typography>
                        <TextField
                          size="small"
                          value={rangeItem.range}
                          onChange={(e) => {
                            const newRange = e.target.value;
                            setRefRangeConfig((prev: any) => {
                              const newConfig = { ...prev };
                              const category = [...(newConfig.Bilirubin as any[])];
                              category[idx] = { ...category[idx], range: newRange };
                              return { ...newConfig, Bilirubin: category };
                            });
                          }}
                          sx={{
                            "& .MuiInputBase-input": { color: isDarkMode ? "text.primary" : "inherit" },
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? theme.palette.divider : undefined }
                          }}
                        />
                        <TextField
                          size="small"
                          placeholder="Unit"
                          value={rangeItem.unit || ""}
                          onChange={(e) => {
                            const newUnit = e.target.value;
                            setRefRangeConfig((prev: any) => {
                              const newConfig = { ...prev };
                              const category = [...(newConfig.Bilirubin as any[])];
                              category[idx] = { ...category[idx], unit: newUnit };
                              return { ...newConfig, Bilirubin: category };
                            });
                          }}
                          sx={{
                            "& .MuiInputBase-input": { color: isDarkMode ? "text.primary" : "inherit" },
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? theme.palette.divider : undefined }
                          }}
                        />
                      </Box>
                    ))}
                  </Paper>
                );
              }
            })()}
          </Box>
        </DialogContent >
      </Dialog >



      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"

        PaperProps={{
          sx: {
            borderRadius: "16px",
            backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
            transition: "max-height 0.35s ease",
            maxHeight: isExpanded ? "90vh" : "45vh",
            overflow: "hidden",
          },
        }}
      >

        <DialogTitle
          sx={{
            color: isDarkMode ? theme.palette.text.primary : "#000000ff",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          Diagnostic Report
          <IconButton onClick={() => setOpen(false)} sx={{ color: isDarkMode ? theme.palette.text.secondary : "#0F3B61" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            overflowY: isExpanded ? "auto" : "hidden",
            transition: "all 0.3s ease",
          }}
        >

          <Box sx={{ width: '100%' }}>

            <Typography
              variant="subtitle1"
              sx={{ color: isDarkMode ? theme.palette.text.secondary : "#858585", mb: 1 }}
            >
              Select Tests
            </Typography>

            {/* Test Search & Custom Add */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search or Add Custom Test"
                value={testSearch}
                sx={{
                  "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#000" },
                  backgroundColor: isDarkMode ? theme.palette.background.default : "#F9FAFB",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? theme.palette.divider : "rgba(0,0,0,0.23)" },
                }}
                onChange={(e) => setTestSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: isDarkMode ? theme.palette.text.disabled : "#dadcdfff" }} fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                disabled={!testSearch.trim()}
                onClick={() => {
                  // If it's not in the list, add it
                  if (!availableTests.some(t => t.toLowerCase() === testSearch.toLowerCase())) {
                    setAvailableTests(prev => [...prev, testSearch]);
                    toggleTest(testSearch); // Select it
                    setTestSearch(""); // Clear
                  }
                }}
              >
                Add
              </Button>
            </Box>

            {/* Chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
              {availableTests
                .filter(test =>
                  test.toLowerCase().includes(testSearch.toLowerCase())
                )
                .map(test => (
                  <Chip
                    key={test}
                    label={test}
                    clickable
                    onClick={() => toggleTest(test)}
                    // onDelete={() => handleDeleteTest(test)} // Disable delete from chips
                    sx={{
                      borderRadius: "16px",
                      bgcolor: isDarkMode ? alpha("#58A6FF", 0.2) : alpha("#228BE6", 0.15),
                      color: isDarkMode ? "#58A6FF" : "#228BE6",
                      fontWeight: 500,
                      "& .MuiChip-deleteIcon": {
                        color: isDarkMode ? alpha("#58A6FF", 0.7) : alpha("#228BE6", 0.7),
                        "&:hover": { color: isDarkMode ? "#58A6FF" : "#228BE6" }
                      },
                      "&:hover": {
                        bgcolor: isDarkMode ? alpha("#58A6FF", 0.3) : alpha("#228BE6", 0.25),
                      },
                    }}
                  />
                ))}
            </Box>
            <Box sx={{ mt: 3, }}>
              {selectedTests.map(test => (
                <Paper
                  key={test}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: "12px",
                    backgroundColor: isDarkMode ? theme.palette.background.default : "#FFF",
                    "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#000" },
                    "& .MuiInputBase-Label": { color: isDarkMode ? theme.palette.text.primary : "#000" },
                    border: `1px solid ${isDarkMode ? theme.palette.divider : "#b8b8b8ff"}`
                  }}
                >
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={600} color={isDarkMode ? theme.palette.text.primary : "black"}>{test}</Typography>

                    <IconButton size="small" onClick={() => toggleTest(test)}>
                      <RemoveCircleOutlineIcon color="error" />
                    </IconButton>
                  </Box>

                  {/* Specimen */}
                  <Box display={"flex"}>
                    <Box mt={2}>
                      <Typography variant="caption" color="grey">
                        Specimen
                      </Typography>

                      <ToggleButtonGroup
                        exclusive
                        value={testConfigs[test]?.specimen}
                        onChange={(_, newValue) => {
                          if (!newValue) return;
                          setTestConfigs(prev => ({
                            ...prev,
                            [test]: { ...prev[test], specimen: newValue },
                          }));
                        }}
                      >
                        {["Venous", "Heel Stick", "Arterial"].map((opt) => (
                          <ToggleButton
                            key={opt}
                            value={opt}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              color: "#7A8899",
                              width: "71px",
                              height: "48px",
                              border: "1px solid #D0D7E2",
                              borderRadius: "8px",
                              "&.Mui-selected": {
                                backgroundColor: alpha("#228BE6", 0.1),
                                color: "#228BE6",

                              },
                            }}
                          >
                            {opt}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>

                    </Box>

                    {/* Priority */}
                    <Box mt={2}>
                      <Typography variant="caption" color="grey">
                        Priority
                      </Typography>

                      <ToggleButtonGroup
                        exclusive
                        value={testConfigs[test]?.priority}
                        onChange={(_, newValue) => {
                          if (!newValue) return;
                          setTestConfigs(prev => ({
                            ...prev,
                            [test]: { ...prev[test], priority: newValue },
                          }));
                        }}
                      >
                        {["Routine", "Emergency"].map((opt) => (
                          <ToggleButton
                            key={opt}
                            value={opt}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              color: "#7A8899",
                              width: "83px",
                              height: "48px",
                              border: "1px solid #D0D7E2",
                              borderRadius: "8px",
                            }}
                          >
                            {opt}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>

                    </Box>

                    {/* Frequency */}
                    <Box mt={1}>
                      <Typography variant="caption" color="grey">
                        Fqy
                      </Typography>
                      <TextField
                        select
                        size="small"
                        value={testConfigs[test]?.frequency}
                        onChange={(e) =>
                          setTestConfigs(prev => ({
                            ...prev,
                            [test]: { ...prev[test], frequency: e.target.value },
                          }))
                        }
                        sx={{ mt: 1, height: "45px", width: 120, border: "1px solid  #D0D7E2", borderRadius: 2, color: "#7A8899" }}
                      >
                        {["Once", "Daily", "Weekly"].map(opt => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>

        {/* Sticky Footer for Diagnostic Report */}
        <DialogActions sx={{ p: 2, justifyContent: 'space-between', borderTop: `1px solid ${isDarkMode ? theme.palette.divider : '#E5E7EB'}` }}>
          <Button
            size="small"
            startIcon={<UploadFileIcon />}
            sx={{
              textTransform: "none",
              border: `1px solid ${isDarkMode ? theme.palette.divider : '#E5E7EB'}`,
              borderRadius: '8px',
              color: isDarkMode ? theme.palette.text.primary : "#4B5563",
              px: 2
            }}
            onClick={() => setOpenUploadDialog(true)}
          >
            + Upload Report
          </Button>

          <Box display="flex" gap={2}>
            <Button
              sx={{ color: 'white', backgroundColor: '#228BE6' }}
              variant="contained"
              disabled={selectedTests.length === 0}
              onClick={() => setOpen(false)}
            >
              Back
            </Button>

            <Button
              variant="contained"
              sx={{ backgroundColor: "#228BE6", color: "#fff" }}
              onClick={handlePlaceOrder}
              disabled={selectedTests.length === 0}
            >
              Order
            </Button>
          </Box>
        </DialogActions>
      </Dialog>


      <Dialog
        open={openCBCDialog}
        onClose={() => setOpenCBCDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 0, // Reset padding for custom layout
            backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
            boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh", // prevent overflow
          },
        }}
      >
        {/* ===== Header ===== */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={3}
          borderBottom={`1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`}
        >
          <Typography fontWeight={600} color={isDarkMode ? theme.palette.text.primary : "black"}>
            B/O : {patient_name} - {activeOrder?.testName || "Report"}
          </Typography>

          <IconButton onClick={() => setOpenCBCDialog(false)}>
            <CloseIcon sx={{ color: isDarkMode ? theme.palette.text.secondary : "#232324ff" }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, overflowY: "auto" }}>

          {/* ===== Meta Info ===== */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: isDarkMode ? theme.palette.background.default : "#ffffffff",
              border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
            }}
          >
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} mb={1}>
              {/* Collection: When the blood was actually drawn */}
              <Typography variant="caption" color={isDarkMode ? theme.palette.text.primary : "black"}>
                <b>Collection</b><br />
                {formatFHIRDate(activeOrder?.fullResource?.effectiveDateTime)}
              </Typography>

              {/* Received: When the server first saved the record (lastUpdated) */}
              <Typography variant="caption" color={isDarkMode ? theme.palette.text.primary : "black"}>
                <b>Received</b><br />
                {formatFHIRDate(activeOrder?.fullResource?.meta?.lastUpdated)}
              </Typography>

              {/* Report: When the results were finalized and issued */}
              <Typography variant="caption" color={isDarkMode ? theme.palette.text.primary : "black"}>
                <b>Report</b><br />
                {formatFHIRDate(activeOrder?.fullResource?.issued)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />

            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
              <Typography variant="caption" color={isDarkMode ? theme.palette.text.primary : "black"}>
                <b>Reported by</b><br />{activeOrder?.orderedBy || "--"}
              </Typography>
              <Typography variant="caption" color={isDarkMode ? theme.palette.text.primary : "black"}>
                <b>Verified by</b><br />{user?.name || "--"}
              </Typography>
            </Box>
          </Paper>

          {/* ===== Result Table ===== */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "12px",
              p: 2,
              border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
              backgroundColor: isDarkMode ? theme.palette.background.default : "#fff"
            }}
          >
            <Table size="small" sx={{
              borderCollapse: "separate",
              borderSpacing: "0 8px", // 👈 vertical gap between rows
            }}>
              <TableHead sx={{
                backgroundColor: isDarkMode ? theme.palette.background.paper : "#F8FAFC", "& th": {
                  borderBottom: "none",
                },
              }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: isDarkMode ? theme.palette.text.primary : "#000" }}>Result Entry</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDarkMode ? theme.palette.text.primary : "#000" }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDarkMode ? theme.palette.text.primary : "#000" }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: isDarkMode ? theme.palette.text.primary : "#000" }}>Reference Range</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>

              <TableBody sx={{ backgroundColor: isDarkMode ? theme.palette.background.default : "#fff" }}>
                {cbcResults.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                      borderRadius: "8px",
                      "& td": {},
                      "&:hover": { backgroundColor: isDarkMode ? theme.palette.action.hover : "#FAFAFA" },
                    }}
                  >
                    {/* Test Name */}
                    <TableCell sx={{
                      fontWeight: 500,
                      color: isDarkMode ? theme.palette.text.primary : "#000",
                      backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                      borderTopLeftRadius: "12px",
                      borderBottomLeftRadius: "12px",
                      border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                      borderRight: "none",
                    }} >
                      {row.isEditing ? (
                        <TextField
                          variant="standard"
                          fullWidth
                          value={row.test}
                          onChange={(e) => {
                            const updated = [...cbcResults];
                            updated[index].test = e.target.value;
                            setCbcResults(updated);
                          }}
                          sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem", fontWeight: 500, color: isDarkMode ? theme.palette.text.primary : "#000" } }}
                        />
                      ) : (
                        row.test
                      )}
                    </TableCell>


                    {/* Editable Value */}
                    <TableCell sx={{
                      backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                      borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                      borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                    }}>
                      {row.isEditing ? (
                        <TextField
                          variant="standard"
                          value={row.value}
                          autoFocus
                          onChange={(e) => {
                            const updated = [...cbcResults];
                            updated[index].value = e.target.value;
                            setCbcResults(updated);
                          }}
                          sx={{
                            width: 80, "& .MuiInputBase-input": {
                              color: isDarkMode ? theme.palette.text.primary : "#111827",
                              fontSize: "0.875rem",
                              fontWeight: 600
                            },
                            "& .MuiInput-underline:after": { borderBottomColor: isDarkMode ? "#58A6FF" : "#228BE6" },
                          }}
                        />
                      ) : (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography
                            sx={{
                              color: isOutOfRange(row.value, row.referenceRange) ? "#DC2626" : (isDarkMode ? theme.palette.text.primary : "#111827"),
                              fontWeight: isOutOfRange(row.value, row.referenceRange) ? 700 : 500
                            }}
                          >
                            {row.value || "—"}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>

                    {/* Unit */}
                    <TableCell sx={{
                      color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
                      backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                      borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                      borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                    }}>
                      {row.isEditing ? (
                        <TextField
                          variant="standard"
                          fullWidth
                          value={row.unit}
                          onChange={(e) => {
                            const updated = [...cbcResults];
                            updated[index].unit = e.target.value;
                            setCbcResults(updated);
                          }}
                          sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem", color: isDarkMode ? theme.palette.text.primary : "#000" } }}
                        />
                      ) : (
                        row.unit
                      )}
                    </TableCell>

                    {/* Reference */}
                    <TableCell sx={{
                      color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
                      backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                      borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                      borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                    }}>
                      {row.isEditing ? (
                        <TextField
                          variant="standard"
                          fullWidth
                          value={row.referenceRange}
                          onChange={(e) => {
                            const updated = [...cbcResults];
                            updated[index].referenceRange = e.target.value;
                            setCbcResults(updated);
                          }}
                          sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem", color: isDarkMode ? theme.palette.text.primary : "#000" } }}
                        />
                      ) : (
                        row.referenceRange
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{
                      backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                      borderTopRightRadius: "12px",
                      borderBottomRightRadius: "12px",
                      border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                      borderLeft: "none",
                    }}>
                      <Box display="flex" gap={0.5}>
                        {/* Move Up */}
                        <IconButton
                          size="small"
                          disabled={index === 0}
                          onClick={() => {
                            if (index === 0) return;
                            const updated = [...cbcResults];
                            [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
                            setCbcResults(updated);
                          }}
                        >
                          <ArrowUpward fontSize="small" sx={{ color: index === 0 ? "#E5E7EB" : "#9CA3AF" }} />
                        </IconButton>

                        {/* Move Down */}
                        <IconButton
                          size="small"
                          disabled={index === cbcResults.length - 1}
                          onClick={() => {
                            if (index === cbcResults.length - 1) return;
                            const updated = [...cbcResults];
                            [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
                            setCbcResults(updated);
                          }}
                        >
                          <ArrowDownward fontSize="small" sx={{ color: index === cbcResults.length - 1 ? "#E5E7EB" : "#9CA3AF" }} />
                        </IconButton>

                        {/* Edit */}
                        <IconButton
                          size="small"
                          onClick={() => {
                            const updated = [...cbcResults];
                            updated[index].isEditing = !updated[index].isEditing;
                            setCbcResults(updated);
                          }}
                        >
                          {row.isEditing ? (
                            <CheckIcon fontSize="small" sx={{ color: "#10B981" }} />
                          ) : (
                            <EditIcon fontSize="small" sx={{ color: "#228BE6" }} />
                          )}
                        </IconButton>

                        {/* Delete */}
                        <IconButton
                          size="small"
                          onClick={() => {
                            const updated = [...cbcResults];
                            updated.splice(index, 1);
                            setCbcResults(updated);
                          }}
                        >
                          <DeleteOutline fontSize="small" sx={{ color: "#EF4444" }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Add other */}
                <TableRow>
                  <TableCell sx={{
                    fontWeight: 500,
                    color: isDarkMode ? theme.palette.text.primary : "#000",
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                    borderTopLeftRadius: "12px",
                    borderBottomLeftRadius: "12px",
                    border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                    borderRight: "none",
                  }}>
                    <TextField
                      variant="standard"
                      placeholder="Add Other Items"
                      fullWidth
                      value={newItem.test}
                      onChange={(e) => setNewItem({ ...newItem, test: e.target.value })}
                      sx={{
                        width: 140,
                        "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#111827", fontSize: "0.875rem" },
                        "& .MuiInput-underline:after": { borderBottomColor: isDarkMode ? "#58A6FF" : "#228BE6" },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{
                    color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                    borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                    borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                  }}>
                    <TextField
                      variant="standard"
                      placeholder="Value"
                      fullWidth
                      value={newItem.value}
                      onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                      sx={{
                        width: 50,
                        "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#111827", fontSize: "0.875rem" },
                        "& .MuiInput-underline:after": { borderBottomColor: isDarkMode ? "#58A6FF" : "#228BE6" },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{
                    color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                    borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                    borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                  }}>
                    <TextField
                      variant="standard"
                      placeholder="Unit"
                      fullWidth
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      sx={{
                        width: 50,
                        "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#111827", fontSize: "0.875rem" },
                        "& .MuiInput-underline:after": { borderBottomColor: isDarkMode ? "#58A6FF" : "#228BE6" },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{
                    color: isDarkMode ? theme.palette.text.secondary : "#6B7280",
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                    borderTop: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                    borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                  }}>
                    <TextField
                      variant="standard"
                      placeholder="Ref Range"
                      fullWidth
                      value={newItem.referenceRange}
                      onChange={(e) => setNewItem({ ...newItem, referenceRange: e.target.value })}
                      sx={{
                        width: 90,
                        "& .MuiInputBase-input": { color: isDarkMode ? theme.palette.text.primary : "#111827", fontSize: "0.875rem" },
                        "& .MuiInput-underline:after": { borderBottomColor: isDarkMode ? "#58A6FF" : "#228BE6" },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{
                    backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
                    borderTopRightRadius: "12px",
                    borderBottomRightRadius: "12px",
                    border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`,
                    borderLeft: "none",
                  }}>
                    <IconButton onClick={handleAddItem} disabled={!newItem.test}>
                      <AddCircleOutline sx={{ color: newItem.test ? (isDarkMode ? "#58A6FF" : "#4338CA") : "#9CA3AF" }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>

        </DialogContent>

        {/* ===== Footer ===== */}
        <Box
          mt={3}
          pt={2}
          borderTop={`1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`}
          display="flex"
          gap={2}
        >
          {/* Scan */}
          <Button
            fullWidth
            startIcon={isProcessing ? <Box sx={{ animation: "spin 1s linear infinite" }}>⏳</Box> : <AutoAwesomeIcon />}
            onClick={(e) => {
              const supportedScanTests = ["cbc", "serum electrolytes", "total bilirubin"];
              const currentTest = activeOrder?.testName?.toLowerCase() || "";

              if (!supportedScanTests.includes(currentTest)) {
                setError("This order type is not yet supported for scanning. Support for additional tests is coming soon!");
                return;
              }
              handleScanMenuClick(e);
            }}
            disabled={isProcessing}
            sx={{
              flex: 1, // Full width in flex container
              textTransform: "none",
              color: "#4338CA",
              backgroundColor: alpha("#4338CA", 0.1),
              borderRadius: "10px",
            }}
          >
            Scan Auto-fill
          </Button>
          <Menu
            anchorEl={scanMenuAnchor}
            open={openScanMenu}
            onClose={handleScanMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={() => { handleScanMenuClose(); fileOCRInputRef.current?.click(); }}>
              <UploadFileIcon fontSize="small" sx={{ mr: 1, color: "#228BE6" }} /> Upload Image
            </MenuItem>
            <MenuItem onClick={() => { handleScanMenuClose(); setShowScanner(true); }}>
              <AutoAwesomeIcon fontSize="small" sx={{ mr: 1, color: "#4338CA" }} /> Capture Image
            </MenuItem>
          </Menu>

          {/* Hidden Input for PaddleOCR */}

          {/* Proceed */}
          <Button
            fullWidth
            variant="contained"
            disabled={isSaving}
            sx={{ flex: 1, textTransform: "none", backgroundColor: "#228BE6", color: "#fff", borderRadius: "10px", }}
            onClick={handleSaveCBCResults} // Call the FHIR update function
          >
            {isSaving ? "Saving..." : "Proceed →"}
          </Button>
        </Box>

      </Dialog>

      {/* Hidden Input for PaddleOCR */}
      <input
        type="file"
        accept="image/*"
        ref={fileOCRInputRef}
        style={{ display: "none" }}
        onChange={handlePaddleOCR}
      />

      {/* ===== Direct Upload Dialog ===== */}
      <Dialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
          Upload Report
          <IconButton onClick={() => setOpenUploadDialog(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Order Type Name" placeholder="e.g. Lipid Profile"
            margin="normal"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
          />
          <TextField
            fullWidth label="Reported By" placeholder="Lab Technician Name"
            margin="normal"
            value={uploadReportedBy}
            onChange={(e) => setUploadReportedBy(e.target.value)}
          />

          <Box mt={2} border="1px dashed #ccc" borderRadius="8px" p={3} textAlign="center">
            {uploadPreview ? (
              <Box>
                <img src={uploadPreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: "8px" }} />
                <Button size="small" color="error" onClick={() => { setUploadFile(null); setUploadPreview(null); }}>Remove</Button>
              </Box>
            ) : (
              <>
                <Typography variant="body2" color="textSecondary" mb={1}>
                  Upload Image or PDF
                </Typography>
                <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                  Choose File
                  <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileSelect} />
                </Button>
                <Typography variant="caption" display="block" mt={1}>or</Typography>
                <Button variant="text" startIcon={<AutoAwesomeIcon />} onClick={() => setShowScanner(true)}>
                  Take Photo
                </Button>
              </>
            )}
          </Box>
        </DialogContent>
        <Box p={2} pt={0} display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" disabled={!uploadFile || isSaving} onClick={handleDirectUploadSubmit}>
            {isSaving ? "Uploading..." : "Save & Finish"}
          </Button>
        </Box>
      </Dialog>

      {/* ===== Camera Dialog ===== */}
      <Dialog open={showScanner} onClose={() => setShowScanner(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Scan / Capture
          <IconButton onClick={() => setShowScanner(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", p: 2 }}>
          <Box sx={{
            width: "100%",
            height: 320,
            backgroundColor: "#000",
            borderRadius: "12px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2
          }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ facingMode: "environment" }}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={captureAndProcess}
            disabled={isProcessing}
            startIcon={isProcessing ?
              <Box sx={{ animation: "spin 1s linear infinite" }}>⏳</Box> :
              <AutoAwesomeIcon />
            }
          >
            {isProcessing ? "Processing..." : "Capture"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)} maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "20px", backgroundColor: isDarkMode ? theme.palette.background.paper : "#F9FAFB", },
        }}>
        {/* ===== HEADER (Hidden in Print) ===== */}
        <Box className="no-print" display="flex" alignItems="center" gap={1} px={3} py={2} borderBottom={`1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`}>
          <IconButton onClick={() => setOpenReportDialog(false)} sx={{ color: isDarkMode ? theme.palette.text.secondary : undefined }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          {/* Use activeOrder with optional chaining to prevent crash */}
          <Typography fontWeight={600} color={isDarkMode ? theme.palette.text.primary : "black"}>
            {activeOrder?.testName || "Laboratory"} Report
          </Typography>

          <Box ml="auto">
            <IconButton sx={{ color: isDarkMode ? theme.palette.text.secondary : "black" }} onClick={() => setOpenReportDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* ===== PRINT HEADER (Only visible during print) ===== */}
        <Box className="print-report-header">
          <Typography component="h1" fontWeight={700} fontSize="1.5rem" color={isDarkMode ? "#58A6FF" : "#228BE6"}>
            {activeOrder?.testName || "Laboratory"} Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </Typography>
        </Box>

        {/* ===== CONTENT ===== */}
        <DialogContent sx={{ backgroundColor: isDarkMode ? theme.palette.background.paper : "#F9FAFB" }}>
          <Paper
            elevation={0}
            sx={{
              backgroundColor: isDarkMode ? theme.palette.background.default : "#FFFFFF",
              borderRadius: "16px",
              p: 3,
            }}
          >
            {/* ===== META INFO ===== */}
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
              gap={2}
              color={isDarkMode ? theme.palette.text.primary : "black"}
            >
              <Typography variant="caption">
                <b>Collection</b><br />
                {/* Use issued date from the FHIR resource if available */}
                {activeOrder?.orderedAt || "N/A"}
              </Typography>
              <Typography variant="caption">
                <b>Specimen</b><br />
                {activeOrder?.specimen || "N/A"}
              </Typography>
              <Typography variant="caption">
                <b>Status</b><br />
                {activeOrder?.status?.toUpperCase() || "FINAL"}
              </Typography>
              <Typography variant="caption">
                <b>Reported by</b><br /> {activeOrder?.orderedBy || "Lab Information System"}
              </Typography>
              <Typography variant="caption">
                <b>Verified by</b><br /> {activeOrder?.verifiedBy || "--"}
              </Typography>
            </Box>

            <Box sx={{ my: 3, height: "1px", backgroundColor: isDarkMode ? theme.palette.divider : "#E5E7EB" }} />

            {/* ===== TABLE OR ATTACHMENT SECTION ===== */}
            <Typography fontWeight={600} color={isDarkMode ? "#58A6FF" : "#228BE6"} mb={1}>
              {activeOrder?.testName} Results
            </Typography>

            {activeOrder?.attachment ? (
              <Box mt={2} textAlign="center" sx={{ border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`, borderRadius: "12px", overflow: "hidden", p: 1 }}>
                {activeOrder.contentType === 'application/pdf' ? (
                  <iframe
                    src={`data:application/pdf;base64,${activeOrder.attachment}`}
                    width="100%"
                    height="500px"
                    style={{ border: "none" }}
                  />
                ) : (
                  <img
                    src={`data:${activeOrder.contentType || 'image/png'};base64,${activeOrder.attachment}`}
                    alt="Report Attachment"
                    style={{ maxWidth: "100%", maxHeight: "600px" }}
                  />
                )}
              </Box>
            ) : (
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead sx={{ backgroundColor: isDarkMode ? theme.palette.background.paper : "#F8FAFC" }}>
                  <TableRow>
                    <TableCell sx={{ color: isDarkMode ? theme.palette.text.primary : "black" }}>Test</TableCell>
                    <TableCell sx={{ color: isDarkMode ? theme.palette.text.primary : "black" }}>Result</TableCell>
                    <TableCell sx={{ color: isDarkMode ? theme.palette.text.primary : "black" }}>Unit</TableCell>
                    <TableCell sx={{ color: isDarkMode ? theme.palette.text.primary : "black" }}>Reference Range</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {/* Map through reportData (parsed from FHIR) instead of static mockCBCData */}
                  {reportData.length > 0 ? (
                    reportData.map((row, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ color: isDarkMode ? theme.palette.text.primary : "#111827", fontWeight: 500 }}>
                          {row.test}
                        </TableCell>
                        <TableCell sx={{ color: isDarkMode ? "#58A6FF" : "#228BE6", fontWeight: 700 }}>
                          {row.result}
                        </TableCell>
                        <TableCell sx={{ color: isDarkMode ? theme.palette.text.secondary : "#858585ff" }}>{row.unit}</TableCell>
                        <TableCell sx={{ color: isDarkMode ? theme.palette.text.secondary : "#858585ff" }}>{row.ref}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: "grey" }}>
                        No result data found in this report.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {/* ===== AUTO SUMMARY ===== */}
            <Box className="print-auto-summary" sx={{ mt: 3, p: 2, borderRadius: "10px", backgroundColor: isDarkMode ? theme.palette.background.paper : "#F9FAFB" }}>
              <Typography fontWeight={600} fontSize="0.85rem" color={isDarkMode ? "#A371F7" : "#4F46E5"} mb={0.5}>
                Auto-Summary
              </Typography>
              <Typography variant="body2" color={isDarkMode ? theme.palette.text.primary : "#111827"}>
                {/* You could optionally parse the summary from the FHIR conclusion if you saved one */}
                This {activeOrder?.testName} report has been processed and verified.
                Please review the specific test values above against the reference ranges.
              </Typography>
            </Box>

            {/* ===== ACTION BUTTONS (Hidden in Print) ===== */}
            <Box className="no-print" display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button
                size="small"
                onClick={() => window.print()}
                sx={{
                  backgroundColor: alpha("#228BE6", 0.1), color: "#228BE6",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                }}
              >
                Print Report
              </Button>
              <Button size="small" variant="outlined" sx={{ textTransform: "none", borderRadius: "8px", px: 2 }} >
                + Review Note
              </Button>
            </Box>
          </Paper>
        </DialogContent>
      </Dialog>
      <Snackbar open={saveSuccess} autoHideDuration={6000} onClose={() => setSaveSuccess(false)}>
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }}> Report saved successfully! </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}> {error} </Alert>
      </Snackbar>

      {/* ===== Loading Dialog ===== */}
      <Dialog
        open={isProcessing}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            textAlign: "center",
            p: 2,
          }
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <AutoAwesomeIcon sx={{ color: "#4338CA", fontSize: 20 }} />
            <Typography fontWeight={600} fontSize="1rem">
              Extraction & Filling results
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setIsProcessing(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          {/* Document Icon with Glitter */}
          <Box position="relative" mb={3}>
            {/* Main File Icon */}
            <InsertDriveFile sx={{ fontSize: 60, color: "#BFDBFE" }} />
            {/* Center filled part style if needed, mapped to color */}

            {/* Glitter Stars (Simulated with absolute positioned stars) */}
            <AutoAwesomeIcon sx={{
              position: "absolute", top: -10, right: -10,
              color: "#FBBF24", fontSize: 24,
              animation: "pulse 1.5s infinite"
            }} />
            <AutoAwesomeIcon sx={{
              position: "absolute", bottom: -5, left: -10,
              color: "#FBBF24", fontSize: 16,
              animation: "pulse 2s infinite"
            }} />
          </Box>

          {/* Progress Bar */}
          <Box width="100%">
            <LinearProgress sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "#E0E7FF",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#4338CA"
              }
            }} />
          </Box>
        </DialogContent>
      </Dialog>
    </Box >
  );
};