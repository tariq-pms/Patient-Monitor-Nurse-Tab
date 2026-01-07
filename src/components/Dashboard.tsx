import {
  Box, Typography, Button, TableRow, Table, TableBody,
  TableCell, TableHead, IconButton, Paper,
  Chip, Snackbar, Alert,ToggleButton,Checkbox,Divider,ToggleButtonGroup,Dialog,DialogContent,DialogTitle,TextField,MenuItem,
  } from "@mui/material";
import { AddCircleOutline, } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import { useEffect,  useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import EditIcon from "@mui/icons-material/Edit";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import { alpha } from "@material-ui/core";
// import { active } from "d3";
interface DashboardProps {
  
  patient: any;
  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
  UserRole: string;
  onClose: () => void;
  
}
const CBC_REPORT_TEMPLATE = [
  {
    test: "Hemoglobin (Hb)",
    value: "",
    unit: "g/dL",
    referenceRange: "13.4 - 19.9",
    isEditing: false,
  },
  {
    test: "Hematocrit",
    value: "",
    unit: "%",
    referenceRange: "42 - 65",
    isEditing: false,
  },
  {
    test: "RBC Count",
    value: "",
    unit: "million/µL",
    referenceRange: "3.90 - 5.90",
    isEditing: false,
  },
  {
    test: "WBC Count",
    value: "",
    unit: "×10³/µL",
    referenceRange: "9.0 – 30.0",
    isEditing: false,
  },
  {
    test: "Neutrophils",
    value: "",
    unit: "%",
    referenceRange: "45 – 75",
    isEditing: false,
  },
  {
    test: "Lymphocytes",
    value: "",
    unit: "%",
    referenceRange: "20 – 50",
    isEditing: false,
  },
  {
    test: "Platelet Count",
    value: "",
    unit: "×10³/µL",
    referenceRange: "150 – 450",
    isEditing: false,
  },
];

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
  reportData?: typeof CBC_REPORT_TEMPLATE;
  
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  // patient,
  // patient_name, 
  patient_resource_id,
  // onClose 
}) => {
  
 /* const [showScanner, setShowScanner] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{table: LabReport[], metadata: any} | null>(null);
  
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedReports, setSavedReports] = useState<any[]>([]);
const [isLoadingReports, setIsLoadingReports] = useState(false);

  const captureAndProcess = async () => {
    if (!webcamRef.current) return;
  
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Failed to capture image. Please try again.");
      return;
    }
  
    setCapturedImage(imageSrc);
    setIsProcessing(true);
  
    try {
      const response = await processImage(imageSrc);
      console.log('Processing Response:', response);
  
      if (response.error) throw new Error(response.error);
  
      setExtractedData(response);
    } catch (error: any) {
      console.error('Processing Error:', error);
      setError(`Error processing image: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setShowScanner(false);
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('https://pmsind.co.in:5001/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      return await response.json();
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    fetch('https://pmsind.co.in:5001/api/upload', {
      method: 'POST',
      body: formData
    })
      .then(async (response) => {
        const data = await response.json();
        console.log("📦 Server response from upload:", data);
        if (!response.ok || data.error) throw new Error(data.error || 'Upload failed');
        setExtractedData(data);
      })
      .catch((err) => {
        console.error('Upload error:', err);
        setError(err.message);
      })
      .finally(() => setIsProcessing(false));
  };

  // const saveAsFHIRDiagnosticReport = async () => {
  //   if (!extractedData || !patient_resource_id) return;
    
  //   setIsSaving(true);
  //   setError(null);

  //   try {
  //     // Convert the extracted data to FHIR DiagnosticReport format
  //     const diagnosticReport = {
  //       resourceType: "DiagnosticReport",
  //       status: "final",
  //       code: {
  //         coding: [{
  //           system: "http://loinc.org",
  //           code: "11502-2",
  //           display: "Laboratory report"
  //         }]
  //       },
  //       subject: {
  //         reference: `Patient/${patient_resource_id}`
  //       },
  //       effectiveDateTime: new Date().toISOString(),
  //       issued: new Date().toISOString(),
  //       result: extractedData.table.map((test, index) => ({
  //         reference: `Observation/${index}-${Date.now()}`,
  //         display: `${test.testName}: ${test.result}`
  //       })),
  //       contained: extractedData.table.map((test, index) => ({
  //         resourceType: "Observation",
  //         id: `${index}-${Date.now()}`,
  //         status: "final",
  //         code: {
  //           text: test.testName || "Unknown test"
  //         },
  //         valueQuantity: {
  //           value: parseFloat(test.result || "0"),
  //           unit: test.units,
  //           system: "http://unitsofmeasure.org",
  //           code: test.units
  //         },
  //         referenceRange: test.referenceRange ? [{
  //           text: test.referenceRange
  //         }] : undefined,
  //         interpretation: test.status ? [{
  //           coding: [{
  //             system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
  //             code: test.status === "Normal" ? "N" : "A",
  //             display: test.status
  //           }]
  //         }] : undefined
  //       }))
  //     };

  //     // Save to your FHIR server
  //     const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport`, {
  //       method: 'POST',
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //       body: JSON.stringify(diagnosticReport)
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'Failed to save report');
  //     }

  //     setSaveSuccess(true);
  //   } catch (err) {
  //     console.error('Error saving report:', err);
  //     setError(err instanceof Error ? err.message : 'Failed to save report');
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };
  const saveAsFHIRDiagnosticReport = async () => {
    if (!extractedData || !patient_resource_id) {
      setError('Missing required data to save report');
      return;
    }
  
    setIsSaving(true);
    setError(null);
  
    try {
      // Convert to simplified FHIR DiagnosticReport format without Observations
      const diagnosticReport = {
        resourceType: "DiagnosticReport",
        status: "final",
        code: {
          coding: [{
            system: "http://loinc.org",
            code: "11502-2",
            display: "Laboratory report"
          }]
        },
        subject: {
          reference: `Patient/${patient_resource_id}`
        },
        effectiveDateTime: new Date().toISOString(),
        issued: new Date().toISOString(),
        conclusion: extractedData.table.map(test =>
          `${test.testName || test.test}: ${test.result} ${test.unit || ''}` +
          (test.referenceRange ? ` (Ref: ${test.referenceRange})` : '') +
          (test.status ? ` [${test.status}]` : '')
        ).join('\n')
      };
  
      console.log('Sending FHIR payload:', diagnosticReport);
  
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(diagnosticReport)
      });
  
      if (!response.ok) {
        let errorMessage = `Server responded with status ${response.status}`;
        try {
          const text = await response.text();
          if (text) {
            const errorData = JSON.parse(text);
            errorMessage = errorData?.issue?.[0]?.details?.text ||
                           errorData?.error || errorMessage;
          }
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
  
      // ✅ Safely handle empty response body
      const responseText = await response.text();
      const result = responseText ? JSON.parse(responseText) : {};
      console.log('Successfully saved report:', result);
      setSaveSuccess(true);
      fetchPatientReports();
    } catch (err) {
      console.error('Detailed error:', err);
      setError(`Error saving report: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };
  const fetchPatientReports = async () => {
    setIsLoadingReports(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport?subject=Patient/${patient_resource_id}`,
        {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }
  
      const data = await response.json();
      setSavedReports(data.entry || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(`Error loading reports: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingReports(false);
    }
  };
  const parseConclusionToTable = (conclusion: string) => {
    const lines = conclusion.split('\n');
    return lines.map(line => {
      // Extract components from each line
      const testMatch = line.match(/^(.+?):/);
      const resultMatch = line.match(/:\s*(.+?)\s*(\(|\[|$)/);
      const refMatch = line.match(/\(Ref:\s*(.+?)\)/);
      const statusMatch = line.match(/\[(.+?)\]$/);
  
      return {
        test: testMatch ? testMatch[1].trim() : 'Unknown',
        result: resultMatch ? resultMatch[1].trim() : '',
        referenceRange: refMatch ? refMatch[1].trim() : undefined,
        status: statusMatch ? statusMatch[1].trim() : undefined,
      };
    });
  };

  useEffect(() => {
    fetchPatientReports();
  }, [patient_resource_id]); // Re-fetch when patient changes
  
  const ReportViewer = ({ report }: { report: any }) => {
    const tests = parseConclusionToTable(report.resource.conclusion);
  

//new report 



    return (
      <Box sx={{ mt: 3, mb: 4 ,p:2,backgroundColor:'#FFFFFF',borderRadius:'20px'}}>
        <Typography variant="subtitle1" gutterBottom>
          Report from {new Date(report.resource.effectiveDateTime).toLocaleString()}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{backgroundColor:'grey'}}>
                <TableCell>Test</TableCell>
                <TableCell >Result</TableCell>
                <TableCell >Reference Range</TableCell>
                <TableCell >Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.map((test, index) => (
                <TableRow key={index}>
                  <TableCell sx={{color:'black'}}>{test.test}</TableCell>
                  <TableCell sx={{color:'black'}}>{test.result}</TableCell>
                  <TableCell sx={{color:'black'}}>{test.referenceRange || 'N/A'}</TableCell>
                  <TableCell sx={{color:'black'}}>
                    <Chip
                      label={test.status || 'Unknown'}
                      color={test.status === 'Normal' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };



 */
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

// const patientName =
//   patient.name?.[0]?.text ||
//   `${patient.name?.[0]?.given?.join(" ")} ${patient.name?.[0]?.family}`;

// const patientId = patient.identifier?.[0]?.value;

// const dob = patient.birthDate;

// const gender = patient.gender;

// const gestationalAge =
//   patient.extension?.find(
//     (e: any) =>
//       e.url ===
//       "http://example.org/fhir/StructureDefinition/patient-gestationalAge"
//   )?.valueString;


const AVAILABLE_TESTS = [
  "CBC",
  "Serum Bilirubin",
  "Electrolytes",
  "Blood Gas",
  "CRP",
  "Blood Culture",
];

const [testSearch, setTestSearch] = useState("");
const [selectedTests, setSelectedTests] = useState<string[]>([]);
const [openReportDialog,setOpenReportDialog]=useState<boolean>(false);
const isExpanded = selectedTests.length > 0;

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
const [patientVerified, setPatientVerified] = useState(false);
const [openCBCDialog,setOpenCBCDialog]=useState(false);
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

const [cbcResults, setCbcResults] = useState(CBC_REPORT_TEMPLATE);
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
    // fetchPatientReports();

  } catch (err) {
    setError(err instanceof Error ? err.message : 'An unknown error occurred');
  }
};
const isCBCOrder = (order: DiagnosticOrder | null) =>
  !!order && order.testName.toLowerCase().includes("cbc");

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
const [activeOrder, setActiveOrder] = useState<any | null>(null);
const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
const [sampleQty, setSampleQty] = useState("");
const handleOpenCBC = (order: DiagnosticOrder) => {
     if (!isCBCOrder(order)) return;
  setActiveOrder(order);
  setOpenCBCDialog(true);
  setCbcResults(CBC_REPORT_TEMPLATE);
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
console.log("selectorder",selectedOrder);

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
          orderedBy: "Dr. System", // FHIR would usually have this in resource.performer
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
   
    console.log("FHIR response (after PUT):",updatedResource);
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
      conclusion: `RESULTS:\n${resultsString}\n\n${activeOrder.fullResource.conclusion}`,
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
   console.log("updatedResource value entered",updatedResource);
   
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
    
    
    <Box sx={{ flexGrow: 1, padding: 2,  justifyContent: 'center' }}>
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
          sx={{
            color: "#0F3B61",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          Diagnostic Report
        </Typography>

        <Button
          
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor:alpha("#228BE6",0.1),
            color: "#228BE6",
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            "&:hover": {  },
          }}
        >
          + Order
        </Button>
        
      </Box>
      {/* Diagnostics Header */}
      
{!selectedOrder ? (
 <>
 {/* Header */}
<Box
  sx={{
    mb: 1,
    px: 2,
    py: 1,
    backgroundColor: alpha("#868E96", 0.12),
    borderRadius: "8px",
    display: { xs: "none", md: "grid" },
    gridTemplateColumns: "2fr 1fr 1fr 2fr auto",
    alignItems: "center",
    color: "#868E96",
    fontSize: "0.75rem",
    fontWeight: 500,
  }}
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
     
      sx={{
        mb: 1,
        px: 2,
        py: 1.25,
        borderRadius: "10px",
        boxShadow: "none",
        backgroundColor: "#FFFFFF",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "3fr 1.5fr 1.5fr 3fr 120px" },
        gap: { xs: 1, md: 0 },
        alignItems: "center",
      
      
       
      }}
      >
      {/* Order type */}
      <Box sx={{ minWidth: 0 }}>
      <Typography fontWeight={600} noWrap sx={{ color: "#111827" }}>
        {order.testName}
      </Typography>
      <Typography variant="caption" sx={{ 
        color: order.priority === "Emergency" ? "#DC2626" : "#6B7280",
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
        sx={{ backgroundColor: "#E5E7EB", color: "#374151", height: 22 }}
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
      <Typography variant="caption" display="block" sx={{ color: "#111827" }}>
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
        handleOpenCBC(order);
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
):( <>
   {/* Meta */}
    <Paper  elevation={0}
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    p: { xs: 2, md: 3 },
  }}>
      <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} color={"black"}>
        <Typography variant="caption"><b>Collection</b><br />15/05/2025 07:45 AM</Typography>
        <Typography variant="caption"><b>Received</b><br />15/05/2025 11:45 AM</Typography>
        <Typography variant="caption"><b>Report</b><br />16/06/2025 11:45 AM</Typography>
        <Typography variant="caption"><b>Reported by</b><br />Ritu Sharma</Typography>
        <Typography variant="caption"><b>Verified by</b><br />Dr. Ramesh Kumar</Typography>
      </Box>
    </Paper>
{/* ================= TABLE (mockCBCData USED HERE) ================= */}
    <Paper  elevation={0}
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    p: { xs: 2, md: 3 },
    mt:2
  }}>
      <Typography sx={{ px: 2, py: 1, fontWeight: 600, color: "#228BE6" }}>
        Complete Blood Count (CBC)
      </Typography>

      <Table size="small">
        <TableHead  sx={{ backgroundColor: "#F8FAFC" }}>
          <TableRow>
            <TableCell sx={{color:"black"}}>Test</TableCell>
            <TableCell sx={{color:"black"}}>Result</TableCell>
            <TableCell sx={{color:"black"}}>Unit</TableCell>
            <TableCell sx={{color:"black"}}>Reference Range</TableCell>
            <TableCell sx={{color:"black"}}>Method</TableCell>
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
              
              <TableCell sx={{ color : "#000 !important" }}>{row.unit}</TableCell>
              <TableCell sx={{ color : "#111827" }}>{row.ref}</TableCell>
              <TableCell sx={{ color : "#111827" }}>{row.method}</TableCell>
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
      backgroundColor: "#fff",
    },
  }}
