import React, { useEffect, useRef, useMemo, useState } from "react";
import { Box, Typography, TextField, Button, Grid, Divider, Paper, Autocomplete, MenuItem, Select, Dialog, DialogTitle, Tooltip, DialogContent, DialogActions, FormControlLabel, FormGroup, Checkbox, FormControl,  Snackbar, Alert,  useTheme, createFilterOptions } from "@mui/material";
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
import SearchIcon from "@mui/icons-material/Search";

// 1. Import the Pencil Icon
import EditIcon from '@mui/icons-material/Edit';

// 2. Import InputAdornment (Check if you already have a line importing from '@mui/material')
// If you don't have it, add this:
import { InputAdornment } from '@mui/material';

import {
  Stack,
} from "@mui/material";
// Make sure your drug database is imported

// const Q_FACTOR_MAP: Record<number, string> = {
//   4: "Q4H",
//   6: "Q6H",
//   8: "Q8H",
//   12: "Q12H",
//   24: "Q24H",
//   36: "Q36H",
//   48: "Q48H",
//   30: "Q30H",
//   42: "Q42H",
//   18: "Q18H",
// };
type MedicationItem = {
  id: string;
  name: string;
  orderType: string;
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

  // ✅ ADD THESE TO FIX TS ERRORS
  dose?: string | number;       // Prescribed dose (e.g., 12.5 mg/kg)
  weight?: number;              // Patient weight in grams (e.g., 2500)
  doseAmount?: string | number; // Calculated absolute dose in mg (e.g., 31.25)
  infusionTime?: string;        // e.g. "30 minutes"
  dosageInstruction?: Array<{   // Full FHIR structure support
    text?: string;
  }>;
};
interface PrescriptionScreenProps {

  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
  birth_date: string;     // e.g., "2025-12-30"
  gestational_age: string; // e.g., "15W 02D"
  UserRole: string;
  current_weight?: string | number;


  // Optional: External control for the prescription dialog
  externalOpenPrescribeModal?: boolean;
  externalSetOpenPrescribeModal?: (open: boolean) => void;

  // Optional: Callback when prescription is confirmed
  onPrescriptionConfirm?: (prescription: any) => void;

  // Optional: If true, saves to FHIR immediately. If false, returns data to parent.
  saveOnConfirm?: boolean;
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
// type AdministrationHistoryItem = {
//   id: string;
//   versionId: string;
//   name: string;
//   status: string;
//   effectiveDateTime: string;
//   performerName: string;
//   patientReference: string;
//   requestReference: string;

//   // NEW FIELDS
//   dosage: string;
//   route: string;
//   indication: string;
//   frequency: string;
//   duration: string;
// };



const filter = createFilterOptions<any>();

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
  additionalNote: string;
  intervals?: string[];
  adminOver?: number | null;
  concentration?: string | null;
  intervalHours?: number | null;
  dose?: string | number;
  doseAmount?: string | number;
  infusionTime?: string;
  isCritical: boolean;
}



