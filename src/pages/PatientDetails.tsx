import { Box, Typography, Stack, IconButton, useTheme } from "@mui/material";
import { SidebarOg } from '../components/SidebarOg';

import { FC, useState, useEffect, useCallback, SetStateAction } from "react";
import { PrescriptionScreen } from '../components/PrescriptionScreen';
import { PatientOverview } from "../components/PatientOverview";
import { FeedsScreen } from "../components/FeedsScreen";
import { AssessmentScoring } from "../components/AssesmentScoring";
import { useLocation } from "react-router-dom";
import { Trends1 } from "../components/Trends";
import { Notes } from "../components/Notes";
import { Treatment } from "../components/Treatment";
import { Assessments } from "../components/Assessments";
import { Dashboard } from '../components/Dashboard';
import { ConsentForms } from '../components/ConsentForm';
import { GrowthChart } from '../components/GrowthChart';
import { usePermissions } from '../contexts/PermissionContext';
import { ProtectedModule } from '../components/ProtectedModule'; // ADD THIS IMPORT

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // Added
import { useNavigate } from "react-router-dom";
// Removed ChildCareIcon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBaby } from "@fortawesome/free-solid-svg-icons";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
// BedIcon removed - not used
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SearchIcon from '@mui/icons-material/Search'; // Added
import { Menu, MenuItem, TextField, InputAdornment } from "@mui/material"; // Added components
import { VentiChart } from "../components/VentiChart";
import { Notifications } from "./Notifications";
export interface PatientDetails {
  newData: boolean;
  key: string;
  patient_id: string;
  gestational_age: string;
  birthDate: string;
  gender: string;
  device: {
    "resourceType": string;
    "id": string;
    "meta": {
      "versionId": string;
      "lastUpdated": string;
    };
    "status": string;
    "patient": {
      "reference": string
    };
    "location": {
      "reference": string
    };
    "identifier":
    {
      "system": string;
      "value": string;
    }[];

  }[];
  patient_resource_id: string;
  observation_resource: {
    "resourceType": string;
    "id": string;
    "meta": {
      "versionId": string;
      "lastUpdated": string;
    },
    "identifier":
    {
      "value": string;
    }[];
    "status": string;
    "category":
    {
      "coding":
      {
        "system": string;
        "code": string;
        "display": string;
      }[];
    }[];
    "code": {
      "coding":
      {
        "system": string;
        "code": string;
        "display": string;
      }[];

      "text": string;
    };
    "subject": {
      "reference": string;
    };
    "device": {
      "reference": string;
    };
    "component":
    {
      "code": {
        "coding":
        {
          "system": string;
          "code": string;
          "display": string;
        }[];
        "text": string;
      };
      "valueQuantity": {
        "value": number;
        "unit": string;
        "system": string;
        "code": string;
      };
    }[];
  }[];
  communication_resource: {
    meta: any;
    "id": string;
    "status": string;
    "resourceType": string;
    "sent": string;
    "category": {
      "coding": {
        "system": string;
        "code": string;
      }[];
      "text": string;
    }[];
    "subject": {
      "reference": string;
    };
    "sender": {
      "reference": string;
    };
    "payload": {
      "contentReference": {
        "display": string;
      };
    }[];
    "extension":
    {
      "url": string;
      "valueCodeableConcept": {
        "coding": {
          "system": string;
          "code": string;
          "display": string;
        }[];
      };
    }[];
  }[];
  patient_name: string;
  darkTheme: boolean;
  UserRole: string;
  selectedIcon: string;
  isSidebarCollapsed: boolean;
  userOrganization: string;
  toggleTheme?: () => void;
}