>
  {/* Header */}
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography fontWeight={600} color={"black"}>
      Sample Collection
    </Typography>
    <IconButton onClick={() => setOpenSampleDialog(false)}>
      <CloseIcon sx={{ color: "black" }} />
    </IconButton>
  </Box>

  <Divider sx={{ my: 2 }} />

  {/* Patient Verified */}
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    sx={{
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      px: 2,
      py: 1.5,
      mb: 2,
    }}
  >
    <Typography color={"black"}>Patient Verified?</Typography>
    <Checkbox
      sx={{ color: "black" }}
      checked={patientVerified}
      onChange={(e) => setPatientVerified(e.target.checked)}
    />
  </Box>

  {/* Sample Qty */}
  <Box mb={2}>
    <Typography variant="caption" color="black">
      Sample qty
    </Typography>

    <TextField
      fullWidth
      placeholder="Collected Sample qty"
      value={sampleQty}
      onChange={(e) => setSampleQty(e.target.value)}
      sx={{
        mt: 1,
        "& .MuiOutlinedInput-root": { borderRadius: "12px", pr: 1, color: "#000" },
        "& .MuiOutlinedInput-Input": { color: "#cececeff" },
        backgroundColor: "#F9FAFB",
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
                  backgroundColor: sampleQty === qty ? "#228BE6" : "#E8F1FD",
                  color: sampleQty === qty ? "#fff" : "#228BE6",
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
  <Typography variant="caption" color="grey">
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
          color: "#7A8899",
          height: "48px",
          border: "1px solid #D0D7E2",
          borderRadius: "8px",
          "&.Mui-selected": {
            backgroundColor: alpha("#228BE6", 0.1),
            color: "#228BE6",
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
  open={open}
  onClose={() => setOpen(false)}
  fullWidth
  maxWidth="sm"
  
  PaperProps={{
    sx: {
      borderRadius: "16px",
      backgroundColor: "#FFFFFF",
      transition: "max-height 0.35s ease",
      maxHeight: isExpanded ? "90vh" : "45vh", // 🔥 WORKS
      overflow: "hidden",
    },
  }}
>

        <DialogTitle
          sx={{
            color: "#000000ff",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          Diagnostic Report
          <IconButton onClick={() => setOpen(false)} sx={{ color: "#0F3B61" }}>
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

      <Box sx={{ width: '100%'}}>
      
        <Typography
  variant="subtitle1"
  sx={{ color: "#858585", mb: 1 }}
>
  Select Tests
</Typography>

{/* Search */}
<Box sx={{ mb: 2 }}>
  <TextField
    fullWidth
    size="small"
    placeholder="Search Tests"
    value={testSearch}
    sx={{ "& .MuiInputBase-input": { color: "#000" },backgroundColor:"#F9FAFB"}}
    onChange={(e) => setTestSearch(e.target.value)}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon sx={{color:"#dadcdfff"}} fontSize="small" />
        </InputAdornment>
      ),
    }}
  />
</Box>

{/* Chips */}
<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
  {AVAILABLE_TESTS
    .filter(test =>
      test.toLowerCase().includes(testSearch.toLowerCase())
    )
    .map(test => (
      <Chip
        key={test}
        label={test}
        clickable
        onClick={() => toggleTest(test)}
        sx={{
          borderRadius: "16px",
          bgcolor: 
             alpha("#228BE6", 0.15),
            
          color:  "#228BE6",
            
          fontWeight: 500,
        }}
      />
    ))}
</Box>
<Box sx={{ mt: 3,}}> 
  {selectedTests.map(test => (
    <Paper
      key={test}
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: "12px",
        backgroundColor:"#FFF",
        "& .MuiInputBase-input": { color: "#000" },
      "& .MuiInputBase-Label": { color: "#000" },
      border:"1px solid #b8b8b8ff" 
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={600} color={"black"}>{test}</Typography>

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
          sx={{ mt: 1, height:"45px",width: 120,border:"1px solid  #D0D7E2",borderRadius:2,color:"#7A8899" }}
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


        <Box mb={3} sx={{ backgroundColor: 'white', borderRadius: '20px' }}>
          <Box sx={{ p: 3 }}>
           
              <Box textAlign="center" py={4}>
                

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button 
                    sx={{color:'white',backgroundColor:'#228BE6'}} 
                    variant="contained" 
                    disabled={selectedTests.length === 0}
                  >
                    Back
                  </Button>

                 <Button
  variant="contained"
  sx={{ backgroundColor: "#228BE6" ,color:"#fff"}}
  onClick={handlePlaceOrder}
  disabled={selectedTests.length === 0}
>
  Order 
</Button>
     </Box>
              </Box>
          </Box>
        </Box>
      </Box>
      </DialogContent>
        </Dialog>


<Dialog
  open={openCBCDialog}
  onClose={() => setOpenCBCDialog(false)}
  maxWidth="md"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: "16px",
      p: 3,
      backgroundColor: "#FFFFFF",
      boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
    },
  }}
>
  {/* ===== Header ===== */}
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    mb={2}
  >
    <Typography fontWeight={600} color={"black"}>
      B/O {selectedOrder?.testName}: CBC Report
    </Typography>

    <IconButton onClick={() => setOpenCBCDialog(false)}>
      <CloseIcon sx={{ color: "#232324ff" }} />
    </IconButton>
  </Box>

  {/* ===== Meta Info ===== */}
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      mb: 2,
      borderRadius: "12px",
      backgroundColor: "#ffffffff",
      border: "1px solid #E5E7EB",
    }}
  >
    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} mb={1}>
  {/* Collection: When the blood was actually drawn */}
  <Typography variant="caption" color={"black"}>
    <b>Collection</b><br />
    {formatFHIRDate(activeOrder?.fullResource?.effectiveDateTime)}
  </Typography>

  {/* Received: When the server first saved the record (lastUpdated) */}
  <Typography variant="caption" color={"black"}>
    <b>Received</b><br />
    {formatFHIRDate(activeOrder?.fullResource?.meta?.lastUpdated)}
  </Typography>

  {/* Report: When the results were finalized and issued */}
  <Typography variant="caption" color={"black"}>
    <b>Report</b><br />
    {formatFHIRDate(activeOrder?.fullResource?.issued)}
  </Typography>
