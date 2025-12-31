import React, { useEffect,useRef, useState } from "react";
import {Box, Typography, TextField, Button,Grid,Divider,Paper,Autocomplete,MenuItem,Select,  Dialog,DialogTitle,Tooltip,DialogContent,FormControlLabel,FormGroup,Checkbox,FormControl,Snackbar, Alert,  CircularProgress} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Chip } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrescription } from "@fortawesome/free-solid-svg-icons";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { addHours } from "date-fns";
import { ProtectedModule } from '../components/ProtectedModule';
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";


const Q_FACTOR_MAP: Record<number, string> = {
  4: "Q4H",
  6: "Q6H",
  8: "Q8H",
  12: "Q12H",
  24: "Q24H",
  36:"Q36H",
  48:"Q48H",
  30:"Q30H",
  42:"Q42H",
  18:"Q18H",
};
type MedicationItem = {
  id: string;
  name: string;
  orderType: string;   // ✅ ADD THIS
  frequency: number | string;
  frequency1: string;
  route: string;
  startDate: string;
  endDate: string;
  use: string;
  additionalNote: string;
  isCritical: boolean;
  intervals: string[] | null;
  totalDoses: number;
  administeredCount: number;
  adminOver: number | null;
  concentration: string | null;
  intervalHours: number | null;
};
interface PrescriptionScreenProps {

  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
  gestational_age:string;
  birth_date:string;
  UserRole: string;

}
// type AdministrationHistoryItem = {
//   id: string;
//   versionId: string;
//   name: string;
//   status: string;
//   effectiveDateTime: string;
//   performerName: string;
//   patientReference: string;
//   requestReference: string;
// };
type AdministrationHistoryItem = {
  id: string;
  versionId: string;
  name: string;
  status: string;
  effectiveDateTime: string;
  performerName: string;
  patientReference: string;
  requestReference: string;

  // NEW FIELDS
  dosage: string;
  route: string;
  indication: string;
  frequency: string;
  duration: string;
};


interface Medication {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  frequency: string;
  frequency1?: string; // optional, if some don't have it
  route: string;
    orderType: string;
  totalDoses: number;
  administeredCount: number;
  dosageInstruction?: {
    doseAndRate?: {
      doseQuantity?: {
        value?: number;
        unit?: string;
      };
    }[];
  }[];
  use: string;
}


export const PrescriptionScreen: React.FC<PrescriptionScreenProps> = (props) => {

    
      const [selectedDrugName, setSelectedDrugName] = useState("");
      const [selectedDrugCategory, setSelectedDrugCategory] = useState("");
      const [selectedDrugUse, setSelectedDrugUse] = useState("");
      const [dose, setDose] = useState<string>('');
      const [route, setRoute] = useState<string>('');
      const [unit, setUnit] = useState("mg/kg");
      const [frequency, setFrequency] = useState<string>('');
      const [startDate, setStartDate] = useState<Date | null>(null);
      const [endDate, setEndDate] = useState<Date | null>(null);
      const [days, setDays] = useState<number>(1);
      const [indication, setIndication] =  useState<string[]>([]);
      //const [indications, setIndications] = useState<string[]>([]);
      const[admin,setAdmin]=useState<string>('');
     const [intervalHours, setIntervalHours] = useState<string>(''); // optional
      const[conc,setConc]=useState<string>('');
      const [additionalNote, setAdditionalNote] = useState("");
      const[doseperday,setDoseperday]=useState('N/A');
     // Store medications
     const [drugOptions, setDrugOptions] = useState<any[]>([]);
     const [openPrescribeModal, setOpenPrescribeModal] = useState(false);
const [pmaDays, setPmaDays] = useState<string>("");
const [pmaCombined,setpmaCombined]=useState<string>("");
const [allDrugsList, setAllDrugsList] = useState<any[]>([]);
const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "completed">("ongoing");
// const [inputValue, setInputValue] = useState("");

      const [gestationalAge, setGestationalAge] = useState<string>('');
const [birthDate, setBirthDate] = useState<string>('');
const [pnaDays, setPnaDays] = useState<string>("");
const [pmaWeeks, setPmaWeeks] = useState<string>("");
const [weight, setWeight] = useState<string>("");

 // e.g. "Q8H"
const [ivAdminBackup, setIvAdminBackup] = useState<string>(''); // stores last IV admin
const [doseAmount, setDoseAmount] = useState<string>('');   // mg total
const [doseVolume, setDoseVolume] = useState<string>('');   // mL total
const [deliveryRate, setDeliveryRate] = useState<string>(''); // mL/hr
const[ordertype,setOrderType]=useState<string>('');
const [sortBy, setSortBy] = useState<string>("");
const [availableRoutes, setAvailableRoutes] = useState<string[]>([]);
const [selectedChips, setSelectedChips] = useState<string[]>([]);
//const [fhirImageId, setFhirImageId] = useState<string | null>(null);
const [openViewDialog, setOpenViewDialog] = useState(false);
const [selectedMedication, setSelectedMedication] = useState<any | null>(null);
const [capturedImage, setCapturedImage] = useState<string | null>(null);
const [isCameraActive, setIsCameraActive] = useState(false);
const videoRef = useRef<HTMLVideoElement>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
const [gaWeeks, setGaWeeks] = useState<string>("");
const [gaDays, setGaDays] = useState<string>("");

     // Drug search options
      const [selectedDrug, setSelectedDrug] = useState<any | null>(null); // Selected drug object
      const [administrationHistory, setAdministrationHistory] = useState<AdministrationHistoryItem[]>([]);
      const [prescriptionHistory, setPrescriptionHistory] = useState<Medication[]>([]);
const [step, setStep] = useState(1); // 🔹 step 1: details, step 2: capture image
  const [patientVerified, setPatientVerified] = useState(false);
  const [doseVerified, setDoseVerified] = useState(false);
const [chipNotes, setChipNotes] = useState<{ [key: string]: string }>({});
//const [startTime, setStartTime] = useState("");
const [duration] = useState("");
//const [rate, setRate] = useState("");
const [adminDetails, setAdminDetails] = useState({
  startTime: "",
  duration: "",
  calculatedRate: "",
});

// 🔹 Fetch GA & DOB from FHIR (if exists)
// Gestational age in total days
//const totalGADays = Number(gaWeeks) * 7 + Number(gaDays);


  const handleClose = () => {
  if (step > 1) {
    setStep(step - 1);
  } else {
    setOpenViewDialog(false);
  }
};
const handleCloseEntire = () => {
  setOpenViewDialog(false);  // closes the dialog completely
      setStep(1);                // optional — reset stepper to first step
  setSelectedChips([]); 
  setCapturedImage(null);
  setDoseVerified(false);
  setPatientVerified(false);
  setIsCameraActive(false);

  // Optional: stop camera if it was left on
  if (videoRef.current && videoRef.current.srcObject) {
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
  } // optional — clear selected chips if you’re using them
};

const handleProceed = async () => {
  // ✅ Step 1 → Step 2 guard (verification check)
  if (step === 1 && (!patientVerified || !doseVerified)) {
    alert("Please verify both 'Patient' and 'Drug dose & route' before proceeding.");
    return;
  }

  // ✅ Step 2 → Step 3 (upload captured image to FHIR)
  if (step === 2) {
    if (!capturedImage) {
      alert("Please capture or upload an image before proceeding.");
      return;
    }
    setStep(3);
    return;
  }

  // ✅ Step 3 → Step 4 (chip selection required)
  if (step === 3) {
    if (selectedChips.length <= 0) {
      
alert("You are proceeding with no additional info");
      
    } 
    setStep(4);//else {
    //  alert("Please select at least one option before proceeding.");
   // }
    return;
  }

  // ✅ Step 4 → Step 5 (drug administration timing & rate)
  if (step === 4) {
    // Add any validation here if needed later (e.g., notes required)
    setStep(5);
    return;
  }

  // ✅ Step 5 → End (finish flow and close dialog)
  if (step === 5) {
    // Optionally trigger final save or summary step here
    try {
      if (!capturedImage) {
  console.error("No image captured.");
  return;
}

      await handleUploadToFHIR(capturedImage); 
      if (selectedMedication?.id) {
        console.log("Administering medication:", selectedMedication.id);
        await handleAdminister(selectedMedication.id);
         // ✅ trigger FHIR administration
      }
  
    } catch (error) {
      console.error("Error administering medication:", error);
      alert("Failed to administer medication. Please try again.");
       console.error("FHIR upload failed:", error);
      alert("Failed to upload image to FHIR. Please try again.");
    }
    setStep(1);
    setDoseVerified(false);
    setPatientVerified(false);
    setOpenViewDialog(false);
    
    return;}
//if (step === 6) {
    // Optionally trigger final save or summary step here
 //   setStep(1);
  ///  setOpenViewDialog(false);
 //   return;
 // }
  // ✅ Default fallback — safety guard
  if (step < 5) setStep(step + 1);
};

useEffect(() => {
  if (!gaWeeks) return;
  const gaDec =
    gaDays !== ""
      ? (parseInt(gaWeeks) + parseInt(gaDays) / 7).toFixed(1)
      : parseInt(gaWeeks).toFixed(1);
  setGestationalAge(gaDec);
  if (birthDate) {
    const calc = calculatePNAandPMA(birthDate, gaDec);
    setPnaDays(String(calc.pnaDays));
    setPmaWeeks(calc.pmaWeeks);
    setPmaDays(calc.pmaDays);
    setpmaCombined(calc.pmaDecimal);
  }
}, [gaWeeks, gaDays]);
useEffect(() => {
  if (!birthDate || !gestationalAge) return;
  const calc = calculatePNAandPMA(birthDate, gestationalAge);
  setPnaDays(String(calc.pnaDays));
  setPmaWeeks(calc.pmaWeeks);
  setPmaDays(calc.pmaDays);
  setpmaCombined(calc.pmaDecimal);
  console.log("pmaCombined",pmaCombined);
  
}, [birthDate]);
useEffect(() => {
  if (pmaWeeks === "" || pmaDays === "") return;
  const dec = (
    parseInt(pmaWeeks) +
    parseInt(pmaDays) / 7
  ).toFixed(1);
  setpmaCombined(dec);
}, [pmaWeeks, pmaDays]);

const handleTakePhoto = async () => {
    if (!isCameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        console.error("Camera access error:", err);
        alert("Unable to access the camera. Please allow permission.");
      }
    } else {
      // Capture the current frame from video
      const video = videoRef.current;
      if (!video) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/png");
      setCapturedImage(imageData);

      // Stop camera
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(false);
    }
  };

  // 🔹 Upload from gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

 
  // Fetch drug data (RxNorm API example)
  // const fetchDrugs = async (query: string) => {
  //   try {
  //     const response = await fetch(
  //       `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`
  //     );
  //     const data = await response.json();
  //     const drugs =
  //       data.drugGroup.conceptGroup?.flatMap((group: any) =>
  //         group.conceptProperties
  //           ? group.conceptProperties.map((item: any) => item.name)
  //           : []
  //       ) || [];
  //     setDrugOptions(drugs);
  //   } catch (error) {
  //     console.error("Error fetching drug data:", error);
  //     setDrugOptions([]);
  //   }
  // };

  
// place near other helper functions in PrescriptionScreen.tsx


const mapRuleToOption = (rule: any) => ({
  // keep fields your UI expects
  name: rule.drug_name || "",               // used by getOptionLabel
  category: rule.other_info?.ABOUT?.[0] || "", // optional
  use: rule.regimens && rule.regimens.length ? rule.regimens[0].raw_text : "", // first use as fallback
  original: rule // keep full object for deeper use later (e.g., regimens)
});


const fetchDrugs = async (query: string = "") => {
  try {
    const resp = await fetch("/rules.json"); // ✅ keep your existing path
    const data = await resp.json();

    // ✅ Normalize to array (since some files may contain single or multiple drug objects)
    const list = Array.isArray(data) ? data : [data];

    // ✅ Cache full drug list if not already stored
    if (!allDrugsList.length) setAllDrugsList(list);

    // ✅ Filter based on search query
    let matches;
    if (!query.trim()) {
      // no query → show all drugs
      matches = list.map(mapRuleToOption);
    } else {
      matches = list
        .filter(
          (d: any) =>
            d.drug_name &&
            d.drug_name.toLowerCase().includes(query.toLowerCase())
        )
        .map(mapRuleToOption);
    }

    setDrugOptions(matches);
  } catch (err) {
    console.error("Error loading rules.json:", err);
    setDrugOptions([]);
  }
};
useEffect(() => {
  fetchDrugs(""); // ✅ load full list initially
}, []);


/*const getIndicationsForDrug = (drug: any) => {
  if (!drug || !drug.regimens) return [];
  // Extract unique raw_text values (drug uses)
  const uniqueUses = [...new Set(drug.regimens.map((r: any) => r.raw_text))];
  return uniqueUses;
};*/

/*const getRegimenDetails = (drug: any, indication: string) => {
  if (!drug || !drug.regimens) return null;
  const match = drug.regimens.find(
    (r: any) => r.raw_text.toLowerCase() === indication.toLowerCase()
  );
  return match || null;
};*/



const calculatePNAandPMA = (birthDate: string, gestAgeDecimal: string) => {
  if (!birthDate || !gestAgeDecimal) {
    return { pnaDays: 0, pmaWeeks: "", pmaDays: "", pmaDecimal: "" };
  }

  const birth = new Date(birthDate);
  const today = new Date();

  // PNA in days
  const pnaDays = Math.max(
    0,
    Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  );

  // PMA in weeks (decimal)
  const pmaDecimal = (parseFloat(gestAgeDecimal) + pnaDays / 7).toFixed(1);

  // Convert decimal -> weeks + days
  const wholeWeeks = Math.floor(parseFloat(pmaDecimal));
  const remainingDays = Math.round((parseFloat(pmaDecimal) - wholeWeeks) * 7);

  return {
    pnaDays,
    pmaWeeks: String(wholeWeeks),
    pmaDays: String(remainingDays),
    pmaDecimal,
  };
};



useEffect(() => {
  if (birthDate && gestationalAge) {
    const { pnaDays, pmaWeeks } = calculatePNAandPMA(birthDate, gestationalAge);
    setPnaDays(String(pnaDays ?? ""));
    setPmaWeeks(String(pmaWeeks ?? ""));

  }
}, [birthDate, gestationalAge]);


//checkning pna and pma values
useEffect(() => {
  console.log("GA:", gestationalAge, "| PNA (days):", pnaDays, "| PMA (weeks):", pmaWeeks);
}, [gestationalAge, pnaDays, pmaWeeks]);



// Check if a numeric value is within a defined range object
const inRange = (value: number, range: any): boolean => {
  if (!range) return true;

  const min =
    range.min ??
    range.min_kg ??
    range.min_days ??
    0;

  const max =
    range.max ??
    range.max_kg ??
    range.max_days ??
    Infinity;

  return value >= min && value <= max;
};

const filterRegimensForPatient = (
  regimens: any[],
  gestationalAge: string,
  weight: string,
  pnaDays: number,
  pmaWeeks: number
): any[] => {
  const ga = parseFloat(gestationalAge || "0");
  const wt = parseFloat(weight || "0");

  return regimens.filter((r) => {
    const gaOk = !r.ga_range || inRange(ga, r.ga_range);
    const pnaOk = !r.pna_range || inRange(pnaDays, r.pna_range);
    const pmaOk = !r.pma_range || inRange(pmaWeeks, r.pma_range);
    const wtOk = !r.weight_range_kg || inRange(wt, r.weight_range_kg);
    return gaOk && pnaOk && pmaOk && wtOk;
  });
};

