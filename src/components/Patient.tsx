import {
  Box, Typography, TableRow, TableCell, Table, TableBody, 
  TableHead, TextField, Stack, Button, Tabs, Tab,
  InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, InputLabel, Snackbar, Alert, CircularProgress,
  IconButton,
  Menu,
  MenuItem,

  useTheme,
  useMediaQuery,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';

interface PatientProps {
  userOrganization: string;
  darkTheme: boolean;
  openDialog: boolean;
  onCloseDialog: () => void;
}
interface Patient {
  active: boolean;
  id: string;
  name: string;
  patientId: string;
  bed: string;
  assignee: string;
  birthDateTime: string;
  dischargedDate: string;
  gestation: string;
  birthWeight: string;
  lastUpdated: string;
}
export const Patient: FC<PatientProps> = ({ userOrganization }) => {
const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("current");
  const [step,setStep]=useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const [practitioners, setPractitioners] = useState<any[]>([]);
  const [isVerified, setIsVerified] = useState(false);
// const [locations, setLocations] = useState<any[]>([]);
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
const [sameAsPatient, setSameAsPatient] = useState(false);
const [assignDialog, setAssignDialog] = useState({
  open: false,
  type: "", // "user" or "bed"
  selectedValue: ""
});
const [openPatientDialog, setOpenPatientDialog] = useState(false);
const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });
  const [formData, setFormData] = useState({
    mothersName: "",
    patientId: "",
    birthDate: "",
    birthTime: "",
    gestationWeeks: "",
    gestationDays: "",
    birthWeight: "",
    gender:"",
    bedNo:"",
    age:"",
    adminNo:"",
    mobile:"",
    nationality:"",
    otherNationality:"",
    address:"",
    kinName:"",
    kinPhone:"",
    relationship:"",
    kinAddress:"",
    doaDate:"",
    doaTime:'',
    treatingDr:"",
    admittingDr:"",
    refHospital:"",
    filledby:""
  });
  
  const ResetForm= async() => {
    setFormData({
        mothersName: "",
        patientId: "",
        birthDate: "",
        birthTime: "",
        gestationWeeks: "",
        gestationDays: "",
        birthWeight: "",
        gender:"",
        age:"",
    bedNo:"",
    doaTime:'',
    adminNo:"",
    mobile:"",
    nationality:"",
    otherNationality:"",
    address:"",
    kinName:"",
    kinPhone:"",
    relationship:"",
    kinAddress:"",
    doaDate:"",
    treatingDr:"",
    admittingDr:"",
    refHospital:"",
    filledby:""
      });
  }
  const isFormComplete = (form: any) => {
    const fieldsToCheck = [
      "mothersName",
      "patientId",
      "birthDate",
      
      "gestationWeeks",
      "gestationDays",
      // "birthWeight",
      "gender",
      // "bedNo",
      "adminNo",
      
    ];
  
    return fieldsToCheck.every(
      (key) => form[key] && String(form[key]).trim() !== ""
    );
  };
  // const isFormCompleteSecond = (form: any) => {
  //   const fieldsToCheck = [
    
  //      "mobile",
  //      "birthTime",
  //     "nationality",
  //     "address",
  //     "kinName",
  //     "kinPhone",
  //     "relationship",
  //     "kinAddress",
  //     "doaDate",
  //     "treatingDr",
  //     "admittingDr",
  //     "refHospital",
  //   ];
  
  //   return fieldsToCheck.every(
  //     (key) => form[key] && String(form[key]).trim() !== ""
  //   );
  // };
  const finalNationality =
  formData.nationality === "Other"
    ? formData.otherNationality
    : formData.nationality;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Patient?_count=1000&organization=${userOrganization}`, {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
            "Content-Type": "application/fhir+json"
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const fetchedPatients = data.entry?.map((entry: any) => {
          const resource = entry.resource;
          
          // Extract patient details
          const mothersName = resource.extension?.find(
            (ext: any) => ext.url === "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName"
          )?.valueString || "Unknown";

          const gestation = resource.extension?.find(
            (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/patient-gestationalAge"
          )?.valueString || "N/A";

          const birthWeight = resource.extension?.find(
            (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/patient-birthWeight"
          )?.valueQuantity?.value || "N/A";

          return {
            id: resource.id,
            name: ` ${mothersName}`,
            patientId: resource.identifier?.[0]?.value || "N/A",
            birthDateTime: resource.birthDate ? formatDate(resource.birthDate) : "N/A",
            gestation,
            birthWeight: birthWeight !== "N/A" ? `${birthWeight} g` : "N/A",
            lastUpdated: resource.meta?.lastUpdated ? formatDateTime(resource.meta.lastUpdated) : "N/A",
            bed: "--",
            assignee: "--",
            dischargedDateTime: "--",
            active: resource.active !== false
          };
        }) || [];

        // Sort by lastUpdated in descending order (newest first)
        const sortedPatients = [...fetchedPatients].sort((a, b) => {
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        });

        setPatients(sortedPatients);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  },[]);

  // const fetchPractitioners = async () => {
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Practitioner`, {
  //       headers: {
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         "Content-Type": "application/fhir+json"
  //       }
  //     });
  //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  //     const data = await response.json();
  //     return data.entry?.map((entry: any) => ({
  //       id: entry.resource.id,
  //       name: entry.resource.name?.[0]?.text || "Unknown"
  //     })) || [];
  //   } catch (err) {
  //     console.error("Error fetching practitioners:", err);
  //     return [];
  //   }
  // };
  
  // const fetchLocations = async () => {
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Location`, {
  //       headers: {
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         "Content-Type": "application/fhir+json"
  //       }
  //     });
  //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  //     const data = await response.json();
  //     return data.entry?.map((entry: any) => ({
  //       id: entry.resource.id,
  //       name: entry.resource.name,
  //       type: entry.resource.physicalType?.coding?.[0]?.code,
  //       identifier: entry.resource.identifier?.[0]?.value
  //     })).filter((loc: any) => loc.type === "bd" || loc.type === "ro") || []; // Filter for beds and rooms
  //   } catch (err) {
  //     console.error("Error fetching locations:", err);
  //     return [];
  //   }
  // };
  const fetchPatients = async () => {
    try {
      setLoading(true);
  
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/Patient?_count=1000&organization=${userOrganization}`,
        {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
            "Content-Type": "application/fhir+json",
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      const fetchedPatients =
        data.entry?.map((entry: any) => {
          const resource = entry.resource;
  
          const mothersName =
            resource.extension?.find(
              (ext: any) =>
                ext.url ===
                "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName"
            )?.valueString || "Unknown";
  
          const gestation =
            resource.extension?.find(
              (ext: any) =>
                ext.url ===
                "http://example.org/fhir/StructureDefinition/gestationalAge"
            )?.valueString || "N/A";
  
          const birthWeight =
            resource.extension?.find(
              (ext: any) =>
                ext.url ===
                "http://example.org/fhir/StructureDefinition/birthWeight"
            )?.valueQuantity?.value || "N/A";
  
          return {
            id: resource.id,
            name: mothersName,
            patientId: resource.identifier?.[0]?.value || "N/A",
            birthDateTime: resource.birthDate
              ? formatDate(resource.birthDate)
              : "N/A",
            gestation,
            birthWeight:
              birthWeight !== "N/A" ? `${birthWeight} g` : "N/A",
            lastUpdated: resource.meta?.lastUpdated
              ? formatDateTime(resource.meta.lastUpdated)
              : "N/A",
            bed: "--",
            assignee: "--",
            dischargedDateTime: "--",
            active: resource.active !== false,
          };
        }) || [];
  
      const sortedPatients = fetchedPatients.sort(
        (a: { lastUpdated: string | number | Date; }, b: { lastUpdated: string | number | Date; }) =>
          new Date(b.lastUpdated).getTime() -
          new Date(a.lastUpdated).getTime()
      );
  
      setPatients(sortedPatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPatients();
  }, [userOrganization]);
  

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const [practitionersData, locationsData] = await Promise.all([
  //       fetchPractitioners(),
  //       fetchLocations()
  //     ]);
  //     setPractitioners(practitionersData);
  //     setLocations(locationsData);
  //   };
  //   fetchData();
  // }, []);
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ' ' + date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', weekday: 'short' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

  const { name, value } = e.target;

  let updatedValue = value;

  // NAME VALIDATION
  if (name === "mothersName") {
    updatedValue = allowText(value).slice(0, 40);
  }

  // UHID LIMIT
  if (name === "patientId") {
    updatedValue = value.slice(0, 20);
  }

  // ADMISSION NUMBER LIMIT
  if (name === "adminNo") {
    updatedValue = value.slice(0, 20);
  }

  // MOBILE NUMBER
  if (name === "mobile" || name === "kinPhone") {
    updatedValue = allowNumbers(value).slice(0, 10);
  }

  // GESTATION WEEKS
  if (name === "gestationWeeks") {
    updatedValue = allowNumbers(value).slice(0, 2);

    const num = Number(updatedValue);
    if (num > 45) return; // medical upper limit
  }

  // GESTATION DAYS
  if (name === "gestationDays") {
    updatedValue = allowNumbers(value).slice(0, 1);

    const num = Number(updatedValue);
    if (num > 6) return;
  }

  // BIRTH WEIGHT (grams)
  if (name === "birthWeight") {
    updatedValue = allowNumbers(value).slice(0, 5);

    const num = Number(updatedValue);
    if (num > 6000) return; // realistic NICU range
  }

  // AGE (manual input fallback)
  if (name === "age") {
    updatedValue = allowNumbers(value).slice(0, 3);
  }

  // DOB -> AUTO AGE
  if (name === "birthDate") {

    const ageDays = calculateAgeFromDOB(value);

    setFormData((prev) => ({
      ...prev,
      birthDate: value,
      age: ageDays
    }));

    return;
  }
 if (name === "kinName") {
    updatedValue = allowText(value).slice(0, 40);
  }
  if (name === "treatingDr") {
    updatedValue = allowText(value).slice(0, 40);
  }
   if (name === "treatingDr") {
    updatedValue = allowText(value).slice(0, 40);
  }
   if (name === "admittingDr") {
    updatedValue = allowText(value).slice(0, 40);
  }
    if (name === "refHospital") {
    updatedValue = allowText(value).slice(0, 40);
  }
  
  setFormData((prev) => ({
    ...prev,
    [name]: updatedValue
  }));
};

  // --- UPLOAD STATE (Renamed to avoid conflicts) ---
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // --- HANDLERS (Fixed TypeScript 'any' error) ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploadFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setUploadLoading(true);
    const formDataPayload = new FormData();
    formDataPayload.append("file", uploadFile);

    try {
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formDataPayload,
      });

      const data = await response.json();
      console.log("Parsed Data:", data);

      // --- HELPER 1: Date Formatter (DD-MM-YYYY -> YYYY-MM-DD) ---
      const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const parts = dateStr.split(/[-/]/);
        if (parts.length === 3 && parts[2].length === 4) {
             const day = parts[0].padStart(2, "0");
             const month = parts[1].padStart(2, "0");
             const year = parts[2];
             return `${year}-${month}-${day}`;
        }
        return dateStr;
      };

      // --- HELPER 2: Normalize Gender (MALE/male -> Male) ---
      // ✅ This fixes the issue!
      const normalizeGender = (val: string) => {
        if (!val) return "";
        const lower = val.toLowerCase().trim();
        
        if (lower === "male" || lower === "m") return "Male";
        if (lower === "female" || lower === "f") return "Female";
        
        // Fallback: just Capitalize first letter (e.g. "Unknown" -> "Unknown")
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      };

      // --- HELPER 3: Time Formatter ---
      const formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return timeStr; 
        let [_, hours, minutes, modifier] = match;
        let h = parseInt(hours, 10);
        if (modifier.toUpperCase() === "PM" && h < 12) h += 12;
        if (modifier.toUpperCase() === "AM" && h === 12) h = 0;
        return `${h.toString().padStart(2, "0")}:${minutes}`;
      };

      // --- HELPER 4: Split Date & Time ---
      const splitDateTime = (dateTimeStr: string) => {
        if (!dateTimeStr) return { date: "", time: "" };
        const firstSpaceIndex = dateTimeStr.indexOf(" ");
        if (firstSpaceIndex === -1) {
            return { date: formatDate(dateTimeStr), time: "" };
        }
        const datePart = dateTimeStr.substring(0, firstSpaceIndex);
        const timePart = dateTimeStr.substring(firstSpaceIndex + 1);
        return {
            date: formatDate(datePart),
            time: formatTime(timePart)
        };
      };

      const doa = splitDateTime(data["Date Of Admission"]);

      // --- AUTO-FILL FORM ---
      setFormData((prev) => ({
        ...prev,
        mothersName: data["Name"] || "",
        patientId: data["Uhid"] || "",
        birthDate: formatDate(data["Date Of Birth"]) || "",
        
        // ✅ Apply the gender normalization here
        gender: normalizeGender(data["Gender"]),
        
        bedNo: data["Bed Number"] || "",
        age: data["Age"] ? `${data["Age"]} ${data["Age Unit"] || ""}`.trim() : "",
        adminNo: data["Admission Number"] || "",
        mobile: data["Mobile Number"] || "",
        nationality: data["Nationality"] || "",
        address: data["Address"] || "",
        kinName: data["Kin Name"] || "",
        kinPhone: data["Kin Phone"] || "",
        relationship: data["Relationship"] || "",
        kinAddress: data["Kin Address"] || "",
        doaDate: doa.date,
        doaTime: doa.time,
        treatingDr: data["Treating Doctor"] || "",
        admittingDr: data["Admitting Doctor"] || "",
        refHospital: data["Referring Doctor"] || "",
      }));

      setUploadOpen(false); 
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process PDF");
    } finally {
      setUploadLoading(false);
      setUploadFile(null);
    }
  };

  const handleAssignClick = (type: string) => {
    setAssignDialog({
      open: true,
      type,
      selectedValue: ""
    });
  };
  
  const handleAssignDialogClose = () => {
    setAssignDialog(prev => ({ ...prev, open: false }));
  };
  
  const handleAssignSubmit = async () => {
    if (!selectedPatient || !assignDialog.selectedValue) return;
  
    try {
      if (assignDialog.type === "user") {
        // Assign practitioner to patient
        await assignPractitionerToPatient(selectedPatient.id, assignDialog.selectedValue);
        setSnackbar({
          open: true,
          message: "User assigned successfully!",
          severity: "success"
        });
      } else if (assignDialog.type === "bed") {
        // Assign bed to patient
        await assignBedToPatient(selectedPatient.id, assignDialog.selectedValue);
        setSnackbar({
          open: true,
          message: "Bed assigned successfully!",
          severity: "success"
        });
      }
  
      // Update local state
      // setPatients(prev => prev.map(p => 
      //   p.id === selectedPatient.id 
      //     ? { 
      //         // ...p, 
      //         // assignee: assignDialog.type === "user" 
      //         //   ? practitioners.find(pr => pr.id === assignDialog.selectedValue)?.name || "--"
      //         //   : p.assignee,
      //         // bed: assignDialog.type === "bed" 
      //         //   ? locations.find(loc => loc.id === assignDialog.selectedValue)?.identifier || "--"
      //         //   : p.bed
      //       } 
      //     : p
      // ));
  
      handleAssignDialogClose();
      handleMenuClose();
    } catch (error) {
      console.error("Error assigning:", error);
      setSnackbar({
        open: true,
        message: "Failed to assign",
        severity: "error"
      });
    }
  };
  
  const assignPractitionerToPatient = async (patientId: string, practitionerId: string) => {
    // In FHIR, you would typically create a PractitionerRole or Encounter to link them
    // For simplicity, we'll create a basic Encounter
    const encounter = {
      resourceType: "Encounter",
      status: "in-progress",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "IMP",
        display: "inpatient encounter"
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      participant: [
        {
          individual: {
            reference: `Practitioner/${practitionerId}`
          }
        }
      ]
    };
  
    const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Encounter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        "Authorization": "Basic " + btoa("fhiruser:change-password")
      },
      body: JSON.stringify(encounter)
    });
  
    if (!response.ok) throw new Error("Failed to assign practitioner");
  };
  
  const assignBedToPatient = async (patientId: string, locationId: string) => {
    // Create an encounter with the location
    const encounter = {
      resourceType: "Encounter",
      status: "in-progress",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "IMP",
        display: "inpatient encounter"
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      location: [
        {
          location: {
            reference: `Location/${locationId}`
          }
        }
      ]
    };
  
    const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Encounter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        "Authorization": "Basic " + btoa("fhiruser:change-password")
      },
      body: JSON.stringify(encounter)
    });
  
    if (!response.ok) throw new Error("Failed to assign bed");
  };

  
  const handleSubmit = async () => {
    try {
      if (!formData.mothersName || !formData.patientId || !formData.birthDate) {
        throw new Error("Required fields are missing");
      }
  
      const FHIR_BASE = import.meta.env.VITE_FHIRAPI_URL;
      const AUTH = {
        "Content-Type": "application/json", // 🔥 safer than application/fhir+json
        Authorization: "Basic " + btoa("fhiruser:change-password"),
      };
  
      /* =========================
         1️⃣ CREATE PATIENT
      ========================= */
      const patientPayload: any = {
        resourceType: "Patient",
        active: true,
        managingOrganization: {
          reference: `Organization/${userOrganization}`,
        },
        identifier: [
          {
            system: "http://hospital.org/uhid",
            value: formData.patientId,
          },
          {
            system: "http://hospital.org/admission-no",
            value: formData.adminNo,
          },
        ],
        name: [
          {
            use: "official",
            text: `B/O ${formData.mothersName}`,
          },
        ],
        gender: formData.gender?.toLowerCase() || "unknown",
        birthDate: formData.birthDate,
        address: formData.address ? [{ text: formData.address }] : [],
        telecom: formData.mobile
          ? [{ system: "phone", value: formData.mobile, use: "mobile" }]
          : [],
        extension: [
          {
            url: "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName",
            valueString: formData.mothersName,
          },
          {
            url: "http://hl7.org/fhir/StructureDefinition/gestationalAge",
            valueString: `${formData.gestationWeeks || 0}W ${formData.gestationDays || 0}D`,
          },
          {
            url: "http://hl7.org/fhir/StructureDefinition/birthWeight",
            valueQuantity: {
              value: Number(formData.birthWeight) || 0,
              unit: "g",
              system: "http://unitsofmeasure.org",
              code: "g",
            },
          },
          {
            url: "http://hl7.org/fhir/StructureDefinition/nationality",
            valueString:
              formData.nationality === "Other"
                ? formData.otherNationality
                : formData.nationality,
          },
        ],
      };
  
      const patientRes = await fetch(`${FHIR_BASE}/Patient`, {
        method: "POST",
        headers: AUTH,
        body: JSON.stringify(patientPayload),
      });
  
      if (!patientRes.ok) {
        const err = await patientRes.text();
        throw new Error(`Patient creation failed: ${err}`);
      }
  
      /* =========================
         🔐 SAFE PATIENT ID
      ========================= */
      let patientId: string | null = null;

// 1️⃣ Try response body
const patientJson = await patientRes.json().catch(() => null);
console.log("📦 Patient Response JSON:", patientJson);

if (patientJson?.id) {
  patientId = patientJson.id;
}

// 2️⃣ Correct Location header parsing (FHIR-safe)
if (!patientId) {
  const location = patientRes.headers.get("location");
  console.log("📍 Location Header:", location);

  if (location) {
    const match = location.match(/Patient\/([^/]+)/);
    if (match && match[1]) {
      patientId = match[1];
    }
  }
}

// 3️⃣ Fallback search (last resort)
if (!patientId) {
  const searchRes = await fetch(
    `${FHIR_BASE}/Patient?identifier=http://hospital.org/uhid|${formData.patientId}`,
    { headers: AUTH }
  );

  const bundle = await searchRes.json();
  patientId = bundle?.entry?.[0]?.resource?.id;
}

if (!patientId) {
  throw new Error("Unable to resolve Patient ID");
}

const patientRef = `Patient/${patientId}`;
console.log("✅ FINAL patientRef:", patientRef);

      // let patientId: string | null = null;
  
      // const location = patientRes.headers.get("location");
      // if (location) {
      //   patientId = location.split("/").pop()!;
      // } else {
      //   const searchRes = await fetch(
      //     `${FHIR_BASE}/Patient?identifier=http://hospital.org/uhid|${formData.patientId}`,
      //     { headers: AUTH }
      //   );
  
      //   if (!searchRes.ok) {
      //     throw new Error("Patient created but could not be fetched");
      //   }
  
      //   const bundle = await searchRes.json();
      //   if (!bundle.entry?.length) {
      //     throw new Error("Patient not found after creation");
      //   }
  
      //   patientId = bundle.entry[0].resource.id;
      // }
  
      // const patientRef = `Patient/${patientId}`;
  
      /* =========================
         2️⃣ CREATE ENCOUNTER (FIXED)
      ========================= */
      const encounterPayload: any = {
        resourceType: "Encounter",
        status: "in-progress",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "IMP",
        },
        subject: {
          reference: patientRef,
        },
        serviceProvider: {
          reference: `Organization/${userOrganization}`,
        },
        period: {
          start: new Date(
            `${formData.doaDate}T${formData.doaTime || "00:00"}`
          ).toISOString(),
        },
      
        /* =========================
           👨‍⚕️ DOCTORS
        ========================= */
        participant: [
          ...(formData.treatingDr
            ? [
                {
                  type: [
                    {
                      coding: [
                        {
                          system:
                            "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                          code: "ATND",
                          display: "Attending Physician",
                        },
                      ],
                    },
                  ],
                  individual: {
                    display: formData.treatingDr,
                  },
                },
              ]
            : []),
      
          ...(formData.admittingDr
            ? [
                {
                  type: [
                    {
                      coding: [
                        {
                          system:
                            "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                          code: "ADM",
                          display: "Admitting Physician",
                        },
                      ],
                    },
                  ],
                  individual: {
                    display: formData.admittingDr,
                  },
                },
              ]
            : []),
        ],
      
        /* =========================
           🏥 REFERRING HOSPITAL
        ========================= */
        hospitalization: formData.refHospital
          ? {
              origin: {
                display: formData.refHospital,
              },
            }
          : undefined,
      };
      
  
      const encounterRes = await fetch(`${FHIR_BASE}/Encounter`, {
        method: "POST",
        headers: AUTH,
        body: JSON.stringify(encounterPayload),
      });
      if (encounterRes.ok) {
       console.log('checking encounter id', encounterPayload);
       
       
      }
      else {
        const err = await encounterRes.text();
        throw new Error(`Encounter creation failed: ${err}`);
      }
  
      /* =========================
         3️⃣ CREATE RELATED PERSON (FIXED)
      ========================= */
      if (formData.kinName) {
        const relatedPersonPayload: any = {
          resourceType: "RelatedPerson",
          patient: {
            reference: patientRef,
          },
          relationship: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
                  code: "NOK",
                  display: formData.relationship || "Next of Kin",
                },
              ],
            },
          ],
          name: [
            {
              use: "official",
              text: formData.kinName,
            },
          ],
          telecom: formData.kinPhone
            ? [{ system: "phone", value: formData.kinPhone }]
            : [],
          address: formData.kinAddress ? [{ text: formData.kinAddress }] : [],
        };
  
        const kinRes = await fetch(`${FHIR_BASE}/RelatedPerson`, {
          method: "POST",
          headers: AUTH,
          body: JSON.stringify(relatedPersonPayload),
        });
  
        if (!kinRes.ok) {
          const err = await kinRes.text();
          throw new Error(`RelatedPerson creation failed: ${err}`);
        }
      }
  
      /* =========================
         ✅ SUCCESS
      ========================= */
      setSnackbar({
        open: true,
        severity: "success",
        message: "NICU Admission completed successfully",
      });
      await fetchPatients();
      setOpenDialog(false);
      ResetForm();
      setStep(1);
  
    } catch (error: any) {
      console.error(error);
      setSnackbar({
        open: true,
        severity: "error",
        message: error.message || "Failed to save admission",
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.bed && patient.bed.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === "current") {
      return matchesSearch && patient.active !== false;
    } else {
      return matchesSearch && patient.active === false;
    }
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, patient: Patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };
 
  const handleDischarge = async () => {
    if (!selectedPatient) return;
    
    try {
      const baseUrl = import.meta.env.VITE_FHIRAPI_URL;
      const authHeader = "Basic " + btoa("fhiruser:change-password");

      // 1. Fetch current patient data to update active status
      const patientResponse = await fetch(
        `${baseUrl}/Patient/${selectedPatient.id}`,
        {
          headers: {
            "Authorization": authHeader,
            "Content-Type": "application/fhir+json"
          }
        }
      );
  
      if (!patientResponse.ok) {
        throw new Error("Failed to fetch patient data");
      }
  
      const currentPatient = await patientResponse.json();
      const patientUpdate = {
        ...currentPatient,
        active: false,
      };

      const promises: Promise<any>[] = [];

      // Save Patient
      promises.push(
        fetch(`${baseUrl}/Patient/${selectedPatient.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/fhir+json",
            "Authorization": authHeader
          },
          body: JSON.stringify(patientUpdate)
        })
      );

      // 2. Query for active Encounter
      const encounterSearchUrl = `${baseUrl}/Encounter?subject=Patient/${selectedPatient.id}&status=in-progress`;
      const encSearchRes = await fetch(encounterSearchUrl, {
         headers: { "Authorization": authHeader }
      });
      
      if (encSearchRes.ok) {
        const encData = await encSearchRes.json();
        if (encData.entry && encData.entry.length > 0) {
          // Process all active encounters
          for (const entry of encData.entry) {
            const encounter = entry.resource;
            encounter.status = "finished";
            encounter.period = encounter.period || {};
            encounter.period.end = new Date().toISOString();

            promises.push(
              fetch(`${baseUrl}/Encounter/${encounter.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/fhir+json",
                  "Authorization": authHeader
                },
                body: JSON.stringify(encounter)
              })
            );

            // 3. Device Unlinking: Find Bed ID from encounter
            if (encounter.location && encounter.location.length > 0) {
              const locRef = encounter.location[0].location?.reference; // "Location/bed-123"
              if (locRef) {
                const bedId = locRef.replace("Location/", "");
                
                // Fetch the Bed to locate its parent Room
                const bedRes = await fetch(`${baseUrl}/Location/${bedId}`, {
                   headers: { "Authorization": authHeader }
                });
                if (bedRes.ok) {
                  const bedResource = await bedRes.json();
                  const roomId = bedResource.partOf?.reference?.replace("Location/", "");

                  if (roomId) {
                    // Fetch Devices assigned to this Bed
                    const devRes = await fetch(`${baseUrl}/Device?location=Location/${bedId}`, {
                      headers: { "Authorization": authHeader }
                    });
                    if (devRes.ok) {
                      const devData = await devRes.json();
                      if (devData.entry) {
                        for (const devEntry of devData.entry) {
                          const device = devEntry.resource;
                          // Remove patient bind
                          if (device.patient) delete device.patient;
                          // Remap back to Room
                          device.location = {
                             reference: `Location/${roomId}`,
                             display: "Room"
                          };

                          promises.push(
                            fetch(`${baseUrl}/Device/${device.id}`, {
                               method: "PUT",
                               headers: {
                                 "Content-Type": "application/json",
                                 "Authorization": authHeader
                               },
                               body: JSON.stringify(device)
                            })
                          );
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
  
      await Promise.all(promises);
  
      setSnackbar({
        open: true,
        message: "Patient successfully discharged!",
        severity: "success"
      });
  
      // Refresh the UI Patient list
      setPatients(prev => prev.filter(p => p.id !== selectedPatient.id));
    } catch (error) {
      console.error("Error discharging patient:", error);
      setSnackbar({
        open: true,
        message: "Failed to discharge patient",
        severity: "error"
      });
    } finally {
      handleMenuClose();
    }
  };
// Only numbers
const allowNumbers = (value: string) => value.replace(/[^0-9]/g, "");

// Only alphabets + spaces
const allowText = (value: string) => value.replace(/[^a-zA-Z\s]/g, "");
  const calculateAgeFromDOB = (dob: string) => {
  if (!dob) return "";

  const birth = new Date(dob);
  const today = new Date();

  const diff = today.getTime() - birth.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return days.toString();
};


  return (
    <Box sx={{ p: 1 }}>
  {/* Responsive Header */}
  {/* <Typography
    variant={isMobile ? "h6" : "h5"}
    sx={{ fontWeight: "bold", mb: 1 }}
  >
    NICU Patients
  </Typography> */}

  {/* Responsive Row: Tabs + Search + Button */}
  <Stack
    direction={isMobile ? "column" : "row"}
    justifyContent="space-between"
    alignItems={isMobile ? "flex-start" : "center"}
    spacing={1}
    sx={{ mt: 1, mb: 2 }}
  >
    {/* Tabs */}
    <Tabs
      value={activeTab}
      onChange={(_e, newValue) => setActiveTab(newValue)}
      variant="scrollable"
      scrollButtons={isMobile ? "auto" : false}
      allowScrollButtonsMobile
      sx={{ minHeight: "36px" }}
    >
      <Tab
        label="Current"
        value="current"
        sx={{ p: 0, mr: isMobile ? 0 : 2, color: "black" }}
      />
      <Tab
        label="Discharged"
        value="discharged"
        sx={{ p: 0, color: "black" }}
      />
    </Tabs>

    {/* Search + Button */}
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ width: isMobile ? "100%" : "auto", mt: isMobile ? 1 : 0 }}
    >
      <TextField
        size="small"
        fullWidth={isMobile}
        placeholder="Search patients..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          maxWidth: isMobile ? "100%" : 300,
          backgroundColor: "white",
          borderRadius: "20px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "20px",
            color: "black",
          },
          "& .MuiInputBase-input": {
            color: "black",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: "20px",
          },
        }}
      />

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{
          backgroundColor: "#228BE61A",
          color: "#228BE6",
          whiteSpace: "nowrap",
          minWidth: isMobile ? "auto" : "unset",
        }}
      >
        {!isMobile && "Patient"}
      </Button>
    </Stack>
  </Stack>

  {/* Responsive Table */}
  {/* <Paper
  sx={{
    boxShadow: "none",
    border: "1px solid #e0e0e0",
    overflow: "auto", // Change from "auto" to "hidden" for better control
    height: "calc(100vh - 200px)", // Adjust this value based on your needs
    display: "flex",
    flexDirection: "column"
  }}
> */}
    <Table sx={{ minWidth: 600 }}>
      <TableHead>
        <TableRow sx={{ backgroundColor: "lightgrey" }}>
          {[
            "Patient Name",
            "Patient ID",
            "Bed No",
            "Assignee",
            "Birth Date and Time",
          ].map((header) => (
            <TableCell
              key={header}
              sx={{ fontWeight: "bold", color: "#868E96", whiteSpace: "nowrap" }}
            >
              {header}
            </TableCell>
          ))}
          <TableCell sx={{ fontWeight: "bold", color: "#868E96", whiteSpace: "nowrap" }}>
            {activeTab === "current" ? "Action" : "Discharged Date"}
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {filteredPatients.map((patient) => (
          <TableRow
          key={patient.id || patient.patientId}
          
          sx={{
            backgroundColor: "#FFFFFF",
           
          }}
        >
            <TableCell   sx={{
           
            color: "#000000",
            "&:hover": {
              backgroundColor: "#228BE61A",
              cursor: "pointer",
            }
          }} onClick={() => navigate(`/patient-profile/${patient.id}`)}>{patient.name}</TableCell>
            <TableCell sx={{ color: "#000000" }}>{patient.patientId}</TableCell>
            <TableCell sx={{ color: "#000000" }}>{patient.bed}</TableCell>
            <TableCell sx={{ color: "#000000" }}>{patient.assignee}</TableCell>
            <TableCell sx={{ color: "#000000" }}>{patient.birthDateTime}</TableCell>

            <TableCell sx={{ color: "#333", width: 120 }}>
              {activeTab === "discharged" ? (
                patient.dischargedDate
              ) : (
                <IconButton
                  aria-label="actions"
                  sx={{
                    color: "#555",
                    padding: "6px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                  onClick={(e) => handleMenuOpen(e, patient)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  {/* </Paper> */}

  {/* Menu */}
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
    <MenuItem onClick={handleDischarge}>Discharge Patient</MenuItem>
    <MenuItem onClick={() => handleAssignClick("user")}>Assign User</MenuItem>
    <MenuItem onClick={() => handleAssignClick("bed")}>Assign Bed</MenuItem>
  </Menu>

      <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  maxWidth="sm"
  fullWidth
  hideBackdrop={false}
  PaperProps={{
    sx: {
      borderRadius: 3,
      p: 1,
      backgroundColor: "white",
      color: "black",
      position: "relative",
    }
  }}
>
  {/* Close Icon */}
  <IconButton
    onClick={() => {
      ResetForm(),
      setOpenDialog(false)}}
    sx={{ position: "absolute", top: 10, right: 10, color: "black" }}
  >
    <CloseIcon />
  </IconButton>

  {/* ---- TITLE ---- */}
  <DialogTitle
    sx={{ fontWeight: 600, textAlign: "center", color: "#000" }}
  >
    NICU Admission
  </DialogTitle>

  {/* ---- STEPPER ---- */}
  <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 2 }}>
    {[
      { id: 1, label: "" },
      { id: 2, label: "" },
      { id: 3, label: "" },
    ].map((stepItem, index, arr) => {
      const isLast = index === arr.length - 1;
      const isActive = step >= stepItem.id;

      return (
        <Box
          key={stepItem.id}
          sx={{ display: "flex", alignItems: "center", width: "33%", position: "relative" }}
        >
          {/* Connecting Line */}
          {!isLast && (
            <Box
              sx={{
              position: "absolute",
              top: "-6px", // centers line between circles
              left: "62%",
              right: "-38%",
              height: "2px",
              backgroundColor:
                step > stepItem.id ? "#228BE6" : "rgba(34,139,230,0.3)",
              transition: "background-color 0.3s ease",
              zIndex: 0,
            }}
            />
          )}

          {/* Step Circle */}
          <Box
            sx={{
            zIndex: 1,
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: isActive
              ? "#228BE6"
              : "rgba(34,139,230,0.15)",
            color: isActive ? "#fff" : "#228BE6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "0.9rem",
            transition: "all 0.3s ease",

            position: "absolute",     // <— IMPORTANT
    top: "-20px",               // adjust vertically
    left: "50%",               // center horizontally
    transform: "translateX(-50%)",
          }}
          >
            {stepItem.id}
          </Box>

          {/* Step Label */}
          <Typography
            sx={{
              color: isActive ? "#124D81" : "#A7B3CD",
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {stepItem.label}
          </Typography>
        </Box>
      );
    })}
  </Box>

  {/* ---- CONTENT ---- */}
  <DialogContent dividers sx={{ borderColor: "#ccc" }}>
   {step === 1 && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

  {/* --- MOTHER NAME --- */}
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    <Typography sx={{ fontWeight: 500 }}>Name *</Typography>

    <TextField
    required
      fullWidth
      placeholder="Mother's / Father's Name"
      name="mothersName"
      value={formData.mothersName}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Typography color="black">B/O -</Typography>
          </InputAdornment>
        ),
        sx: { backgroundColor: "#F5F5F5", borderRadius: 1 ,
            "& .MuiInputBase-input": {
        color: "#000",
        opacity: 1,
      }
        },
      }}
    />
  </Box>

  {/* --- UHID + ADMISSION NO --- */}
  <Box sx={{ display: "flex", gap: 2 }}>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontWeight: 500 }}>UHID *</Typography>
      <TextField
        required
        fullWidth
        name="patientId"
        value={formData.patientId}
        onChange={handleChange}
        //placeholder="NBNK-2883"
        InputProps={{
          sx: { backgroundColor: "#F5F5F5", borderRadius: 1,
              "& .MuiInputBase-input": {
        color: "#000",
        opacity: 1,
      }
           },
        }}
      />
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontWeight: 500 }}>Admission No *</Typography>
      <TextField
      required
        fullWidth
        name="adminNo"
        value={formData.adminNo}
        onChange={handleChange}
        //placeholder="NKIP25-26/499"
        InputProps={{
          sx: { backgroundColor: "#F5F5F5", borderRadius: 1 ,
              "& .MuiInputBase-input": {
        color: "#000",
        opacity: 1,
      }
          },
        }}
      />
    </Box>
  </Box>

  {/* --- BED NO + GENDER --- */}
  <Box sx={{ display: "flex", gap: 2 }}>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontWeight: 500 }}>Bed No</Typography>
      <TextField
        fullWidth
        name="bedNo"
        value={formData.bedNo}
        onChange={handleChange}
        //placeholder="141-Vasudama/NICU"
        InputProps={{
          sx: { backgroundColor: "#F5F5F5", borderRadius: 1 ,
              "& .MuiInputBase-input": {
        color: "#000",
        opacity: 1,
      }
          },
        }}
      />
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontWeight: 500 }}>Gender *</Typography>

      <Box sx={{ display: "flex", mt: 1}}>
        <Button
          fullWidth
          
          sx={{
            textTransform: "none",
            borderRadius: 2,
            backgroundColor:
              formData.gender === "Male" ? "#F9FAFB" : "#ffffffff",
            color: formData.gender === "Male" ? "#228BE6" : "#868E96",
            marginLeft:"18px",
          }}
          onClick={() => setFormData({ ...formData, gender: "Male" })}
        >
          ♂ Male
        </Button>

        <Button
          fullWidth
          
          sx={{
            textTransform: "none",
            borderRadius: 2,
            backgroundColor:
              formData.gender === "Female" ? "#F9FAFB" : "#ffffffff",
            color: formData.gender === "Female" ? "#228BE6" : "#868E96",
            marginRight:"18px",
          }}
          onClick={() => setFormData({ ...formData, gender: "Female" })}
        >
          ♀ Female
        </Button>
      </Box>
    </Box>
  </Box>

  {/* --- DOB + AGE --- */}
  <Box sx={{ display: "flex", gap: 2 }}>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontWeight: 500 }}>DOB*</Typography>
      <TextField
      required
        type="date"
        fullWidth
        name="birthDate"
        value={formData.birthDate}
        onChange={handleChange}
        InputProps={{
          sx: { backgroundColor: "#F5F5F5", borderRadius: 1 ,
              "& .MuiInputBase-input": {
        color: "#000",
        opacity: 1,
      }
          },
              inputProps: {
      max: new Date().toISOString().split("T")[0], // ⛔ Prevent future dates
    },
        }}
      />
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontWeight: 500 }}>Age*</Typography>
      <TextField
      required
      placeholder="Days"
        fullWidth
        //placeholder="2 D"
        name="age"
        value={formData.age}
        onChange={handleChange}
        InputProps={{
          sx: { backgroundColor: "#F5F5F5", borderRadius: 1 ,
            
"& .MuiInputBase-input": {
      color: "#000",       // BLACK PLACEHOLDER
      opacity: 1,          // MAKE IT FULLY VISIBLE
    }
          },
        }}
      />
    </Box>
  </Box>

  {/* --- GESTATION + BIRTH WEIGHT --- */}
  <Box sx={{ display: "flex", gap: 2 }}>

    {/* Gestation */}
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontWeight: 500 }}>Gestation*</Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        <TextField
          required
          placeholder="00"
          sx={{ width: 60 }}
          name="gestationWeeks"
          value={formData.gestationWeeks}
          onChange={handleChange}
          InputProps={{
            sx: { backgroundColor: "#F5F5F5", borderRadius: 1,
              "& .MuiInputBase-input": {
      color: "#000",       // BLACK PLACEHOLDER
      opacity: 1,          // MAKE IT FULLY VISIBLE
    }
             },
          }}
        />
        <Typography>W</Typography>

        <TextField
          placeholder="00"
          sx={{ width: 60 }}
          name="gestationDays"
          value={formData.gestationDays}
          onChange={handleChange}
          InputProps={{
            sx: { backgroundColor: "#F5F5F5", borderRadius: 1 ,
              "& .MuiInputBase-input": {
      color: "#000",       // BLACK PLACEHOLDER
      opacity: 1,          // MAKE IT FULLY VISIBLE
    }
            },
          }}
        />
        <Typography>D</Typography>
      </Box>
    </Box>

    {/* Birth Weight */}
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontWeight: 500 }}>Birth Weight (g)</Typography>
      <TextField
        fullWidth
        //placeholder="0000 gram"
        name="birthWeight"
        value={formData.birthWeight}
        onChange={handleChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">

            </InputAdornment>
          ),
          sx: { backgroundColor: "#F5F5F5", borderRadius: 1,
            "& .MuiInputBase-input": {
      color: "#000",       // BLACK PLACEHOLDER
      opacity: 1,          // MAKE IT FULLY VISIBLE
    }
           },
        }}
      />
    </Box>

  </Box>