</Box>
    <Divider sx={{ my: 1 }} />

    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
      <Typography variant="caption" color={"black"}>
        <b>Reported by</b><br />--
      </Typography>
      <Typography variant="caption" color={"black"}>
        <b>Verified by</b><br />--
      </Typography>
    </Box>
  </Paper>

  {/* ===== Result Table ===== */}
  <Paper
    elevation={0}
    sx={{
      borderRadius: "12px",
      p: 2,
      border: "1px solid #E5E7EB",
      backgroundColor:"#fff"
    }}
  >
    <Table size="small"  sx={{
    borderCollapse: "separate",
    borderSpacing: "0 8px", // 👈 vertical gap between rows
  }}>
      <TableHead sx={{ backgroundColor: "#F8FAFC" , "& th": {
      borderBottom: "none",
    },}}>
        <TableRow>
          <TableCell sx={{fontWeight:700, color:"#000"}}>Result Entry</TableCell>
          <TableCell sx={{fontWeight:700,color:"#000"}}>Value</TableCell>
          <TableCell sx={{fontWeight:700,color:"#000"}}>Unit</TableCell>
          <TableCell sx={{fontWeight:700,color:"#000"}}>Reference Range</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>

      <TableBody sx={{backgroundColor:"#fff"}}>
        {cbcResults.map((row, index) => (
          <TableRow
            key={index}
            sx={{
             backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    
    "& td": {
      
    },
              "&:hover": { backgroundColor: "#FAFAFA" },
            }}
          >
            {/* Test */}
            <TableCell sx={{ fontWeight: 500 ,color:"#000",  backgroundColor: "#FFFFFF",
    borderTopLeftRadius: "12px",
    borderBottomLeftRadius: "12px",
    border: "1px solid #E5E7EB",
    borderRight: "none",}} >
              {row.test}
            </TableCell>

        
           {/* Editable Value */}
<TableCell sx={{ 
  backgroundColor: "#FFFFFF",
  borderTop: "1px solid #E5E7EB",
  borderBottom: "1px solid #E5E7EB",
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
      onBlur={() => {
        const updated = [...cbcResults];
        updated[index].isEditing = false;
        setCbcResults(updated);
      }}
      sx={{ 
        width: 90, 
        "& .MuiInputBase-input": {
          // Highlight text in Red while typing if out of range
          color: isOutOfRange(row.value, row.referenceRange) ? "#DC2626" : "#111827",
          fontSize: "0.875rem",
          fontWeight: isOutOfRange(row.value, row.referenceRange) ? 700 : 500,
        },
      }}
    />
  ) : (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Typography
        sx={{ 
          // Highlight static text in Red if out of range
          color: isOutOfRange(row.value, row.referenceRange) ? "#DC2626" : "#228BE6", 
          fontWeight: isOutOfRange(row.value, row.referenceRange) ? 700 : 500 
        }}
      >
        {row.value || "—"}
        {/* Optional: Add a small warning icon if out of range */}
        {isOutOfRange(row.value, row.referenceRange) }
      </Typography>
    </Box>
  )}
</TableCell>

            {/* Unit */}
            <TableCell sx={{ color: "#6B7280" , backgroundColor: "#FFFFFF",
    borderTop: "1px solid #E5E7EB",
    borderBottom: "1px solid #E5E7EB",}}>
              {row.unit}
            </TableCell>

            {/* Reference */}
            <TableCell sx={{ color: "#6B7280" , backgroundColor: "#FFFFFF",
    borderTop: "1px solid #E5E7EB",
    borderBottom: "1px solid #E5E7EB",}}>
              {row.referenceRange}
            </TableCell>

            <TableCell sx={{  backgroundColor: "#FFFFFF",
    borderTopRightRadius: "12px",
    borderBottomRightRadius: "12px",
    border: "1px solid #E5E7EB",
    borderLeft: "none",}}><IconButton
                    size="small"
                    onClick={() => {
                      const updated = [...cbcResults];
                      updated[index].isEditing = true;
                      setCbcResults(updated);
                    }}
                  >
                    <EditIcon fontSize="small" sx={{ color: "#228BE6" }} />
                  </IconButton></TableCell>
          </TableRow>
        ))}

        {/* Add other */}
        <TableRow>
          <TableCell sx={{ fontWeight: 500 ,color:"#000",  backgroundColor: "#FFFFFF",
    borderTopLeftRadius: "12px",
    borderBottomLeftRadius: "12px",
    border: "1px solid #E5E7EB",
    borderRight: "none",}}>
            <TextField
              variant="standard"
              placeholder="Add Other Items (if missing)"
              fullWidth
               sx={{ width: 90 , "& .MuiInputBase-input": {
      color: "#111827",       // dark text
      fontSize: "0.875rem",
    },

    
    "& .MuiInput-underline:after": {
      borderBottomColor: "#228BE6",
    },}}
            />
          </TableCell>
          <TableCell sx={{ color: "#6B7280" , backgroundColor: "#FFFFFF",
    borderTop: "1px solid #E5E7EB",
    borderBottom: "1px solid #E5E7EB",}}>
            <TextField variant="standard" placeholder="Value" fullWidth   sx={{ width: 90 , "& .MuiInputBase-input": {
      color: "#111827",       // dark text
      fontSize: "0.875rem",
    },

   
    "& .MuiInput-underline:after": {
      borderBottomColor: "#228BE6",
    },}}/>
          </TableCell>
          <TableCell sx={{ color: "#6B7280" , backgroundColor: "#FFFFFF",
    borderTop: "1px solid #E5E7EB",
    borderBottom: "1px solid #E5E7EB",}}>
            <TextField variant="standard" placeholder="Unit" fullWidth  sx={{ width: 90 , "& .MuiInputBase-input": {
      color: "#111827",       // dark text
      fontSize: "0.875rem",
    },

   
    "& .MuiInput-underline:after": {
      borderBottomColor: "#228BE6",
    },}} />
          </TableCell>
          <TableCell sx={{  backgroundColor: "#FFFFFF",
    borderTopRightRadius: "12px",
    borderBottomRightRadius: "12px",
    border: "1px solid #E5E7EB",
    borderLeft: "none",}}>
            <TextField variant="standard" placeholder="Reference Range" fullWidth   sx={{ width: 90 , "& .MuiInputBase-input": {
      color: "#111827",       // dark text
      fontSize: "0.875rem",
    },

    
    "& .MuiInput-underline:after": {
      borderBottomColor: "#228BE6",
    },}}/>
          </TableCell >
          <TableCell sx={{borderBottom:"none"}}><AddCircleOutline sx={{color:"#000"}}/></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Paper>

  {/* ===== Footer ===== */}
 <Box
  mt={3}
  pt={2}
  borderTop="1px solid #E5E7EB"
  display="grid"
  gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }}
  gap={1.5}