useEffect(() => {
  if (selectedDrug && selectedDrug.original) {
    const filtered = filterRegimensForPatient(
      selectedDrug.original.regimens,
      gestationalAge,
      weight,
      Number(pnaDays)||0,
      Number(pmaWeeks)||0
    );
    const uses = [...new Set(filtered.map((r: any) => r.raw_text))] as string[];
    setIndication(uses);

    // ✅ Reset selected indication every time list changes
    setSelectedDrugUse('');
  }
}, [gestationalAge, weight, pnaDays, pmaWeeks, selectedDrug]);

const calculateDoseMetrics = (
  dosec: string,
  weight: string,
  concc: string,
  admin: string,
  route: string,
  dosePerDay?: string
) => {
  const wt = parseFloat(weight || "0");
  const dose = parseFloat(dosec || "0");
  const conc = parseFloat(concc || "0");
  const adminTime = parseFloat(admin || "0");
  const perDay = parseFloat(dosePerDay || "0");

  if (!wt || !dose || !conc) {
    return { doseAmount: "", doseVolume: "", deliveryRate: "" };
  }

  // ✅ Dose amount (mg) = dose_value * weight
  var doseAmount = dose * wt; // mg
   if (perDay && perDay > 0) {
    doseAmount = doseAmount / perDay;
  }
  // ✅ Dose volume (mL) = doseAmount / conc
  const doseVolume = conc ? doseAmount / conc : 0;

  // ✅ Delivery rate (for IV only) = volume / (admin_time / 60)
  const deliveryRate =
    route.toUpperCase() === "IV" && adminTime
      ? doseVolume / (adminTime / 60)
      : 0;

  return {
    doseAmount: doseAmount.toFixed(3),
    doseVolume: doseVolume.toFixed(3),
    deliveryRate: deliveryRate ? deliveryRate.toFixed(3) : "",
  };
};
useEffect(() => {
  const { doseAmount, doseVolume, deliveryRate } = calculateDoseMetrics(
    dose,
    weight,
    conc,
    admin,
    route,
    doseperday
  );
  setDoseAmount(doseAmount);
  setDoseVolume(doseVolume);
  setDeliveryRate(deliveryRate);
}, [dose, weight, conc, admin, route,doseperday]);

  /*const getIndicationsForDrug = (drug: any) => {
    if (!drug || !drug.regimens) return [];
    
    // Extract unique indications (raw_text)
    const indications = [...new Set(drug.regimens.map((r: any) => r.raw_text))];
    return indications;
  };*/
// ✅ Find active regimen for selected drug use + route
const activeRegimen =
  selectedDrug?.original?.regimens?.find(
    (r: any) =>
      r.raw_text === selectedDrugUse && r.routes?.toUpperCase() === route?.toUpperCase()
  ) || null;

const calcNotes = activeRegimen?.calc_notes || "";


  const isFormEmpty = () => {
    return (
      !selectedDrug ||
      !dose ||
      !route ||
      !frequency ||
      !startDate ||
      !endDate 
      // !indication ||
      // !additionalNote
    );
  };
  // Function to calculate the end date
const calculateEndDate = (startDate: string | number | Date, frequency: string, days: number) => {
  if (!startDate || !frequency || !days) return null;
  
  const hoursPerDose = parseInt(frequency.replace('Q', '').replace('H', ''), 10);
  const totalHours = days * 24; // Total hours based on the number of days
  const doses = totalHours / hoursPerDose; // Total doses within the period
  
  return addHours(new Date(startDate), doses * hoursPerDose);
};
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

const handleCloseSnackbar = () => {
  setSnackbarOpen(false);
};

// In your component
useEffect(() => {
  if (startDate && frequency && days) {
    const computedEndDate = calculateEndDate(startDate, frequency, days);
    setEndDate(computedEndDate);
  }
}, [startDate, frequency, days]);

  const resetForm = () => {
    setDrugOptions([]); // Clears the dropdown options safely
    setSelectedDrug(null);
    setSelectedDrugName('');
    setSelectedDrugCategory('');
    setSelectedDrugUse('');
    setDose('');
    setRoute('');
    setFrequency('');
    setStartDate(null);
    setEndDate(null);
    setDays(1);
    setIntervalHours('');
    setAdmin('');
    setIndication([]);
    setSelectedDrug('');
    setConc('');
    setOrderType('');
    setRoute('');
    setAdditionalNote('');
  };
//const FHIR_BASE_URL="https://pmsserver.local/fhir";
/**
 * Uploads the captured or selected image to the FHIR server as a Media resource.
 * Links it to the current patient using props.patient_resource_id.
 */