</Box>

)}


    {/* ---- STEP 2 CONTENT ---- */}
    {step === 2 && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

    {/* --- MOBILE + NATIONALITY --- */}
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* Mobile No */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>Mobile No</Typography>
        <TextField
          fullWidth
          //placeholder="9948573839"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          InputProps={{
            sx: {
              backgroundColor: "#F5F5F5",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#000", opacity: 1 }
            }
          }}
        />
      </Box>

      {/* Nationality */}
      <Box sx={{ flex: 1 }}>
  <Typography sx={{ fontWeight: 500 }}>Nationality</Typography>

  <TextField
    select
    fullWidth
    name="nationality"
    value={formData.nationality}
    onChange={handleChange}
    InputProps={{
      sx: {
        backgroundColor: "#F5F5F5",
        borderRadius: 1,
        "& .MuiInputBase-input": {
          color: "#000",
          opacity: 1,
        },
      },
    }}
  >
    {[
      "Indian",
      // "Bangladeshi",
      // "Pakistani",
      // "Nepali",
      // "Sri Lankan",
      // "British",
      // "American",
      // "Chinese",
      // "Japanese",
      // "German",
      // "Gulf National",
      "Other",
    ].map((item) => (
      <MenuItem key={item} value={item}>
        {item}
      </MenuItem>
    ))}
  </TextField>

  {/* 👇 SHOW ONLY IF OTHER */}
  {formData.nationality === "Other" && (
    <TextField
      fullWidth
      sx={{ mt: 1 }}
      name="otherNationality"
      placeholder="Enter nationality"
      value={formData.otherNationality}
      onChange={handleChange}
      InputProps={{
        sx: {
          backgroundColor: "#F5F5F5",
          borderRadius: 1,
          "& .MuiInputBase-input": {
            color: "#000",
            opacity: 1,
          },
        },
      }}
    />
    
  )}
  