>
  {/* Scan */}
  <Button
    fullWidth
    startIcon={<AutoAwesomeIcon />}
    sx={{
      textTransform: "none",
      color: "#4338CA",
      backgroundColor: alpha("#4338CA", 0.1),
      borderRadius: "10px",
    }}
  >
    Scan Auto-fill
  </Button>

  {/* File */}
  <Button
    fullWidth
    startIcon={<UploadFileIcon />}
    sx={{
      textTransform: "none",
      backgroundColor: alpha("#228BE6", 0.1),
      color: "#228BE6",
      borderRadius: "10px",
    }}
  >
    File
  </Button>

  {/* Proceed */}
  <Button
  fullWidth
  variant="contained"
  disabled={isSaving}
  sx={{
    textTransform: "none",
    backgroundColor: "#228BE6",
    color: "#fff",
    borderRadius: "10px",
  }}
  onClick={handleSaveCBCResults} // Call the FHIR update function
>
  {isSaving ? "Saving..." : "Proceed →"}
</Button>
</Box>

</Dialog>

<Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)} maxWidth="md"
  fullWidth
  PaperProps={{
    sx: { borderRadius: "20px", backgroundColor: "#F9FAFB",}, }}>
  {/* ===== HEADER ===== */}
  <Box display="flex"alignItems="center" gap={1} px={3} py={2} borderBottom="1px solid #E5E7EB">
    <IconButton onClick={() => setOpenReportDialog(false)}>
      <ArrowBackIosNewIcon fontSize="small" />
    </IconButton>

    {/* Use activeOrder with optional chaining to prevent crash */}
    <Typography fontWeight={600} color={"black"}>
      {activeOrder?.testName || "Laboratory"} Report
    </Typography>

    <Box ml="auto">
      <IconButton sx={{ color: "black" }} onClick={() => setOpenReportDialog(false)}>
        <CloseIcon />
      </IconButton>
    </Box>
  </Box>

  {/* ===== CONTENT ===== */}
  <DialogContent sx={{ backgroundColor: "#F9FAFB" }}>
    <Paper
      elevation={0}
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        p: 3,
      }}
    >
      {/* ===== META INFO ===== */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
        gap={2}
        color="black"
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
          <b>Reported by</b><br /> Lab Information System
        </Typography>
        <Typography variant="caption">
          <b>Verified by</b><br /> Dr. Ramesh Kumar
        </Typography>
      </Box>

      <Box sx={{ my: 3, height: "1px", backgroundColor: "#E5E7EB" }} />

      {/* ===== TABLE SECTION ===== */}
      <Typography fontWeight={600} color="#228BE6" mb={1}>
        {activeOrder?.testName} Results
      </Typography>

      <Table size="small" sx={{ mt: 2 }}>
        <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
          <TableRow>
            <TableCell sx={{ color: "black" }}>Test</TableCell>
            <TableCell sx={{ color: "black" }}>Result</TableCell>
            <TableCell sx={{ color: "black" }}>Unit</TableCell>
            <TableCell sx={{ color: "black" }}>Reference Range</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {/* Map through reportData (parsed from FHIR) instead of static mockCBCData */}
          {reportData.length > 0 ? (
            reportData.map((row, idx) => (
              <TableRow key={idx} hover>
                <TableCell sx={{ color: "#111827", fontWeight: 500 }}>
                  {row.test}
                </TableCell>
                <TableCell sx={{ color: "#228BE6", fontWeight: 700 }}>
                  {row.result}
                </TableCell>
                <TableCell sx={{ color: "#858585ff" }}>{row.unit}</TableCell>
                <TableCell sx={{ color: "#858585ff" }}>{row.ref}</TableCell>
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

      {/* ===== AUTO SUMMARY ===== */}
      <Box sx={{ mt: 3, p: 2, borderRadius: "10px", backgroundColor: "#F9FAFB" }}>
        <Typography fontWeight={600} fontSize="0.85rem" color="#4F46E5" mb={0.5}>
          Auto-Summary
        </Typography>
        <Typography variant="body2" color="#111827">
          {/* You could optionally parse the summary from the FHIR conclusion if you saved one */}
          This {activeOrder?.testName} report has been processed and verified. 
          Please review the specific test values above against the reference ranges.
        </Typography>
      </Box>

      {/* ===== ACTION BUTTONS ===== */}
      <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
        <Button
          size="small"
          onClick={() => window.print()}
          sx={{backgroundColor: alpha("#228BE6", 0.1),color: "#228BE6",
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
      <Snackbar open={saveSuccess} autoHideDuration={6000}  onClose={() => setSaveSuccess(false)}>
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }}> Report saved successfully! </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}> {error} </Alert>
      </Snackbar>
    </Box>
  );
};