export const PrescriptionScreen: React.FC<PrescriptionScreenProps> = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // 🔹 Custom Hook or Logic for Unit Persistence
  const [doseUnitOptions, setDoseUnitOptions] = useState<string[]>([]);
  const [intervalUnitOptions, setIntervalUnitOptions] = useState<string[]>([]);
  const [infusionUnitOptions, setInfusionUnitOptions] = useState<string[]>([]);
  const [concUnitOptions, setConcUnitOptions] = useState<string[]>([]);

  useEffect(() => {
    // Load defaults or from local storage
    const loadUnits = (key: string, defaults: string[]) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaults;
    };

    setDoseUnitOptions(loadUnits('doseUnitOptions', ["mg/kg/dose", "mg/dose", "mL", "unit/kg/dose", "mcg/kg/dose"]));
    setIntervalUnitOptions(loadUnits('intervalUnitOptions', ["hrs", "min", "days"]));
    setInfusionUnitOptions(loadUnits('infusionUnitOptions', ["minutes", "hours"]));
    setConcUnitOptions(loadUnits('concUnitOptions', ["mg/mL", "mcg/mL", "unit/mL", "%"]));
  }, []);

  const saveUnit = (value: string | null, type: 'dose' | 'interval' | 'infusion' | 'conc') => {
    if (!value) return;
    const trimmed = value.trim();
    if (!trimmed) return;

    if (type === 'dose') {
      setDoseUnitOptions(prev => {
        if (!prev.includes(trimmed)) {
          const newList = [...prev, trimmed];
          localStorage.setItem('doseUnitOptions', JSON.stringify(newList));
          return newList;
        }
        return prev;
      });
    } else if (type === 'interval') {
      setIntervalUnitOptions(prev => {
        if (!prev.includes(trimmed)) {
          const newList = [...prev, trimmed];
          localStorage.setItem('intervalUnitOptions', JSON.stringify(newList));
          return newList;
        }
        return prev;
      });
    } else if (type === 'infusion') {
      setInfusionUnitOptions(prev => {
        if (!prev.includes(trimmed)) {
          const newList = [...prev, trimmed];
          localStorage.setItem('infusionUnitOptions', JSON.stringify(newList));
          return newList;
        }
        return prev;
      });
    } else if (type === 'conc') {
      setConcUnitOptions(prev => {
        if (!prev.includes(trimmed)) {
          const newList = [...prev, trimmed];
          localStorage.setItem('concUnitOptions', JSON.stringify(newList));
          return newList;
        }
        return prev;
      });
    }
  };


  // Replace your old 'selectedDrug' states with these:
  const [selectedDrugData, setSelectedDrugData] = useState<any>(null);
  const [selectedDrugName, setSelectedDrugName] = useState("");
  const [selectedHeading, setSelectedHeading] = useState("");
  const [, setAvailableRoutes] = useState<string[]>([]);
  const [route, setRoute] = useState("");
  const [showDetails, setShowDetails] = useState(false);



  // ✅ NEW CODE: Initialize with PROPS
  const [dob, setDob] = useState<Date | null>(
    props.birth_date ? new Date(props.birth_date) : null
  );

  // Helper to parse "28W 2D" string into separate values if needed
  const parseGA = (gaString: string) => {
    const match = gaString?.match(/(\d+)W\s*(\d+)D/i);
    return match ? { weeks: match[1], days: match[2] } : { weeks: "", days: "" };
  };

  const initialGA = useMemo(() => parseGA(props.gestational_age), [props.gestational_age]);

  const [gaWeeks, setGaWeeks] = useState(initialGA.weeks);
  const [gaDays, setGaDays] = useState(initialGA.days);

  // const [selectedDrugCategory, setSelectedDrugCategory] = useState("");
  const [, setSelectedDrugUse] = useState("");
  const [dose, setDose] = useState<string>('');
  const [unit, setUnit] = useState("mg/kg");
  const [intervalUnit, setIntervalUnit] = useState("hrs");
  const [infusionTimeUnit, setInfusionTimeUnit] = useState("minutes");
  const [concUnit, setConcUnit] = useState("mg/mL");
  const [frequency, setFrequency] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [days,] = useState<number>(1);
  const [, setIndication] = useState<string[]>([]);
  //const [indications, setIndications] = useState<string[]>([]);
  const [admin] = useState<string>('');
  const [intervalHours, setIntervalHours] = useState<string>(''); // optional
  const [infusionTime, setInfusionTime] = useState<string>('');
  const [conc, setConc] = useState<string>('');
  // const [additionalNote, setAdditionalNote] = useState("");
  const [durationDays, setDurationDays] = useState<string>(""); // New Duration State
  const [doseperday] = useState('N/A');
  // Store medications
  const [, setDrugOptions] = useState<any[]>([]);
  const [internalOpenPrescribeModal, setInternalOpenPrescribeModal] = useState(false);

  // Use external control if provided, otherwise use internal state
  const openPrescribeModal = props.externalOpenPrescribeModal !== undefined
    ? props.externalOpenPrescribeModal
    : internalOpenPrescribeModal;
  const setOpenPrescribeModal = props.externalSetOpenPrescribeModal || setInternalOpenPrescribeModal;

  const [pmaDays, setPmaDays] = useState<string>("");

  // 🔹 Helper: Format date for input


  // 🔹 Sync Logic: Start/End/Duration
  const handleStartDateChange = (newValue: Date | null) => {
    setStartDate(newValue);
    if (newValue && durationDays) {
      // If duration exists, update End Date
      const days = parseInt(durationDays);
      if (!isNaN(days)) {
        const newEnd = new Date(newValue);
        newEnd.setDate(newEnd.getDate() + days); // Add days
        setEndDate(newEnd);
      }
    } else if (newValue && endDate) {
      // If end date exists, update Duration
      const diffTime = Math.abs(endDate.getTime() - newValue.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDurationDays(String(diffDays));
    }
  };

  const handleEndDateChange = (newValue: Date | null) => {
    setEndDate(newValue);
    if (newValue && startDate) {
      // Update Duration
      const diffTime = Math.abs(newValue.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDurationDays(String(diffDays));
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDurationDays(val);
    if (startDate && val) {
      const days = parseInt(val);
      if (!isNaN(days)) {
        const newEnd = new Date(startDate);
        newEnd.setDate(newEnd.getDate() + days);
        setEndDate(newEnd);
      }
    }
  };


  const [pmaCombined, setpmaCombined] = useState<string>("");
  const [allDrugsList, setAllDrugsList] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "completed">("ongoing");
  // const [inputValue, setInputValue] = useState "";

  const [gestationalAge, setGestationalAge] = useState<string>('');
  const [birthDate] = useState<string>('');
  const [pnaDays, setPnaDays] = useState<string>("");
  const [pmaWeeks, setPmaWeeks] = useState<string>("");
  const [weight, setWeight] = useState(props.current_weight || "");
  // const [weightG, setWeightG] = useState<string>("");
  // e.g. "Q8H"
  // const [ivAdminBackup, setIvAdminBackup] = useState<string>(''); // stores last IV admin
  const [doseAmount, setDoseAmount] = useState<string>('');   // mg total
  const [, setDoseVolume] = useState<string>('');   // mL total
  const [, setDeliveryRate] = useState<string>(''); // mL/hr
  // const [ordertype, setOrderType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusSearch, setStatusSearch] = useState("All");
  const [timeSearchStart, setTimeSearchStart] = useState<Date | null>(null);
  const [timeSearchEnd, setTimeSearchEnd] = useState<Date | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  //const [fhirImageId, setFhirImageId] = useState<string | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<any | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync weight with props
  useEffect(() => {
    setWeight(props.current_weight || "");
  }, [props.current_weight]);

  // Validation State
  const [selectedRegimenOption, setSelectedRegimenOption] = useState<any>(null);
  const [doseWarning, setDoseWarning] = useState<string | null>(null);
  const [infusionWarning, setInfusionWarning] = useState<string | null>(null);
  const [concWarning, setConcWarning] = useState<string | null>(null);
  const [intervalWarning, setIntervalWarning] = useState<string | null>(null);
  const [selectedDrug] = useState<any | null>(null); // Selected drug object
  // const [administrationHistory, setAdministrationHistory] = useState<AdministrationHistoryItem[]>([]);
  const [prescriptionHistory, setPrescriptionHistory] = useState<Medication[]>([]);
  const [step, setStep] = useState(1); // 🔹 step 1: details, step 2: capture image
  const [patientVerified, setPatientVerified] = useState(false);
  const [doseVerified, setDoseVerified] = useState(false);
  const [chipNotes, setChipNotes] = useState<{ [key: string]: string }>({});
  //const [startTime, setStartTime] = useState("");
  //const [rate, setRate] = useState("");

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

  const [drug_database, setDrugDatabase] = useState<any[]>([]);

  // 🔹 Fetch Custom Drugs from FHIR
  const fetchCustomDrugs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Medication?_count=1000`, {
        headers: {
          "Authorization": "Basic " + btoa("fhiruser:change-password")
        }
      });
      if (!response.ok) return [];
      const bundle = await response.json();
      if (!bundle.entry) return [];

      const customDrugs = bundle.entry
        .map((entry: any) => {
          const med = entry.resource;
          // Look for our specific extension
          const ext = med.extension?.find((e: any) => e.url === "http://example.org/fhir/StructureDefinition/drug-schema-json");
          if (ext && ext.valueString) {
            try {
              const parsed = JSON.parse(ext.valueString);
              return { ...parsed, isCustom: true, fhirId: med.id };
            } catch (e) {
              console.error("Failed to parse custom drug JSON", e);
              return null;
            }
          }
          return null;
        })
        .filter((d: any) => d !== null);

      return customDrugs;
    } catch (error) {
      console.error("Error fetching custom drugs:", error);
      return [];
    }
  };

  const saveCustomDrugToFHIR = async (drugData: any) => {
    try {
      // 1. Check if drug exists (by name) to decide PUT vs POST
      // For simplicity, if we have a fhirId, we PUT. Else we search/POST.
      let method = "POST";
      let url = `${import.meta.env.VITE_FHIRAPI_URL}/Medication`;

      if (drugData.fhirId) {
        method = "PUT";
        url = `${import.meta.env.VITE_FHIRAPI_URL}/Medication/${drugData.fhirId}`;
      } else {
        // Double check if it exists by name to avoid duplicates if ID is missing
        const search = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Medication?code=${drugData.drug_name}`, {
          headers: { "Authorization": "Basic " + btoa("fhiruser:change-password") }
        });
        const searchData = await search.json();
        if (searchData.entry && searchData.entry.length > 0) {
          method = "PUT";
          const existingId = searchData.entry[0].resource.id;
          url = `${import.meta.env.VITE_FHIRAPI_URL}/Medication/${existingId}`;
          drugData.fhirId = existingId;
        }
      }

      const resource = {
        resourceType: "Medication",
        id: drugData.fhirId,
        code: {
          text: drugData.drug_name
        },
        extension: [
          {
            url: "http://example.org/fhir/StructureDefinition/drug-schema-json",
            valueString: JSON.stringify(drugData)
          }
        ]
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa("fhiruser:change-password")
        },
        body: JSON.stringify(resource)
      });

      if (response.ok) {
        const savedMed = await response.json();
        console.log("Custom drug saved to FHIR:", savedMed);
        return savedMed.id;
      } else {
        console.error("Failed to save custom drug", await response.text());
      }
    } catch (e) {
      console.error("Error saving custom drug:", e);
    }
  };

  useEffect(() => {
    const loadDrugs = async () => {
      try {
        const [neofaxRes, customDrugs] = await Promise.all([
          fetch("/final_neofax_output.json").then(res => res.json()).catch(() => []),
          fetchCustomDrugs()
        ]);

        // Merge lists. Custom drugs with same name should ideally overwrite or merge? 
        // For now, let's just append and let the UI handle filtering/selection.
        // Or better: Use a Map to deduplicate by name, preferring Custom (latest).
        const drugMap = new Map();
        neofaxRes.forEach((d: any) => drugMap.set(d.drug_name, d));
        customDrugs.forEach((d: any) => drugMap.set(d.drug_name, d)); // Overwrites if exists

        const merged = Array.from(drugMap.values());
        setDrugDatabase(merged);
      } catch (error) {
        console.error(error);
      }
    };
    loadDrugs();
  }, []);

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

    // ✅ Step 3 → Step 5 (jump to confirm, bypassing timing/rate step)
    if (step === 3) {
      if (selectedChips.length <= 0) {

        alert("You are proceeding with no additional info");

      }
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

      return;
    }
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
    console.log("pmaCombined", pmaCombined);

  }, [birthDate]);
  useEffect(() => {
    if (pmaWeeks === "" || pmaDays === "") return;
    const dec = (
      parseInt(pmaWeeks) +
      parseInt(pmaDays) / 7
    ).toFixed(1);
    setpmaCombined(dec);
  }, [pmaWeeks, pmaDays]);

  // 1. New State for the options list
  const [availableOptions, setAvailableOptions] = useState<any[]>([]);

  // 2. Helper to fill form when an option is clicked
  // Helper to fill the form when an option is clicked (or auto-selected)
  // Helper to fill the form when an option is clicked (or auto-selected)
  const handleRegimenSelect = (regimen: any) => {
    // Shared Helper: Parse Range to {min, max} (Handles "10-20", "10,20", [10,20])
    const parseRange = (val: any) => {
      if (typeof val === 'number') return { min: val, max: val };
      if (!val) return null;
      let parts: number[] = [];
      if (Array.isArray(val)) {
        parts = val.map(v => parseFloat(v));
      } else {
        const s = String(val);
        // Split by hyphen or comma
        parts = s.split(/[-,\u2013]/).map(p => parseFloat(p.trim()));
      }
      // Filter out NaNs
      parts = parts.filter(n => !isNaN(n));

      if (parts.length === 0) return null;
      if (parts.length === 1) return { min: parts[0], max: parts[0] };
      // Sort to ensure min/max
      parts.sort((a, b) => a - b);
      return { min: parts[0], max: parts[parts.length - 1] };
    };

    // Shared Helper: Calculate Average or return single value
    const calculateAverage = (val: any) => {
      const range = parseRange(val);
      if (!range) return "";
      if (range.min === range.max) return String(range.min);
      return ((range.min + range.max) / 2).toFixed(2).replace(/\.00$/, "");
    };

    const avgDose = calculateAverage(regimen.dose);
    setDose(avgDose);

    setUnit(regimen.unit || "mg/kg/dose");
    setFrequency(String(regimen.frequency || ""));
    setIntervalHours(calculateAverage(regimen.interval_hours));
    setIntervalUnit("hrs");

    setSelectedRegimenOption(regimen);

    // Calculate Dose Amount (mg) using the averaged dose
    if (weight && avgDose) {
      const numericDose = parseFloat(avgDose);
      const numericWeightKg = Number(weight) / 1000;
      if (!isNaN(numericDose) && !isNaN(numericWeightKg)) {
        setDoseAmount((numericDose * numericWeightKg).toFixed(2));
      } else {
        setDoseAmount("");
      }
    } else {
      setDoseAmount("");
    }

    if (selectedDrugData && selectedHeading && route) {
      const adminDetails = selectedDrugData[selectedHeading]?.routes?.[route]?.admin_details;
      if (adminDetails) {
        // Use average for Infusion Time and Concentration too
        setInfusionTime(calculateAverage(adminDetails.infusion_time));
        setInfusionTimeUnit(adminDetails.infusion_time_unit || "minutes");
        setConc(calculateAverage(adminDetails.concentration_mg_ml));
        setConcUnit("mg/mL");
      }
    }
  };

  // 🚀 Unified Auto-Selection Effect
  useEffect(() => {
    if (selectedDrugData && selectedHeading && route) {
      const routesData = selectedDrugData[selectedHeading]?.routes;
      if (routesData && routesData[route]) {

        const rawRanges = routesData[route].ranges || [];
        // Filter options based on Weight/GA/Conditions
        const validOptions = rawRanges.filter((r: any) => isRangeValid(r));

        if (validOptions.length > 0) {
          console.log("🚀 Auto-selecting options:", validOptions);
          setAvailableOptions(validOptions);
          handleRegimenSelect(validOptions[0]);
        } else {
          console.log("⚠️ No matching regimens found for patient metrics.");
          setAvailableOptions([]);
          // Reset values if no match found
          setDose("");
          setDoseAmount("");
          setIntervalHours("");
          setInfusionTime("");
          setConc("");
          setSelectedRegimenOption(null);

          // Reset Warnings
          setDoseWarning(null);
          setInfusionWarning(null);
          setConcWarning(null);
          setIntervalWarning(null);
        }
      }
    }
  }, [selectedDrugData, selectedHeading, route, weight]);

  // 🔹 Dose Validation Effect
  useEffect(() => {
    if (!dose || !selectedRegimenOption) {
      setDoseWarning(null);
      return;
    }

    // Helper to parse range string "10-15" => {min: 10, max: 15}
    const parseRange = (val: any) => {
      if (typeof val === 'number') return { min: val, max: val };
      if (!val) return null;
      let parts: number[] = [];
      if (Array.isArray(val)) {
        parts = val.map(v => parseFloat(v));
      } else {
        const s = String(val);
        // Split by hyphen or comma
        parts = s.split(/[-,\u2013]/).map(p => parseFloat(p.trim()));
      }
      // Filter out NaNs
      parts = parts.filter(n => !isNaN(n));

      if (parts.length === 0) return null;
      if (parts.length === 1) return { min: parts[0], max: parts[0] };
      parts.sort((a, b) => a - b);
      return { min: parts[0], max: parts[parts.length - 1] };
    };

    const numericDose = parseFloat(dose);
    if (isNaN(numericDose)) return;

    // Check Min/Max if available
    // Assuming regimen has optional fields like min_dose, max_dose (adjust based on your actual data structure)
    // If not directly on the option, check if the ranges have them.
    // For now, let's assume we check against the option's specific constraints if any, 
    // or if the option itself REPRESENTS a range (often it does).



    let warningMsg = null;

    // 1. Check Max Dose ( Absolute Max )
    if (selectedRegimenOption.max_dose) {
      const maxDoseVal = parseFloat(selectedRegimenOption.max_dose);
      if (!isNaN(maxDoseVal) && numericDose > maxDoseVal) {
        warningMsg = `Value ${numericDose} exceeds max allowed dose of ${maxDoseVal}`;
      }
    }

    // 2. Check Range ( If dose was a range e.g. 10-20 )
    if (!warningMsg && selectedRegimenOption.dose) {
      const range = parseRange(selectedRegimenOption.dose);
      if (range) {
        if (numericDose < range.min) {
          warningMsg = `Value ${numericDose} is below recommended range (${range.min}-${range.max})`;
        } else if (numericDose > range.max) {
          warningMsg = `Value ${numericDose} is above recommended range (${range.min}-${range.max})`;
        }
      }
    }

    setDoseWarning(warningMsg);
  }, [dose, selectedRegimenOption]);

  // 🔹 Infusion Time Validation Effect
  useEffect(() => {
    if (!infusionTime || !selectedDrugData || !selectedHeading || !route) {
      setInfusionWarning(null);
      return;
    }

    const adminDetails = selectedDrugData[selectedHeading]?.routes?.[route]?.admin_details;
    if (!adminDetails || !adminDetails.infusion_time) return;

    // Helper to parse range string "20-120" => {min: 20, max: 120}
    const parseRange = (val: any) => {
      if (typeof val === 'number') return { min: val, max: val };
      if (!val) return null;
      let parts: number[] = [];
      if (Array.isArray(val)) {
        parts = val.map(v => parseFloat(v));
      } else {
        const s = String(val);
        // Split by hyphen or comma
        parts = s.split(/[-,\u2013]/).map(p => parseFloat(p.trim()));
      }
      // Filter out NaNs
      parts = parts.filter(n => !isNaN(n));

      if (parts.length === 0) return null;
      if (parts.length === 1) return { min: parts[0], max: parts[0] };
      parts.sort((a, b) => a - b);
      return { min: parts[0], max: parts[parts.length - 1] };
    };

    const val = parseFloat(infusionTime);
    if (isNaN(val)) return;

    const range = parseRange(adminDetails.infusion_time);
    let msg = null;

    if (range) {
      if (val < range.min) {
        msg = `Value ${val} is below recommended range (${range.min}-${range.max})`;
      } else if (val > range.max) {
        msg = `Value ${val} is above recommended range (${range.min}-${range.max})`;
      }
    }

    setInfusionWarning(msg);

  }, [infusionTime, selectedDrugData, selectedHeading, route]);

  // 🔹 Concentration Validation Effect
  useEffect(() => {
    if (!conc || !selectedDrugData || !selectedHeading || !route) {
      setConcWarning(null);
      return;
    }

    const adminDetails = selectedDrugData[selectedHeading]?.routes?.[route]?.admin_details;
    if (!adminDetails || !adminDetails.concentration_mg_ml) return;

    // Helper to parse range string "20-120" => {min: 20, max: 120}
    const parseRange = (val: any) => {
      if (typeof val === 'number') return { min: val, max: val };
      if (!val) return null;
      let parts: number[] = [];
      if (Array.isArray(val)) {
        parts = val.map(v => parseFloat(v));
      } else {
        const s = String(val);
        // Split by hyphen or comma
        parts = s.split(/[-,\u2013]/).map(p => parseFloat(p.trim()));
      }
      // Filter out NaNs
      parts = parts.filter(n => !isNaN(n));

      if (parts.length === 0) return null;
      if (parts.length === 1) return { min: parts[0], max: parts[0] };
      parts.sort((a, b) => a - b);
      return { min: parts[0], max: parts[parts.length - 1] };
    };

    const val = parseFloat(conc);
    if (isNaN(val)) return;

    const range = parseRange(adminDetails.concentration_mg_ml);
    let msg = null;

    if (range) {
      if (val < range.min) {
        msg = `Value ${val} is below recommended range (${range.min}-${range.max})`;
      } else if (val > range.max) {
        msg = `Value ${val} is above recommended range (${range.min}-${range.max})`;
      }
    }
    setConcWarning(msg);
  }, [conc, selectedDrugData, selectedHeading, route]);

  // 🔹 Interval Validation Effect
  useEffect(() => {
    if (!intervalHours || !selectedRegimenOption) {
      setIntervalWarning(null);
      return;
    }

    // Helper to parse range string "20-120" => {min: 20, max: 120}
    const parseRange = (val: any) => {
      if (typeof val === 'number') return { min: val, max: val };
      if (!val) return null;
      let parts: number[] = [];
      if (Array.isArray(val)) {
        parts = val.map(v => parseFloat(v));
      } else {
        const s = String(val);
        // Split by hyphen or comma
        parts = s.split(/[-,\u2013]/).map(p => parseFloat(p.trim()));
      }
      // Filter out NaNs
      parts = parts.filter(n => !isNaN(n));

      if (parts.length === 0) return null;
      if (parts.length === 1) return { min: parts[0], max: parts[0] };
      parts.sort((a, b) => a - b);
      return { min: parts[0], max: parts[parts.length - 1] };
    };

    const val = parseFloat(intervalHours);
    if (isNaN(val)) return;

    const range = parseRange(selectedRegimenOption.interval_hours);
    let msg = null;

    if (range) {
      if (val < range.min) {
        msg = `Value ${val} is below recommended range (${range.min}-${range.max})`;
      } else if (val > range.max) {
        msg = `Value ${val} is above recommended range (${range.min}-${range.max})`;
      }
    }
    setIntervalWarning(msg);
  }, [intervalHours, selectedRegimenOption]);

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

  // Delete medication handler


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
    if (props.current_weight) {
      setWeight(props.current_weight);
    }
  }, [props.current_weight]);

  useEffect(() => {
    if (selectedDrug && selectedDrug.original) {
      const filtered = filterRegimensForPatient(
        selectedDrug.original.regimens,
        gestationalAge,
        String(weight),
        Number(pnaDays) || 0,
        Number(pmaWeeks) || 0
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

    // ✅ Dose amount (mg) = dose_value * (weight_in_g / 1000)
    // NOTE: weight is in grams (from UI input), standard dosing is mg/kg
    var doseAmount = dose * (wt / 1000); // mg
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
      String(weight),
      conc,
      admin,
      route,
      doseperday
    );
    setDoseAmount(doseAmount);
    setDoseVolume(doseVolume);
    setDeliveryRate(deliveryRate);
  }, [dose, weight, conc, admin, route, doseperday]);

  /*const getIndicationsForDrug = (drug: any) => {
    if (!drug || !drug.regimens) return [];
    
    // Extract unique indications (raw_text)
    const indications = [...new Set(drug.regimens.map((r: any) => r.raw_text))];
    return indications;
  };*/
  // ✅ Find active regimen for selected drug use + route

  // const calcNotes = activeRegimen?.calc_notes || "";


  // const isFormEmpty = () => {
  //   return (
  //     !selectedDrug ||
  //     !dose ||
  //     !route ||
  //     !frequency ||
  //     !startDate ||
  //     !endDate
  //     // !indication ||
  //     // !additionalNote
  //   );
  // };
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

  // const resetForm = () => {
  //   setDrugOptions([]); // Clears the dropdown options safely
  //   setSelectedDrug(null);
  //   setSelectedDrugName('');
  //   setSelectedDrugCategory('');
  //   setSelectedDrugUse('');
  //   setDose('');
  //   setRoute('');
  //   setFrequency('');
  //   setStartDate(null);
  //   setEndDate(null);
  //   setDays(1);
  //   setIntervalHours('');
  //   setAdmin('');
  //   setIndication([]);
  //   setSelectedDrug('');
  //   setConc('');
  //   setOrderType('');
  //   setRoute('');
  //   setAdditionalNote('');
  // };
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





  const [, setLoading] = useState<boolean>(true);


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
  const getMedicationStatus = (med: any) => {
    const now = new Date();
    const start = new Date(med.startDate);
    // const end = new Date(med.endDate);
    const nextDose = getNextDoseTime(med);
    const isCompleted = med.administeredCount >= med.totalDoses;
    const isBeforeStart = now < start;
    const isMissed = nextDose && now > nextDose && !isCompleted;

    if (isCompleted) return "Completed";
    if (isMissed) return "Missed";
    if (isBeforeStart) return "Upcoming";
    return "Ongoing";
  };

  const filteredMedications = prescriptionHistory.filter((med) => {
    const status = getMedicationStatus(med);

    // Filtering by Search Type
    let matchesSearch = true;
    if (sortBy === "name") {
      matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (sortBy === "status") {
      matchesSearch = statusSearch === "All" || status === statusSearch;
    } else if (sortBy === "time" && (timeSearchStart || timeSearchEnd)) {
      const medStart = new Date(med.startDate).getTime();
      const medEnd = new Date(med.endDate).getTime();
      const searchStart = timeSearchStart ? timeSearchStart.getTime() : 0;
      const searchEnd = timeSearchEnd ? timeSearchEnd.getTime() : Infinity;

      // Overlap condition: med start is before search end AND med end is after search start
      matchesSearch = medStart <= searchEnd && medEnd >= searchStart;
    }

    if (!matchesSearch) return false;

    // Status Filter (Tabs)
    if (statusFilter === "all") return true;
    if (statusFilter === "completed") return status === "Completed";
    if (statusFilter === "ongoing") return status !== "Completed";
    return false;
  });

  const finalMedications = [...filteredMedications].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "status") {
      const statusOrder: Record<string, number> = { "Missed": 0, "Upcoming": 1, "Ongoing": 2, "Completed": 3 };
      return statusOrder[getMedicationStatus(a)] - statusOrder[getMedicationStatus(b)];
    }
    if (sortBy === "time") {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    // Default: Sort by time
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
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



  // const groupedByMedication = administrationHistory.reduce((acc, item) => {
  //   if (!acc[item.name]) acc[item.name] = [];
  //   acc[item.name].push(item);
  //   return acc;
  // }, {} as Record<string, AdministrationHistoryItem[]>);

  // const fetchAdminister = async () => {
  //   setLoading(true);
  //   try {
  //     const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration?subject=Patient/${props.patient_resource_id}`;

  //     const response = await fetch(searchUrl, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //       },
  //     });

  //     if (response.ok) {
  //       const searchData = await response.json();
  //       console.log("Fetched MedicationAdministration:", searchData);
  //       console.log("Fetched patient resource id:", props.patient_resource_id);
  //       console.log("Fetched user role:", props.UserRole);


  //       if (searchData?.entry && searchData.entry.length > 0) {
  //         // const allHistories = await Promise.all(
  //         //   searchData.entry.map(async (entry: { resource: any }) => {
  //         //     const resourceId = entry.resource.id;
  //         //     const historyUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationAdministration/${resourceId}/_history`;

  //         //     const historyResponse = await fetch(historyUrl, {
  //         //       method: "GET",
  //         //       headers: {
  //         //         "Content-Type": "application/json",
  //         //         Authorization: "Basic " + btoa("fhiruser:change-password"),
  //         //       },
  //         //     });

  //         //     if (historyResponse.ok) {
  //         //       const historyData = await historyResponse.json();
  //         //       return historyData.entry.map((historyEntry: { resource: any }) => {
  //         //         const medication = historyEntry.resource;

  //         //         // Dynamic dosage formatting
  //         //         const dose =
  //         //           medication.dosage?.dose?.value
  //         //             ? `${medication.dosage?.dose?.value} ${medication.dosage?.dose?.unit ?? ""}`
  //         //             : medication.dosage?.dose?.text || "N/A";

  //         //         return {
  //         //           id: medication.id,
  //         //           versionId: medication.meta?.versionId || "N/A",
  //         //           name: medication.medicationCodeableConcept?.text || "N/A",
  //         //           status: medication.status || "N/A",
  //         //           effectiveDateTime: medication.effectiveDateTime || "N/A",
  //         //           performerName: medication.performer?.[0]?.actor?.display || "N/A",
  //         //           patientReference: medication.subject?.reference || "N/A",
  //         //           requestReference: medication.request?.reference || "N/A",

  //         //           // NEW FIELDS
  //         //           dosage: dose || "N/A",
  //         //           route: medication.dosage?.route?.text || "N/A",
  //         //           indication:
  //         //             medication.reasonCode?.[0]?.text ??
  //         //             medication.reasonReference?.[0]?.display ??
  //         //             "N/A",
  //         //           frequency:
  //         //             medication.dosage?.timing?.repeat?.frequency ??
  //         //             medication.dosage?.timing?.code?.text ??
  //         //             "N/A",
  //         //           duration:
  //         //             medication.dosage?.timing?.repeat?.boundsPeriod?.duration ??
  //         //             "N/A",
  //         //         } as AdministrationHistoryItem;
  //         //       });

  //         //     } else {
  //         //       console.error(
  //         //         `Failed to fetch history for MedicationAdministration ${resourceId}.`
  //         //       );
  //         //       return [];
  //         //     }
  //         //   })
  //         // );

  //         // Flatten the nested array of histories
  //         // const flattenedHistories: AdministrationHistoryItem[] = allHistories.flat();
  //         // setAdministrationHistory(flattenedHistories);
  //       } 
  //       // else {
  //       //   setAdministrationHistory([]);
  //       //   console.warn("No MedicationAdministration entries found.");
  //       // }
  //     } else {
  //       console.error("Failed to fetch MedicationAdministration resource.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching MedicationAdministration:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchPrescription = async () => {
    setLoading(true);
    try {
      const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest?subject=Patient/${props.patient_resource_id}&_count=100`;

      const response = await fetch(searchUrl, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
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
            medication.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod?.start ||
            "";

          const end =
            medication.dispenseRequest?.validityPeriod?.end ||
            medication.dosageInstruction?.[0]?.timing?.repeat?.boundsPeriod?.end ||
            "";

          const safeStart = start || "";
          const safeEnd = end || "";
          const safeFreq = typeof rawFreq === "number" ? rawFreq : 0;

          return {
            id: medication.id,
            name: medication.medicationCodeableConcept?.text || "N/A",
            frequency,
            frequency1: getExt("http://example.org/fhir/StructureDefinition/frequencyLabel")?.valueString || "N/A",
            route: medication.dosageInstruction?.[0]?.route?.coding?.[0]?.display || "N/A",
            startDate: start,
            endDate: end,
            use: medication.reasonCode?.[0]?.text || "N/A",
            additionalNote: medication.note?.[0]?.text || "N/A",
            intervals: calculateIntervals(safeStart, safeEnd, safeFreq).map(d =>
              d instanceof Date ? d.toISOString() : String(d)
            ),
            totalDoses: getExt("http://example.org/fhir/StructureDefinition/totalDoses")?.valueInteger || 0,
            administeredCount: getExt("http://example.org/fhir/StructureDefinition/administeredCount")?.valueInteger || 0,
            adminOver: getExt("http://example.org/fhir/StructureDefinition/deliveryRate")?.valueQuantity?.value ?? null,
            concentration: getExt("http://example.org/fhir/StructureDefinition/concentration")?.valueString ?? null,
            intervalHours: getExt("http://example.org/fhir/StructureDefinition/intervalHours")?.valueDecimal ?? null,
            orderType: medication.category?.[0]?.coding?.[0]?.display || "Regular",
            isCritical: false,

            // ✅ ADD THESE THREE LINES TO EXTRACT THE MISSING DATA:
            dose: medication.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value ?? "N/A",
            weight: getExt("http://example.org/fhir/StructureDefinition/weight")?.valueQuantity?.value ?? null,
            doseAmount: getExt("http://example.org/fhir/StructureDefinition/doseAmount")?.valueQuantity?.value ?? null,
            infusionTime: getExt("http://example.org/fhir/StructureDefinition/infusionTime")?.valueString ?? null,
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
        intervals: item.intervals ?? undefined,

        totalDoses: item.totalDoses || 0,
        administeredCount: item.administeredCount,

        adminOver: item.adminOver,
        concentration: item.concentration,
        intervalHours: item.intervalHours,
        dose: item.dose,
        doseAmount: item.doseAmount,
        infusionTime: item.infusionTime,

        orderType: item.orderType,

        isCritical: item.isCritical || false, // Default to false if missing
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
    // ✅ 1. NEW VALIDATION: Block save if any critical value is empty
    if (!dose || !intervalHours || !unit || !startDate || !endDate || !route || !conc || !infusionTime) {
      // Create a specific error message
      const missing = [];
      if (!dose) missing.push("Dose");
      if (!intervalHours) missing.push("Interval");
      if (!startDate) missing.push("Start Date");
      if (!endDate) missing.push("End Date");
      if (!route) missing.push("Route");
      if (!infusionTime) missing.push("Infusion Time");

      setSnackbarMessage(`Missing required fields: ${missing.join(", ")}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);

    // 2. Convert any possible range string to a single number for numeric fields
    const numericDose = parseFloat(String(dose).split('-')[0]) || 0;
    const numericInterval = parseFloat(String(intervalHours).split('-')[0]) || 12;

    // 3. Format Dates as ISO strings for FHIR compatibility
    const isoStart = startDate instanceof Date ? startDate.toISOString() : startDate;
    const isoEnd = endDate instanceof Date ? endDate.toISOString() : endDate;

    // Validation for dates handled above in step 1

    // 4. Calculate total doses correctly
    const start = new Date(isoStart);
    const end = new Date(isoEnd);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const dosesPerDay = Math.max(1, Math.floor(24 / numericInterval));
    const totalDoses = (dosesPerDay * totalDays) + 1;


    // 🛑 NEW: Save Custom Drug / Update Existing Drug with new defaults
    // We update the drug structure with the currently entered values so they become defaults for next time.
    if (selectedDrugData) {
      let updatedDrug = { ...selectedDrugData };

      // Ensure structure exists
      if (!updatedDrug[selectedHeading]) updatedDrug[selectedHeading] = { routes: {} };
      if (!updatedDrug[selectedHeading].routes) updatedDrug[selectedHeading].routes = {};
      if (!updatedDrug[selectedHeading].routes[route]) updatedDrug[selectedHeading].routes[route] = { ranges: [], admin_details: {} };

      const currentRouteData = updatedDrug[selectedHeading].routes[route];

      // 1. Update Admin Details (Infusion, Conc) - keeps existing logic
      currentRouteData.admin_details = {
        ...currentRouteData.admin_details,
        infusion_time: infusionTime,
        infusion_time_unit: infusionTimeUnit,
        concentration_mg_ml: conc,
      };

      // 2. Save DEFAULTS for immediate recall (ignoring patient metrics)
      // These will be used to prefill the form when this route is selected again.
      currentRouteData.defaults = {
        dose: numericDose,
        unit: unit,
        interval: numericInterval,
        interval_unit: intervalUnit,
        infusion_time: infusionTime,
        infusion_time_unit: infusionTimeUnit,
        concentration: conc
      };

      // 3. Save HISTORY for "Recent Options" (Last 3 distinct)
      if (!currentRouteData.history) currentRouteData.history = [];

      const newHistoryItem = {
        dose: numericDose,
        unit: unit,
        interval: numericInterval,
        infusion_time: infusionTime,
        concentration: conc
      };

      // Remove identical existing items to avoid duplicates
      currentRouteData.history = currentRouteData.history.filter((h: any) =>
        !(h.dose === newHistoryItem.dose && h.interval === newHistoryItem.interval && h.concentration === newHistoryItem.concentration)
      );

      // Add new item to front and keep max 3
      currentRouteData.history.unshift(newHistoryItem);
      if (currentRouteData.history.length > 3) currentRouteData.history.pop();


      // If it's a "Custom" drug (created by user), we save it.
      // If it's a standard drug, we save it ONLY IF we added history/defaults (overriding it).
      const hasHistory = currentRouteData.history && currentRouteData.history.length > 0;
      const hasDefaults = !!currentRouteData.defaults;

      if (updatedDrug.isCustom || updatedDrug.fhirId || hasHistory || hasDefaults) {
        // Ensure we flag it as custom so next load picks it up correctly if we are converting standard to custom
        // actually fetchCustomDrugs sets isCustom=true for everything from FHIR.

        const savedId = await saveCustomDrugToFHIR(updatedDrug);
        if (savedId) {
          console.log("Updated/Saved custom drug with ID:", savedId);
          updatedDrug.fhirId = savedId;
          setSelectedDrugData(updatedDrug);

          // 🛑 Robustness: Update local AND re-fetch from server to ensure sync
          setDrugDatabase((prev) => {
            const exists = prev.findIndex(d => d.drug_name === updatedDrug.drug_name);
            if (exists >= 0) {
              const copy = [...prev];
              copy[exists] = updatedDrug;
              return copy;
            } else {
              return [...prev, updatedDrug];
            }
          });

          // Trigger background re-fetch for absolute consistency
          fetchCustomDrugs().then((customDrugs) => {
            // Re-merge logic similar to useEffect
            // We can't easily access neofaxRes here, but we can merge into existing drug_database
            setDrugDatabase(prev => {
              const drugMap = new Map();
              prev.forEach(d => drugMap.set(d.drug_name, d));
              customDrugs.forEach((d: any) => drugMap.set(d.drug_name, d));
              return Array.from(drugMap.values());
            });
          });
        }
      }
    }

    const prescriptionData = {
      resourceType: "MedicationRequest",
      status: "active",
      intent: "order",
      medicationCodeableConcept: { text: selectedDrugName },
      subject: { reference: `Patient/${props.patient_resource_id}`, display: props.patient_name },
      requester: { reference: "Practitioner/12345" },
      reasonCode: selectedHeading ? [{ text: selectedHeading }] : undefined,

      dosageInstruction: [{
        // Full text label for the dashboard display
        text: `${dose} ${unit} every ${intervalHours} ${intervalUnit}`,
        route: {
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/route-of-administration",
            code: route.toLowerCase(),
            display: route, // ✅ Assigned selected route
          }],
        },
        timing: {
          repeat: {
            frequency: dosesPerDay,
            period: 1,
            periodUnit: "d",
            boundsPeriod: { start: isoStart, end: isoEnd }
          }
        },
        doseAndRate: [{
          doseQuantity: {
            value: numericDose, // Clean number for database storage
            unit: unit,
            system: "http://unitsofmeasure.org",
            code: unit
          }
        }]
      }],

      extension: ([
        { url: "http://example.org/fhir/StructureDefinition/totalDoses", valueInteger: totalDoses },
        { url: "http://example.org/fhir/StructureDefinition/administeredCount", valueInteger: 0 },
        { url: "http://example.org/fhir/StructureDefinition/frequencyLabel", valueString: `Q${numericInterval}H` },
        { url: "http://example.org/fhir/StructureDefinition/intervalHours", valueDecimal: numericInterval }, // Fixes "N/A" in verification dialog

        // ✅ FIX: Assign calculated mg amount (e.g. 15 mg) to doseAmount extension
        {
          url: "http://example.org/fhir/StructureDefinition/doseAmount",
          valueQuantity: { value: Number(doseAmount), unit: "mg", system: "http://unitsofmeasure.org", code: "mg" }
        },

        {
          url: "http://example.org/fhir/StructureDefinition/weight",
          valueQuantity: { value: Number(weight), unit: "g", system: "http://unitsofmeasure.org", code: "g" }
        },

        { url: "http://example.org/fhir/StructureDefinition/concentration", valueString: `${conc} ${concUnit}` },
        { url: "http://example.org/fhir/StructureDefinition/infusionTime", valueString: `${infusionTime} ${infusionTimeUnit}` }
      ].filter(ext => ext !== null)) as any[]
    };

    console.log("🚀 ATTEMPTING FHIR SAVE", prescriptionData);

    // 🛑 NEW: Draft Mode Check
    if (props.saveOnConfirm === false) {
      console.log("📝 Draft Mode: Returning prescription data without saving.");
      setOpenPrescribeModal(false);

      if (props.onPrescriptionConfirm) {
        props.onPrescriptionConfirm({
          drug: selectedDrugName,
          dose: `${doseAmount} mg`,
          frequency: `Q${numericInterval}H`,
          route: route,
          pendingPrescriptionData: prescriptionData // Pass the full FHIR object back
        });
      }
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + btoa("fhiruser:change-password")
        },
        body: JSON.stringify(prescriptionData),
      });

      if (response.ok) {
        setOpenPrescribeModal(false);
        setSnackbarMessage("Prescription saved successfully!");
        setSnackbarSeverity("success");
        fetchPrescription(); // Refresh the website dashboard

        // Notify parent component (e.g., Treatment.tsx) of the new prescription
        if (props.onPrescriptionConfirm) {
          props.onPrescriptionConfirm({
            drug: selectedDrugName,
            dose: `${doseAmount} mg`,
            frequency: `Q${numericInterval}H`,
            route: route,
          });
        }
      } else {
        const errorBody = await response.text();
        console.error("❌ FHIR ERROR:", errorBody);
        throw new Error(`Request failed: ${response.statusText}`);
      }
    } catch (error) {
      setSnackbarMessage("Save failed. Check console for details.");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const calculateDuration = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to format ranges [12, 15] -> "12-15"
  const formatClinicalValue = (val: any) => {
    if (val === null || val === undefined || val === "" || val === "Not Present") return "";
    if (Array.isArray(val)) return `${val[0]}-${val[1]}`;
    return val.toString();
  };

  // Helper: Calculate PNA in total days from DOB
  const calculatePnaDays = () => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper: Calculate PMA (Correctly handling day overflow)
  const calculatePmaWeeks = () => {
    const totalGaDays = (Number(gaWeeks) * 7) + Number(gaDays);
    const totalPnaDays = calculatePnaDays();
    const totalPmaDays = totalGaDays + totalPnaDays;
    return Math.floor(totalPmaDays / 7);
  };

  // Updated Filtering Logic
  const isRangeValid = (range: any) => {
    if (!range.conditions || range.conditions.length === 0) return true;

    // Convert all patient metrics to Numbers for comparison
    const patientMetrics: Record<string, number> = {
      pna_days: calculatePnaDays(),
      ga_weeks: Number(gaWeeks),
      // PMA overflow logic: (Total GA Days + Total PNA Days) / 7
      pma_weeks: Math.floor(((Number(gaWeeks) * 7) + Number(gaDays) + calculatePnaDays()) / 7),
      weight_g: Number(weight)
    };

    return range.conditions.every((cond: any) => {
      const val = patientMetrics[cond.type];
      if (val === undefined || isNaN(val)) return false;
      const [min, max] = cond.range;
      return val >= min && val <= max;
    });
  };

  // Define these styles to fix the "can't find name" errors
  const inputStyles = {
    "& .MuiInputLabel-root": { color: "#64748B", fontWeight: 500 },
    "& .MuiInputLabel-root.Mui-focused": { color: "#3B82F6" },
    "& .MuiOutlinedInput-root": {
      bgcolor: "#F8FAFC",
      "& fieldset": { borderColor: "#E2E8F0", borderWidth: 1.5 },
      "&:hover fieldset": { borderColor: "#3B82F6" },
      "&.Mui-focused fieldset": { borderColor: "#3B82F6", borderWidth: 2 }
    },
    "& .MuiInputBase-input": { color: "#1E293B", fontWeight: 500 }
  };

  // const selectStyles = {
  //   bgcolor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
  //   borderRadius: 2,
  //   color: isDarkMode ? theme.palette.text.primary : "#334155",
  //   fontSize: "0.95rem",
  //   "& .MuiOutlinedInput-notchedOutline": { borderColor: isDarkMode ? theme.palette.divider : "#E2E8F0", borderWidth: 1.5 },
  //   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#3B82F6" },
  //   "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3B82F6", borderWidth: 2 },
  //   "& .MuiSelect-select": { padding: "12px 14px" }
  // };

  const primaryButtonStyles = {
    bgcolor: "#3B82F6",
    color: "#FFFFFF",
    fontWeight: 600,
    px: 3,
    py: 1.25,
    borderRadius: 2,
    textTransform: "none",
    fontSize: "0.95rem",
    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.25)",
    "&:hover": { bgcolor: "#2563EB", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.35)" },
    "&:disabled": { bgcolor: "#CBD5E1", color: "#94A3B8" }
  };

  const cancelButtonStyles = {
    borderColor: "#CBD5E1",
    color: "#475569",
    fontWeight: 600,
    px: 3,
    py: 1.25,
    borderRadius: 2,
    textTransform: "none",
    fontSize: "0.95rem",
    borderWidth: 1.5,
    "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC", borderWidth: 1.5 }
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
      console.log("MedicationRequest Extensions:", extensions);

      let totalDoses = extensions.find(
        (ext: any) =>
          ext.url ===
          "http://example.org/fhir/StructureDefinition/totalDoses"
      )?.valueInteger;

      const administeredCount = extensions.find(
        (ext: any) =>
          ext.url ===
          "http://example.org/fhir/StructureDefinition/administeredCount"
      )?.valueInteger ?? 0; // Default to 0 if missing

      // 🛡️ Robust Fallback for totalDoses
      if (totalDoses === undefined) {
        console.warn("Total doses missing, attempting fallback calculation.");
        const instr = medicationRequest.dosageInstruction?.[0];
        const repeat = instr?.timing?.repeat;
        if (repeat?.boundsPeriod?.start && repeat?.boundsPeriod?.end) {
          const start = new Date(repeat.boundsPeriod.start);
          const end = new Date(repeat.boundsPeriod.end);
          const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

          // Estimate doses based on frequency or period
          const freq = repeat.frequency || 1;
          const period = repeat.period || 1;
          const periodUnit = repeat.periodUnit || 'd';
          let dosesPerDay = freq;
          if (periodUnit === 'h') dosesPerDay = 24 / period;

          totalDoses = Math.floor(dosesPerDay * diffDays) + 1;
        } else {
          totalDoses = 1; // Minimum fallback
        }
        console.log("Calculated fallback totalDoses:", totalDoses);
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

      // 6️⃣ Update MedicationRequest with all extensions (merging existing and updates)
      const existingExtensions = medicationRequest.extension || [];
      const updatedExtensions = [
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
      ];

      // Merge: Keep existing extensions that are NOT being updated now
      const finalExtensions = [
        ...existingExtensions.filter((oldExt: any) =>
          !updatedExtensions.some((newExt: any) => newExt.url === oldExt.url)
        ),
        ...updatedExtensions
      ];

      const updatedRequest = {
        ...medicationRequest,
        extension: finalExtensions,
        status,
      };

      console.log("🚀 UPDATING MedicationRequest (Merged Extensions):", updatedRequest);

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
        // fetchAdminister();
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
    // fetchAdminister(); 
    //Fetch Procedure on component mount or when `patient_resource_id` changes
  }, [props.patient_resource_id]);


  return (

    <Box sx={{ borderRadius: "25px" }}>

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
              backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
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
              color: isDarkMode ? theme.palette.text.primary : "#0F3B61",
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
                color: isDarkMode ? theme.palette.text.secondary : "#0F3B61",
                "&:hover": { backgroundColor: isDarkMode ? theme.palette.action.hover : "#F2F2F2" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>



          <DialogContent dividers sx={{ padding: 0, maxHeight: "80vh", overflowY: "auto", bgcolor: isDarkMode ? theme.palette.background.default : "#F8FAFB" }}>
            <Box sx={{ padding: 4 }}>

              <Stack spacing={4}>

                {/* ✅ PATIENT INFO HEADER */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF", border: `1px solid ${isDarkMode ? theme.palette.divider : "#E5E7EB"}`, borderRadius: "12px", padding: "12px 24px", boxShadow: "0px 1px 3px rgba(0,0,0,0.05)" }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "15px", color: "#374151" }}>
                    GA: <span style={{ fontWeight: 400 }}>{gaWeeks || "--"} W {gaDays || "0"} D</span>
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: "15px", color: "#374151" }}>
                    PMA: <span style={{ fontWeight: 400 }}>{dob && gaWeeks ? calculatePmaWeeks() : "--"} Weeks</span>
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ fontWeight: 600, fontSize: "15px", color: "#374151" }}>
                      Wt: <span style={{ fontWeight: 400 }}>{weight ? (Number(weight) / 1000).toFixed(2) : "--"} Kg</span>
                    </Typography>
                    <IconButton size="small" onClick={() => setShowDetails(!showDetails)} sx={{ color: "#228BE6", backgroundColor: "#E7F5FF", '&:hover': { backgroundColor: "#D0EBFF" } }}>
                      <EditIcon sx={{ fontSize: "16px" }} />
                    </IconButton>
                  </Stack>
                </Box>

                {/* 🔽 EXPANDABLE EDIT SECTION */}
                {showDetails && (
                  <Box sx={{ p: 3, borderRadius: 3, bgcolor: "#F8FAFC", border: "1px dashed #CBD5E1" }}>
                    <Typography variant="subtitle2" sx={{ color: "#64748B", fontWeight: 700, mb: 2, textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.5px" }}>Editing Metrics Manually</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={4}><TextField label="Date of Birth" type="date" fullWidth value={dob ? dob.toISOString().split('T')[0] : ''} onChange={(e) => { const val = e.target.value; setDob(val ? new Date(val) : null); }} InputLabelProps={{ shrink: true }} sx={inputStyles} /></Grid>
                      <Grid item xs={2.5}><TextField label="GA (Weeks)" fullWidth value={gaWeeks} onChange={(e) => setGaWeeks(e.target.value)} placeholder="Wk" sx={inputStyles} /></Grid>
                      <Grid item xs={1.5}><TextField label="Days" fullWidth value={gaDays} onChange={(e) => setGaDays(e.target.value)} placeholder="D" sx={inputStyles} /></Grid>
                      <Grid item xs={4}><TextField label="Weight (grams)" fullWidth value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 2500" sx={inputStyles} InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }} /></Grid>
                    </Grid>
                  </Box>
                )}

                {/* 🔹 STEP 1: DRUG NAME SELECTION */}
                <Box>
                  <Typography variant="subtitle1" sx={{ color: "#1E293B", fontWeight: 600, marginBottom: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", bgcolor: "#3B82F6", color: "white", fontSize: "0.75rem", fontWeight: 700 }}>1</Box>
                    Select Drug <Box component="span" sx={{ color: "#EF4444", ml: 0.5 }}>*</Box>
                  </Typography>
                  <Autocomplete
                    freeSolo
                    options={drug_database}
                    getOptionLabel={(option) => (typeof option === "string" ? option : option.drug_name || "")}
                    value={selectedDrugData}
                    onChange={(_event, newValue: any) => {
                      let data = newValue;
                      // 🛑 Fix: Disable "Enter" key for adding new, BUT allow selecting existing by typing exact name
                      if (typeof newValue === "string") {
                        const match = drug_database.find((d) => d.drug_name.toLowerCase() === newValue.toLowerCase());
                        if (match) {
                          data = match;
                        } else {
                          return; // Ignore new strings (force usage of "Add" option)
                        }
                      }

                      // Handle "Add new" (from filterOptions)
                      if (newValue && newValue.inputValue) {
                        data = {
                          drug_name: newValue.inputValue,
                          isCustom: true,
                        };
                      }


                      setSelectedDrugData(data);
                      setSelectedDrugName(data?.drug_name || "");
                      setSelectedHeading("");
                      setAvailableRoutes([]);
                      setRoute("");

                      // 🔹 Reset Form State
                      setDose("");
                      setDoseAmount("");
                      setFrequency("");
                      setIntervalHours("");
                      setInfusionTime("");
                      setConc("");
                      setUnit("mg/kg/dose");
                      setIntervalUnit("hrs");
                      setInfusionTimeUnit("minutes"); // Reset to default when changing drug
                      setSelectedRegimenOption(null);

                      // 🔹 Reset Warnings
                      setDoseWarning(null);
                      setInfusionWarning(null);
                      setConcWarning(null);
                      setIntervalWarning(null);
                    }}
                    filterOptions={(options: any[], params) => {
                      const filtered = filter(options, params);
                      const { inputValue } = params;
                      // Suggest the creation of a new value
                      if (inputValue !== '' && !options.some((option) => option.drug_name === inputValue)) {
                        filtered.push({
                          inputValue,
                          drug_name: `Add "${inputValue}"`,
                          isAddNew: true
                        });
                      }
                      return filtered;
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="Search drug name or type new..." fullWidth sx={inputStyles} />}
                    PaperComponent={(props) => (
                      <Paper {...props} sx={{ bgcolor: "#FFFFFF", color: "#1E293B" }} />
                    )}
                  />
                </Box>

                {/* 🔹 STEP 2: DRUG USE (HEADING) SELECTION */}
                {selectedDrugData && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: "#1E293B", fontWeight: 600, marginBottom: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", bgcolor: "#3B82F6", color: "white", fontSize: "0.75rem", fontWeight: 700 }}>2</Box>
                      Select Indication (Drug Use) <Box component="span" sx={{ color: "#EF4444", ml: 0.5 }}>*</Box>
                    </Typography>
                    <Autocomplete
                      freeSolo
                      options={selectedDrugData ? Object.keys(selectedDrugData).filter((key) => typeof selectedDrugData[key] === "object" && selectedDrugData[key].routes) : []}
                      value={selectedHeading}
                      onChange={(_event, newValue: any) => {
                        let val = "";
                        // 🛑 Fix: Only allow string if it exists in options
                        const opts = selectedDrugData ? Object.keys(selectedDrugData).filter((key) => typeof selectedDrugData[key] === "object" && selectedDrugData[key].routes) : [];

                        if (typeof newValue === "string") {
                          if (!opts.includes(newValue)) return; // Ignore Enter on new value
                          val = newValue;
                        } else if (newValue && newValue.inputValue) {
                          val = newValue.inputValue;
                        } else if (newValue) {
                          val = newValue; // Should be string from options keys
                        }

                        setSelectedHeading(val);
                        setRoute("");

                        // If new indication, we need to ensure structure exists
                        if (selectedDrugData && val && !selectedDrugData[val]) {
                          setSelectedDrugData({
                            ...selectedDrugData,
                            [val]: { routes: {} }
                          });
                        }
                      }}
                      filterOptions={(options: any[], params) => {
                        const filtered = filter(options, params);
                        const { inputValue } = params;
                        // Suggest the creation of a new value
                        if (inputValue !== '' && !options.includes(inputValue)) {
                          filtered.push({
                            inputValue,
                            title: `Add "${inputValue}"`
                          });
                        }
                        return filtered;
                      }}
                      getOptionLabel={(option: any) => {
                        // Value selected with enter, right from the input
                        if (typeof option === 'string') {
                          return option;
                        }
                        // Add "xxx" option created dynamically
                        if (option.inputValue) {
                          return option.inputValue;
                        }
                        // Regular option
                        return option.title || option;
                      }}
                      renderInput={(params) => <TextField {...params} placeholder="e.g. Sepsis, Meningitis..." fullWidth sx={inputStyles} />}
                      PaperComponent={(props) => (
                        <Paper {...props} sx={{ bgcolor: "#FFFFFF", color: "#1E293B" }} />
                      )}
                    />
                  </Box>
                )}

                {/* 🔹 STEP 3: ROUTE SELECTION */}
                {selectedHeading && selectedDrugData && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: "#1E293B", fontWeight: 600, marginBottom: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", bgcolor: "#3B82F6", color: "white", fontSize: "0.75rem", fontWeight: 700 }}>3</Box>
                      Select Route <Box component="span" sx={{ color: "#EF4444", ml: 0.5 }}>*</Box>
                    </Typography>
                    <FormControl fullWidth>
                      <Autocomplete
                        freeSolo
                        options={selectedDrugData && selectedHeading && selectedDrugData[selectedHeading]?.routes ? Object.keys(selectedDrugData[selectedHeading].routes) : []}
                        value={route}
                        onChange={(_event, newValue: any) => {
                          let newRoute = "";
                          const opts = selectedDrugData && selectedHeading && selectedDrugData[selectedHeading]?.routes ? Object.keys(selectedDrugData[selectedHeading].routes) : [];

                          if (typeof newValue === "string") {
                            if (!opts.includes(newValue)) return; // Ignore Enter on new
                            newRoute = newValue;
                          } else if (newValue && newValue.inputValue) {
                            newRoute = newValue.inputValue;
                          } else if (newValue) {
                            newRoute = newValue;
                          }

                          setRoute(newRoute);

                          // If existing route, populate defaults (existing logic)
                          if (selectedDrugData && selectedHeading && newRoute) {
                            const routeData = selectedDrugData[selectedHeading]?.routes?.[newRoute];
                            const adminDetails = routeData?.admin_details;

                            // 1. Prefill Admin Details (Infusion/Conc)
                            if (adminDetails) {
                              if (adminDetails.infusion_time_unit) setInfusionTimeUnit(adminDetails.infusion_time_unit);
                              else setInfusionTimeUnit("minutes");
                            }

                            // 2. 🛑 NEW: Prefill DEFAULTS (Dose, Interval, etc.)
                            // Prioritize these over patient-metric calculated options
                            if (routeData?.defaults) {
                              const d = routeData.defaults;
                              if (d.dose) setDose(d.dose);
                              if (d.unit) setUnit(d.unit);
                              if (d.interval) setIntervalHours(d.interval);
                              if (d.interval_unit) setIntervalUnit(d.interval_unit);
                              if (d.infusion_time) setInfusionTime(d.infusion_time);
                              if (d.infusion_time_unit) setInfusionTimeUnit(d.infusion_time_unit);
                              if (d.concentration) setConc(d.concentration);
                            }

                            // If it's a NEW route, we ensure state structure exists
                            if (!selectedDrugData[selectedHeading]?.routes?.[newRoute]) {
                              setSelectedDrugData({
                                ...selectedDrugData,
                                [selectedHeading]: {
                                  ...selectedDrugData[selectedHeading],
                                  routes: {
                                    ...selectedDrugData[selectedHeading]?.routes,
                                    [newRoute]: {
                                      ranges: [],
                                      admin_details: {
                                        infusion_time: "",
                                        concentration_mg_ml: "",
                                        notes: ""
                                      }
                                    }
                                  }
                                }
                              });
                            }
                          }
                        }}
                        filterOptions={(options: any[], params) => {
                          const filtered = filter(options, params);
                          const { inputValue } = params;
                          if (inputValue !== '' && !options.includes(inputValue)) {
                            filtered.push({
                              inputValue,
                              title: `Add "${inputValue}"`
                            });
                          }
                          return filtered;
                        }}
                        getOptionLabel={(option: any) => {
                          if (typeof option === 'string') return option;
                          if (option.inputValue) return option.inputValue;
                          return option.title || option;
                        }}
                        renderInput={(params) => <TextField {...params} label="Select Route" placeholder="IV, IM, PO..." fullWidth sx={inputStyles} />}
                        PaperComponent={(props) => (
                          <Paper {...props} sx={{ bgcolor: "#FFFFFF", color: "#1E293B" }} />
                        )}
                      />
                    </FormControl>
                  </Box>
                )}

                {/* 🔹 REGIMEN OPTIONS OR HISTORY */}
                {route && (
                  <Box sx={{ mt: 2 }}>
                    {/* Check for History first */}
                    {(selectedDrugData[selectedHeading]?.routes?.[route]?.history?.length > 0) ? (
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: "#64748B", fontWeight: 700, mb: 1, textTransform: "uppercase", fontSize: "12px" }}>
                          Recent Prescriptions
                        </Typography>
                        <Stack spacing={2}>
                          {selectedDrugData[selectedHeading].routes[route].history.map((hist: any, idx: number) => {
                            const isSelected = String(dose) === String(hist.dose) && String(intervalHours) === String(hist.interval);
                            return (
                              <Paper
                                key={idx}
                                elevation={0}
                                onClick={() => {
                                  setDose(hist.dose);
                                  setUnit(hist.unit);
                                  setIntervalHours(hist.interval);
                                  setInfusionTime(hist.infusion_time);
                                  setConc(hist.concentration);
                                }}
                                sx={{
                                  p: 2, borderRadius: 2, cursor: "pointer", border: "1px solid",
                                  borderColor: isSelected ? "#3B82F6" : "#E2E8F0",
                                  backgroundColor: isSelected ? "#F0F9FF" : "#FFFFFF",
                                  color: isSelected ? "#1E40AF" : "#334155",
                                  transition: "all 0.2s ease",
                                  mb: 1
                                }}
                              >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#E2E8F0" }}>
                                    History {idx + 1}
                                  </Typography>
                                  {isSelected && <Chip label="Selected" size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />}
                                </Box>

                                <Stack spacing={1} sx={{ mt: 1 }}>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600, minWidth: 80 }}>Dose:</Typography>
                                    <Typography variant="caption" sx={{ color: "#0284C7", fontWeight: 700 }}>
                                      {hist.dose} {hist.unit}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600, minWidth: 80 }}>Interval:</Typography>
                                    <Typography variant="caption" sx={{ color: "#0F172A" }}>
                                      {hist.interval} hours
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Paper>
                            );
                          })}
                        </Stack>
                      </Box>
                    ) : availableOptions.filter(isRangeValid).length === 0 ? (
                      <Box sx={{ p: 3, textAlign: 'center', bgcolor: "#F8FAFC", borderRadius: 3, border: "1px dashed #E2E8F0" }}>
                        <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
                          No regimens found matching these patient metrics.
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          Please enter values manually below.
                        </Typography>
                      </Box>
                    ) : availableOptions.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: "#64748B", fontWeight: 700, mb: 1, textTransform: "uppercase", fontSize: "12px" }}>
                          Recommended Options
                        </Typography>
                        <Stack spacing={2}>
                          {availableOptions.map((opt, idx) => {
                            const isSelected = String(dose) === String(opt.dose) && String(intervalHours) === String(opt.interval_hours);
                            return (
                              <Paper
                                key={idx}
                                elevation={0}
                                onClick={() => handleRegimenSelect(opt)}
                                sx={{
                                  p: 2, borderRadius: 2, cursor: "pointer", border: "1px solid",
                                  borderColor: isSelected ? "#3B82F6" : "#E2E8F0",
                                  backgroundColor: isSelected ? "#F0F9FF" : "#FFFFFF", // Light Theme
                                  color: isSelected ? "#1E40AF" : "#334155",
                                  transition: "all 0.2s ease",
                                  mb: 1
                                }}
                              >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#E2E8F0" }}>
                                    Option {idx + 1}
                                  </Typography>
                                  {isSelected && <Chip label="Selected" size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />}
                                </Box>

                                <Stack spacing={1} sx={{ mt: 1 }}>
                                  {/* Conditions */}
                                  {(opt.weight_range_kg || opt.pna_range) && (
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                      <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600, minWidth: 80 }}>Conditions:</Typography>
                                      <Typography variant="caption" sx={{ color: "#0F172A" }}>
                                        {opt.weight_range_kg ? `Weight: ${opt.weight_range_kg.min}-${opt.weight_range_kg.max}kg` : ""}
                                        {opt.pna_range ? `, PNA: ${opt.pna_range.min}-${opt.pna_range.max}d` : ""}
                                      </Typography>
                                    </Box>
                                  )}

                                  {/* Dose */}
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600, minWidth: 80 }}>Dose:</Typography>
                                    <Typography variant="caption" sx={{ color: "#0284C7", fontWeight: 700 }}>
                                      {opt.dose} {opt.unit}
                                    </Typography>
                                  </Box>

                                  {/* Max Dose */}
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600, minWidth: 80 }}>Max Dose:</Typography>
                                    <Typography variant="caption" sx={{ color: "#0F172A" }}>
                                      {opt.max_dose ? `${opt.max_dose} ${opt.unit}` : "Not Present"}
                                    </Typography>
                                  </Box>

                                  {/* Interval */}
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600, minWidth: 80 }}>Interval:</Typography>
                                    <Typography variant="caption" sx={{ color: "#0F172A" }}>
                                      {opt.interval_hours} hours
                                    </Typography>
                                  </Box>

                                  {/* Duration */}
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600, minWidth: 80 }}>Duration:</Typography>
                                    <Typography variant="caption" sx={{ color: "#0F172A" }}>
                                      {opt.duration ? opt.duration : "Not Present"}
                                    </Typography>
                                  </Box>

                                  {/* Notes */}
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600, minWidth: 80 }}>Notes:</Typography>
                                    <Typography variant="caption" sx={{ color: "#0F172A" }}>
                                      {opt.notes || "Not Present"}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Paper>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                )}

                {/* 🔹 PRESCRIPTION DETAILS FORM (Visible if Route is Selected) */}
                {selectedDrugData && selectedHeading && route && (
                  <Box>
                    <Box sx={{ my: 3, p: 3, borderRadius: 3, bgcolor: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
                      <Typography variant="h6" sx={{ color: "#1E293B", fontWeight: 700, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <Box sx={{ fontSize: "1.5rem" }}>📋</Box> Drug Details Summary
                      </Typography>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#EFF6FF", border: "1px solid #DBEAFE", mb: 2.5 }}>
                        <Typography variant="body1" sx={{ color: "#1E40AF", fontWeight: 700 }}>{selectedDrugData.drug_name} - {selectedHeading} ({route})</Typography>
                      </Box>
                      <Stack spacing={1.5}>
                        {selectedDrugData[selectedHeading]?.routes?.[route]?.admin_details?.infusion_time && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600, minWidth: 130 }}>Infusion Time:</Typography>
                            <Typography variant="body2" sx={{ color: "#334155" }}>
                              {`${formatClinicalValue(selectedDrugData[selectedHeading].routes[route].admin_details.infusion_time)} ${selectedDrugData[selectedHeading].routes[route].admin_details.infusion_time_unit || "minutes"}`}
                            </Typography>
                          </Box>
                        )}
                        {selectedDrugData[selectedHeading]?.routes?.[route]?.admin_details?.concentration_mg_ml && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600, minWidth: 130 }}>Concentration:</Typography>
                            <Typography variant="body2" sx={{ color: "#334155" }}>
                              {`${formatClinicalValue(selectedDrugData[selectedHeading].routes[route].admin_details.concentration_mg_ml)} mg/mL`}
                            </Typography>
                          </Box>
                        )}
                        {selectedDrugData[selectedHeading]?.routes?.[route]?.admin_details?.notes && (
                          <Box sx={{ mt: 1, p: 2, bgcolor: "#FEF3C7", borderRadius: 2, border: "1px solid #FDE68A" }}>
                            <Typography variant="body2" sx={{ color: "#92400E", fontSize: "0.875rem", lineHeight: 1.6 }}><strong>Admin Notes:</strong> {selectedDrugData[selectedHeading].routes[route].admin_details.notes}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>

                    {/* 📅 Prescription Period Inputs */}
                    <Box sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                      <Typography variant="subtitle2" sx={{ color: "#64748B", fontWeight: 700, mb: 2 }}>
                        Prescription Period
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={4}>
                            <DateTimePicker
                              label="Start Date & Time"
                              value={startDate}
                              onChange={handleStartDateChange}
                              slotProps={{
                                textField: { fullWidth: true, sx: inputStyles },
                                openPickerButton: { sx: { color: '#64748B' } }
                              }}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              label="Duration (Days)"
                              fullWidth
                              type="number"
                              value={durationDays}
                              onChange={handleDurationChange}
                              sx={inputStyles}
                              placeholder="e.g. 3"
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <DateTimePicker
                              label="End Date & Time"
                              value={endDate}
                              onChange={handleEndDateChange}
                              slotProps={{
                                textField: { fullWidth: true, sx: inputStyles },
                                openPickerButton: { sx: { color: '#64748B' } }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </LocalizationProvider>
                    </Box>

                    {/* 💊 Final Prescription Values - Editable */}
                    <Box sx={{ p: 3.5, borderRadius: 3, border: "2px solid #3B82F6", bgcolor: "#FFFFFF", boxShadow: "0 4px 16px rgba(59, 130, 246, 0.12)" }}>
                      <Typography variant="h6" sx={{ color: "#1E293B", mb: 6, fontWeight: 700, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{ fontSize: "1.5rem" }}>💊</Box> Final Prescription Values
                      </Typography>
                      <Grid container spacing={4}>
                        {/* DOSE & UNIT */}
                        {/* DOSE & UNIT */}
                        <Grid item xs={8}>
                          <TextField
                            label="Final Dose"
                            fullWidth
                            value={dose}
                            onChange={(e) => setDose(e.target.value)}
                            sx={inputStyles}
                            error={!!doseWarning}
                            helperText={doseWarning}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Autocomplete
                            freeSolo
                            options={doseUnitOptions}
                            value={unit}
                            onChange={(_event, newValue) => {
                              const val = typeof newValue === 'string' ? newValue : newValue || "";
                              setUnit(val);
                              saveUnit(val, 'dose');
                            }}
                            onInputChange={(_event, newInputValue) => setUnit(newInputValue)}
                            onBlur={() => saveUnit(unit, 'dose')}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Unit"
                                variant="outlined"
                                sx={inputStyles}
                              />
                            )}
                          />
                        </Grid>

                        {/* INTERVAL & UNIT */}
                        <Grid item xs={8}>
                          <TextField
                            label="Interval (hours)"
                            fullWidth
                            value={intervalHours}
                            onChange={(e) => setIntervalHours(e.target.value)}
                            sx={inputStyles}
                            error={!!intervalWarning}
                            helperText={intervalWarning}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Autocomplete
                            freeSolo
                            options={intervalUnitOptions}
                            value={intervalUnit}
                            onChange={(_event, newValue) => {
                              const val = typeof newValue === 'string' ? newValue : newValue || "";
                              setIntervalUnit(val);
                              saveUnit(val, 'interval');
                            }}
                            onInputChange={(_event, newInputValue) => setIntervalUnit(newInputValue)}
                            onBlur={() => saveUnit(intervalUnit, 'interval')}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Unit"
                                variant="outlined"
                                sx={inputStyles}
                              />
                            )}
                          />
                        </Grid>

                        {/* INFUSION TIME & UNIT */}
                        <Grid item xs={8}>
                          <TextField
                            label="Infusion Time"
                            fullWidth
                            value={infusionTime}
                            onChange={(e) => setInfusionTime(e.target.value)}
                            sx={inputStyles}
                            error={!!infusionWarning}
                            helperText={infusionWarning}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Autocomplete
                            freeSolo
                            options={infusionUnitOptions}
                            value={infusionTimeUnit}
                            onChange={(_event, newValue) => {
                              const val = typeof newValue === 'string' ? newValue : newValue || "";
                              setInfusionTimeUnit(val);
                              saveUnit(val, 'infusion');
                            }}
                            onInputChange={(_event, newInputValue) => setInfusionTimeUnit(newInputValue)}
                            onBlur={() => saveUnit(infusionTimeUnit, 'infusion')}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Unit"
                                variant="outlined"
                                sx={inputStyles}
                              />
                            )}
                          />
                        </Grid>

                        {/* CONCENTRATION & UNIT */}
                        <Grid item xs={8}>
                          <TextField
                            label="Concentration"
                            fullWidth
                            value={conc}
                            onChange={(e) => setConc(e.target.value)}
                            sx={inputStyles}
                            error={!!concWarning}
                            helperText={concWarning}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Autocomplete
                            freeSolo
                            options={concUnitOptions}
                            value={concUnit}
                            onChange={(_event, newValue) => {
                              const val = typeof newValue === 'string' ? newValue : newValue || "";
                              setConcUnit(val);
                              saveUnit(val, 'conc');
                            }}
                            onInputChange={(_event, newInputValue) => setConcUnit(newInputValue)}
                            onBlur={() => saveUnit(concUnit, 'conc')}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Unit"
                                variant="outlined"
                                sx={inputStyles}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}

                {/* Action Buttons MOVED to DialogActions */}

              </Stack>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: "1px solid #E2E8F0", bgcolor: "#F8FAFB" }}>
            <Button
              variant="outlined"
              onClick={() => { setOpenPrescribeModal(false); }}
              sx={cancelButtonStyles}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              disabled={!selectedDrugData || !route || !dose}
              onClick={handlePrescribe}
              sx={primaryButtonStyles}
            >
              Confirm
            </Button>
          </DialogActions>





        </Dialog >

      </ProtectedModule >
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

            {/* 🔹 Right: Dynamic Search and Sort */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {sortBy === "name" && (
                <TextField
                  size="small"
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#228BE6" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "25px",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .MuiOutlinedInput-root": { borderRadius: "25px", px: 1.5 },
                    minWidth: 250
                  }}
                />
              )}

              {sortBy === "status" && (
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                  <Select
                    value={statusSearch}
                    onChange={(e) => setStatusSearch(e.target.value)}
                    sx={{
                      borderRadius: "25px",
                      backgroundColor: "#FFFFFF",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      px: 1.5,
                      color: "#124D81",
                      "& .MuiSelect-icon": { color: "#228BE6" },
                      boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Missed">Missed</MenuItem>
                    <MenuItem value="Upcoming">Upcoming</MenuItem>
                    <MenuItem value="Ongoing">Ongoing</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              )}

              {sortBy === "time" && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DateTimePicker
                      label="Start"
                      value={timeSearchStart}
                      onChange={(newValue) => setTimeSearchStart(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            backgroundColor: "#FFFFFF",
                            borderRadius: "25px",
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            "& .MuiOutlinedInput-root": { borderRadius: "25px", px: 1.5 },
                            minWidth: 180,
                            boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
                          }
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700 }}>TO</Typography>
                    <DateTimePicker
                      label="End"
                      value={timeSearchEnd}
                      onChange={(newValue) => setTimeSearchEnd(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            backgroundColor: "#FFFFFF",
                            borderRadius: "25px",
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            "& .MuiOutlinedInput-root": { borderRadius: "25px", px: 1.5 },
                            minWidth: 180,
                            boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
                          }
                        }
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              )}

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
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="time">Time</MenuItem>
                </Select>
              </FormControl>
            </Box>
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
              (finalMedications as MedicationItem[]).map((medication: MedicationItem, index) => {

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

                    {/* 🧪 Updated Dose & Route Column logic */}
                    <Typography sx={{ color: "#495057" }}>
                      {/* Priority 1: Use calculated absolute dose (mg) from extensions */}
                      {medication.doseAmount
                        ? `${medication.doseAmount} mg`
                        : (medication.dose && medication.dose !== "N/A" && medication.weight)
                          ? /* Priority 2: Calculate mg on-the-fly using weight */
                          `${(Number(medication.dose) * (Number(medication.weight) / 1000)).toFixed(2)} mg`
                          : /* Priority 3: Fallback to the frequency text (e.g. "12.5 mg/kg every 12 hrs") */
                          medication.frequency1 || "N/A"}
                      {" "}
                      {medication.route && medication.route !== "N/A" && `(${medication.route})`}
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
                    <strong>Dose Amount:</strong> {selectedMedication.doseAmount ? `${Number(selectedMedication.doseAmount).toFixed(2)} mg` : "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                    <strong>Interval:</strong> {selectedMedication.intervalHours ? `${selectedMedication.intervalHours} hrs` : "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                    <strong>Infusion Time:</strong> {selectedMedication.infusionTime || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#A7B3CD" }}>
                    <strong>Concentration:</strong> {selectedMedication.concentration || "N/A"}
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
                  width: "100%",
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
                        <b>Adm. Over:</b> {selectedMedication?.infusionTime || "—"}
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
              {step === 5 ? "Finish" : "Proceed"}
            </Button>
          </Box>
        </Dialog>

      </ProtectedModule>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box >

  );
};