const handleUploadToFHIR = async (imageBase64: string) => {
  try {
    if (!imageBase64) {
      console.error("No image data found.");
      setSnackbarMessage("No image to upload.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // ✅ Ensure your base FHIR URL and credentials are set correctly
    const FHIR_BASE_URL = import.meta.env.VITE_FHIRAPI_URL;
    const authHeader = "Basic " + btoa("fhiruser:change-password");

    // ✅ Build proper FHIR Media resource structure
    const mediaResource = {
      resourceType: "Media",
      status: "completed",
      type: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/media-type",
            code: "photo",
            display: "Photograph",
          },
        ],
        text: "photo",
      },
      subject: {
        reference: `Patient/${props.patient_resource_id}`,
      },
      content: {
        contentType: "image/jpeg",
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ""), // clean base64 prefix if present
      },
      issued: new Date().toISOString(),
      createdDateTime: new Date().toISOString(),
    };

    console.log("Uploading Media resource to FHIR:", mediaResource);

    const response = await fetch(`${FHIR_BASE_URL}/Media`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(mediaResource),
    });

    // ✅ Handle errors cleanly
    if (!response.ok) {
      const errorText = await response.text();
      console.error("FHIR upload failed:", errorText);
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const locationHeader = response.headers.get("Location");
    console.log("✅ Image uploaded successfully to FHIR!", locationHeader);

    setSnackbarMessage("Image uploaded successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    return locationHeader; // optional: store for linking later
  } catch (error) {
    console.error("Error uploading to FHIR:", error);
    setSnackbarMessage("FHIR upload failed. Check connection or credentials.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};


  
  const handleEndDateChange = (newEndDate: Date | null) => {
    setEndDate(newEndDate);
    const effectiveStartDate = startDate || new Date(); // Fallback to current date
    if (newEndDate) {
      const difference = Math.ceil(
        (newEndDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (difference >= 1) {
        setDays(difference);
      }
    }
  };
  const [medicationResourceId, setMedicationResourceId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
 
 
  const [administering, setAdministering] = useState(false);
  const [currentMedicationId, setCurrentMedicationId] = useState<string | null>(null);

  const calculateIntervals = (startDate: string | number | Date, endDate: string | number | Date, frequencyInHours: number) => {
    const intervals = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= new Date(endDate)) {
      intervals.push(new Date(currentDate)); // Add the current date to the intervals array
      currentDate.setHours(currentDate.getHours() + frequencyInHours); // Increment by the frequency
    }
    return intervals;
    
    
  }; 
  const getIntervalHours = (frequencyString: string | undefined): number => {
  if (!frequencyString) return 0;

  const lower = frequencyString.toLowerCase();

  if (lower.includes("6")) return 6;
  if (lower.includes("8")) return 8;
  if (lower.includes("12")) return 12;
  if (lower.includes("24")) return 24;
  if (lower.includes("once daily")) return 24;
  if (lower.includes("twice daily")) return 12;
  if (lower.includes("thrice daily")) return 8;

  return 0; // default fallback
};
const getNextDoseTime = (med: any) => {
  const start = new Date(med.startDate);
  const intervalHours = getIntervalHours(med.frequency1);
  if (!intervalHours) return null;

  // Calculate next dose after last administered dose
  const nextTime = new Date(start);
  nextTime.setHours(start.getHours() + intervalHours * med.administeredCount);
  return nextTime;
};
const filteredMedications = prescriptionHistory.filter((med) => {
  const now = new Date();
  const start = new Date(med.startDate);
  const end = new Date(med.endDate);
  const nextDose = getNextDoseTime(med);

  const isCompleted = med.administeredCount >= med.totalDoses;
  const isBeforeStart = now < start;
  //const isAfterEnd = now > end;
  const isMissed = nextDose && now > nextDose && !isCompleted;
  const isOngoing = !isCompleted && now >= start && now <= end && !isMissed;
  const isUpcoming = isBeforeStart && !isCompleted;

  if (statusFilter === "all") return true;
  if (statusFilter === "completed") return isCompleted;
  if (statusFilter === "ongoing") return isOngoing || isUpcoming || isMissed;
  return false;
});

const finalMedications = [...filteredMedications].sort(
  (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
);
  // const fetchPrescription = async () => {
  //   setLoading(true);
  //   try {
  //     const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest?subject=Patient/${props.patient_resource_id}`;
  //     const response = await fetch(searchUrl, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //     });
  
  //     if (response.ok) {
  //       const searchData = await response.json();
  //       console.log("Fetched Medication:", searchData);
  
  //       if (searchData?.entry && searchData.entry.length > 0) {
  //         const medicationData = searchData.entry.map((entry: { resource: any }) => {
  //           const medication = entry.resource;
  
  //           // Get frequency and start/end dates
  //           const frequency = medication.dosageInstruction?.[0]?.timing?.repeat?.frequency || "N/A";
  //           const startDate = medication.dispenseRequest?.validityPeriod?.start || "N/A";
  //           const endDate = medication.dispenseRequest?.validityPeriod?.end || "N/A";
             
  //           let frequencyInHours = frequency;
  //           const intervals = calculateIntervals(startDate, endDate, frequencyInHours);
  //           console.log("MedicationRequest intervals.",intervals);
  //           return {
  //             id: medication.id, // Ensure the medication ID is included
  //             name: medication.medicationCodeableConcept.text,
  //             frequency: frequency,
  //             frequency1: medication.dosageInstruction?.[0]?.text || "N/A",
  //             route: medication.dosageInstruction?.[0]?.route?.coding?.[0]?.display || "N/A",
  //             startDate: startDate,
  //             endDate: endDate,
  //             use: medication.reasonCode?.[0]?.text || "N/A",
  //             additionalNote: medication.note?.[0]?.text || "N/A",
  //             isCritical: false,
  //             intervals: intervals,
  //           };
  //         });
  
  //         setPrescriptionHistory(medicationData);
         
  //         // Save the medication data with IDs
  //       }
  //     } else {
  //       console.error("Failed to fetch MedicationRequest resource.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching MedicationRequest:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  

 
  // const handlePrescribe = async () => {
  //   setLoading(true);
  //   const doseValue = Number(dose);
  //     // Dynamically setting the period based on the selected frequency (Q12H, Q8H, Q6H)
  // const period = frequency === 'Q12H' ? 12 : frequency === 'Q8H' ? 8 : frequency === 'Q6H' ? 6 : 12;
  //   const prescriptionData = {
  //     resourceType: "MedicationRequest",
  //     id: medicationResourceId || undefined,
  //     status: "active",
  //     intent: "order",
  //     medicationCodeableConcept: {
  //       text: selectedDrugName, 
  //     },
     
  //     subject: {
  //       reference: `Patient/${props.patient_resource_id}`,
  //       display: props.patient_name,
  //     },
  //     requester: {
  //       reference: "Practitioner/12345", // Use a valid doctor ID
  //     },
  //     dosageInstruction: [
  //       {
  //         text: `${dose} mg ${route} every ${frequency}`,
  //         doseAndRate: [
  //           {
  //             doseQuantity: {
  //               value: doseValue, // Use the number value here
  //               unit: "mg",
  //             },
  //           },
  //         ],
  //         timing: {
  //           repeat: {
  //             frequency: period,  
  //             period: 1,     
  //             periodUnit: "d" 
  //           }
  //         },
  //         route: {
  //           coding: [
  //             {
  //               system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
  //               code: route.toLowerCase(),
  //               display: route,
  //             },
  //           ],
  //         },
  //       },
  //     ],
      
  //     reasonCode: [
  //       {
  //         text: selectedDrugUse,
  //       },
  //     ],
  //     note: [
  //       {
  //         text: additionalNote,
  //       },
  //     ],
  //     dispenseRequest: {
  //       validityPeriod: {
  //         start: startDate, // Start date of the prescription
  //         end: endDate, // End date of the prescription
  //       },
  //       expectedSupplyDuration: {
  //         value: days, // Total number of days
  //         unit: "days",
  //         system: "http://unitsofmeasure.org",
  //         code: "d",
  //       },
  //     },
  //   };
  
  //   try {
  //     const requestConfig = {
  //       method:  "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //       body: JSON.stringify(prescriptionData),
  //     };
  
  //     const url =`${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`;
  
  //     const response = await fetch(url, requestConfig);
  
  //     if (!response.ok) {
  //       const errorBody = await response.text();
  //       console.error("Error response body:", errorBody);
  //       throw new Error(`Request failed: ${response.statusText}`);
  //     }
  
  //     // Only parse JSON if the response has content
  //     const contentType = response.headers.get("content-type");
  //     let responseData = null;
  //     if (contentType && contentType.includes("application/json")) {
  //       responseData = await response.json();
  //     }
  //       setMedicationResourceId(responseData?.id || null);
  //       console.log("Prescription saved successfully:", responseData);
  //       setSnackbarMessage("Prescription saved successfully!");
  //     setSnackbarSeverity("success");
  //     setSnackbarOpen(true);
  //   } catch (error) {
  //     console.error("Error saving Prescription resource:", error);
  //     setSnackbarMessage("An error occurred while saving the Prescription.");
  //     setSnackbarSeverity("error");
  //     setSnackbarOpen(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  // const handleAdminister = async (medicationId: string) => {
  //   setAdministering(true);
  //   setCurrentMedicationId(medicationId);
  
  //   try {
  //     // Fetch MedicationRequest to get the medication reference or codeable concept
  //     const medicationRequestResponse = await fetch(
  //       `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         },
  //       }
  //     );
  
  //     if (!medicationRequestResponse.ok) {
  //       console.error("Failed to fetch MedicationRequest resource.");
  //       setSnackbarMessage("Failed to fetch MedicationRequest.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     const medicationRequest = await medicationRequestResponse.json();
  
  //     // Validate if the medication details are available
  //     const medicationReference =
  //       medicationRequest.medicationReference?.reference || null;
  //     const medicationCodeableConcept =
  //       medicationRequest.medicationCodeableConcept || null;
  
  //     if (!medicationReference && !medicationCodeableConcept) {
  //       console.error("MedicationRequest does not have a valid medication field.");
  //       setSnackbarMessage("Invalid MedicationRequest: Missing medication.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     // Check if a MedicationAdministration already exists for the MedicationRequest
  //     const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration?request=MedicationRequest/${medicationId}`;
  //     const searchResponse = await fetch(searchUrl, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //     });
  
  //     if (!searchResponse.ok) {
  //       console.error("Failed to search for existing MedicationAdministration.");
  //       setSnackbarMessage("Error checking existing administration.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     const searchData = await searchResponse.json();
  //     const existingAdmin = searchData?.entry?.[0]?.resource;
  
  //     // Enhanced: Validation to prevent multiple concurrent administrations
  //     if (existingAdmin && existingAdmin.status === "in-progress") {
  //       console.warn("MedicationAdministration is already in progress.");
  //       setSnackbarMessage("This medication is already being administered.");
  //       setSnackbarSeverity("warning");
  //       return;
  //     }
  
  //     // Prepare the MedicationAdministration resource
  //     const administerData = {
  //       resourceType: "MedicationAdministration",
  //       status: "completed", // Updated as per FHIR resource standard
  //       medicationReference: medicationReference
  //         ? { reference: medicationReference }
  //         : undefined,
  //       medicationCodeableConcept: medicationCodeableConcept || undefined,
  //       request: {
  //         reference: `MedicationRequest/${medicationId}`,
  //       },
  //       subject: {
  //         reference: `Patient/${props.patient_resource_id}`,
  //       },
  //       performer: [
  //         {
  //           actor: {
  //             reference: "Practitioner/12345", // Replace with actual performer ID
  //             display: "Nurse Name", // Replace with dynamic performer name
  //           },
  //         },
  //       ],
  //       effectiveDateTime: new Date().toISOString(),
  //     };
  
  //     // Log administration attempt (enhancement)
  //     console.log(
  //       "Attempting to administer medication with the following data:",
  //       administerData
  //     );
  
  //     let response;
  //     if (existingAdmin) {
  //       // Update existing MedicationAdministration with PUT
  //       const adminId = existingAdmin.id;
  //       response = await fetch(
  //         `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration/${adminId}`,
  //         {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: "Basic " + btoa("fhiruser:change-password"),
  //           },
  //           body: JSON.stringify({ ...existingAdmin, ...administerData }),
  //         }
  //       );
  //     } else {
  //       // Create new MedicationAdministration with POST
  //       response = await fetch(
  //         `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: "Basic " + btoa("fhiruser:change-password"),
  //           },
  //           body: JSON.stringify(administerData),
  //         }
  //       );
  //     }
  
  //     if (response.ok) {
  //       const responseData = await response.json();
  //       console.log("Medication administered successfully:", responseData);
  //       setSnackbarMessage("Medication administered successfully!");
  //       setSnackbarSeverity("success");
  //     } else {
  //       const errorMessage = await response.text();
  //       console.error("Failed to administer medication:", errorMessage);
  //       setSnackbarMessage("Failed to administer medication.");
  //       setSnackbarSeverity("error");
  //     }
  //   } catch (error) {
  //     console.error("Error administering medication:", error);
  //     setSnackbarMessage("An error occurred while administering the medication.");
  //     setSnackbarSeverity("error");
  //   } finally {
  //     setAdministering(false);
  //     setCurrentMedicationId(null);
  //     setSnackbarOpen(true);
  //   }
  // };
  const groupedByMedication = administrationHistory.reduce((acc, item) => {
    if (!acc[item.name]) acc[item.name] = [];
    acc[item.name].push(item);
    return acc;
  }, {} as Record<string, AdministrationHistoryItem[]>);
  
  const fetchAdminister = async () => {
    setLoading(true);
    try {
      const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration?subject=Patient/${props.patient_resource_id}`;
      
      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      });
  
      if (response.ok) {
        const searchData = await response.json();
        console.log("Fetched MedicationAdministration:", searchData);
        console.log("Fetched patient resource id:", props.patient_resource_id);
        console.log("Fetched user role:", props.UserRole);
      
  
        if (searchData?.entry && searchData.entry.length > 0) {
          const allHistories = await Promise.all(
            searchData.entry.map(async (entry: { resource: any }) => {
              const resourceId = entry.resource.id;
              const historyUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration/${resourceId}/_history`;
  
              const historyResponse = await fetch(historyUrl, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Basic " + btoa("fhiruser:change-password"),
                },
              });
  
              if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                return historyData.entry.map((historyEntry: { resource: any }) => {
                  const medication = historyEntry.resource;
                
                  // Dynamic dosage formatting
                  const dose =
                    medication.dosage?.dose?.value
                      ? `${medication.dosage?.dose?.value} ${medication.dosage?.dose?.unit ?? ""}`
                      : medication.dosage?.dose?.text || "N/A";
                
                  return {
                    id: medication.id,
                    versionId: medication.meta?.versionId || "N/A",
                    name: medication.medicationCodeableConcept?.text || "N/A",
                    status: medication.status || "N/A",
                    effectiveDateTime: medication.effectiveDateTime || "N/A",
                    performerName: medication.performer?.[0]?.actor?.display || "N/A",
                    patientReference: medication.subject?.reference || "N/A",
                    requestReference: medication.request?.reference || "N/A",
                
                    // NEW FIELDS
                    dosage: dose || "N/A",
                    route: medication.dosage?.route?.text || "N/A",
                    indication:
                      medication.reasonCode?.[0]?.text ??
                      medication.reasonReference?.[0]?.display ??
                      "N/A",
                    frequency:
                      medication.dosage?.timing?.repeat?.frequency ??
                      medication.dosage?.timing?.code?.text ??
                      "N/A",
                    duration:
                      medication.dosage?.timing?.repeat?.boundsPeriod?.duration ??
                      "N/A",
                  } as AdministrationHistoryItem;
                });
                
              } else {
                console.error(
                  `Failed to fetch history for MedicationAdministration ${resourceId}.`
                );
                return [];
              }
            })
          );
  
          // Flatten the nested array of histories
          const flattenedHistories: AdministrationHistoryItem[] = allHistories.flat();
          setAdministrationHistory(flattenedHistories);
        } else {
          setAdministrationHistory([]);
          console.warn("No MedicationAdministration entries found.");
        }
      } else {
        console.error("Failed to fetch MedicationAdministration resource.");
      }
    } catch (error) {
      console.error("Error fetching MedicationAdministration:", error);
    } finally {
      setLoading(false);
    }
  };
  
 const fetchPrescription = async () => {
  setLoading(true);
  try {
    const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest?subject=Patient/${props.patient_resource_id}&_count=100`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("fhiruser:change-password"),
      },
    });

    if (!response.ok) {
      console.error("❌ Failed to fetch MedicationRequest:", response.statusText);
      return;
    }

    const searchData = await response.json();
    console.log("📦 MedicationRequest bundle:", searchData);

    if (!searchData?.entry?.length) {
      setPrescriptionHistory([]);
      return;
    }

    // ------------------------------------------------------------
    // 🔍 Normalize and map FHIR → MedicationItem[]
    // ------------------------------------------------------------
    const medicationData: MedicationItem[] = searchData.entry.map(
      (entry: { resource: any }): MedicationItem => {
        const medication = entry.resource;
        const extensions = medication.extension || [];

        const getExt = (url: string) =>
          extensions.find((ext: any) => ext.url === url);

        const rawFreq =
          medication.dosageInstruction?.[0]?.timing?.repeat?.frequency;

        const frequency = rawFreq ? String(rawFreq) : "N/A";

        const start =
          medication.dispenseRequest?.validityPeriod?.start ||
          medication.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod
            ?.start ||
          "";

        const end =
          medication.dispenseRequest?.validityPeriod?.end ||
          medication.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod?.end ||
          "";

        // Ensure valid inputs for calculateIntervals
        const safeStart = start || "";
        const safeEnd = end || "";
        const safeFreq = typeof rawFreq === "number" ? rawFreq : 0;

        return {
          id: medication.id,
          name: medication.medicationCodeableConcept?.text || "N/A",

          frequency, // string
          frequency1:
            getExt(
              "http://example.org/fhir/StructureDefinition/frequencyLabel"
            )?.valueString || "N/A",

          route:
            medication.dosageInstruction?.[0]?.route?.coding?.[0]?.display ||
            "N/A",

          startDate: start,
          endDate: end,

          use: medication.reasonCode?.[0]?.text || "N/A",
          additionalNote: medication.note?.[0]?.text || "N/A",

          intervals: calculateIntervals(safeStart, safeEnd, safeFreq).map(d =>
  d instanceof Date ? d.toISOString() : String(d)
),


          totalDoses:
            getExt("http://example.org/fhir/StructureDefinition/totalDoses")
              ?.valueInteger || 0,

          administeredCount:
            getExt("http://example.org/fhir/StructureDefinition/administeredCount")
              ?.valueInteger || 0,

          adminOver:
            getExt("http://example.org/fhir/StructureDefinition/deliveryRate")
              ?.valueQuantity?.value ?? null,

          concentration:
            getExt("http://example.org/fhir/StructureDefinition/concentration")
              ?.valueString ?? null,

          intervalHours:
            getExt("http://example.org/fhir/StructureDefinition/intervalHours")
              ?.valueDecimal ?? null,

          orderType:
            medication.category?.[0]?.coding?.[0]?.display || "Regular",

          isCritical: false,
        };
      }
    );

    // ------------------------------------------------------------
    // 🔥 Sort by latest prescription first
    // ------------------------------------------------------------
    medicationData.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    const normalized: Medication[] = medicationData.map(item => ({
  id: item.id,
  name: item.name,
    
  // TS EXPECTS STRING (you already converted raw freq to string earlier)
  frequency: String(item.frequency),
      
  frequency1: item.frequency1,
  route: item.route,
  startDate: item.startDate,
  endDate: item.endDate,
  use: item.use,
  additionalNote: item.additionalNote,

  // TS EXPECTS string[] (you already converted toISOString, good)
  intervals: item.intervals,

  totalDoses: item.totalDoses,
  administeredCount: item.administeredCount,

  adminOver: item.adminOver,
  concentration: item.concentration,
  intervalHours: item.intervalHours,

  orderType: item.orderType,

  isCritical: item.isCritical,
}));

    setPrescriptionHistory(normalized);
   
    console.log("✅ Sorted Prescription List:", medicationData);
  } catch (error) {
    console.error("💥 Error fetching MedicationRequest:", error);
  } finally {
    setLoading(false);
  }
};

 // Put this inside your component where you compute filteredMedications

//   const handlePrescribe = async () => {
//     setLoading(true);
  
//     const period = frequency === 'Q12H' ? 12 : frequency === 'Q8H' ? 8 : frequency === 'Q6H' ? 6 : 12;
//     console.log("Total frequency (hours between doses):", period);
//   if (!startDate || !endDate) {
//   setSnackbarMessage("Start date and end date must be provided.");
//   setSnackbarSeverity("error");
//   setSnackbarOpen(true);
//   setLoading(false);
//   return;
// }

// const start = new Date(startDate);
// const end = new Date(endDate);
//     console.log("Start Date:", start, "End Date:", end);
  
//     const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
//     console.log("Total days:", totalDays);
  
//     const dosesPerDay = Math.floor(24 / period);
//     const totalDoses = (dosesPerDay * totalDays) + 1;
//     console.log("Total doses:", totalDoses);
//     console.log("indication:", indication);
//      console.log("selectedDrugCategory:", selectedDrugCategory);
  
//     const prescriptionData = {
//       resourceType: "MedicationRequest",
//       id: medicationResourceId || undefined,
//       status: "active",
//       intent: "order",
//       medicationCodeableConcept: { text: selectedDrugName },
//       subject: { reference: `Patient/${props.patient_resource_id}`, display: props.patient_name },
//       requester: { reference: "Practitioner/12345" },
//       dosageInstruction: [{
//         text: `${dose} mg every ${frequency}`,
//         doseAndRate: [{ doseQuantity: { value: Number(dose), unit: "mg" } }],
//         timing: { repeat: { frequency: period, periodUnit: "d" } },
//         route: {
//           coding: [{
//             system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
//             code: route.toLowerCase(),
//             display: route,
//           }]
//         }
//       }],
//       reasonCode: [{ text: selectedDrugUse }],
//       note: [{ text: additionalNote }],
//       dispenseRequest: {
//         validityPeriod: { start: startDate, end: endDate },
//         expectedSupplyDuration: { value: totalDays, unit: "days", system: "http://unitsofmeasure.org", code: "d" }
//       },
//       extension: [
//         { url: "http://example.org/fhir/StructureDefinition/totalDoses", valueInteger: totalDoses },
//         { url: "http://example.org/fhir/StructureDefinition/administeredCount", valueInteger: 0 }
//       ]
//     };
  
//     try {
//       const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Basic " + btoa("fhiruser:change-password"),
//         },
//         body: JSON.stringify(prescriptionData),
//       });
  
//       if (response.ok) {
//         const contentType = response.headers.get("Content-Type");
//         let responseData = null;
  
//         if (contentType && contentType.includes("application/json")) {
//           responseData = await response.json();
//         }
  
//         setMedicationResourceId(responseData?.id || null);
//         console.log("Prescription saved successfully:", responseData);
//         setSnackbarMessage("Prescription saved successfully!");
//         setSnackbarSeverity("success");
//         setSnackbarOpen(true);
//         fetchPrescription();
//       } else {
//         const errorBody = await response.text();
//         console.error("Error response:", response.status, response.statusText, errorBody);
//         throw new Error(`Request failed: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error("Error saving Prescription resource:", error);
//       setSnackbarMessage("An error occurred while saving the Prescription.");
//       setSnackbarSeverity("error");
//       setSnackbarOpen(true);
//     } finally {
//       setLoading(false);
//     }
//   };
  
// Helper function to calculate duration in days

const handlePrescribe = async () => {
  setLoading(true);

  const period =
    frequency === "Q12H"
      ? 12
      : frequency === "Q8H"
      ? 8
      : frequency === "Q6H"
      ? 6: frequency === "Q36H"
      ? 36: frequency === "Q42H"
      ? 42: frequency === "Q24H"
      ? 24: frequency === "Q18H"
      ? 18: frequency === "Q30H"
      ? 30: frequency === "Q15H"
      ? 15: frequency === "Q48H"
      ? 48: frequency === "Q72H"
      ? 72: frequency === "Q54H"
      ? 54
      : 12;

  if (!startDate || !endDate) {
    setSnackbarMessage("Start date and end date must be provided.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    setLoading(false);
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const dosesPerDay = Math.max(1, Math.floor(24 / period));

  const totalDoses = dosesPerDay * totalDays + 1;

  // ✅ Construct FHIR resource
  const prescriptionData = {
    resourceType: "MedicationRequest",
    id: medicationResourceId || undefined,
    status: "active",
    intent: "order",
    medicationCodeableConcept: { text: selectedDrugName },
    subject: {
      reference: `Patient/${props.patient_resource_id}`,
      display: props.patient_name,
    },
    requester: { reference: "Practitioner/12345" },
   reasonCode: selectedDrugUse
  ? [{ text: selectedDrugUse }]
  : undefined,
note: additionalNote && additionalNote.trim() !== ""
  ? [{ text: additionalNote.trim() }]
  : undefined,


    dosageInstruction: [
      {
        text: `${dose} ${unit} every ${frequency}`,
        route: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
              code: route.toLowerCase(),
              display: route,
            },
          ],
        },
        timing: {
          repeat: {
            frequency: dosesPerDay,
            period: 1,
            periodUnit: "d",
            boundsPeriod: {
              start: startDate,
              end: endDate,
            },
          },
        },
        doseAndRate: [
          {
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/dose-rate-type",
                  code: "ordered",
                  display: "Ordered",
                },
              ],
            },
            doseQuantity: {
              value: Number(dose),
              unit: unit,
              system: "http://unitsofmeasure.org",
              code: unit,
            },
            rateQuantity:
              route.toUpperCase() === "IV"
                ? {
                    value: Number(deliveryRate),
                    unit: "mL/hr",
                    system: "http://unitsofmeasure.org",
                    code: "mL/h",
                  }
                : undefined,
          },
        ],
      },
    ],

    dispenseRequest: {
      validityPeriod: { start: startDate, end: endDate },
      expectedSupplyDuration: {
        value: totalDays,
        unit: "days",
        system: "http://unitsofmeasure.org",
        code: "d",
      },
    },

    extension: [
  {
    url: "http://example.org/fhir/StructureDefinition/totalDoses",
    valueInteger: totalDoses,
  },
  {
    url: "http://example.org/fhir/StructureDefinition/administeredCount",
    valueInteger: 0,
  },
  {
    url: "http://example.org/fhir/StructureDefinition/frequencyLabel",
    valueString: frequency,
  },
  intervalHours
    ? {
        url: "http://example.org/fhir/StructureDefinition/intervalHours",
        valueDecimal: Number(intervalHours),
      }
    : null,
  gestationalAge
    ? {
        url: "http://example.org/fhir/StructureDefinition/gestationalAge",
        valueString: gestationalAge,
      }
    : null,
  weight
    ? {
        url: "http://example.org/fhir/StructureDefinition/weight",
        valueQuantity: {
          value: Number(weight),
          unit: "kg",
          system: "http://unitsofmeasure.org",
          code: "kg",
        },
      }
    : null,
  birthDate
    ? {
        url: "http://example.org/fhir/StructureDefinition/birthDate",
        valueDate: birthDate,
      }
    : null,
  doseAmount
    ? {
        url: "http://example.org/fhir/StructureDefinition/doseAmount",
        valueQuantity: {
          value: Number(doseAmount),
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg",
        },
      }
    : null,
  doseVolume
    ? {
        url: "http://example.org/fhir/StructureDefinition/doseVolume",
        valueQuantity: {
          value: Number(doseVolume),
          unit: "mL",
          system: "http://unitsofmeasure.org",
          code: "mL",
        },
      }
    : null,
  // ✅ FIX: Only include if route = IV and deliveryRate > 0
  route?.toUpperCase() === "IV" && deliveryRate
    ? {
        url: "http://example.org/fhir/StructureDefinition/deliveryRate",
        valueQuantity: {
          value: Number(deliveryRate),
          unit: "mL/hr",
          system: "http://unitsofmeasure.org",
          code: "mL/h",
        },
      }
    : null,
  admin
    ? {
        url: "http://example.org/fhir/StructureDefinition/admin",
        valueString: admin.trim(),
      }
    : null,
  conc
    ? {
        url: "http://example.org/fhir/StructureDefinition/concentration",
        valueString: String(conc).trim(),
      }
    : null,
  doseperday
    ? {
        url: "http://example.org/fhir/StructureDefinition/dosePerDay",
        valueString: doseperday.trim(),
      }
    : null,
  selectedDrugCategory
    ? {
        url: "http://example.org/fhir/StructureDefinition/drugCategory",
        valueString: selectedDrugCategory.trim(),
      }
    : null,
].filter(Boolean),
// remove any undefined extensions
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(prescriptionData),
        
      }
    );