</Box>

    </Box>

    {/* --- ADDRESS --- */}
    <Box>
      <Typography sx={{ fontWeight: 500 }}>Address</Typography>
      <TextField
        fullWidth
        multiline
        minRows={2}
        //placeholder="Govardhan Hill, Ashok Nagar, Nashik..."
        name="address"
        value={formData.address}
        onChange={handleChange}
        InputProps={{
          sx: {
            backgroundColor: "#F5F5F5",
            borderRadius: 1,
            "& .MuiInputBase-input": { color: "#000", opacity: 1 }
          }
        }}
      />
    </Box>

    {/* --- NEXT OF KIN NAME --- */}
    <Box>
      <Typography sx={{ fontWeight: 500 }}>Next of Kin Name</Typography>
      <TextField
        fullWidth
        //placeholder="Shakir Huzain"
        name="kinName"
        value={formData.kinName}
        onChange={handleChange}
        InputProps={{
          sx: {
            backgroundColor: "#F5F5F5",
            borderRadius: 1,
            "& .MuiInputBase-input": { color: "#000", opacity: 1 }
          }
        }}
      />
    </Box>

    {/* --- PHONE + RELATIONSHIP --- */}
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* Phone */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>Phone</Typography>
        <TextField
          fullWidth
          //placeholder="9948573839"
          name="kinPhone"
          value={formData.kinPhone}
           disabled={sameAsPatient}
          onChange={handleChange}
          InputProps={{
            sx: {
              backgroundColor: "#F5F5F5",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#000", opacity: 1 , WebkitTextFillColor: "#000",}
            }
          }}
        />
      </Box>

      {/* Relationship */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>Relationship</Typography>
        <TextField
          fullWidth
          select
          name="relationship"
          value={formData.relationship}
          onChange={handleChange}
          InputProps={{
            sx: { backgroundColor: "#F5F5F5", borderRadius: 1 ,
              "& .MuiInputBase-input": {
      color: "#000",       // BLACK PLACEHOLDER
      opacity: 1,          // MAKE IT FULLY VISIBLE
    }
            }
          }}
        >
          <MenuItem value="Father">Father</MenuItem>
          <MenuItem value="Mother">Mother</MenuItem>
          <MenuItem value="Guardian">Guardian</MenuItem>
        </TextField>
      </Box>
    </Box>

    {/* --- KIN ADDRESS --- */}
    <Box>
      <Typography sx={{ fontWeight: 500 }}>Address</Typography>
      <TextField
        fullWidth
        multiline
        minRows={2}
        //placeholder="Govardhan Hill, Ashok Nagar..."
        name="kinAddress"
        value={formData.kinAddress}
         disabled={sameAsPatient}
        onChange={handleChange}
        InputProps={{
          sx: {
            backgroundColor: "#F5F5F5",
            borderRadius: 1,
            "& .MuiInputBase-input": { color: "#000", opacity: 1 , WebkitTextFillColor: "#000",}
          }
        }}
      />
    </Box>
    <FormControlLabel
    sx={{ mt: 1 }}
    control={
      <Checkbox
        checked={sameAsPatient}
        onChange={(e) => {
          const checked = e.target.checked;
          setSameAsPatient(checked);

          if (checked) {
            setFormData((prev) => ({
              ...prev,
              kinAddress: prev.address,
              kinPhone: prev.mobile,
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              kinAddress: "",
              kinPhone: "",
            }));
          }
        }}
        sx={{ color: "#124D81" }}
      />
    }
    label={
      <Typography sx={{ color: "#000", fontSize: 14 }}>
        Same as patient address & phone
      </Typography>
    }
  />
    {/* --- DOA + TREATING DR --- */}
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* DOA */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>DOA</Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            type="date"
            fullWidth
            name="doaDate"
            value={formData.doaDate}
            onChange={handleChange}
            InputProps={{
              sx: { backgroundColor: "#F5F5F5", borderRadius: 1 ,
                "& .MuiInputBase-input": { color: "#000", opacity: 1 }
              }
            }}
          />
          <TextField
            type="time"
            fullWidth
            name="doaTime"
            value={formData.doaTime}
            onChange={handleChange}
            InputProps={{
              sx: { backgroundColor: "#F5F5F5", borderRadius: 1 ,
                "& .MuiInputBase-input": { color: "#000", opacity: 1 }
              }
            }}
          />
        </Box>
      </Box>

      {/* Treating Dr */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>Treating Dr</Typography>
        <TextField
          fullWidth
          // REMOVED "select" prop here
          name="treatingDr"
          value={formData.treatingDr}
          onChange={handleChange}
          // Kept your existing styling
          InputProps={{
            sx: { 
               backgroundColor: "#F5F5F5", 
               borderRadius: 1,
               "& .MuiInputBase-input": { color: "#000", opacity: 1 }
            }
          }}
        />
        {/* REMOVED <MenuItem> children */}
      </Box>
    </Box>

    {/* --- ADMITTING DR + REFERRING HOSPITAL --- */}
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* ADMITTING DOCTOR (Now a standard Text Field) */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>Admitting Dr</Typography>
        <TextField
          fullWidth
          // REMOVED "select" prop
          name="admittingDr"
          value={formData.admittingDr}
          onChange={handleChange}
          // Kept your styling
          InputProps={{
            sx: { 
               backgroundColor: "#F5F5F5", 
               borderRadius: 1,
               "& .MuiInputBase-input": { color: "#000", opacity: 1 }
            }
          }}
        /> 
        {/* REMOVED <MenuItem> children */}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 500 }}>Referring Hospital</Typography>
        <TextField
          fullWidth
         //placeholder="Borneo Hospital"
          name="refHospital"
          value={formData.refHospital}
          onChange={handleChange}
          InputProps={{
            sx: {
              backgroundColor: "#F5F5F5",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#000", opacity: 1 }
            }
          }}
        />
      </Box>
    </Box>
  </Box>
)}

    {/* ---- STEP 3 CONTENT ---- */}
    {step === 3 && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 2 }}>
    
   
    {/* ---- SECTION TITLE ---- */}

    {/* PREVIEW BLOCK 1 */}
    <Box
  sx={{
    p: 2,
    border: "1px solid #E5E7EB",
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    
  }}