export const PatientDetailView: FC<PatientDetails> = (props): JSX.Element => {
  const location = useLocation();
  const { patientName: initialName, patientId: initialId, patientResourceId: initialResourceId, gestationAge: initialGa, birthDate: initialBirthDate, gender: initialGender, birthWeight: initialBirthWeight, initialTab } = location.state || {};

  const [patientName, setPatientName] = useState(initialName || "");
  const [patientId, setPatientId] = useState(initialId || "");
  const [patientResourceId, setPatientResourceId] = useState(initialResourceId || "");
  const [gestationAge, setGestationAge] = useState(initialGa || "");
  const [birthDate, setBirthDate] = useState(initialBirthDate || "");
  const [gender, setGender] = useState((initialGender && initialGender !== "undefined") ? initialGender : "");
  const [birthWeight, setBirthWeight] = useState(initialBirthWeight || "");

  const [selectedMenuItemId, setSelectedMenuItemId] = useState(initialTab || 'overview');
  
  const [patientLocation, setPatientLocation] = useState<string>("Loading...");

  // Fetch true bed location dynamically based on Active Encounter
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (!patientResourceId) return;
        const baseUrl = import.meta.env.VITE_FHIRAPI_URL;
        const encounterUrl = `${baseUrl}/Encounter?subject=Patient/${patientResourceId}&status=in-progress`;
        const encRes = await fetch(encounterUrl, {
          headers: { Authorization: "Basic " + btoa("fhiruser:change-password") },
        });

        if (encRes.ok) {
          const encData = await encRes.json();
          if (encData.entry && encData.entry.length > 0) {
            for (const entry of encData.entry) {
              const encounter = entry.resource;
              if (encounter.location && encounter.location.length > 0) {
                const locRef = encounter.location[0].location?.reference;
                if (locRef) {
                  const locRes = await fetch(`${baseUrl}/${locRef}`, {
                    headers: { Authorization: "Basic " + btoa("fhiruser:change-password") },
                  });
                  if (locRes.ok) {
                    const locData = await locRes.json();
                    const locName = locData.name || locData.identifier?.[0]?.value || "Bed Assigned";
                    setPatientLocation(locName);
                    return;
                  }
                }
              }
            }
          }
        }
        setPatientLocation("Unassigned");
      } catch (err) {
        console.error("Error fetching patient location:", err);
        setPatientLocation("Unassigned");
      }
    };

    fetchLocation();
  }, [patientResourceId]);

  useEffect(() => {
    if (initialTab) {
      setSelectedMenuItemId(initialTab);
    }
  }, [initialTab]);

  // Sync state when location.state changes (e.g. switching patients)
  useEffect(() => {
    if (location.state) {
      setPatientName(initialName || "");
      setPatientId(initialId || "");
      setPatientResourceId(initialResourceId || "");
      setGestationAge(initialGa || "");
      setBirthDate(initialBirthDate || "");
      setGender((initialGender && initialGender !== "undefined") ? initialGender : "");
      setBirthWeight(initialBirthWeight || "");
    }
  }, [location.state, initialName, initialId, initialResourceId, initialGa, initialBirthDate, initialGender, initialBirthWeight]);
  const navigate = useNavigate();
  // ADD PERMISSION HOOK
  const { canViewModule, hasPermission, loading } = usePermissions();
  // Get theme for dynamic colors — must be before any conditional returns (Rules of Hooks)
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [currentWeight, setCurrentWeight] = useState("");
  const [latestWeightData, setLatestWeightData] = useState<{ weight: string, gain: string }>({ weight: "", gain: "" });

  const handleWeightChange = useCallback((w: string) => {
    console.log("⚖️ PatientDetails: Received weight change from GrowthChart ->", w);
    setCurrentWeight(w);
    setLatestWeightData(prev => ({ ...prev, weight: `${w} g` }));
  }, []);

  // Fetch Patient Demographics if missing from state
  useEffect(() => {
    const fetchPatientDemographics = async () => {
      // If we have minimal resource ID but missing key fields, fetch the patient
      if (initialResourceId && (!gender || gender === "" || gender === "undefined" || !gestationAge || gestationAge === "undefined")) {
        try {
          const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
          const authHeader = "Basic " + btoa("fhiruser:change-password");
          const response = await fetch(`${baseUrl}/Patient/${initialResourceId}`, {
            headers: { Authorization: authHeader, Accept: "application/fhir+json" },
          });

          if (response.ok) {
            const patient = await response.json();
            console.log("🏥 [PatientDetails] FETCHED PATIENT FROM FHIR:", patient);
            if (patient.gender && (!gender || gender === "undefined")) {
              console.log("🏥 [PatientDetails] SETTING GENDER FROM FHIR:", patient.gender);
              setGender(patient.gender);
            }
            // Also sync other fields if missing
            if (!gestationAge || gestationAge === "undefined" || gestationAge === "N/A") {
              const gaExt = patient.extension?.find((e: any) =>
                e.url?.toLowerCase().includes('gestational-age') ||
                e.url?.toLowerCase().includes('ga')
              ) || patient.extension?.[1];

              if (gaExt && gaExt.valueString) {
                console.log("🏥 [PatientDetails] SETTING GA FROM FHIR:", gaExt.valueString);
                setGestationAge(gaExt.valueString);
              }
            }
            if (patient.birthDate && !birthDate) {
              setBirthDate(patient.birthDate);
            }
          }
        } catch (err) {
          console.error("Error fetching patient demographics:", err);
        }
      }
    };

    fetchPatientDemographics();
  }, [initialResourceId, gender, gestationAge, birthDate]);


  // --- Patient Switcher Logic ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setPatientSearchQuery("");
  };





  useEffect(() => {
    if (!openMenu) return; // Only fetch when menu is opened (optimization) or on mount if preferred. 
    // Actually, distinct fetch might be better on mount or first open. Let's fetch on mount or first click.
    // For now, simpler to fetch on open or just once. Let's fetch once on component mount for smoother UX.
  }, [openMenu]);

  // Fetch Latest Weight Logic
  useEffect(() => {
    const fetchLatestWeight = async () => {
      if (!patientResourceId && !patientId) return;

      const idToUse = patientResourceId || patientId;

      const baseUrl = import.meta.env.VITE_FHIRAPI_URL as string;
      const authHeader = "Basic " + btoa("fhiruser:change-password");

      try {
        // Fetch the most recent 10 Daily Neonatal/Growth Chart Observations
        // We fetch multiple to ensure we find the absolute latest in case of server-side sort inconsistencies.
        const response = await fetch(
          `${baseUrl}/Observation?subject=Patient/${idToUse}&category=growth-chart&_sort=-date&_count=10`,
          {
            headers: {
              Authorization: authHeader,
              Accept: "application/fhir+json",
            },
          }
        );

        if (!response.ok) return;

        const result = await response.json();

        if (result.entry && result.entry.length > 0) {
          // 🔥 FIX: Sort by effectiveDateTime descending to find the ABSOLUTE latest weight
          const sortedEntries = [...result.entry].sort((a: any, b: any) => {
            const dateA = new Date(a.resource.effectiveDateTime || 0).getTime();
            const dateB = new Date(b.resource.effectiveDateTime || 0).getTime();
            return dateB - dateA;
          });

          const observation = sortedEntries[0].resource;

          let weightVal = "";
          let gainVal = "";

          observation.component?.forEach((comp: any) => {
            const text = comp.code?.text;
            if (text === "Current Weight") {
              weightVal = comp.valueQuantity?.value;
            }
            if (text === "Gain/Loss in 24 hrs") {
              gainVal = comp.valueString;
            }
          });

          // Standardize to g/kg/d if needed
          if (gainVal && !gainVal.includes("g/kg/d")) {
            // Try to find previous weight to calculate
            const prevWeightComp = observation.component?.find((c: any) => c.code?.text === "Previous Weight");
            if (weightVal && prevWeightComp?.valueQuantity?.value) {
              const curr = Number(weightVal);
              const prev = Number(prevWeightComp.valueQuantity.value);
              const avgWeight = (curr + prev) / 2;
              const velocity = ((curr - prev) * 1000) / avgWeight;
              const sign = velocity > 0 ? "+" : "";
              gainVal = `${sign}${velocity.toFixed(2)} g/kg/d`;
            }
          }

          // If we have weight but no saved gain string, we could try to calculate it 
          // but relying on the saved string is safer if GrowthChart handles it.
          // For now, just set what we found.

          if (weightVal) {
            setLatestWeightData({
              weight: `${weightVal} g`,
              gain: gainVal || ""
            });
            setCurrentWeight(String(weightVal));
          }
        }
      } catch (error) {
        console.error("Error fetching weight:", error);
      }
    };

    fetchLatestWeight();
  }, [patientResourceId, patientId]);

  // useEffect(() => {
  //   const fetchPatients = async () => {
  //     try {
  //       if (!props.userOrganization) return;

  //       const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL}/Patient?_count=1000&organization=${props.userOrganization}`, {
  //         headers: {
  //           Authorization: "Basic " + btoa("fhiruser:change-password"),
  //           "Content-Type": "application/fhir+json"
  //         }
  //       });

  //       if (!response.ok) throw new Error("Failed to fetch patients");

  //       const data = await response.json();
  //       const formatted = data.entry?.map((entry: any) => {
  //         const r = entry.resource;
  //         return {
  //           id: r.id,
  //           name: r.name?.[0]?.text || "Unknown", // Assuming name is stored here as per typical
  //           // Correction: Original code used extension for mothers name, let's assume standard name or extension
  //           // Reusing logic from Patient.tsx regarding Name:
  //           mothersName: r.extension?.find((e: any) => e.url === "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName")?.valueString || "Unknown",
  //           gender: r.gender,
  //           bed: r.id === patientId ? "NICU 1 - 01" : "--", // Mock bed for now as in Patient.tsx it was "bed: '--'"
  //           patientId: r.identifier?.[0]?.value || "N/A",
  //           resource: r // Keep full resource for state passing
  //         };
  //       }) || [];
  //       setAllPatients(formatted);
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   };
  //   fetchPatients();
  // }, [props.userOrganization]);