console.log(prescriptionData)
    if (response.ok) {
      const contentType = response.headers.get("Content-Type");
      let responseData = null;

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      }

      setMedicationResourceId(responseData?.id || null);
      console.log("✅ Prescription saved successfully:", responseData);
      setSnackbarMessage("Prescription saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchPrescription();
    } else {
      const errorBody = await response.text();
      console.error("❌ Error response:", response.status, response.statusText, errorBody);
      throw new Error(`Request failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("💥 Error saving Prescription resource:", error);
    setSnackbarMessage("An error occurred while saving the Prescription.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  } finally {
    setLoading(false);
  }
};

const calculateDuration = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to calculate next dose date
// const calculateNextDoseDate = (
//   startDate: string,
//   frequency: number,
//   administeredCount: number
// ): Date | null => {
//   if (!startDate || frequency <= 0) return null;
  
//   const start = new Date(startDate);
//   const hoursBetweenDoses = 24 / frequency;
//   const hoursToAdd = hoursBetweenDoses * administeredCount;
  
//   const nextDate = new Date(start);
//   nextDate.setHours(nextDate.getHours() + hoursToAdd);
  
//   return nextDate;
// };
  // const handlePrescribe = async () => {
  //   setLoading(true);
  
  //   const period = frequency === 'Q12H' ? 12 : frequency === 'Q8H' ? 8 : frequency === 'Q6H' ? 6 : 12;
  
  //   // Existing logic to calculate total doses...
  //   const prescriptionData = {
  //     resourceType: "MedicationRequest",
  //     id: medicationResourceId || undefined,
  //     status: "active",
  //     intent: "order",
  //     medicationCodeableConcept: {
  //       text: selectedDrugName,
  //     },
  //     subject: {
  //       reference: `Patient/${props.patient_resource_id}`,
  //       display: props.patient_name,
  //     },
  //     requester: {
  //       reference: "Practitioner/12345", // Replace with actual Practitioner ID
  //     },
  //     dosageInstruction: [
  //       {
  //         text: `${dose} mg ${route} every ${frequency}`,
  //         doseAndRate: [
  //           {
  //             doseQuantity: {
  //               value: Number(dose),
  //               unit: "mg",
  //             },
  //           },
  //         ],
  //         timing: {
  //           repeat: {
  //             frequency: period,  
  //             period: 1,
  //             periodUnit: "d",
  //           },
  //         },
  //         route: {
  //           coding: [
  //             {
  //               system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
  //               code: route.toLowerCase(),
  //               display: route,
  //             },
  //           ],
  //         },
  //       },
  //     ],
  //     reasonCode: [
  //       {
  //         text: selectedDrugUse,
  //       },
  //     ],
  //     note: [
  //       {
  //         text: additionalNote,
  //       },
  //     ],
  //     dispenseRequest: {
  //       validityPeriod: {
  //         start: startDate,
  //         end: endDate,
  //       },
  //       expectedSupplyDuration: {
  //         value: totalDays,
  //         unit: "days",
  //         system: "http://unitsofmeasure.org",
  //         code: "d",
          
  //       },
  //     },
  //     // Custom extension to store total doses and administered count
  //     extension: [
  //       {
  //         url: "http://example.org/fhir/StructureDefinition/totalDoses",
  //         valueInteger: totalDoses,
  //       },
  //       {
  //         url: "http://example.org/fhir/StructureDefinition/administeredCount",
  //         valueInteger: 0,
  //       },
  //     ],
  //   };
  
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //       body: JSON.stringify(prescriptionData),
  //     });
  
  //     if (response.ok) {
  //       const responseData = await response.json();
  //       setMedicationResourceId(responseData?.id || null);
  //       console.log("Prescription saved successfully:", responseData);
  
  //       // Add the newly prescribed medication directly to the UI
      
  
  //       setSnackbarMessage("Prescription saved successfully!");
  //       setSnackbarSeverity("success");
  //       setSnackbarOpen(true);
  //     } else {
  //       const errorBody = await response.text();
  //       console.error("Error response body:", errorBody);
  //       throw new Error(`Request failed: ${response.statusText}`);
  //     }
  //   } catch (error) {
  //     console.error("Error saving Prescription resource:", error);
  //     setSnackbarMessage("An error occurred while saving the Prescription.");
  //     setSnackbarSeverity("error");
  //     setSnackbarOpen(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  
  // const handleAdminister = async (medicationResourceId: string) => {
  //   console.log("medicationId:", medicationResourceId);  // Log the value of medicationId
  //   setAdministering(true);
    
  //   setCurrentMedicationId(medicationResourceId);
  
  //   try {
  //     // Fetch MedicationRequest to get current count and total doses
  //     const medicationRequestResponse = await fetch(
  //       `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         },
  //       }
  //     );
  
  //     if (!medicationRequestResponse.ok) {
  //       console.error("Failed to fetch MedicationRequest resource.");
  //       setSnackbarMessage("Failed to fetch MedicationRequest.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     const medicationRequest = await medicationRequestResponse.json();
  //     const extensions = medicationRequest.extension || [];
  //     const totalDoses = extensions.find(
  //       (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/totalDoses"
  //     )?.valueInteger;
  //     const administeredCount = extensions.find(
  //       (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/administeredCount"
  //     )?.valueInteger;
  
  //     if (administeredCount === undefined || totalDoses === undefined) {
  //       console.error("MedicationRequest does not have totalDoses or administeredCount.");
  //       setSnackbarMessage("Invalid MedicationRequest: Missing dose tracking information.");
  //       setSnackbarSeverity("error");
  //       return;
  //     }
  
  //     // Update administered count
  //     const updatedAdministeredCount = administeredCount + 1;
  //     const status = updatedAdministeredCount >= totalDoses ? "completed" : "active";
  
  //     const updatedRequest = {
  //       ...medicationRequest,
  //       extension: [
  //         {
  //           url: "http://example.org/fhir/StructureDefinition/totalDoses",
  //           valueInteger: totalDoses,
  //         },
  //         {
  //           url: "http://example.org/fhir/StructureDefinition/administeredCount",
  //           valueInteger: updatedAdministeredCount,
  //         },
  //       ],
  //       status,
  //     };
  
  //     // Update MedicationRequest on FHIR server
  //     const updateResponse = await fetch(
  //       `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         },
  //         body: JSON.stringify(updatedRequest),
  //       }
  //     );
  
  //     if (updateResponse.ok) {
  //       console.log(`Medication administered successfully: ${updatedAdministeredCount}/${totalDoses}`);
  //       setSnackbarMessage(`Medication administered: ${updatedAdministeredCount}/${totalDoses}`);
  //       setSnackbarSeverity("success");
  
  //       // Update local state for real-time reflection
  //       setPrescriptionHistory((prevHistory) =>
  //         prevHistory.map((medication) =>
  //           medication.id === medicationResourceId
  //             ? {
  //                 ...medication,
  //                 administeredCount: updatedAdministeredCount,
  //                 status: updatedAdministeredCount >= totalDoses ? "completed" : "active",
  //               }
  //             : medication
  //         )
  //       );
  //     } else {
  //       console.error("Failed to update MedicationRequest:", await updateResponse.text());
  //       setSnackbarMessage("Failed to update MedicationRequest.");
  //       setSnackbarSeverity("error");
  //     }
  //   } catch (error) {
  //     console.error("Error administering medication:", error);
  //     setSnackbarMessage("An error occurred while administering the medication.");
  //     setSnackbarSeverity("error");
  //   } finally {
  //     setAdministering(false);
  //     setCurrentMedicationId(null);
  //     setSnackbarOpen(true);
  //   }
  // };
const handleAdminister = async (medicationResourceId: string) => {
  console.log("MedicationResourceId:", medicationResourceId);
  setAdministering(true);
  setCurrentMedicationId(medicationResourceId);
  console.log("currentMedicationId:", currentMedicationId);

  try {
    // 1️⃣ Fetch MedicationRequest
    const medicationRequestResponse = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      }
    );

    if (!medicationRequestResponse.ok) {
      console.error("Failed to fetch MedicationRequest resource.");
      setSnackbarMessage("Failed to fetch MedicationRequest.");
      setSnackbarSeverity("error");
      return;
    }

    const medicationRequest = await medicationRequestResponse.json();

    // 2️⃣ Extract extensions for dose tracking
    const extensions = medicationRequest.extension || [];
    const totalDoses = extensions.find(
      (ext: any) =>
        ext.url ===
        "http://example.org/fhir/StructureDefinition/totalDoses"
    )?.valueInteger;
    const administeredCount = extensions.find(
      (ext: any) =>
        ext.url ===
        "http://example.org/fhir/StructureDefinition/administeredCount"
    )?.valueInteger;

    if (administeredCount === undefined || totalDoses === undefined) {
      console.error("Missing dose tracking information in MedicationRequest.");
      setSnackbarMessage(
        "Invalid MedicationRequest: Missing dose tracking information."
      );
      setSnackbarSeverity("error");
      return;
    }

    // 3️⃣ Compute next dose time (using frequency / interval if available)
    let nextDoseTime = null;

    // Try to find dosageInstruction timing
    const dosageInstruction = medicationRequest.dosageInstruction?.[0];
    if (dosageInstruction?.timing?.repeat?.period && dosageInstruction?.timing?.repeat?.periodUnit) {
      const { period, periodUnit } = dosageInstruction.timing.repeat;
      const now = new Date();

      // Convert periodUnit into milliseconds
      const unitMap: Record<string, number> = {
        s: 1000,
        min: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      };
      const intervalMs = (unitMap[periodUnit] || 0) * period;

      if (intervalMs > 0) {
        nextDoseTime = new Date(now.getTime() + intervalMs).toISOString();
      }
    }

    // 4️⃣ Search for existing MedicationAdministration
    const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration?request=MedicationRequest/${medicationResourceId}`;
    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("fhiruser:change-password"),
      },
    });

    if (!searchResponse.ok) {
      console.error("Failed to search for existing MedicationAdministration.");
      setSnackbarMessage("Error checking existing administration.");
      setSnackbarSeverity("error");
      return;
    }

    const searchData = await searchResponse.json();
    const existingAdmin = searchData?.entry?.[0]?.resource;

    if (existingAdmin && existingAdmin.status === "in-progress") {
      console.warn("MedicationAdministration is already in progress.");
      setSnackbarMessage("This medication is already being administered.");
      setSnackbarSeverity("error");
      return;
    }

    // 5️⃣ Update administered count and status (FHIR-valid)
    const updatedAdministeredCount = administeredCount + 1;
    const status =
      updatedAdministeredCount >= totalDoses ? "completed" : "active";

    // 🧩 Extended status info (your app-level detail)
    const statusDetail =
      updatedAdministeredCount >= totalDoses ? "completed" : "ongoing";

    // 6️⃣ Update MedicationRequest with all extensions (including next dose)
    const updatedRequest = {
      ...medicationRequest,
      extension: [
        {
          url: "http://example.org/fhir/StructureDefinition/totalDoses",
          valueInteger: totalDoses,
        },
        {
          url: "http://example.org/fhir/StructureDefinition/administeredCount",
          valueInteger: updatedAdministeredCount,
        },
        {
          url: "http://example.org/fhir/StructureDefinition/medicationStatusDetail",
          valueString: statusDetail,
        },
        ...(nextDoseTime
          ? [
              {
                url: "http://example.org/fhir/StructureDefinition/nextDoseTime",
                valueDateTime: nextDoseTime,
              },
            ]
          : []),
      ],
      status,
    };

    const updateResponse = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest/${medicationResourceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(updatedRequest),
      }
    );

    if (!updateResponse.ok) {
      console.error(
        "Failed to update MedicationRequest:",
        await updateResponse.text()
      );
      setSnackbarMessage("Failed to update MedicationRequest.");
      setSnackbarSeverity("error");
      return;
    }

    // 7️⃣ Record MedicationAdministration
    
    const dosageData = {
      text: `${selectedMedication.concentration} ${unit} every ${selectedMedication.frequency}`,
      route: {
        text: selectedMedication.route,
      },
      rateRatio: {
        numerator: { value: 1 },
        denominator: { value: 1 }
      }
    };
    

    const administerData = {
      resourceType: "MedicationAdministration",
      status: "completed",
    
      medicationReference: medicationRequest.medicationReference
        ? { reference: medicationRequest.medicationReference.reference }
        : undefined,
    
      medicationCodeableConcept:
        medicationRequest.medicationCodeableConcept || undefined,
    
      request: {
        reference: `MedicationRequest/${medicationResourceId}`,
      },
    
      subject: {
        reference: `Patient/${props.patient_resource_id}`,
      },
    
      performer: [
        {
          actor: {
            reference: "Practitioner/12345",
            display: `${props.UserRole}`,
          },
        },
      ],
    
      effectiveDateTime: new Date().toISOString(),
    
      dosage: dosageData // ✔️ minimal accepted
    };
    


    let response;
    if (existingAdmin) {
      const adminId = existingAdmin.id;
      response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration/${adminId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
          body: JSON.stringify({ ...existingAdmin, ...administerData }),
        }
      );
    } else {
      response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
          body: JSON.stringify(administerData),
        }
      );
    }

    if (response.ok) {
      console.log(
        `✅ Medication administered successfully: ${updatedAdministeredCount}/${totalDoses}`
      );
      if (nextDoseTime) {
        console.log(`🕒 Next dose scheduled at: ${nextDoseTime}`);
      }
      setSnackbarMessage(
        `Medication administered: ${updatedAdministeredCount}/${totalDoses}`
      );
      setSnackbarSeverity("success");
      fetchPrescription();
      fetchAdminister();
    } else {
      console.error("Failed to administer medication:", await response.text());
      setSnackbarMessage("Failed to administer medication.");
      setSnackbarSeverity("error");
    }
  } catch (error) {
    console.error("Error administering medication:", error);
    setSnackbarMessage(
      "An error occurred while administering the medication."
    );
    setSnackbarSeverity("error");
  } finally {
    setAdministering(false);
    setCurrentMedicationId(null);
    setSnackbarOpen(true);
  }
};


  useEffect(() => {
    fetchPrescription();
    setStatusFilter("ongoing");
    fetchAdminister(); //Fetch Procedure on component mount or when `patient_resource_id` changes
  }, [props.patient_resource_id]);
  
  
  return (
    
    <Box sx={{  borderRadius: "25px"}}>
    
    {/* {props.UserRole !== "NICU Nurse" && ( */}
    <ProtectedModule module="Medications" action="create">
     {/* 🔹 Prescribe button aligned top-right */}
    <Dialog
  open={openPrescribeModal}
  onClose={() => setOpenPrescribeModal(false)}
  maxWidth="md"
  fullWidth
  hideBackdrop
  PaperProps={{
    sx: {
      boxShadow: 6,
      borderRadius: 7,
      backgroundColor: "#FFFFFF",
    },
  }}
  sx={{
    "& .MuiDialog-container": {
        backdropFilter: "blur(6px)",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
  }}
>
 <DialogTitle
  sx={{
    color: "#0F3B61",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  New Prescription
  <IconButton
    onClick={() => setOpenPrescribeModal(false)}
    sx={{
      color: "#0F3B61",
      "&:hover": { backgroundColor: "#F2F2F2" },
    }}
  >
    <CloseIcon />
  </IconButton>
</DialogTitle>

 

  <DialogContent dividers sx={{ padding: 2, maxHeight: "80vh", overflowY: "auto" }}>
    {/* <DrugCalculator /> */}
      <Box sx={{ padding: 3, borderRadius: 5, backgroundColor: "#FFFFFF" }}>
          <Typography variant="h6" sx={{ color: "#0F3B61", marginBottom: 3 }}></Typography>

          {/* Drug Name with Autocomplete */}
          <Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    alignItems: "flex-start",
    marginBottom: 3,
  }}
>
  {/* 🔹 Drug Name */}
  <Box sx={{ flex: 2, minWidth: 250 }}>
    <Typography
      variant="subtitle2"
      sx={{ color: "#0F3B61", marginBottom: 1 }}
    >
      Drug Name*
    </Typography>
    <Autocomplete
  freeSolo
  options={drugOptions}
  value={selectedDrug}
 onChange={(_event, newValue) => {
  if (!newValue) {
    setSelectedDrug(null);
    setSelectedDrugName("");
    setSelectedDrugCategory("");
    setSelectedDrugUse("");
    setIndication([]);
    setAvailableRoutes([]);
    setRoute("");
    setDose("");
    setAdmin("");
    setConc("");
    return;
  }

  if (typeof newValue === "string") {
    setSelectedDrug(null);
    setSelectedDrugName(newValue);
    setSelectedDrugCategory("");
    setSelectedDrugUse("");
    setIndication([]);
    setAvailableRoutes([]);
    setRoute("");
    setDose("");
    setAdmin("");
    setConc("");
    return;
  }

  // ✅ Normal selection
  setSelectedDrug(newValue);
  setSelectedDrugName(newValue.name || "");
  setSelectedDrugCategory(newValue.category || "");
  setSelectedDrugUse("");

  const drugDetails = newValue.original;

  // ✅ Filter by patient GA, weight, etc.
  const filtered = filterRegimensForPatient(
    drugDetails.regimens,
    gestationalAge,
    weight,
    Number(pnaDays)||0,
    Number(pmaWeeks)||0
  );

  // ✅ Group by raw_text so each drug use appears once
  const uniqueIndications = [...new Set(filtered.map((r: any) => r.raw_text))];
  setIndication(uniqueIndications);

  // ✅ Build a lookup of { raw_text: [routes...] } for later use
  const routeMap: Record<string, string[]> = {};
  filtered.forEach((r: any) => {
    if (!routeMap[r.raw_text]) routeMap[r.raw_text] = [];
    if (!routeMap[r.raw_text].includes(r.routes))
      routeMap[r.raw_text].push(r.routes);
  });

  

  // ✅ Reset downstream fields
  setAvailableRoutes([]);
  setRoute("");
  setDose("");
  setAdmin("");
  setConc("");
  setIntervalHours("");
  setDoseperday("");
}}

  onInputChange={(_event, newInputValue, reason) => {
    if (reason === "input") {
      // user typing
      fetchDrugs(newInputValue);
    } else if (reason === "clear") {
      // cleared
      fetchDrugs("");
    }
  }}
  onOpen={() => {
    // ✅ Show full list when clicked (no typing)
    fetchDrugs("");
  }}
  getOptionLabel={(option) =>
    typeof option === "string" ? option : option.name || ""
  }
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Search Drug name"
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#DBE2F2",
          },
        },
        "& .MuiInputBase-root": {
          color: "#0F3B61",
        },
      }}
    />
  )}
  ListboxProps={{
    style: {
      maxHeight: "250px", // ✅ Scrollable list
      overflowY: "auto",
      backgroundColor: "#000000ff", // ✅ Matches your theme background
    },
  }}
/>

  </Box>

  <Box sx={{ flex: 1, minWidth: 160 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    GA (Weeks + Days)
  </Typography>

  <Box sx={{ display: "flex", gap: 1 }}>
    {/* Weeks Input */}
    <TextField
      type="number"
      label="Weeks"
      placeholder="e.g. 33"
      fullWidth
      value={gaWeeks}
      // GA Weeks Input
onChange={(e) => {
  const val = e.target.value;

  if (val === "") {
    setGaWeeks("");
    setGestationalAge(""); // reset GA
    return;
  }

  const num = parseInt(val);
  if (isNaN(num) || num < 0) {
    alert("⚠️ Weeks must be a positive number.");
    setGaWeeks("");
    return;
  }
  if (num > 45) {
    alert("⚠️ GA weeks cannot exceed 45.");
    setGaWeeks("45");
    return;
  }

  setGaWeeks(val);

  // Update gestationalAge in "weeks.days" format
  const days = gaDays === "" ? 0 : parseInt(gaDays);
  setGestationalAge(`${num}.${days}`);
}}

      InputProps={{ inputProps: { min: 0, max: 45 } }}
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "#DBE2F2" },
        },
        "& .MuiInputBase-root": { color: "#0F3B61" },
      }}
    />

    {/* Days Input */}
    <TextField
      type="number"
      label="Days"
      placeholder="0–6"
      fullWidth
      value={gaDays}
      // GA Days Input
onChange={(e) => {
  const val = e.target.value;

  if (val === "") {
    setGaDays("");
    setGestationalAge("");
    return;
  }

  const num = parseInt(val);
  if (isNaN(num) || num < 0) {
    alert("⚠️ Days must be positive.");
    setGaDays("");
    return;
  }
  if (num > 6) {
    alert("⚠️ Days cannot exceed 6.");
    setGaDays("6");
    return;
  }

  setGaDays(val);

  // Update gestationalAge in "weeks.days" format
  const weeks = gaWeeks === "" ? 0 : parseInt(gaWeeks);
  setGestationalAge(`${weeks}.${num}`);
}}

      InputProps={{ inputProps: { min: 0, max: 6 } }}
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "#DBE2F2" },
        },
        "& .MuiInputBase-root": { color: "#0F3B61" },
      }}
    />
  </Box>
</Box>


{/* 🔹 Weight (kg) */}
<Box sx={{ flex: 1, minWidth: 130 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    Weight (kg)
  </Typography>

  <TextField
    type="text" // ✅ use text for better validation control
    placeholder="e.g. 2.8"
    fullWidth
    value={weight}
    onChange={(e) => {
      const input = e.target.value.trim();

      // ✅ Allow clearing
      if (input === "") {
        setWeight("");
        return;
      }

      // ✅ Allow only numeric with optional single decimal
      const regex = /^\d*\.?\d*$/;
      if (!regex.test(input)) return; // ignore invalid characters

      const value = parseFloat(input);

      // ✅ Range validation
      if (!isNaN(value)) {
        if (value < 0)return; // ignore negative
        if (value > 5) {
          setWeight("5");
          alert("Weight cannot exceed 5 kg");
          return;
        }
      }

      setWeight(input); // ✅ safe — remains string
    }}
    inputProps={{
      inputMode: "decimal", // ✅ shows numeric keyboard on mobile
      pattern: "[0-9]*[.,]?[0-9]*",
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#DBE2F2" },
      },
      "& .MuiInputBase-root": { color: "#0F3B61" },
    }}
  />
</Box>



  {/* 🔹 Birth Date */}
  <Box sx={{ flex: 1, minWidth: 200 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    Birth Date
  </Typography>
  <TextField
    type="date"
    fullWidth
    value={birthDate}
    onChange={(e) => setBirthDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    inputProps={{
      max: new Date().toISOString().split("T")[0], // ✅ restrict future dates
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#DBE2F2",
        },
      },
      "& .MuiInputBase-root": {
        color: "#0F3B61",
      },
    }}
  />
</Box>
{/* 🔹 PMA and PNA (Editable) */}
<Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    alignItems: "flex-start",
    marginBottom: 3,
  }}
>
  {/* PMA (Weeks) */}
<Box sx={{ flex: 1, minWidth: 190 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    PMA (Weeks)
  </Typography>

 <TextField
  type="number"
  label="PMA Weeks"
  fullWidth
  value={pmaWeeks}
  onChange={(e) => {
    const val = e.target.value;
    if (val === "") { setPmaWeeks(""); return; }
    const num = parseInt(val);
    if (num < 20 || num > 60) return;
    setPmaWeeks(val);
  }} inputProps={{
      inputMode: "numeric", // ✅ mobile-friendly
      pattern: "[0-9]*",
      min: 0,
      max: 90,
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#DBE2F2" },
      },
      "& .MuiInputBase-root": { color: "#0F3B61" },
    }}
/>



</Box>
<Box sx={{ flex: 1, minWidth: 150 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    PMA days
  </Typography>



<TextField
  type="number"
  label="PMA Days"
  value={pmaDays}
  fullWidth
  onChange={(e) => {
    const val = e.target.value;
    if (val === "") { setPmaDays(""); return; }
    const num = parseInt(val);
    if (num < 0 || num > 6) return;
    setPmaDays(val);
  }} inputProps={{
      inputMode: "numeric", // ✅ mobile-friendly
      pattern: "[0-9]*",
      min: 0,
      max: 90,
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#DBE2F2" },
      },
      "& .MuiInputBase-root": { color: "#0F3B61" },
    }}
/>

</Box>



  {/* PNA (Days) */}
 <Box sx={{ flex: 1, minWidth: 150 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#0F3B61", marginBottom: 1 }}
  >
    PNA (Days)
  </Typography>

  <TextField
    type="text" // ✅ text for safe numeric control
    placeholder="e.g. 10"
    fullWidth
    value={pnaDays}
    onChange={(e) => {
      const input = e.target.value.trim();

      // ✅ Allow clearing
      if (input === "") {
        setPnaDays("");
        return;
      }

      // ✅ Allow only integers (no decimals)
      const regex = /^\d*$/;
      if (!regex.test(input)) return;

      const num = parseInt(input, 10);
      if (!isNaN(num)) {
        if (num < 0) return;
        if (num > 90) {
          setPnaDays("90");
          alert("PNA days cannot exceed 90");
          return;
        }
      }

      setPnaDays(input);
    }}
    inputProps={{
      inputMode: "numeric", // ✅ mobile-friendly
      pattern: "[0-9]*",
      min: 0,
      max: 90,
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#DBE2F2" },
      },
      "& .MuiInputBase-root": { color: "#0F3B61" },
    }}
  />
</Box>


</Box>

</Box>
{/* Drug Use + Route (side-by-side) */}
<Box
  sx={{
    display: "flex",
    flexWrap: "wrap", // ✅ wraps vertically on mobile
    gap: 2,
    marginBottom: 3,
  }}
>
  {/* Drug Use */}
  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 65%" } }}>
    <Typography
      variant="subtitle2"
      sx={{ color: "#0F3B61", marginBottom: 1 }}
    >
      Drug Use*
    </Typography>

    <Autocomplete
      freeSolo
      options={indication} // ✅ your existing list of indications
      value={selectedDrugUse}
      onChange={(_event, newValue) => {
  if (!newValue) {
    // 🔹 Clear when deselected
    setSelectedDrugUse("");
    setAvailableRoutes([]);
    setRoute("");
    setDose("");
    setDoseperday("");
    setAdmin("");
    setConc("");
    setIntervalHours("");
    setFrequency("");
    return;
  }

  // 🔹 Update selected indication (string only)
  const selectedUse = typeof newValue === "string" ? newValue : newValue;
  setSelectedDrugUse(selectedUse);

  if (!selectedDrug) return;

  // ✅ Find all regimens for this indication
  const drugDetails = selectedDrug.original;
  const matchedRegimens = drugDetails.regimens.filter(
    (r: any) => r.raw_text === selectedUse
  );

  // ✅ Extract all unique routes for this drug use
const uniqueRoutes: string[] = Array.from(
  new Set(
    matchedRegimens.map((r: any) => String(r.routes))
  )
).map((r) => r as string);

setAvailableRoutes(uniqueRoutes);

// Auto-select first route
if (uniqueRoutes.length > 0) {
  const firstRoute: string = uniqueRoutes[0];
  setRoute(firstRoute);

  // Find regimen for this route
  const regimen = matchedRegimens.find(
    (r: any) => r.routes?.toUpperCase() === firstRoute.toUpperCase()
  );

  if (regimen) {
    setDose(regimen.dose_value?.toString() || "");
    setDoseperday(regimen.dose_per_day?.toString() || "N/A");
    setConc(regimen.conc_value?.toString() || "");
    setIntervalHours(regimen.frequency?.interval_hours?.toString() || "");

    if (firstRoute.toUpperCase() === "IV") {
      const adminVal = regimen.admin?.toString() || "";
      setAdmin(adminVal);
      setIvAdminBackup(adminVal);
      console.log("ivAdminBackup",ivAdminBackup);
      
    } else {
      setAdmin("N/A");
    }
      // ✅ Convert interval to Q-factor (Q6H etc.)
      const interval = regimen.frequency?.interval_hours;
      if (interval) {
        const qLabel = Q_FACTOR_MAP[interval] || `Q${interval}H`;
        setFrequency(qLabel);
      } else {
        setFrequency("");
      }
    }
  } else {
    // 🔹 No routes found
    setAvailableRoutes([]);
    setRoute("");
    setDose("");
    setAdmin("");
    setConc("");
    setDoseperday("N/A");
    setIntervalHours("");
    setFrequency("");
  }
}}

      onInputChange={(_event) => {
        setIndication(indication);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select the Drug Use"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#DBE2F2" },
            },
            "& .MuiInputBase-root": {
              color: "#0F3B61",
            },
          }}
        />
      )}
    />
  </Box>

  {/* Route */}
  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 30%" } }}>
    <Typography
      variant="subtitle2"
      sx={{ color: "#0F3B61", marginBottom: 1 }}
    >
      Route*
    </Typography>
{/* Route */}
<Select
  label="Route"
  displayEmpty
  value={route || ""}
  onChange={(e) => {
    const newRoute = e.target.value;
    setRoute(newRoute);

    // ✅ Recalculate related values for this route
    const regimen = selectedDrug?.original?.regimens?.find(
      (r: any) =>
        r.raw_text === selectedDrugUse &&
        r.routes?.toUpperCase() === newRoute?.toUpperCase()
    );

    if (regimen) {
      // update all dependent values
      setDose(regimen.dose_value?.toString() || "");
      setDoseperday(regimen.dose_per_day?.toString() || "N/A");
      setConc(regimen.conc_value || "");
      const interval = regimen.frequency?.interval_hours;
      setIntervalHours(interval?.toString() || "");

      if (newRoute.toUpperCase() === "IV") {
        const adminVal = regimen.admin?.toString() || "";
        setAdmin(adminVal);
        setIvAdminBackup(adminVal);
      } else {
        setAdmin("N/A");
      }
    } else {
      setAdmin("N/A");
      setConc("");
      setIntervalHours("");
      setDose("");
    }

    // delivery rate toggle
    if (newRoute.toUpperCase() !== "IV") setDeliveryRate("");
  }}
  fullWidth
  MenuProps={{
    MenuListProps: { disablePadding: true },
    sx: { "&& .Mui-selected": { backgroundColor: "#124D81", color: "#FFFFFF" } },
  }}
  sx={{
    flex: { xs: "1 1 100%", sm: "1 1 150px" },
    "& .MuiSelect-icon": { color: "#0F3B61", backgroundColor: "#F2FBFF" },
    color: "#0F3B61",
    border: "1px solid #DBE2F2",
  }}
>
  {/* Show placeholder when no route selected */}
  <MenuItem disabled value="">
    Route
  </MenuItem>

  {/* ✅ Dynamically list only available routes for selected drug use */}
  {availableRoutes.map((r) => (
    <MenuItem key={r} value={r}>
      {r}
    </MenuItem>
  ))}
</Select>

  </Box>
</Box>


          
                {/* 💊 Dosage Table (Responsive for Desktop & Mobile) */}
{!calcNotes && (
<Box sx={{ marginBottom: 3 }}>
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 2,
      rowGap: 2,
      // ✅ When screen is small (mobile), make items stack vertically
      flexDirection: { xs: "column", sm: "row" },
    }}
  >
    {/* Dosage */}
    <TextField
      label="Dosage"
      value={dose}
      onChange={(e) => setDose(e.target.value)}
      type="number"
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 150px" }, // full width on mobile
        "& .MuiOutlinedInput-root fieldset": { borderColor: "#DBE2F2" },
        "& .MuiInputBase-root": { color: "#0F3B61" },
        "& .MuiInputLabel-root": { color: "#9BA1AE" },
      }}
    />

    {/* Unit */}
    <Select
      value={unit}
      onChange={(e) => setUnit(e.target.value)}
      MenuProps={{
        MenuListProps: { disablePadding: true },
        sx: { "&& .Mui-selected": { backgroundColor: "#124D81", color: "#FFFFFF" } },
      }}
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 150px" },
        "& .MuiSelect-icon": { color: "#0F3B61", backgroundColor: "#F2FBFF" },
        color: "#0F3B61",
        border: "1px solid #DBE2F2",
      }}
    >
      <MenuItem value="mg/kg">mg/kg</MenuItem>
      <MenuItem value="mg">mg</MenuItem>
      <MenuItem value="mcg">mcg</MenuItem>
      <MenuItem value="mL">mL</MenuItem>
    </Select>

{/* Frequency */}
<Select
  displayEmpty
  value={intervalHours ? String(intervalHours) : ""}
  onChange={(e) => setIntervalHours(String(e.target.value))}
  fullWidth
  MenuProps={{
    MenuListProps: { disablePadding: true },
    sx: {
      "&& .Mui-selected": {
        backgroundColor: "#124D81",
        color: "#FFFFFF",
      },
    },
  }}
  sx={{
    flex: { xs: "1 1 100%", sm: "1 1 150px" },
    border: "1px solid #DBE2F2",
    "& .MuiSelect-icon": { color: "#0F3B61", backgroundColor: "#F2FBFF" },
    "& .MuiSelect-select": {
      color: "#0F3B61 !important",
    },
    "& .MuiSelect-select:empty": {
      color: "#000000 !important",
      opacity: 1,
    },
    "& em": {
      color: "#000000 !important",
      fontStyle: "normal",
    },
  }}
>
  {/* Placeholder */}
  <MenuItem value="">
    <em>Select Freq</em>
  </MenuItem>

{/* ✅ Dynamic Q-factor when not in map */}
  {(() => {
    const key = intervalHours ? String(intervalHours) : "";
    // show Q36H etc. only when it's not one of the standard map keys
    return key && !Q_FACTOR_MAP.hasOwnProperty(key) ? (
      <MenuItem key={key} value={key}>
     
        {`Q${key}H`}
      </MenuItem>
    ) : null;
  })()}
  {/* ✅ Predefined Q-factors */}
  {Object.entries(Q_FACTOR_MAP).map(([key, label]) => (
    <MenuItem key={key} value={key}>
      {label}
    </MenuItem>
  ))}

  
</Select>


    {/* Admin */}
    <TextField
      label="Admin"
      placeholder="e.g., 30"
      value={admin}
      onChange={(e) => setAdmin(e.target.value)}
      disabled={admin === "N/A"}
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 150px" },
        "& .MuiOutlinedInput-root fieldset": { borderColor: "#DBE2F2" },
        "& .MuiInputBase-input": { color: "#0F3B61" },
        "& .MuiInputBase-input.Mui-disabled": {
          WebkitTextFillColor: "black",
          opacity: 1,
        },
        "& .MuiInputLabel-root": { color: "#9BA1AE" },
      }}
    />

    {/* Concentration */}
    <TextField
      label="Conc. (mL)"
      placeholder="e.g., 10"
      value={conc}
      onChange={(e) => setConc(e.target.value)}
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 150px" },
        "& .MuiOutlinedInput-root fieldset": { borderColor: "#DBE2F2" },
        "& .MuiInputBase-root": { color: "#0F3B61" },
        "& .MuiInputLabel-root": { color: "#9BA1AE" },
      }}
    />

    {/* Dose per day */}
    <TextField
      label="Dose / day"
      placeholder="e.g., 2"
      value={doseperday}
      onChange={(e) => setDoseperday(e.target.value)}
      sx={{
        flex: { xs: "1 1 100%", sm: "1 1 150px" },
        "& .MuiOutlinedInput-root fieldset": { borderColor: "#DBE2F2" },
        "& .MuiInputBase-root": { color: "#0F3B61" },
        "& .MuiInputLabel-root": { color: "#9BA1AE" },
      }}
    
    />

    
  </Box>
</Box>
)}
{/* Ordertype */}
<Select
  displayEmpty
  value={ordertype}
  onChange={(e) => setOrderType(String(e.target.value))}
  fullWidth
  MenuProps={{
    MenuListProps: { disablePadding: true },
    sx: {
      "&& .Mui-selected": {
        backgroundColor: "#124D81",
        color: "#FFFFFF",
      },
    },
  }}
  sx={{
    flex: { xs: "1 1 100%", sm: "1 1 150px" },
    border: "1px solid #DBE2F2",
    "& .MuiSelect-icon": { color: "#0F3B61", backgroundColor: "#F2FBFF" },
    "& .MuiSelect-select": {
      color: "#0F3B61 !important",
    },
    "& .MuiSelect-select:empty": {
      color: "#000000 !important",
      opacity: 1,
    },
    "& em": {
      color: "#000000 !important",
      fontStyle: "normal",
    },
  }}
>
  {/* Placeholder */}
  <MenuItem value="">
    <em>Select OrderType</em>
  </MenuItem>


  <MenuItem value="Routine/Reg">Routine/Reg</MenuItem>
      <MenuItem value="PRN/SOS">PRN/SOS</MenuItem>
      <MenuItem value="STAT">STAT</MenuItem>
      <MenuItem value="One-time">One-time</MenuItem>
      <MenuItem value="Titration">Titration</MenuItem>
      <MenuItem value="Others">Others</MenuItem>

  
</Select>
         
          <Box sx={{ marginTop: 4 }}>

      {/* 🔹 Calculated Values Section */}
<Box sx={{ marginTop: 3 }}>
  {calcNotes ? (
    // ✅ Show calc_notes text box if present
    <Box
      sx={{
        backgroundColor: "#F9FBFF",
        border: "1px solid #DBE2F2",
        borderRadius: 2,
        padding: 2,
        color: "#0F3B61",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, marginBottom: 1, color: "#0F3B61" }}
      >
        Calculation Notes
      </Typography>

      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {calcNotes}
      </Typography>
    </Box>
  ) : (
    // ✅ Show regular calculated values if no calc_notes
    <>
      <Typography
        variant="subtitle1"
        sx={{ color: "#0F3B61", marginBottom: 2, fontWeight: 600 }}
      >
        Calculated Values
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", marginTop: 2 }}>
        {/* 💊 Dose Amount */}
        <TextField
          label="Dose Amount (mg)"
          placeholder="Auto-calculated"
          value={doseAmount}
          onChange={(e) => setDoseAmount(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#DBE2F2" },
            },
            "& .MuiInputBase-root": { color: "#0F3B61" },
            "& .MuiInputLabel-root": { color: "#9BA1AE" },
          }}
        />

        {/* 💧 Dose Volume */}
        <TextField
          label="Dose Volume (mL)"
          placeholder="Auto-calculated"
          value={doseVolume}
          onChange={(e) => setDoseVolume(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#DBE2F2" },
            },
            "& .MuiInputBase-root": { color: "#0F3B61" },
            "& .MuiInputLabel-root": { color: "#9BA1AE" },
          }}
        />

        {/* 🚀 Delivery Rate */}
        <TextField
          label="Delivery Rate (mL/hr)"
          placeholder="Auto-calculated"
          value={route.toUpperCase() === "IV" ? deliveryRate : "N/A"}
          onChange={(e) => {
            if (route.toUpperCase() === "IV") setDeliveryRate(e.target.value);
          }}
          disabled={route.toUpperCase() !== "IV"}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#DBE2F2" },
            },
            "& .MuiInputBase-input": {
              color: "#0F3B61",
            },
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "black",
              opacity: 1,
            },
            "& .MuiInputLabel-root": {
              color: "#9BA1AE",
            },
          }}
        />
      </Box>
    </>
  )}
</Box>




          {/* Dates */}
         <Box sx={{ display: "flex", gap: 2, marginTop: 4 }}>

  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <FormControl fullWidth>
      <DateTimePicker
        label="Start Date"
        value={startDate}
        onChange={(newValue) => setStartDate(newValue)}
        format="dd/MM/yyyy hh:mm a"
        minDateTime={new Date()}
        slotProps={{
          textField: {
            variant: "outlined",
            fullWidth: true,
            size: "medium",
          },
        }}
        sx={{
          marginBottom: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#DBE2F2' },
          },
          '& .MuiInputBase-root': { color: '#0F3B61' },
          '& .MuiInputLabel-root': { color: '#9BA1AE' },
          // ✅ Fix: make calendar icon visible
          '& .MuiSvgIcon-root': {
            color: '#124D81', // Dark blue icon color
          },
        }}
      />
    </FormControl>
  </LocalizationProvider>

  <FormControl fullWidth>
    <Select
      value={days}
      onChange={(e) => setDays(e.target.value as number)}
      fullWidth
      MenuProps={{
        MenuListProps: { disablePadding: true },
        sx: {
          '&& .Mui-selected': {
            backgroundColor: '#124D81',
            color: '#FFFFFF',
          },
        },
      }}
      sx={{
        '& .MuiSelect-icon': {
          color: '#0F3B61',
          backgroundColor: '#F2FBFF',
        },
        color: '#0F3B61',
        border: '1px solid #DBE2F2',
      }}
    >
      {Array.from({ length: Math.max(days, 7) }, (_, i) => i + 1).map((day) => (
        <MenuItem key={day} value={day}>
          {day} Day
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <FormControl fullWidth>
      <DateTimePicker
        label="End Date"
        value={endDate}
        onChange={handleEndDateChange}
        format="dd/MM/yyyy hh:mm a"
        minDateTime={new Date()}
        slotProps={{
          textField: {
            variant: "outlined",
            fullWidth: true,
            size: "medium",
          },
        }}
        sx={{
          marginBottom: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#DBE2F2' },
          },
          '& .MuiInputBase-root': { color: '#0F3B61' },
          '& .MuiInputLabel-root': { color: '#9BA1AE' },
          // ✅ Fix: make calendar icon visible
          '& .MuiSvgIcon-root': {
            color: '#124D81', // Dark blue icon
          },
        }}
      />
    </FormControl>
  </LocalizationProvider>
</Box>


          {/* Additional Notes */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "#0F3B61", marginBottom: 1 }}>Additional Notes or Special instruction</Typography>
            <TextField
              placeholder="Enter any additional notes..."
              fullWidth
              multiline
              rows={3}
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#DBE2F2',
                  },
                },
                '& .MuiInputBase-root': {
                  color: '#0F3B61',
                },
              }} />
          </Box>

    
          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
            <Box
              sx={{
                padding: '1%',
                borderRadius: '7px',
                backgroundColor: '#5E84CC1A',
                // Adjust multiplier (10) as needed for desired width
              }}
            >
              <Typography variant="body2" sx={{ color: "#9BA1AE" }}>
                Prescribed by
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "#0F3B61",
                }}
              >
                {props.UserRole}
                <span style={{ color: "green", marginLeft: 4 }}></span>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 3, justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={resetForm} sx={{ borderColor: "#0F3B61", color: "#0F3B61", padding: "2px 7px",    // custom height & width
    minWidth: "80px",  }}  >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handlePrescribe();
                  resetForm();
                  
                } }
                sx={{
                  pointerEvents: isFormEmpty() ? 'none' : 'auto',
                  opacity: isFormEmpty() ? 0.5 : 1,
                  padding: "2px 12px",    // custom height & width
    minWidth: "80px",  
                }}
              >
                Prescribe
              </Button>
            </Box>
          </Box>
        </Box>
        </Box>
      
   
  </DialogContent>

  
    </Dialog>

        </ProtectedModule>
        {/* )} */}
    {/* nurse view */}
    <ProtectedModule module="Medications" action="edit"> 
  <Box >
  <Grid container alignItems="center" justifyContent="space-between" >
    <Typography variant="h6" sx={{ color: "#0F3B61" }} gutterBottom>
      Medications
    </Typography>
    <Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 2,
  }}
>
  <Button
  variant="contained"
  onClick={() => setOpenPrescribeModal(true)}
  sx={{
    backgroundColor: "rgba(34, 139, 230, 0.1)", // 10% opacity
    color: "#228BE6",
    paddingX: 3,
    textTransform: "none",
    fontWeight: 700,
    borderRadius: "8px",
    boxShadow: "none", // remove default contained shadow
    "&:hover": {
      backgroundColor: "rgba(34, 139, 230, 0.1)", // same as normal (no color change)
      boxShadow: "none", // prevent MUI hover shadow
    },
  }}
>
  + Prescribe
</Button>

</Box>
  </Grid>


  <Divider />
    {/* 🔹 Filter Bar */}
<Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
   
    mb: 0,
  }}
>
  {/* 🔹 Left: Status Filter Pills */}
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      
    }}
  >
    {[
      { label: "Active", value: "ongoing" },
      { label: "Completed", value: "completed" },
      { label: "All", value: "all" },
    ].map((option) => {
      const isSelected = statusFilter === option.value;
      return (
        <Box
          key={option.value}
          onClick={() => setStatusFilter(option.value as any)}
          sx={{
            cursor: "pointer",
            px: 3,
            py: 1,
             borderRadius: "8px",
            color: isSelected ? "#228BE6" : "#3C4048",
            backgroundColor: isSelected ? "#E8F1FB" : "transparent",
            fontWeight: isSelected ? 600 : 500,
            fontSize: "0.9rem",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: isSelected ? "#E8F1FB" : "#F0F4FA",
            },
          }}
        >
          {option.label}
        </Box>
      );
    })}
  </Box>

  {/* 🔹 Right: Sort By Dropdown */}
  <FormControl
    variant="outlined"
    size="small"
    sx={{
      minWidth: 120,
      
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
    }}
  >
    <Select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      displayEmpty
      sx={{
        borderRadius: "25px",
        px: 1.5,
        color: "#124D81",
        "& .MuiSelect-icon": { color: "#228BE6" },
      }}
    >
      <MenuItem value="" disabled>
        Sort by
      </MenuItem>
      <MenuItem value="Routine/Reg">Routine / Reg</MenuItem>
      <MenuItem value="PRN/SOS">PRN / SOS</MenuItem>
      <MenuItem value="STAT">STAT</MenuItem>
      <MenuItem value="One-time">One-time</MenuItem>
      <MenuItem value="Titration">Titration</MenuItem>
      <MenuItem value="Others">Others</MenuItem>
    </Select>
  </FormControl>
</Box>



<Box sx={{ mt: 2 }}>
  {/* ✅ Header Row */}
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1.5fr 1.2fr 1fr 1.5fr 0.4fr", // mobile
        sm: "1.3fr 1.1fr 1fr 1.4fr 0.4fr", // tablet
        md: "1.2fr 1fr 1fr 1.3fr 0.4fr",   // desktop
      },
      backgroundColor: "#F4F6FB",
      borderRadius: "10px 10px 0 0",
      padding: "10px 18px",
      color: "#8A94A6",
      fontWeight: 600,
      fontSize: "0.9rem",
    }}
  >
    <Typography>Drug & Type</Typography>
    <Typography>Dose & Route</Typography>
    <Typography>Frequency</Typography>
    <Typography>Status & Time</Typography>
    <Typography></Typography> {/* empty for action button */}
  </Box>

  {/* ✅ Medication Rows */}
  {finalMedications.length === 0 ? (
    <Typography sx={{ mt: 2, color: "#A7B3CD", textAlign: "center" }}>
      {statusFilter === "completed"
        ? "No completed prescriptions."
        : statusFilter === "all"
        ? "No prescriptions available."
        : "No active prescriptions."}
    </Typography>
  ) : (
    finalMedications.map((medication, index) => {

      const now = new Date();
      const start = new Date(medication.startDate);
      // const end = new Date(medication.endDate);
      const nextDose = getNextDoseTime(medication);

      // ✅ determine label + colors
      let label = "Ongoing";
      let bgColor = "#E7F3FF";
      let textColor = "#228BE6";

      const isCompleted = medication.administeredCount >= medication.totalDoses;
      const isBeforeStart = now < start;
   
      const isMissed = nextDose && now > nextDose && !isCompleted;

      if (isCompleted) {
        label = "Completed";
        bgColor = "#E6F4EA";
        textColor = "#2EB67D";
      } else if (isMissed) {
        label = "Missed";
        bgColor = "#FEECEC";
        textColor = "#E63946";
      } else if (isBeforeStart) {
        label = "Upcoming";
        bgColor = "#FFF9E6";
        textColor = "#E6A800";
      }

      return (
        <Box
          key={index}
          
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1.5fr 1.2fr 1fr 1.5fr 0.4fr",
              sm: "1.3fr 1.1fr 1fr 1.4fr 0.4fr",
              md: "1.2fr 1fr 1fr 1.3fr 0.4fr",
            },
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: "1px solid #E6EAF0",
  backgroundColor: "#FFFFFF", 
      transition: "background-color 0.4s ease",
            "&:hover": { backgroundColor: "#F9FBFF", cursor: "pointer" },
          }}
        >
          {/* 💊 Drug name & type */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <FontAwesomeIcon icon={faPrescription} style={{ color: "#228BE6" }} />
            <Box>
              <Typography sx={{ color: "#124D81", fontWeight: 600 }}>
                {medication.name}
              </Typography>
              <Typography
                sx={{ color: "#A7B3CD", fontSize: "0.75rem", fontWeight: 500 }}
              >
                {medication.orderType || "Regular"}
              </Typography>
            </Box>
          </Box>

          {/* 🧪 Dose & Route */}
          <Typography sx={{ color: "#495057" }}>
            {medication.frequency1}{" "}
            {medication.route && `(${medication.route})`}
          </Typography>

          {/* ⏱ Frequency */}
          <Typography sx={{ color: "#495057" }}>
            {calculateDuration(medication.startDate, medication.endDate)} days
          </Typography>

          {/* 🩵 Status + Next Dose Time */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Tooltip title={label} arrow>
              <Typography
                sx={{
                  backgroundColor: bgColor,
                  color: textColor,
                  borderRadius: "8px",
                  px: 1.5,
                  py: 0.2,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "inline-block",
                  maxWidth: 120,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </Typography>
            </Tooltip>

            <Typography
              variant="body2"
              sx={{ color: "#A7B3CD", fontSize: "0.75rem" }}
            >
              <strong>Administered:</strong>{" "}
              {medication.administeredCount}/{medication.totalDoses}
            </Typography>

            {nextDose && !isCompleted && (
              <Typography
                variant="caption"
                sx={{ color: "#6B7A90", mt: 0.5, fontSize: "0.75rem" }}
              >
                Next:{" "}
                {nextDose.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                {nextDose.toLocaleDateString([], {
                  day: "2-digit",
                  month: "short",
                })}
              </Typography>
            )}
          </Box>

          {/* ➡️ Action button */}
          <Box sx={{ textAlign: "right" }}>
            <IconButton
              
              onClick={() => {
            setSelectedMedication(medication);
            setOpenViewDialog(true);
          }}
              disabled={
                medication.administeredCount >= medication.totalDoses ||
                administering
              }
              sx={{
                color: "#228BE6",
                padding: 0.5,
                "&:hover": {
                  color: "#0F3B61",
                  backgroundColor: "transparent",
                },
                "&.Mui-disabled": { color: "#B0C4DE" },
              }}
            >
              <ChevronRightIcon fontSize="medium" />
            </IconButton>
          </Box>
        </Box>
      );
    })
  )}
</Box>

</Box>
<Dialog
      open={openViewDialog}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "520px",
          height: "75vh",
          borderRadius: 3,
          boxShadow: 6,
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      {/* -------- HEADER -------- */}
      <DialogTitle
        sx={{
          color: "#0F3B61",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 0,
        }}
      >
        Medication Verification
        <IconButton onClick={handleCloseEntire} sx={{ color: "#0F3B61" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* -------- CUSTOM HORIZONTAL STEPPER -------- */}

      {/* -------- CUSTOM HORIZONTAL STEPPER -------- */}
{/* -------- CUSTOM HORIZONTAL STEPPER (3 STEPS) -------- */}
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 4,
    py: 2,
    mt: 1,
    mb: 2,
    position: "relative",
  }}
>
  {[
    { id: 1, label: "Details" },
    { id: 2, label: "Capture" },
    { id: 3, label: "Confirm" },
  ].map((item, index, arr) => {
    const isLast = index === arr.length - 1;
    const isActive = step >= item.id;

    return (
      <Box
        key={item.id}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          flex: 1,
        }}
      >
        {/* --- Connector line --- */}
        {!isLast && (
          <Box
            sx={{
              position: "absolute",
              top: "13px", // centers line between circles
              left: "62%",
              right: "-38%",
              height: "2px",
              backgroundColor:
                step > item.id ? "#228BE6" : "rgba(34,139,230,0.3)",
              transition: "background-color 0.3s ease",
              zIndex: 0,
            }}
          />
        )}

        {/* --- Step circle --- */}
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
          }}
        >
          {item.id}
        </Box>

        {/* --- Step label --- */}
        <Typography
          sx={{
            mt: 1,
            color: isActive ? "#124D81" : "#A7B3CD",
            fontWeight: isActive ? 600 : 500,
            fontSize: "0.85rem",
            transition: "color 0.3s ease",
          }}
        >
          {item.label}
        </Typography>
      </Box>
    );
  })}
</Box>


           {/* -------- DIALOG CONTENT -------- */}
      <DialogContent dividers sx={{ flexGrow: 1, p: 3 }}>
        {step === 1 && selectedMedication && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" sx={{ color: "#124D81" }}>
              {selectedMedication.name}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                <strong>Dosage:</strong> {selectedMedication.concentration }
              </Typography>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                <strong>Route:</strong> {selectedMedication.route}
              </Typography>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}> <strong>Start Date:</strong>{" "} {new Date(selectedMedication.startDate).toLocaleString()} </Typography> <Typography variant="body2" sx={{ color: "#A7B3CD" }}> <strong>End Date:</strong>{" "} {new Date(selectedMedication.endDate).toLocaleString()} </Typography>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                <strong>Duration:</strong>{" "}
                {calculateDuration(
                  selectedMedication.startDate,
                  selectedMedication.endDate
                )}{" "}
                days
              </Typography>
              {/* Prescriber Info */} <Typography variant="body2" sx={{ color: "#A7B3CD" }}> <strong>Prescribed by:</strong> {props.UserRole || "—"} </Typography>
              <Typography variant="body2" sx={{ color: "#A7B3CD" }}> <strong>Administered:</strong>{" "} {selectedMedication.administeredCount}/{selectedMedication.totalDoses} </Typography>
              
            </Box>

            <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
              <strong>Indication:</strong>{" "}
              <span style={{ color: "#495057" }}>{selectedMedication.use}</span>
            </Typography>

            {/* Verification checkboxes */}
            <FormGroup sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={patientVerified}
                    onChange={(e) => setPatientVerified(e.target.checked)}
                    sx={{
                      color: "#228BE6",
                      "&.Mui-checked": { color: "#228BE6" },
                    }}
                  />
                }
                label="Patient verified"
                sx={{ color: "#124D81", fontWeight: 500 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={doseVerified}
                    onChange={(e) => setDoseVerified(e.target.checked)}
                    sx={{
                      color: "#228BE6",
                      "&.Mui-checked": { color: "#228BE6" },
                    }}
                  />
                }
                label="Drug dose & route verified"
                sx={{ color: "#124D81", fontWeight: 500 }}
              />
            </FormGroup>
          </Box>
        )}


{step === 2 && (
  <DialogContent
    dividers={false}
    sx={{
      p: 0,
      m: 0,
      height: "100%", // fill full dialog height
      flex: 1,
      display: "flex",
      flexDirection: "column",
      width:"100%",
      alignItems: "center",
      overflow: "hidden",
    }}
  >
    {/* 🔹 Image / Video fills entire dialog area */}
    <Box
      sx={{
        flexGrow: 1,
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#F9FBFF",
        border: "none",
        borderRadius: 0,
        overflow: "hidden",
      }}
    >
      {/* Display captured image or video */}
      {capturedImage ? (
        <img
          src={capturedImage}
          alt="Captured"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Typography
          variant="body2"
          sx={{
            color: "#A7B3CD",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          Camera / Image Capture Placeholder
        </Typography>
      )}

      <video
        ref={videoRef}
        autoPlay
        style={{
          display: isCameraActive ? "block" : "none",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </Box>

    {/* 🔹 Bottom Action Area */}
    <Box
      sx={{
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(6px)",
        p: 2,
        display: "flex",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#228BE6",
          color: "#FFFFFF",
          textTransform: "none",
          borderRadius: "8px",
          px: 3,
          "&:hover": { backgroundColor: "#0F3B61" },
        }}
        onClick={handleTakePhoto}
      >
        {isCameraActive ? "Capture" : "Take Photo"}
      </Button>

      <Button
        variant="outlined"
        sx={{
          color: "#228BE6",
          borderColor: "#228BE6",
          textTransform: "none",
          borderRadius: "8px",
          px: 3,
          "&:hover": { borderColor: "#0F3B61", color: "#0F3B61" },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        Upload from Gallery
      </Button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </Box>
  </DialogContent>
)}




        {step === 3 && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography variant="h6" sx={{ color: "#124D81", fontWeight: "bold" }}>
      Drug Administration
    </Typography>

    


    
   {/* Chips section */}
<Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
    mt: 1,
  }}
>
  {[
    "Observations",
    "Adverse Reaction",
    "Medication Errors",
    "Antibiotic monitoring",
    "Sedation (N-Pass)",
    "Inotrope monitoring",
    "Electrolyte infusion",
  ].map((label, index) => {
    const isSelected = selectedChips.includes(label);
    return (
      <Chip
        key={index}
        label={label}
        clickable
        onClick={() => {
          setSelectedChips((prev) =>
            prev.includes(label)
              ? prev.filter((c) => c !== label)
              : [...prev, label]
          );
        }}
        sx={{
          backgroundColor: isSelected ? "#1c86ffff" : "#F6F8FC",
          color: isSelected ? "#ffffffff" : "#124D81",
          fontWeight: 500,
          border: isSelected ? "1px solid #228BE6" : "1px solid transparent",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: isSelected ? "#469fffff" : "#E8F1FB",
          },
        }}
      />
    );
  })}
</Box>
<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography
      variant="h6"
      sx={{ color: "#124D81", fontWeight: "bold", mb: 1 }}
    >
      Enter Notes
    </Typography>

  {selectedChips.map((chip) => (
  <Box
    key={chip}
    sx={{
      backgroundColor: "#E9F3FF",
      borderRadius: 2,
      p: 2,
      mb: 2,
      position: "relative",
    }}
  >
    {/* 🔹 Close Button */}
    <IconButton
      size="small"
      onClick={() =>
        setSelectedChips((prev) => prev.filter((c) => c !== chip))
      }
      sx={{
        position: "absolute",
        top: 8,
        right: 8,
        color: "#A7B3CD",
        "&:hover": { color: "#0F3B61" },
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>

    <Typography
      variant="subtitle1"
      sx={{ color: "#124D81", fontWeight: 600, mb: 1 }}
    >
      {chip}
    </Typography>

    {/* 🔹 Custom layouts per chip */}
    {chip === "Sedation (N-Pass)" && (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            placeholder="Pre-Dose"
            fullWidth
            value={chipNotes[`${chip}-Pre`] || ""}
            onChange={(e) =>
              setChipNotes((prev) => ({
                ...prev,
                [`${chip}-Pre`]: e.target.value,
              }))
            }
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#124D81" },
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            placeholder="Post-Dose"
            fullWidth
            value={chipNotes[`${chip}-Post`] || ""}
            onChange={(e) =>
              setChipNotes((prev) => ({
                ...prev,
                [`${chip}-Post`]: e.target.value,
              }))
            }
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#124D81" },
            }}
          />
        </Grid>
      </Grid>
    )}

    {chip === "Inotrope monitoring" && (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            placeholder="00"
            fullWidth
            value={chipNotes[`${chip}-BP`] || ""}
            onChange={(e) =>
              setChipNotes((prev) => ({
                ...prev,
                [`${chip}-BP`]: e.target.value,
              }))
            }
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#124D81" },
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            placeholder="HR"
            fullWidth
            value={chipNotes[`${chip}-HR`] || ""}
            onChange={(e) =>
              setChipNotes((prev) => ({
                ...prev,
                [`${chip}-HR`]: e.target.value,
              }))
            }
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: 1,
              "& .MuiInputBase-input": { color: "#124D81" },
            }}
          />
        </Grid>
      </Grid>
    )}

    {chip === "Electrolyte infusion" && (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          placeholder="Rhythm / irritation"
          fullWidth
          value={chipNotes[`${chip}-Rhythm`] || ""}
          onChange={(e) =>
            setChipNotes((prev) => ({
              ...prev,
              [`${chip}-Rhythm`]: e.target.value,
            }))
          }
          sx={{ backgroundColor: "#FFFFFF", borderRadius: 1 }}
        />
        <TextField
          placeholder="Site Assessment"
          fullWidth
          value={chipNotes[`${chip}-Site`] || ""}
          onChange={(e) =>
            setChipNotes((prev) => ({
              ...prev,
              [`${chip}-Site`]: e.target.value,
            }))
          }
          sx={{ backgroundColor: "#FFFFFF", borderRadius: 1 }}
        />
      </Box>
    )}

    {/* Default field for other chips */}
    {![
      "Sedation (N-Pass)",
      "Inotrope monitoring",
      "Electrolyte infusion",
    ].includes(chip) && (
      <TextField
        multiline
        rows={2}
        placeholder={`Enter notes for ${chip}`}
        fullWidth
        value={chipNotes[chip] || ""}
        onChange={(e) =>
          setChipNotes((prev) => ({ ...prev, [chip]: e.target.value }))
        }
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          "& .MuiInputBase-input": { color: "#124D81" },
        }}
      />
    )}
  </Box>
))}

  </Box>
  </Box>
)}
{step === 100 && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography
      variant="h6"
      sx={{ color: "#124D81", fontWeight: "bold", mb: 1 }}
    >
      Drug Administration
    </Typography>

    {selectedChips.map((chip) => (
      <Box
        key={chip}
        sx={{
          backgroundColor: "#F8FAFF",
          borderRadius: 2,
          p: 2,
          mb: 2,
          position: "relative",
        }}
      >
        {/* 🔹 Close Button */}
        <IconButton
          size="small"
          onClick={() =>
            setSelectedChips((prev) => prev.filter((c) => c !== chip))
          }
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "#A7B3CD",
            "&:hover": { color: "#0F3B61" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Typography
          variant="subtitle1"
          sx={{ color: "#124D81", fontWeight: 600, mb: 1 }}
        >
          {chip}
        </Typography>

        {/* 🔹 Custom layouts per chip */}
        {chip === "Sedation (N-Pass)" && (
  <Grid container spacing={2}>
    <Grid item xs={6}>
      <TextField
       // label="Pre-Dose"
        placeholder="Pre-Dose"
        fullWidth
        InputLabelProps={{ shrink: true }} 
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          "& .MuiInputBase-input": {
            color: "#124D81",
          },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(18,77,129,0.5)",
            opacity: 1,
          },
        }}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
        //label="Post-Dose"
        placeholder="Post-Dose"
        fullWidth
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          "& .MuiInputBase-input": {
            color: "#124D81",
          },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(18,77,129,0.5)",
            opacity: 1,
          },
        }}
      />
    </Grid>
  </Grid>
)}

{chip === "Inotrope monitoring" && (
  <Grid container spacing={2}>
    <Grid item xs={6}>
      <TextField
        placeholder="00"
        fullWidth
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          "& .MuiInputBase-input": { color: "#124D81" },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(18,77,129,0.5)",
            opacity: 1,
          },
        }}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
      //  label="HR"
        placeholder="HR"
        fullWidth
       sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          "& .MuiInputBase-input": { color: "#124D81" },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(18,77,129,0.5)",
            opacity: 1,
          },
        }}
      />
    </Grid>
  </Grid>
)}

{chip === "Electrolyte infusion" && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <TextField
      placeholder="Rhythm / irritation"
      fullWidth
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 1,
        "& .MuiInputBase-input": { color: "#124D81" },
        "& .MuiInputBase-input::placeholder": {
          color: "rgba(18,77,129,0.5)",
          opacity: 1,
        },
      }}
    />
    <TextField
      placeholder="Site Assessment"
      fullWidth
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 1,
        "& .MuiInputBase-input": { color: "#124D81" },
        "& .MuiInputBase-input::placeholder": {
          color: "rgba(18,77,129,0.5)",
          opacity: 1,
        },
      }}
    />
  </Box>
)}


        {/* 🔹 Default multiline field for all other chips */}
        {![
          "Sedation (N-Pass)",
          "Inotrope monitoring",
          "Electrolyte infusion",
        ].includes(chip) && (
          <TextField
            multiline
            rows={2}
            placeholder={`Enter notes for ${chip}`}
            fullWidth
            sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 1,
        "& .MuiInputBase-input": { color: "#124D81" },
        "& .MuiInputBase-input::placeholder": {
          color: "rgba(18,77,129,0.5)",
          opacity: 1,
        },
      }}
          />
        )}
      </Box>
    ))}
  </Box>
)}

{step === 4 && (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography
      variant="h6"
      sx={{ color: "#124D81", fontWeight: "bold", mb: 1 }}
    >
      Start Time, Duration & Calculated Rate
    </Typography>

    <Box
      sx={{
        backgroundColor: "#228be65F",
        borderRadius: 3,
        p: 2,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* 🔹 Start Time */}
      <Typography
        variant="h6"
        sx={{ color: "#124D81", fontWeight: "bold" }}
      >
        Start Time
      </Typography>
      <TextField
        type="time"
        fullWidth
        value={adminDetails.startTime}
        onChange={(e) =>
          setAdminDetails((prev) => ({ ...prev, startTime: e.target.value }))
        }
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 3,
          "& .MuiInputBase-input": { color: "#124D81" },
        }}
      />

      {/* 🔹 Duration */}
      <Typography
        variant="h6"
        sx={{ color: "#124D81", fontWeight: "bold" }}
      >
        Duration (min)
      </Typography>
      <TextField
        type="number"
        placeholder="Enter duration"
        fullWidth
        value={adminDetails.duration}
        onChange={(e) =>
          setAdminDetails((prev) => ({ ...prev, duration: e.target.value }))
        }
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 3,
          "& .MuiInputBase-input": { color: "#124D81" },
        }}
      />

      {/* 🔹 Calculated Rate */}
      <Typography
        variant="h6"
        sx={{ color: "#124D81", fontWeight: "bold" }}
      >
        Calculated Rate (mL/hr)
      </Typography>
      <TextField
        placeholder="based on duration and volume"
        fullWidth
        value={adminDetails.calculatedRate}
        onChange={(e) =>
          setAdminDetails((prev) => ({
            ...prev,
            calculatedRate: e.target.value,
          }))
        }
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 3,
          "& .MuiInputBase-input": { color: "#124D81" },
        }}
      />
    </Box>
  </Box>
)}

{step === 5 && (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 1,
      p: 1,
      maxHeight: "75vh",
      overflowY: "auto",
      backgroundColor: "#FFFFFF",
    }}
  >
    {/* Header */}
    <Typography
      variant="h6"
      sx={{ color: "#124D81", fontWeight: 700, textAlign: "center" }}
    >
      Administration Log
    </Typography>

    {/* Medication Info */}
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 2,
        boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
        p: 2.5,
      }}
    >
      <Typography variant="h6" sx={{ color: "#124D81", fontWeight: 700 }}>
        {selectedMedication?.name || "Medication Name"}
      </Typography>

      <Typography sx={{ color: "#A7B3CD", fontSize: "0.85rem", mb: 1 }}>
        {selectedMedication?.use || "Indication / Diagnosis"}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={6}>
          <Typography sx={{ color: "#495057" }}>
            <b>Route:</b> {selectedMedication?.route || "—"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ color: "#495057" }}>
            <b>Order:</b> Scheduled
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ color: "#495057" }}>
            <b>Frequency:</b> {selectedMedication?.frequency1 || "—"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ color: "#495057" }}>
            <b>Adm. Over:</b> {duration ? `${duration} mins` : "—"}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography sx={{ color: "#495057" }}>
            <b>Conc.:</b> {selectedMedication?.concentration || "—"}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* Captured Image */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ color: "#124D81", fontWeight: 600 }}
        >
          Drug Captured Image
        </Typography>
        {capturedImage ? (
          <Box
            sx={{
              mt: 1,
              width: "100%",
              borderRadius: 2,
              border: "1px solid #E6EAF0",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <img
              src={capturedImage}
              alt="Captured Drug"
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
              }}
            />
          </Box>
        ) : (
          <Typography
            sx={{ color: "#A7B3CD", fontSize: "0.85rem", mt: 1, pl: 1 }}
          >
            No image captured.
          </Typography>
        )}
      </Box>

      {/* Observations */}
      {/* Observations */}
<Box sx={{ mt: 2 }}>
  <Typography
    variant="subtitle2"
    sx={{ color: "#124D81", fontWeight: 600 }}
  >
    Observations
  </Typography>

  <Typography
    sx={{
      color: "#495057",
      mt: 0.5,
      fontSize: "0.9rem",
      lineHeight: 1.5,
    }}
  >
    {selectedChips.length > 0
      ? selectedChips.map((chip) => {
          const relatedNotes = Object.keys(chipNotes)
            .filter((key) => key.startsWith(chip))
            .map((key) => chipNotes[key])
            .filter(Boolean)
            .join(", ");

          return (
            <Box key={chip} sx={{ mb: 0.5 }}>
              <strong>{chip}:</strong> {relatedNotes || "—"}
            </Box>
          );
        })
      : "No adverse reactions noted. Vitals stable."}
  </Typography>
</Box>
<Typography
    variant="subtitle2"
    sx={{ color: "#124D81", fontWeight: 600 }}
  >
    Admin Details
  </Typography>
<Grid item xs={6}>
  <Typography sx={{ color: "#495057" }}>
    <b>Start Time:</b> {adminDetails.startTime || "—"}
  </Typography>
</Grid>
<Grid item xs={6}>
  <Typography sx={{ color: "#495057" }}>
    <b>Duration:</b> {adminDetails.duration ? `${adminDetails.duration} min` : "—"}
  </Typography>
</Grid>
<Grid item xs={6}>
  <Typography sx={{ color: "#495057" }}>
    <b>Calculated Rate:</b> {adminDetails.calculatedRate ? `${adminDetails.calculatedRate} mL/hr` : "—"}
  </Typography>
</Grid>

    </Box>

    {/* Footer Buttons */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
      }}
    >
      <Button
        variant="outlined"
        onClick={() => setStep(step - 1)}
        sx={{
          color: "#228BE6",
          borderColor: "#228BE6",
          textTransform: "none",
          borderRadius: "8px",
          px: 3,
          "&:hover": { borderColor: "#0F3B61", color: "#0F3B61" },
        }}
      >
        Edit
      </Button>

      <Button
        variant="contained"
        
        onClick={() => {
          console.log("Report generated");
          setStep(1);
          setOpenViewDialog(false);
        }}
        sx={{
          backgroundColor: "#E03131",
          textTransform: "none",
          color: "#FFFFFF",
          borderRadius: "8px",
          px: 3,
          "&:hover": { backgroundColor: "#C92A2A" },
        }}
      >
        Report
      </Button>
    </Box>
  </Box>
)}





      </DialogContent>

      {/* -------- FOOTER BUTTONS -------- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderTop: "1px solid #E0E0E0",
          backgroundColor: "#F9FBFF",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => {
            handleClose();
           
          }}
          sx={{
            color: "#228BE6",
            borderColor: "#228BE6",
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            "&:hover": { borderColor: "#0F3B61", color: "#0F3B61" },
          }}
        >
          {step === 1 ? "Back" : "Previous"}
        </Button>

        <Button
          variant="contained"
          onClick={handleProceed}
          sx={{
            backgroundColor: "#228BE6",
            color: "white",
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            "&:hover": { backgroundColor: "#0F3B61" },
          }}
        >
          {step ===5 ?  "Finish":"Proceed" }
        </Button>
      </Box>
    </Dialog>

</ProtectedModule>
      {/* Medications  adding */}

      <ProtectedModule module="Medications" action="view">
  <Box marginTop={3}>
    <Typography variant="h6" sx={{ color: "#0F3B61" }} gutterBottom>
      Administered Medications
    </Typography>

    {loading ? (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress size={50} sx={{ color: "#124D81" }} />
      </Box>
    ) : (
      <>
     {Object.entries(groupedByMedication).map(([medName, records]) => {
  const first = records[0]; // Use first entry for common details

  return (
    <Paper
      key={medName}
      elevation={0}
      sx={{
        backgroundColor: "#FFFFFF",
        marginBottom: '25px',
        borderRadius: 3,
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
        padding: 2,
      }}
    >
      
      {/* TOP SECTION */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={3}>
          <Typography variant="subtitle1" fontWeight="bold" color="#124D81">
            {medName}
          </Typography>
          <Typography fontSize="12px" color="#124D81">
            {first.dosage} &nbsp; {first.route} &nbsp; {first.frequency}
          </Typography>
          <Typography variant="caption" color="#A7B3CD">
            Started: {new Date(first.effectiveDateTime).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" display="block" color="#124D81">
            {first.indication}
          </Typography>
        </Grid>

        {/* GRID OF TIMES */}
        <Grid item xs={9}>
          <Grid container>
          {records.map((r, idx) => {
  const dt = new Date(r.effectiveDateTime);

  const time = dt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const date = dt.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
    year:'2-digit'
  }); // Example: 12 Feb

  return (
    <Grid
      item
      key={idx}
      sx={{
        minWidth: 80,
        textAlign: "center",
        borderLeft: "1px solid #E0E6F3",
        paddingY: 1,
      }}
    >
      {/* TIME */}
      <Typography
        fontWeight="bold"
        fontSize="13px"
        color="#124D81"
        sx={{ lineHeight: 1 }}
      >
        {time}
      </Typography>

      {/* DATE */}
      <Typography
        fontSize="11px"
        color="#5A6B8C"
        sx={{ lineHeight: 1.2 }}
      >
        {date}
      </Typography>

      {/* Performer */}
      <Typography
        fontSize="11px"
        color="#555"
        sx={{ mt: 1 }}
      >
        {r.performerName || "Nurse"}
      </Typography>
    </Grid>
  );
})}

          </Grid>
        </Grid>
      </Grid>

    </Paper>
  );
})}

      </>
    )}
  </Box>
</ProtectedModule>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
      <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
    </Box>
   
  );
};