>

  {/* Header Row */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        backgroundColor: "#E8F3FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#1E88E5",
        fontSize: "1.1rem",
      }}
    >
      
    </Box>

    <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
      B/O {formData.mothersName}
    </Typography>
  </Box>

  <Box
    sx={{
      borderBottom: "1px solid #E5E7EB",
      width: "100%",
      mt: 1,
    }}
  />

  {/* --- Row 1 (UHID & Admission No) --- */}
  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
    <Box>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>UHID:</Typography>
      <Typography sx={{ fontWeight: 700 }}>{formData.patientId}</Typography>
    </Box>

    <Box>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>Admission No:</Typography>
      <Typography sx={{ fontWeight: 700 }}>{formData.adminNo}</Typography>
    </Box>
  </Box>

  {/* --- Row 2 (Gender, Age, DOB) --- */}
  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
    <Box>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>Gender:</Typography>
      <Typography sx={{ fontWeight: 700 }}>{formData.gender}</Typography>
    </Box>

    <Box>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>Age:</Typography>
      <Typography sx={{ fontWeight: 700 }}>{formData.age}</Typography>
    </Box>

    <Box>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>DOB:</Typography>
      <Typography sx={{ fontWeight: 700 }}>{formData.birthDate}</Typography>
    </Box>
  </Box>

  {/* --- Row 3 (Bed No) --- */}
  <Box>
    <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>Bed No:</Typography>
    <Typography sx={{ fontWeight: 700 }}>{formData.bedNo}</Typography>
  </Box>

  {/* Edit Icon Button */}
  <Box
    sx={{
      position: "absolute",
      bottom: 12,
      right: 12,
      width: 38,
      height: 38,
      backgroundColor: "#F3F4F6",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "0.2s",
      "&:hover": {
        backgroundColor: "#E5E7EB",
      },
    }}
    onClick={() => setStep(1)}
  >
    <EditIcon sx={{ color: "#1E88E5", fontSize: "1.2rem" }} />
  </Box>