useEffect(() => {
  const fetchPatients = async () => {
    try {
      if (!props.userOrganization) return;

      let allFetchedPatients: SetStateAction<any[]> = [];
      // 1. Add active=true to the query
      let nextUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Patient?_count=100&organization=${props.userOrganization}&active=true`;

      // 2. Loop while there is a "next" page
      while (nextUrl) {
        const response = await fetch(nextUrl, {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
            "Content-Type": "application/fhir+json"
          }
        });

        if (!response.ok) throw new Error("Failed to fetch patients");

        const data = await response.json();
        
        if (data.entry) {
          const pagePatients = data.entry.map((entry: any) => {
            const r = entry.resource;
            return {
              id: r.id,
              name: r.name?.[0]?.text || "Unknown",
              mothersName: r.extension?.find((e: any) => e.url === "http://hl7.org/fhir/StructureDefinition/patient-mothersMaidenName")?.valueString || "Unknown",
              gender: r.gender,
              bed: r.id === patientId ? "NICU 1 - 01" : "--", 
              patientId: r.identifier?.[0]?.value || "N/A",
              resource: r 
            };
          });
          allFetchedPatients = [...allFetchedPatients, ...pagePatients];
        }

        // 3. Check for the 'next' relation link in the FHIR Bundle
        const nextLink = data.link?.find((l: any) => l.relation === "next");
        nextUrl = nextLink ? nextLink.url : null;
      }

      setAllPatients(allFetchedPatients);
    } catch (e) {
      console.error(e);
    }
  };

  fetchPatients();
}, [props.userOrganization]);
  const handlePatientSelect = (patient: any) => {
    // Prepare state similar to how it's passed from Patient.tsx
    // We need: patientName, patientId, patientResourceId, gestationAge, birthDate, gender, birthWeight
    // We need to extract these from the patient resource
    const r = patient.resource;
    const newName = patient.mothersName;
    const newPid = patient.patientId;
    const newResourceId = r.id;
    const newGender = r.gender;
    const newBirthDate = r.birthDate;

    // Extract GA and BirthWeight
    const newGA = r.extension?.find((e: any) => e.url === "http://example.org/fhir/StructureDefinition/gestationalAge")?.valueString || "N/A";

    const newBW = r.extension?.find((e: any) => e.url === "http://example.org/fhir/StructureDefinition/birthWeight")?.valueQuantity?.value;
    const newBWStr = newBW ? `${newBW} g` : "N/A";

    navigate(`/patient/${newResourceId}`, {
      state: {
        patientName: newName,
        patientId: newPid,
        patientResourceId: newResourceId,
        gestationAge: newGA,
        birthDate: newBirthDate,
        gender: newGender,
        birthWeight: newBWStr
      },
      replace: true // Replace current history entry
    });
    handleMenuClose();
  };

  const filteredPatients = allPatients.filter(p =>
    (p.mothersName?.toLowerCase() || "").includes(patientSearchQuery.toLowerCase()) ||
    (p.patientId?.toLowerCase() || "").includes(patientSearchQuery.toLowerCase())
  );
  // ---------------------------

  const handleItemClick = (id: string) => {
    // Map menu IDs to module names for permission checking
    const moduleMap: { [key: string]: string } = {
      'overview': 'Patients Overview',
      'diagnostics': 'Diagnostics',
      'medication': 'Medications',
      'clinicalnotes': 'Clinical Notes',
         'notes': 'Notes',
         'initialassessment': 'Initial Assessment',
          'ventichart': 'Venti Chart',
      'feeds': 'Vitals & Trends',
      'trends': 'Vitals & Trends',
      'treatment': 'Patients Clinical List',
      'assessments': 'Assessments',
      'growthchart': 'Diagnostics',

      'consentforms': 'Consent Forms',
      'newPage': 'Patients Overview',
      'alarms': 'Vitals & Trends' // Added alarms mapping
    };


    const moduleName = moduleMap[id];
    if (moduleName && canViewModule(moduleName)) {
      setSelectedMenuItemId(id);
    }
  };

  useEffect(() => {
    const moduleLabels: { [key: string]: string } = {
      'overview': 'Overview',
      'medication': 'Medication',
      'feeds': 'Feeds & Nutrition',
      'trends': 'Trends',
      'diagnostics': 'Diagnostics',
      'treatment': 'Treatment',
      'notes': 'Notes',
      'assessments': 'Scoring',
      'growthchart': 'Growth Chart',
      'consentforms': 'Consent Forms',
      'initialassessment': 'Assessment',
      'ventichart': 'VentiChart',
      'alltask': 'All Tasks',
      'alarms': 'Notification'
    };

    const label = moduleLabels[selectedMenuItemId] || 'Patient Details';
    document.title = patientName ? `${label} | ${patientName}` : label;
  }, [selectedMenuItemId, patientName]);

  // Show loading state while permissions are being fetched
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading permissions...</Typography>
      </Box>
    );
  }


  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
          borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : "#E0E0E0"}`,
          px: 2,
          py: 1.5,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          flexWrap="wrap"
          useFlexGap
          sx={{ rowGap: 1.5 }}
        >
          {/* Back Button */}
          <IconButton onClick={() => navigate(-1)} size="small">
            <ChevronLeftIcon sx={{ color: "#5F6D7E", fontSize: 28 }} />
          </IconButton>

          {/* Patient Info Pill */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: `1px solid ${isDarkMode ? theme.palette.divider : "#E2E8F0"}`,
              borderRadius: "50px",
              padding: "4px 16px 4px 4px",
              backgroundColor: isDarkMode ? theme.palette.background.default : "#FAFBFC",
            }}
          >
            {/* Patient Name Section */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {/* Circle Icon - Larger and at left edge */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: isDarkMode ? theme.palette.action.selected : "#EBF3FA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FontAwesomeIcon icon={faBaby} style={{ fontSize: "20px", color: isDarkMode ? theme.palette.text.secondary : "#475569" }} />
              </Box>
              <Typography variant="body2" sx={{ color: isDarkMode ? theme.palette.text.secondary : "#64748B" }}>
                B/O
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: (gender?.toLowerCase() === 'male' || gender?.toLowerCase() === 'm')
                    ? '#2BA0E0' // Blue for Male
                    : (gender?.toLowerCase() === 'female' || gender?.toLowerCase() === 'f')
                      ? '#FFAFCC' // Pink for Female
                      : '#334155'  // Default
                }}
              >
                {patientName || "Aditi"}
              </Typography>
            </Stack>

            {/* Divider */}
            <Box
              sx={{
                width: "1px",
                height: "20px",
                backgroundColor: isDarkMode ? theme.palette.divider : "#CBD5E1",
                mx: 1.5,
              }}
            />

            {/* Bed Section - Compact format */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              onClick={handleMenuClick}
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              <Typography variant="body2" sx={{ color: isDarkMode ? theme.palette.text.secondary : "#64748B", fontWeight: 500 }}>
                {patientLocation}
              </Typography>
              <ExpandMoreIcon sx={{ fontSize: 18, color: isDarkMode ? theme.palette.text.disabled : "#94A3B8" }} />
            </Stack>
          </Box>

          {/* Patient Switcher Menu */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                width: 300,
                maxHeight: 400,
                borderRadius: 2,
                mt: 1,
                bgcolor: '#FFFFFF', // Light background
                color: '#334155',   // Dark text
                border: '1px solid #E2E8F0',
                boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Box sx={{ p: 1, position: 'sticky', top: 0, bgcolor: '#FFFFFF', zIndex: 1, borderBottom: '1px solid #E2E8F0' }}>
              <TextField
                size="small"
                fullWidth
                autoFocus
                placeholder="Search patient..."
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                  sx: { color: '#334155', bgcolor: '#F1F5F9' } // Light grey input background
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E2E8F0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#CBD5E1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#94A3B8',
                    },
                  },
                  '& .MuiInputBase-input': { color: '#334155' }
                }}
              />
            </Box>
            {filteredPatients.map((p) => (
              <MenuItem
                key={p.id}
                onClick={() => handlePatientSelect(p)}
                sx={{
                  '&:hover': {
                    bgcolor: '#F8FAFC',
                  },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" width="100%">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: (p.gender?.toLowerCase() === 'male' || p.gender === 'm') ? '#2BA0E0' :
                        (p.gender?.toLowerCase() === 'female' || p.gender === 'f') ? '#FFAFCC' : '#CBD5E1'
                    }}
                  />
                  <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500, color: '#334155' }}>
                    {p.mothersName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    {p.patientId}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
            {filteredPatients.length === 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>No patients found</Typography>
              </Box>
            )}
          </Menu>

          <Box
            sx={{
              backgroundColor: latestWeightData.gain.includes("-") ? "#FEF2F2" : "#ECFDF5", // Red-50 or Green-50
              borderRadius: "6px",
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: latestWeightData.gain.includes("-") ? "#EF4444" : "#059669", fontWeight: 700 }}>
              {latestWeightData.weight || birthWeight || "1340 g"}
            </Typography>
            {latestWeightData.gain && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <ArrowUpwardIcon
                  sx={{
                    fontSize: 12,
                    color: latestWeightData.gain.includes("-") ? "#EF4444" : "#059669",
                    transform: latestWeightData.gain.includes("-") ? "rotate(180deg)" : "none"
                  }}
                />
                <Typography variant="caption" sx={{ color: latestWeightData.gain.includes("-") ? "#EF4444" : "#059669", fontWeight: 600 }}>
                  {latestWeightData.gain}
                </Typography>
              </Stack>
            )}
          </Box>

          {/* ID */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ color: isDarkMode ? theme.palette.text.disabled : "#94A3B8" }}>ID:</Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? theme.palette.text.primary : "#334155", fontWeight: 600 }}>{patientId || "6352489"}</Typography>
          </Stack>

          {/* GA */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ color: isDarkMode ? theme.palette.text.disabled : "#94A3B8" }}>GA:</Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? theme.palette.text.primary : "#334155", fontWeight: 600 }}>{gestationAge || "27W 7D"}</Typography>
          </Stack>

          {/* Right Actions */}
          <Box sx={{ marginLeft: 'auto !important' }}>
            {/* <IconButton onClick={props.toggleTheme}>
              <DarkModeOutlinedIcon sx={{ color: "#64748B" }} />
            </IconButton> */}
          </Box>
        </Stack>
      </Box>
      {/* Main page */}
      <Box sx={{ display: "flex" }}>
        {/* Sidebar - Updated to handle permissions */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            alignSelf: "flex-start",
            height: "100vh",
            backgroundColor: isDarkMode ? '#21262D' : "#FFFFFF", // Elevated sidebar in dark mode
          }}
        >
          <SidebarOg
            isSidebarCollapsed={props.isSidebarCollapsed}
            selectedId={selectedMenuItemId}
            onIconClick={handleItemClick}
            UserRole={props.UserRole}
          />
        </Box>

        {/* Main Content with Permission Protection */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Overview */}
          {selectedMenuItemId === 'overview' && (
            <ProtectedModule module="Patients Overview">
              <PatientOverview
                key={patientResourceId}
                darkTheme={false}
                patientName={patientName || ""}
                patientId={patientId || ""}
                deviceId={""}
                observationId={""}
                patient_resource_id={patientResourceId}
                birthDate={birthDate}
                gestationAge={gestationAge}
                gender={gender}
              />
            </ProtectedModule>
          )}

          {/* Diagnostics */}
          {selectedMenuItemId === 'diagnostics' && (
            <ProtectedModule module="Diagnostics">
              <Dashboard
                key={patientResourceId}
                UserRole={props.UserRole}
                patient_resource_id={patientResourceId}
                patient_name={patientName}
                patient_id={patientId}
                birth_date={birthDate}
                gestational_age={gestationAge}
                current_weight={currentWeight} patient={undefined}              />
            </ProtectedModule>
          )}

          {/* Medication */}
          {
            selectedMenuItemId === 'medication' && (
              <ProtectedModule module="Medications">
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                  <PrescriptionScreen
                    key={patientResourceId}
                    UserRole={props.UserRole}
                    patient_resource_id={patientResourceId}
                    patient_name={patientName}
                    patient_id={patientId}
                    birth_date={birthDate}
                    gestational_age={gestationAge}
                    current_weight={currentWeight}
                  />
                </Box>
              </ProtectedModule>
            )
          }

          {/* Notes */}
          {
            selectedMenuItemId === 'notes' && (
              <ProtectedModule module="Notes">
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                  <Notes
                    key={patientResourceId}
                    patient_name={patientName}
                    patient_id={patientId}
                    patient_resource_id={patientResourceId}
                    birth_date={birthDate}
                    gestational_age={gestationAge}
                     userOrganization={props.userOrganization}
                    UserRole={props.UserRole}
                    canEdit={hasPermission('Notes', 'edit')}
                  />
                </Box>
              </ProtectedModule>
            )
          }

          {/* Feeds */}
          {
            selectedMenuItemId === 'feeds' && (
              <ProtectedModule module="Feeds & Fluids">
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                  <FeedsScreen
                    key={patientResourceId}
                    patient_resource_id={patientResourceId}
                    patient_name={patientName}
                    patient_id={patientId}
                    UserRole={props.UserRole}
                    userOrganization={props.userOrganization}
                    gestational_age={gestationAge}
                    birth_date={birthDate}
                    canEdit={hasPermission('Feeds & Fluids', 'edit')}
                  />
                </Box>
              </ProtectedModule>
            )
          }

          {/* Fluid Management */}
          {selectedMenuItemId === 'treatment' && (
            <ProtectedModule module="Clinical Notes">
              <Treatment
                key={patientResourceId}
                patient_resource_id={patientResourceId}
                patient_id={patientId}
                patient_name={patientName}
                birth_date={birthDate}
                gestational_age={gestationAge}
                location="NICU 1 - 01"
              />
            </ProtectedModule>
          )}

          {/* Trends */}
          {
            selectedMenuItemId === 'trends' && (
              <ProtectedModule module="Vitals & Trends">
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                  <Trends1
                    key={patientResourceId}
                    device_id={""}
                    patient_resource_id={patientResourceId}
                    patient_name={patientName}
                    patient_id={patientId}
                    birth_date={birthDate}
                    gestational_age={gestationAge}
                    device_resource_id={""}
                     gender={gender}
                    userOrganization={props.userOrganization}
                    darkTheme={false}
                    selectedIcon={""}
                  />
                </Box>
              </ProtectedModule>
            )
          }

          {/* Treatment */}
          {
            selectedMenuItemId === 'initialassessment' && (
              <ProtectedModule module="Initial Assessment">
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                  <Assessments
                    key={patientResourceId}
                    patient_name={patientName}
                    patient_id={patientId}
                    patient_resource_id={patientResourceId}
                    birth_date={birthDate}
                    gestational_age={gestationAge}
                    location="NICU 1 - 01" UserRole={""} userOrganization={""}                  />
                </Box>
              </ProtectedModule>
            )
          }
             {
            selectedMenuItemId === 'ventichart' && (
              <ProtectedModule module="Venti Chart">
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                  <VentiChart
                    key={patientResourceId}
                    patient_resource_id={patientResourceId}
                    patient_name={patientName}
                    patient_id={patientId}
                    UserRole={props.UserRole}
                    userOrganization={props.userOrganization}
                    gestational_age={gestationAge}
                    birth_date={birthDate}
                    canEdit={hasPermission('Venti Chart', 'edit')}
                  />
                </Box>
              </ProtectedModule>
            )
          }
          {/* Assessments - User can EDIT this module */}
          {
            selectedMenuItemId === 'assessments' && (
              <ProtectedModule module="Assessments">
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                  <AssessmentScoring
                    key={patientResourceId}
                    userOrganization={props.userOrganization}
                    UserRole={props.UserRole}
                    patient_resource_id={patientResourceId}
                    patient_name={patientName}
                    patient_id={patientId}
                    birth_date={birthDate}
                    gestational_age={gestationAge}
                    canEdit={hasPermission('Assessments', 'edit')}
                  />
                </Box>
              </ProtectedModule>
            )
          }

          {
            selectedMenuItemId === 'growthchart' && (
              <ProtectedModule module="Growth Chart">
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                  <GrowthChart
                    key={patientResourceId}
                    patient_resource_id={patientResourceId}
                    patient_name={patientName}
                    patient_id={patientId}
                    birth_date={birthDate}
                    gestational_age={gestationAge}
                    userOrganization={props.userOrganization}
                    gender={gender}
                    
                    onWeightChange={handleWeightChange}
                    canEdit={hasPermission('Growth Chart', 'edit')}
                  />
                </Box>
              </ProtectedModule>
            )
          }

          {/* Notifications */}
          {
            selectedMenuItemId === 'alarms' && (
              <ProtectedModule module="Vitals & Trends">
                <Box sx={{ flexGrow: 1, overflowY: "auto", height: "100%" }}>
                  <Notifications
                    key={patientResourceId}
                    patientId={patientId || ""}
                    patient_resource_id={patientResourceId}
                    userOrganization={props.userOrganization}
                  />
                </Box>
              </ProtectedModule>
            )
          }


          {
            selectedMenuItemId === 'consentforms' && (
              <ProtectedModule module="Consent Forms">
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                  <ConsentForms key={patientResourceId} patient_resource_id={patientResourceId}
                    patient_name={patientName}
                    patient_id={patientId}
                    birth_date={birthDate}
                    gestational_age={gestationAge}
                    UserRole={props.UserRole}
                    gender={gender}
                    birth_weight={birthWeight}
                     userOrganization={props.userOrganization}

                  />
                </Box>
              </ProtectedModule>
            )
          }

         

          {/* Default view */}
          {
            !selectedMenuItemId && (
              <ProtectedModule module="Patients Overview">
                <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                  <PatientOverview
                    darkTheme={false}
                    patientName={patientName || ""}
                    patientId={patientId || ""}
                    observationId={""}
                    deviceId={""} patient_resource_id={""} />
                </Box>
              </ProtectedModule>
            )
          }
        </Box >
      </Box >
    </>
  );
};