</Box>


    {/* ---- SECTION TITLE 2 ---- */}
   
    {/* PREVIEW BLOCK 2 */}
   <Box
  sx={{
    p: 2,
    border: "1px solid #E5E7EB",
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    mt: -2
  }}
>

  {/* --- Row 1 (Mobile / Nationality) --- */}
  <Box sx={{ display: "flex", justifyContent: "space-between" }}>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
        Mobile No:
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {formData.mobile}
      </Typography>
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
        Nationality:
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        { finalNationality}
      </Typography>
    </Box>

  </Box>

  {/* --- Address (Full Row) --- */}
  <Box>
    <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
      Address :
    </Typography>
    <Typography sx={{ fontWeight: 700, lineHeight: 1.4 }}>
      {formData.address}
    </Typography>
  </Box>

  {/* --- Row 3 (Kin Name / Relationship) --- */}
  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
        Next of Kin:
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {formData.kinName}
      </Typography>
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
        Relationship:
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {formData.relationship}
      </Typography>
    </Box>
  </Box>

  {/* --- Kin Phone (Full Row) --- */}
  <Box>
    <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
      Kin Phone:
    </Typography>
    <Typography sx={{ fontWeight: 700 }}>
      {formData.kinPhone}
    </Typography>
  </Box>

  {/* --- Kin Address (Full Row) --- */}
  <Box>
    <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
      Kin Address:
    </Typography>
    <Typography sx={{ fontWeight: 700, lineHeight: 1.4 }}>
      {formData.kinAddress}
    </Typography>
  </Box>

  {/* --- Row 6 (DOA / Treating Dr) --- */}
  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
    
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
        DOA:
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {formData.doaDate} • {formData.doaTime}
      </Typography>
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
        Treating Dr:
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {formData.treatingDr}
      </Typography>
    </Box>

  </Box>

  {/* --- Row 7 (Admitting Dr / Ref Hospital) --- */}
  <Box sx={{ display: "flex", justifyContent: "space-between" }}>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
        Admitting Dr:
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {formData.admittingDr}
      </Typography>
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
        Referring Hospital:
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {formData.refHospital}
      </Typography>
    </Box>

  </Box>

</Box>
<FormControlLabel
  control={
    <Checkbox
      checked={isVerified}
      onChange={(e) => setIsVerified(e.target.checked)}
      sx={{ color: "#124D81" }}
    />
  }
  label="All details are verified and correct"
/>

{/* <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
        Filled by:
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {formData.admittingDr}
      </Typography>
    </Box> */}
  </Box>
)}

  </DialogContent>

  {/* ---- FOOTER BUTTONS ---- */}
      <DialogActions sx={{ alignContent: "center", justifyContent: "center", p: 2 }}>
        <Box>
          {step === 1 && (
            <Button
              sx={{
                textTransform: "none",
                marginRight: "18px",
                background: "#228BE61A",
                color: "#228BE6",
                fontWeight: 600,
              }}
              // ✅ CHANGED: Now opens the upload dialog instead of a new tab
              onClick={() => setUploadOpen(true)}
            >
              Admission Form
            </Button>
          )}

          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              sx={{ mr: 1, textTransform: "none" }}
            >
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={() => {
                if (!isFormComplete(formData)) {
                  setSnackbar({
                    open: true,
                    severity: "error",
                    message: "Fill all the required fields",
                  });
                  return;
                }
                setStep(step + 1);
              }}
              sx={{
                backgroundColor: "#228BE6",
                color: "#fff",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#228BE6 !important",
                  color: "#fff",
                },
              }}
            >
              Add
            </Button>
          ) : (
            <Button
              disabled={!isVerified}
              onClick={() => {
                handleSubmit();
              }}
              sx={{
                backgroundColor: isVerified ? "#228BE6" : "#A7B3CD",
                color: "#fff",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#228BE6 !important",
                  color: "#fff",
                },
              }}
            >
              Save Admission
            </Button>
          )}
        </Box>
      </DialogActions>
      {/* ---- ENHANCED UPLOAD DIALOG ---- */}
      <Dialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 1400 }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1,
            pt: 2.5,
            px: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionIcon sx={{ color: '#228BE6', fontSize: 20 }} />
            <Typography variant="h6" fontWeight={600} fontSize="1.1rem">
              Upload Admission Form
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setUploadOpen(false)} 
            size="small"
            sx={{ 
              color: '#666',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box
            sx={{
              border: uploadFile ? '2px solid #51cf66' : '2px dashed #dee2e6',
              backgroundColor: uploadFile ? '#f0fdf4' : '#fafafa',
              borderRadius: '12px',
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { 
                backgroundColor: uploadFile ? '#f0fdf4' : '#f5f5f5',
                borderColor: uploadFile ? '#51cf66' : '#228BE6'
              },
            }}
            onClick={() => document.getElementById("pdf-upload-input")?.click()}
          >
            <input
              type="file"
              id="pdf-upload-input"
              accept="application/pdf"
              hidden
              onChange={handleFileChange}
            />
            
            {!uploadFile ? (
              <Box>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: '#e7f5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 28, color: '#228BE6' }} />
                </Box>
                
                <Typography variant="subtitle1" fontWeight={600} color="#1a1a1a" mb={0.5} fontSize="1rem">
                  Click to Upload PDF
                </Typography>

                <Typography variant="body2" color="#4a5568" fontSize="0.9rem" fontWeight={500}>
                  or drag and drop your file here
                </Typography>

                <Typography variant="caption" color="#6b7280" sx={{ mt: 1.5, display: 'block', fontSize: '0.8rem' }}>
                  Supports PDF files only
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: '#d3f9d8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 28, color: '#51cf66' }} />
                </Box>
                
                <Typography variant="subtitle1" fontWeight={600} color="#2f9e44" mb={0.5} fontSize="1rem">
                  {uploadFile.name}
                </Typography>

                <Typography variant="body2" color="#4a5568" fontSize="0.9rem" fontWeight={500}>
                  Ready to extract data
                </Typography>
                
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadFile(null);
                  }}
                  sx={{ 
                    mt: 2,
                    textTransform: 'none',
                    color: '#6b7280',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: '#374151'
                    }
                  }}
                >
                  Choose different file
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button 
            onClick={() => setUploadOpen(false)} 
            sx={{ 
              textTransform: 'none',
              color: '#666',
              fontWeight: 500,
              px: 2,
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadFile || uploadLoading}
            sx={{ 
              textTransform: 'none',
              bgcolor: '#228BE6',
              fontWeight: 500,
              minWidth: 120,
              px: 3,
              boxShadow: '0 2px 8px rgba(34, 139, 230, 0.25)',
              '&:hover': {
                bgcolor: '#1c7ed6',
                boxShadow: '0 4px 12px rgba(34, 139, 230, 0.35)',
              },
              '&:disabled': {
                bgcolor: '#e9ecef',
                color: '#adb5bd'
              }
            }}
          >
            {uploadLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Extract Data'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      </Dialog>

      <Dialog open={assignDialog.open} onClose={handleAssignDialogClose}>
        <DialogTitle>
          {assignDialog.type === "user" ? "Assign User" : "Assign Bed"}
        </DialogTitle>
        <DialogContent>
          {assignDialog.type === "user" ? (
            <>
              <InputLabel>Select Practitioner</InputLabel>
              <TextField
                select
                fullWidth
                value={assignDialog.selectedValue}
                onChange={(e) => setAssignDialog(prev => ({ ...prev, selectedValue: e.target.value }))}
                sx={{ mt: 1 }}
              >
                {/* {practitioners.map((practitioner) => (
                  <MenuItem key={practitioner.id} value={practitioner.id}>
                    {practitioner.name}
                  </MenuItem>
                ))} */}
              </TextField>
            </>
          ) : (
            <>
              <InputLabel>Select Bed</InputLabel>
              <TextField
                select
                fullWidth
                value={assignDialog.selectedValue}
                onChange={(e) => setAssignDialog(prev => ({ ...prev, selectedValue: e.target.value }))}
                sx={{ mt: 1 }}
              >
                {/* {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.identifier} ({location.type === "bd" ? "Bed" : "Room"})
                  </MenuItem>
                ))} */}
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignDialogClose}>Cancel</Button>
          <Button 
            onClick={handleAssignSubmit} 
            disabled={!assignDialog.selectedValue}
            variant="contained"
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openPatientDialog}
        onClose={() => setOpenPatientDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: "#124D81",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Patient Details
          <IconButton onClick={() => setOpenPatientDialog(false)}>
            ✕
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedPatient && (
            <Stack spacing={3}>
              {/* 🔹 Top Summary */}
              <Stack direction="row" spacing={4}>
                <Typography><b>Mother’s Name:</b> {selectedPatient.motherName}</Typography>
                <Typography><b>UHID:</b> {selectedPatient.patientId}</Typography>
                <Typography><b>Admission No:</b> {selectedPatient.admissionNo}</Typography>
              </Stack>

              {/* 🔹 Baby Info */}
              <Stack direction="row" spacing={4}>
                <Typography><b>DOB:</b> {selectedPatient.birthDateTime}</Typography>
                <Typography><b>Gender:</b> {selectedPatient.gender}</Typography>
                <Typography><b>GA:</b> {selectedPatient.gestationalAge}</Typography>
                <Typography><b>Birth Weight:</b> {selectedPatient.birthWeight} g</Typography>
              </Stack>

              {/* 🔹 Admission Details */}
              <Box>
                <Typography fontWeight={600} mb={1}>
                  Admission Details
                </Typography>

                <Stack spacing={1}>
                  <Typography><b>Bed No:</b> {selectedPatient.bed}</Typography>
                  <Typography><b>DOA:</b> {selectedPatient.admissionDate}</Typography>
                  <Typography><b>Treating Doctor:</b> {selectedPatient.treatingDoctor}</Typography>
                  <Typography><b>Admitting Doctor:</b> {selectedPatient.admittingDoctor}</Typography>
                  <Typography><b>Referring Hospital:</b> {selectedPatient.refHospital}</Typography>
                </Stack>
              </Box>

              {/* 🔹 Contact */}
              <Box>
                <Typography fontWeight={600} mb={1}>
                  Contact Details
                </Typography>

                <Typography><b>Mobile:</b> {selectedPatient.mobile}</Typography>
                <Typography><b>Address:</b> {selectedPatient.address}</Typography>
                <Typography><b>Nationality:</b> {selectedPatient.nationality}</Typography>
              </Box>

              {/* 🔹 Next of Kin */}
              <Box>
                <Typography fontWeight={600} mb={1}>
                  Next of Kin
                </Typography>

                <Typography><b>Name:</b> {selectedPatient.kinName}</Typography>
                <Typography><b>Relation:</b> {selectedPatient.kinRelation}</Typography>
                <Typography><b>Mobile:</b> {selectedPatient.kinMobile}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
</Box>

   
  );
};