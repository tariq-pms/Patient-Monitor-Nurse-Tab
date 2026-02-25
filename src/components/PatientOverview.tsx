import React, { useEffect, useState } from "react";
import { format, subDays, isSameDay, parseISO, startOfDay, differenceInDays } from 'date-fns';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Paper,
  Stack,
  Chip,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faPrescription } from "@fortawesome/free-solid-svg-icons";
import FavoriteIcon from "@mui/icons-material/Favorite";
import OpacityIcon from "@mui/icons-material/Opacity";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import BoltIcon from "@mui/icons-material/Bolt";
import Divider from "@mui/material/Divider";


interface PatientOverviewProps {

  darkTheme: boolean;
  patientName: string;
  patientId: string;
  deviceId: string;
  observationId: string;
  patient_resource_id: string;
  reportData?: any;
  birthDate?: string;
  gestationAge?: string;
  gender?: string;
}

interface DiagnosticOrder {
  fullResource: any;
  id: string;
  testName: string;
  specimen: string;
  priority: string;
  status: string;
  orderedAt: string;
  orderedBy: string;
  verifiedBy?: string;
  attachment?: string;
  contentType?: string;
}

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

interface ClinicalScore {
  value: string;
  dateTime: string;
  performer: string;
}
//export const DeviceInService: React.FC<DeviceInServiceProps> = ({
export const PatientOverview: React.FC<PatientOverviewProps> = (props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [chartData, setChartData] = useState<any[]>([]);
  const [diagnosticOrders, setDiagnosticOrders] = useState<DiagnosticOrder[]>([]);
  const [notesSummary, setNotesSummary] = useState<{ date: string; count: number }[]>([]);
  const [latestNote, setLatestNote] = useState<{ author: string; time: string } | null>(null);
  const [apgarScore, setApgarScore] = useState<ClinicalScore | null>(null);
  const [ballardScore, setBallardScore] = useState<ClinicalScore | null>(null);
  const [downeScore, setDowneScore] = useState<ClinicalScore | null>(null);

  // Growth & BSL State
  const [growthData, setGrowthData] = useState<{
    weight: string;
    velocity: string;
    bsl: string;
    tag: string;
    trend: 'up' | 'down' | 'stable' | null;
  } | null>(null);
  // const realtimeDataDisplay = () => {
  //     // if(props.newData){
  //         return (
  //             <div>
  //                 <Stack
  //                 direction={'row'}
  //                 divider={
  //                 <Divider orientation='vertical' flexItem/>
  //                 }
  //                 sx={{
  //                 display: "flex",
  //                 flexWrap: "wrap",
  //                 gap: {
  //                 xs: "2rem",
  //                 sm: "2rem",
  //                 md: "4rem",
  //                 lg: "4rem",
  //                 xl: "4rem",
  //                 },
  //                 mt: {
  //                 xs: 5,
  //                 sm: 6,
  //                 md: 7,
  //                 lg: 8,
  //                 },
  //                 mb: {
  //                 xs: 5,
  //                 sm: 6,
  //                 md: 7,
  //                 lg: 8,
  //                 },
  //                 justifyContent: "center",
  //                 }}
  //             >
  //                 {props.observation_resource?.map((obs) => {
  //                     var x = 0;
  //                     if(obs.identifier[0].value=="PMS-SYRINGE"){

  //                         return (
  //                             obs.component?.map((val) => {
  //                                 if(x==0){
  //                                     x+=1
  //                                     return(
  //                                         <Stack alignItems={'center'} spacing={'10px'}>
  //                                             <Typography variant="subtitle1" >
  //                                                 Mode
  //                                             </Typography>
  //                                             <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
  //                                             <Typography variant='h4'>
  //                                             {val.code.text}

  //                                             </Typography>

  //                                             </div>
  //                                         </Stack>
  //                                     )
  //                                 }
  //                                 else{
  //                                     return(
  //                                         <Stack alignItems={'center'} spacing={'10px'}>
  //                                         <Typography variant="subtitle1" >
  //                                             {val.code.text}
  //                                         </Typography>
  //                                         <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
  //                                         <Typography variant='h4'>
  //                                             {Math.round((val.valueQuantity?.value + Number.EPSILON) * 100) / 100}&nbsp;
  //                                         </Typography>
  //                                         <Typography variant='h5'>
  //                                             {val.valueQuantity?.unit}
  //                                         </Typography>
  //                                         </div>
  //                                     </Stack>
  //                                     )
  //                                 }


  //                         }
  //                             )
  //                         )
  //                     }
  //                     else{
  //                         return (
  //                             obs.component?.map((val) => {
  //                                 if(val.code.text=="Measured Skin Temp 1"|| val.code.text=="Measured Skin Temp 2"|| val.code.text=="SpO2" || val.code.text=="SPO2"||val.code.text=="Pulse Rate"||val.code.text=="Weight"|| val.code.text=="Measure Weigh"|| val.code.text=="Measured Skin Temp"||val.code.text=="Set Skin Temp"||val.code.text=="PI"||val.code.text=="APNEA"||val.code.text=="Rectal Measure Temp"||val.code.text=="Skin Measure Temp")
  //                                 return(
  //                                 <Stack alignItems={'center'} spacing={'10px'}>
  //                                     <Typography variant="subtitle1" >
  //                                         {val.code.text}
  //                                     </Typography>
  //                                     <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
  //                                     <Typography variant='h4'>
  //                                         {Math.round((val.valueQuantity?.value + Number.EPSILON) * 100) / 100}&nbsp;
  //                                     </Typography>
  //                                     <Typography variant='h5'>
  //                                         {val.valueQuantity?.unit}
  //                                     </Typography>
  //                                     </div>
  //                                 </Stack>
  //                             )

  //                         }
  //                             )
  //                         )
  //                     }


  //                 })}

  //                 </Stack>
  //             </div>
  //         )
  //     // }
  //     //  else{
  //     //     return ( <Typography variant="h4" color={darkTheme ? '#FFFFFF':'#124D81'} sx={{fontWeight:'bold'}}>No Therapy Running</Typography>)
  //     // }
  // }


  const [latestManual, setLatestManual] = useState<any | null>(null);
  const [manualTrends, setManualTrends] = useState<any[]>([]);

  const fetchEntries = async () => {
    try {
      const url = `${import.meta.env.VITE_FHIRAPI_URL}/Observation?subject=${props.patient_resource_id}&code=fluid-intake-output&_sort=-date`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": "Basic " + btoa("fhiruser:change-password"),
        },
      });
      const data = await response.json();
      if (data.entry) {
        const formatted = data.entry.map((item: any) => {
          const obs = item.resource;
          const getVal = (text: string) => obs.component?.find((c: any) => c.code.text === text);
          return {
            id: obs.id,
            ivFluid: getVal("IV Fluid")?.valueQuantity?.value || "-",
            byMouth: getVal("By Mouth")?.valueQuantity?.value || "-",
            rtFeed: getVal("RT Feed")?.valueQuantity?.value || "-",
            aspiration: getVal("Aspiration Volume")?.valueQuantity?.value ?? "-",
            urine: getVal("Urine Volume")?.valueQuantity?.value ?? "-",
            stool: getVal("Drain / Stool Volume")?.valueQuantity?.value ?? "-",
          };
        });
        setChartData(formatted);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [props.patient_resource_id]);

  const totals = chartData.reduce((acc, row) => {
    const parse = (val: any) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);
    acc.iv += parse(row.ivFluid);
    acc.rt += parse(row.rtFeed);
    acc.oral += parse(row.byMouth);
    acc.urine += parse(row.urine);
    acc.aspiration += parse(row.aspiration);
    acc.stool += parse(row.stool);
    return acc;
  }, { iv: 0, rt: 0, oral: 0, urine: 0, aspiration: 0, stool: 0 });

  const totalInput = totals.iv + totals.rt + totals.oral;
  const totalOutput = totals.urine + totals.aspiration + totals.stool;
  const balance = totalInput - totalOutput;

  const FENTON_2025_DATA = {
    male: {
      22: { sga: 400, lga: 670 },
      23: { sga: 480, lga: 800 },
      24: { sga: 560, lga: 930 },
      25: { sga: 650, lga: 1070 },
      26: { sga: 740, lga: 1220 },
      27: { sga: 840, lga: 1370 },
      28: { sga: 940, lga: 1480 },
      32: { sga: 1510, lga: 2360 },
      34: { sga: 1930, lga: 2980 },
      36: { sga: 2420, lga: 3650 },
      38: { sga: 2860, lga: 4240 },
      40: { sga: 3120, lga: 4600 },
    },
    female: {
      22: { sga: 380, lga: 630 },
      23: { sga: 450, lga: 750 },
      24: { sga: 530, lga: 880 },
      25: { sga: 610, lga: 1010 },
      26: { sga: 690, lga: 1150 },
      27: { sga: 780, lga: 1290 },
      28: { sga: 880, lga: 1400 },
      32: { sga: 1440, lga: 2220 },
      34: { sga: 1840, lga: 2810 },
      36: { sga: 2310, lga: 3420 },
      38: { sga: 2740, lga: 3950 },
      40: { sga: 3000, lga: 4290 },
    }
  };

  const calculatePmaForFenton = (birthDateStr: string, gaStr: string, targetDate: Date = new Date()): number => {
    if (!birthDateStr || !gaStr) return 0;
    let gaWeeks = 0, gaDays = 0;
    if (gaStr.includes('W') || gaStr.includes('D')) {
      const match = gaStr.match(/(\d+)\s*W\s*(\d+)\s*D/i);
      if (match) { gaWeeks = parseInt(match[1]) || 0; gaDays = parseInt(match[2]) || 0; }
    } else {
      const [gaWeeksStr, gaDaysStr] = gaStr.split(/[+\s]+/);
      gaWeeks = parseInt(gaWeeksStr) || 0; gaDays = parseInt(gaDaysStr) || 0;
    }
    const birth = startOfDay(new Date(birthDateStr));
    const target = startOfDay(targetDate);
    const daysSinceBirth = Math.max(0, differenceInDays(target, birth));
    return Number(((gaWeeks * 7 + gaDays + daysSinceBirth) / 7).toFixed(1));
  };

  const getGrowthCategory = (weightGram: number, pma: number, gender: string = 'male'): string | null => {
    if (!weightGram || !pma) return null;
    const g = String(gender).toLowerCase();
    const isFemale = g.includes('female') || g.includes('girl') || g.includes('f');
    const dataset = isFemale ? FENTON_2025_DATA.female : FENTON_2025_DATA.male;
    const weeks = Object.keys(dataset).map(Number).sort((a, b) => a - b);
    const weekKey = weeks.slice().reverse().find(w => w <= pma);
    if (!weekKey) return null;
    const { sga, lga } = (dataset as any)[weekKey];
    if (weightGram <= sga) return 'SGA';
    if (weightGram >= lga) return 'LGA';
    return 'AGA';
  };

  const BalanceStat = ({ label, value, color = "#000" }: { label: string, value: number, color?: string }) => (
    <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', fontSize: '0.65rem', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: color }}>
        {value} <span style={{ fontSize: '0.6rem', fontWeight: 'normal' }}>mL</span>
      </Typography>
    </Box>
  );
  const [prescriptionHistory, setPrescriptionHistory] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter] = useState<"all" | "ongoing" | "completed">("all");

  const fetchPatientReports = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport?subject=Patient/${props.patient_resource_id}&_sort=-issued`,
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
          const conclusion = resource.conclusion || "";
          const specimenMatch = conclusion.match(/Specimen:?\s*\[?([^,\]\n]+)\]?/i);
          const priorityMatch = conclusion.match(/Priority:?\s*\[?([^,\]\n]+)\]?/i);
          const verifiedMatch = conclusion.match(/Verified By:?\s*\[?([^,\]\n]+)\]?/i);

          return {
            id: resource.id,
            testName: resource.code?.text || "Unknown Test",
            specimen: specimenMatch ? specimenMatch[1].trim() : "N/A",
            priority: priorityMatch ? priorityMatch[1] : "Routine",
            status: resource.status,
            orderedAt: new Date(resource.issued).toLocaleString([], {
              dateStyle: 'short',
              timeStyle: 'short'
            }),
            orderedBy: resource.performer?.[0]?.display || "Dr. System",
            verifiedBy: verifiedMatch ? verifiedMatch[1].trim() : undefined,
            fullResource: resource
          };
        });

        setDiagnosticOrders(formattedOrders);
      }
    } catch (err) {
      console.error("Error fetching FHIR reports:", err);
    }
  };

  const getStatusChipStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "final":
        return { bg: alpha("#16A34A", 0.15), color: "#16A34A", label: "Report Ready" };
      case "preliminary":
        return { bg: alpha("#228BE6", 0.15), color: "#228BE6", label: "Sample Collected" };
      case "registered":
        return { bg: alpha("#FAB005", 0.15), color: "#FAB005", label: "Sample Collection Pending" };
      default:
        return { bg: alpha("#94A3B8", 0.15), color: "#64748B", label: status };
    }
  };

  useEffect(() => {
    if (props.patient_resource_id) {
      fetchPatientReports();
    }
  }, [props.patient_resource_id]);

  // const filteredMedications1 = prescriptionHistory.filter(
  //   (med) => med.administeredCount < med.totalDoses
  // );

  const calculateIntervals = (startDate: string | number | Date, endDate: string | number | Date, frequencyInHours: number) => {
    const intervals = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
      intervals.push(new Date(currentDate)); // Add the current date to the intervals array
      currentDate.setHours(currentDate.getHours() + frequencyInHours); // Increment by the frequency
    }
    return intervals;


  };

  async function fetchManualTrends(patientId: string, timeframeHours = 24) {
    console.log("📥 Fetching MANUAL observations for patient:", patientId);

    try {
      // Step 1: Find the latest Observation ID
      const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Observation?subject=Patient/${patientId}&category=vital-signs&_sort=-date&_count=1`;
      const searchResponse = await fetch(searchUrl, {
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          Accept: "application/fhir+json",
        },
      });

      const searchResult = await searchResponse.json();
      if (!searchResult.entry?.length) return [];

      const observationId = searchResult.entry[0].resource.id;

      // Step 2: Calculate `_since` based on timeframe
      const sinceDate = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString();

      // Step 3: Fetch observation history (filtered)
      const historyUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Observation/${observationId}/_history?_since=${sinceDate}&_count=50`;
      console.log("📜 Fetching filtered observation history:", historyUrl);

      const historyResponse = await fetch(historyUrl, {
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          Accept: "application/fhir+json",
        },
      });

      const bundle = await historyResponse.json();

      // Step 4: Parse data
      const parsed = bundle.entry?.map((entry: any) => {
        const obs = entry.resource;
        const time = obs.effectiveDateTime;
        const values: Record<string, number> = {};
        obs.component?.forEach((component: any) => {
          const label = component.code?.coding?.[0]?.display;
          const value = component.valueQuantity?.value;
          if (label && value !== undefined) values[label] = value;
        });
        return { time, ...values };
      }) || [];
      console.log("🧩 Parsed manual data:", parsed);
      return parsed.reverse();
    } catch (error) {
      console.error("❌ Error fetching manual trends:", error);
      return [];
    }
  }

  useEffect(() => {
    const loadManualTrends = async () => {
      const data = await fetchManualTrends(props.patient_resource_id);
      setManualTrends(data);

      // ✅ Get the last element (latest)
      if (data.length > 0) {
        setLatestManual(data[data.length - 1]);
        console.log("🆕 Latest Manual:", data[data.length - 1]);
        console.log("🆕 Manual Trends:", manualTrends);
      } else {
        setLatestManual(null);
      }
    };

    loadManualTrends();
  }, [props.patient_resource_id]);



  useEffect(() => {
    fetchPatientReports();
    fetchClinicalNotesSummary();
    fetchClinicalScores();
    fetchGrowthSummary();

    // 🔄 Polling for dynamic updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchClinicalNotesSummary();
      fetchClinicalScores();
      fetchGrowthSummary();
    }, 30000);

    // 🔄 Re-fetch when window gets focus (e.g., coming back from another tab)
    window.addEventListener('focus', fetchClinicalNotesSummary);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchClinicalNotesSummary);
    };
  }, [props.patient_resource_id, props.patientId]);

  async function fetchClinicalNotesSummary() {
    if (!props.patientId) return;
    try {
      // 🏥 Use patientId (to match Treatment.tsx) and remove type filter for broader search
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/DocumentReference?subject=Patient/${props.patientId}&_sort=-date`,
        {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        }
      );
      const data = await response.json();
      const rawEntries = data.entry || [];

      // Filter valid notes first (same logic as Treatment.tsx - only counts JSON clinical notes)
      const entries = rawEntries.filter((entry: any) => {
        const content = entry.resource.content || [];
        return content.some((c: any) => c.attachment?.contentType === 'application/json');
      });

      // 1. Set Latest Note info
      if (entries.length > 0) {
        const latestInfo = entries[0].resource;
        setLatestNote({
          author: latestInfo.author?.[0]?.display || "Unknown",
          time: new Date(latestInfo.date).toLocaleString([], {
            dateStyle: 'short',
            timeStyle: 'short'
          })
        });
      } else {
        setLatestNote(null);
      }

      // 2. Aggregate counts for last 5 days (chronological order)
      const last5Days = Array.from({ length: 5 }, (_, i) => subDays(new Date(), 4 - i));
      const summary = last5Days.map(day => {
        const count = entries.filter((entry: any) => {
          const noteDate = parseISO(entry.resource.date);
          return isSameDay(noteDate, day);
        }).length;

        return {
          date: format(day, "MMM dd"),
          count
        };
      });

      setNotesSummary(summary);
    } catch (err) {
      console.error("Error fetching notes summary:", err);
      // Fallback: Show 0 counts for the last 5 days
      const last5Days = Array.from({ length: 5 }, (_, i) => subDays(new Date(), 4 - i));
      setNotesSummary(last5Days.map(day => ({ date: format(day, "MMM dd"), count: 0 })));
    }
  }

  async function fetchClinicalScores() {
    if (!props.patientId && !props.patient_resource_id) return;
    const patientResourceId = props.patient_resource_id;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/Procedure?subject=Patient/${patientResourceId}&_sort=-date&_count=50`,
        {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        }
      );
      const data = await response.json();
      const entries = data.entry || [];

      // Helper to process scores
      const processScore = (typeText: string) => {
        const match = entries.find((e: any) =>
          e.resource.code?.text?.toLowerCase().includes(typeText.toLowerCase())
        );
        if (match) {
          const res = match.resource;
          return {
            value: res.note?.[0]?.text || "N/A",
            dateTime: new Date(res.performedDateTime).toLocaleString([], {
              dateStyle: 'short',
              timeStyle: 'short'
            }),
            performer: res.performer?.[0]?.actor?.display || "N/A"
          };
        }
        return null;
      };

      setApgarScore(processScore("Apgar Score"));
      setBallardScore(processScore("Ballard Score"));
      setDowneScore(processScore("Downe Score"));

    } catch (err) {
      console.error("Error fetching clinical scores:", err);
    }
  }

  async function fetchGrowthSummary() {
    if (!props.patient_resource_id) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/Observation?subject=Patient/${props.patient_resource_id}&category=growth-chart&_sort=-date&_count=10`,
        {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        }
      );
      const data = await response.json();
      const entries = data.entry || [];

      if (entries.length > 0) {
        const processObs = (obs: any) => {
          const vals: any = {};
          obs.component?.forEach((c: any) => {
            const label = c.code?.text;
            if (label) vals[label] = c.valueQuantity?.value ?? c.valueString ?? null;
          });
          return { time: obs.effectiveDateTime, ...vals };
        };

        // Find latest valid entries independently
        let latestWeight: any = null;
        let latestBSL: any = null;
        let previousWeight: any = null;

        // 1. Find Latest Weight
        const weightEntryIndex = entries.findIndex((e: any) => {
          const vals = processObs(e.resource);
          return vals["Current Weight"] != null;
        });

        if (weightEntryIndex !== -1) {
          latestWeight = processObs(entries[weightEntryIndex].resource);

          // 2. Find Previous Weight (starting after the latest weight index)
          const prevWeightEntry = entries.slice(weightEntryIndex + 1).find((e: any) => {
            const vals = processObs(e.resource);
            return vals["Current Weight"] != null;
          });
          if (prevWeightEntry) {
            previousWeight = processObs(prevWeightEntry.resource);
          }
        }

        // 3. Find Latest BSL
        const bslEntry = entries.find((e: any) => {
          const vals = processObs(e.resource);
          return vals["BSL"] != null;
        });
        if (bslEntry) {
          latestBSL = processObs(bslEntry.resource);
        }

        // Construct Display Data
        const weight = latestWeight ? `${latestWeight["Current Weight"]} g` : "N/A";
        const bsl = latestBSL ? `${latestBSL["BSL"]} mg/dL` : "N/A";
        const velocity = latestWeight ? (latestWeight["Gain/Loss in 24 hrs"] || "N/A") : "N/A";

        // Calculate Trend
        let trend: 'up' | 'down' | 'stable' | null = null;
        if (latestWeight && previousWeight) {
          const diff = latestWeight["Current Weight"] - previousWeight["Current Weight"];
          trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';
        }

        // Growth Tag (SGA/AGA/LGA)
        let tag = "N/A";
        if (latestWeight && props.birthDate && props.gestationAge) {
          const pma = calculatePmaForFenton(props.birthDate, props.gestationAge, new Date(latestWeight.time));
          tag = getGrowthCategory(latestWeight["Current Weight"], pma, props.gender || 'male') || "N/A";
        }

        setGrowthData({ weight, velocity, bsl, tag, trend });
      }
    } catch (err) {
      console.error("Error fetching growth summary:", err);
    }
  }

  const fetchPrescription = async () => {
    setLoading(true);
    try {
      const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/MedicationRequest?subject=Patient/${props.patient_resource_id}`;
      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log("Fetched Medication:", searchData);

        if (searchData?.entry && searchData.entry.length > 0) {
          const medicationData = searchData.entry.map((entry: { resource: any; }) => {
            const medication = entry.resource;

            // Extract total doses and administered count from extensions
            const totalDosesExtension = medication.extension?.find(
              (ext: { url: string; }) => ext.url === "http://example.org/fhir/StructureDefinition/totalDoses"
            );
            const administeredCountExtension = medication.extension?.find(
              (ext: { url: string; }) => ext.url === "http://example.org/fhir/StructureDefinition/administeredCount"
            );

            const totalDoses = totalDosesExtension?.valueInteger || 0;
            const administeredCount = administeredCountExtension?.valueInteger || 0;

            // Get frequency and start/end dates
            const frequency = medication.dosageInstruction?.[0]?.timing?.repeat?.frequency || "N/A";
            const startDate = medication.dispenseRequest?.validityPeriod?.start || "N/A";
            const endDate = medication.dispenseRequest?.validityPeriod?.end || "N/A";

            // Calculate intervals
            let frequencyInHours = frequency;
            const intervals = calculateIntervals(startDate, endDate, frequencyInHours);

            return {
              id: medication.id, // Medication ID
              name: medication.medicationCodeableConcept.text,
              frequency,
              frequency1: medication.dosageInstruction?.[0]?.text || "N/A",
              route: medication.dosageInstruction?.[0]?.route?.coding?.[0]?.display || "N/A",
              startDate,
              endDate,
              use: medication.reasonCode?.[0]?.text || "N/A",
              additionalNote: medication.note?.[0]?.text || "N/A",
              isCritical: false,
              intervals,
              totalDoses, // Include total doses
              administeredCount, // Include administered count
            };
          });

          setPrescriptionHistory(medicationData);
          console.log("PrescriptionHistory", medicationData);
        }
      } else {
        console.error("Failed to fetch MedicationRequest resource.");
      }
    } catch (error) {
      console.error("Error fetching MedicationRequest:", error);
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







  useEffect(() => {
    fetchPrescription();
    //Fetch Procedure on component mount or when `patient_resource_id` changes
  }, [props.patient_resource_id]);
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
    // const isAfterEnd = now > end;
    const isMissed = nextDose && now > nextDose && !isCompleted;
    const isOngoing = !isCompleted && now >= start && now <= end && !isMissed;
    const isUpcoming = isBeforeStart && !isCompleted;

    if (statusFilter === "all") return true;
    if (statusFilter === "completed") return isCompleted;
    if (statusFilter === "ongoing") return isOngoing || isUpcoming || isMissed;
    return false;
  });

  return (

    <Box sx={{ flexGrow: 1, overflowY: "auto", mr: 1, ml: 1 }}>
      {/* Header */}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-evenly"
        sx={{
          backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
          borderRadius: 3,
          minHeight: "80px",
          padding: 0,
        }}
      >
        {loading ? (
          // ============================
          // ⭐ SKELETON LOADING STATE ⭐
          // ============================
          <Grid container spacing={3} justifyContent="space-between">
            <Grid item xs={3}>
              <Skeleton variant="rounded" height={40} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton variant="rounded" height={40} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton variant="rounded" height={40} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton variant="rounded" height={40} />
            </Grid>
          </Grid>
        ) : (
          // ============================
          // ⭐ ACTUAL DATA UI ⭐
          // ============================
          <>
            {/* -- your entire original component, unchanged -- */}
            {latestManual && (
              <Box sx={{ flex: "0 0 25%", ml: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "bold",
                    color: isDarkMode ? theme.palette.text.primary : "#333",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  Last Update:
                  <span style={{ fontWeight: "normal", color: isDarkMode ? theme.palette.text.secondary : "#555" }}>
                    {new Date(latestManual.time).toLocaleString([], {})}
                  </span>
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                flex: latestManual ? "0 0 70%" : "1",
                display: "flex",
                justifyContent: latestManual ? "space-between" : "center",
                alignItems: "center",
                gap: 3,
              }}
            >
              {latestManual ? (
                <>
                  {(latestManual["Pulse Rate"] || latestManual["Heart Rate"]) && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FavoriteIcon sx={{ color: "#FFAFCC", fontSize: "30px" }} />
                      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {latestManual["Pulse Rate"] ??
                          latestManual["Heart Rate"]}
                      </Typography>
                    </Stack>
                  )}

                  {latestManual["SpO2"] && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <OpacityIcon sx={{ color: "#03A9F4", fontSize: "30px" }} />
                      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {latestManual["SpO2"]}
                      </Typography>
                    </Stack>
                  )}

                  {(latestManual["Temperature"] ||
                    latestManual["Core Temperature"] ||
                    latestManual["Skin Temperature"]) && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <DeviceThermostatIcon
                          sx={{ color: "#FF9800", fontSize: "30px" }}
                        />
                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                          {latestManual["Temperature"] ??
                            latestManual["Core Temperature"] ??
                            latestManual["Skin Temperature"]}
                        </Typography>
                      </Stack>
                    )}

                  {latestManual["Respiratory Rate"] && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BoltIcon sx={{ color: "#FFEB3B", fontSize: "30px" }} />
                      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {latestManual["Respiratory Rate"]}
                      </Typography>
                    </Stack>
                  )}

                  <IconButton
                    sx={{
                      backgroundColor: "#F2FBFF",
                      color: "#124D81",
                      border: "1px solid #E0E0E0",
                      borderRadius: "8px",
                      "&:hover": { backgroundColor: "#E0F7FF" },
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowTrendUp} color="#124D81" />
                  </IconButton>
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#9BA1AE",
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    No Data Available
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>

        {/* 1. Medication Summary (Top 5 Recent) */}
        <Box
          sx={{
            borderRadius: "15px",
            padding: "16px 20px",
            backgroundColor: isDarkMode ? theme.palette.background.paper : "#FFFFFF",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ borderBottom: "2px solid #E6EAF0", mb: 2, pb: 1 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? theme.palette.text.primary : "#124D81" }}>
              Recent Medications (Top 5)
            </Typography>
            <IconButton sx={{ backgroundColor: isDarkMode ? alpha("#58A6FF", 0.1) : "#F2FBFF", color: isDarkMode ? '#58A6FF' : "#124D81", border: `1px solid ${isDarkMode ? theme.palette.divider : "#E0E0E0"}`, borderRadius: "8px" }}>
              <FontAwesomeIcon icon={faPrescription} />
            </IconButton>
          </Stack>

          {filteredMedications.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60px" }}>
              <Typography variant="body1" sx={{ color: "#A7B3CD", fontWeight: 500 }}>No active prescriptions.</Typography>
            </Box>
          ) : (
            filteredMedications.slice(0, 5).map((medication, index) => (
              <Box
                key={index}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.2fr 0.8fr",
                  alignItems: "center",
                  padding: "10px",
                  borderBottom: "1px solid #E6EAF0",
                  "&:hover": { backgroundColor: "#F9FBFF", cursor: "pointer" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FontAwesomeIcon icon={faPrescription} style={{ color: "#228BE6" }} />
                  <Box>
                    <Typography sx={{ color: "#124D81", fontWeight: 600, fontSize: "0.9rem" }}>{medication.name}</Typography>
                    <Typography sx={{ color: "#A7B3CD", fontSize: "0.7rem" }}>{medication?.orderType || "Regular"}</Typography>
                  </Box>
                </Box>
                <Typography variant="body2">{medication.frequency1}</Typography>
                <Typography variant="body2">{medication.route}</Typography>
                <Typography variant="body2">{calculateDuration(medication.startDate, medication.endDate)} days</Typography>
                <Chip
                  size="small"
                  label={medication.administeredCount < medication.totalDoses ? "Ongoing" : "Completed"}
                  sx={{ backgroundColor: medication.administeredCount < medication.totalDoses ? "#E7F3FF" : "#E6F4EA", color: medication.administeredCount < medication.totalDoses ? "#228BE6" : "#2EB67D", fontWeight: 600 }}
                />
                <Typography variant="caption" sx={{ color: "#6c757d", textAlign: 'right' }}>{new Date(medication.startDate).toLocaleDateString()}</Typography>
              </Box>
            ))
          )}
        </Box>

        {/* 2. Feed Summary */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: isDarkMode ? theme.palette.text.primary : "#124D81" }}>
            Feed Summary
          </Typography>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>Total Input</Typography>
                    <Typography variant="h6" sx={{ color: '#0284C7', fontWeight: 'bold', lineHeight: 1 }}>
                      {totalInput} <span style={{ fontSize: '0.75rem', color: 'grey' }}>mL</span>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, backgroundColor: '#F9FAFB', p: 1, borderRadius: '8px', flexGrow: 1, justifyContent: 'space-around' }}>
                    <BalanceStat label="IV" value={totals.iv} />
                    <BalanceStat label="NG/RT" value={totals.rt} />
                    <BalanceStat label="ORAL" value={totals.oral} />
                  </Box>
                </Box>
              </Grid>
              <Grid item md={0.5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Divider orientation="vertical" flexItem sx={{ height: 40 }} />
              </Grid>
              <Grid item xs={12} md={3.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>Total Output</Typography>
                    <Typography variant="h6" sx={{ color: '#F43F5E', fontWeight: 'bold', lineHeight: 1 }}>
                      {totalOutput} <span style={{ fontSize: '0.75rem', color: 'grey' }}>mL</span>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, backgroundColor: '#F9FAFB', p: 1, borderRadius: '8px', flexGrow: 1, justifyContent: 'center' }}>
                    <BalanceStat label="Urine" value={totals.urine} />
                  </Box>
                </Box>
              </Grid>
              <Grid item md={0.5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                <Divider orientation="vertical" flexItem sx={{ height: 40 }} />
              </Grid>
              <Grid item xs={12} md={2}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>Fluid Balance</Typography>
                  <Typography variant="h6" sx={{ color: '#059669', fontWeight: 'bold', lineHeight: 1 }}>
                    {balance} <span style={{ fontSize: '0.75rem', color: 'grey' }}>mL</span>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* 3. Diagnostic Report Table */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: isDarkMode ? theme.palette.text.primary : "#124D81" }}>
            Diagnostic Report
          </Typography>
          <Paper elevation={0} sx={{ borderRadius: "12px", backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            {/* Table Header */}
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 2fr", px: 2, py: 1.5, backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              <Typography variant="caption" fontWeight={600} color="textSecondary">Order type</Typography>
              <Typography variant="caption" fontWeight={600} color="textSecondary">Specimen</Typography>
              <Typography variant="caption" fontWeight={600} color="textSecondary">Status</Typography>
              <Typography variant="caption" fontWeight={600} color="textSecondary">Ordered time</Typography>
            </Box>
            {/* Table Body */}
            {diagnosticOrders.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="body2" color="textSecondary">No reports found.</Typography></Box>
            ) : (
              diagnosticOrders.slice(0, 5).map((order) => {
                const statusStyles = getStatusChipStyles(order.status);
                return (
                  <Box key={order.id} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 2fr", px: 2, py: 1.5, alignItems: "center", borderBottom: "1px solid #F3F4F6", "&:last-child": { borderBottom: 0 } }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="#111827">{order.testName}</Typography>
                      <Typography variant="caption" color={order.priority === "Emergency" ? "#F97316" : "textSecondary"}>{order.priority}</Typography>
                    </Box>
                    <Box><Chip size="small" label={order.specimen} sx={{ height: 20, fontSize: '0.7rem' }} /></Box>
                    <Box><Chip size="small" label={statusStyles.label} sx={{ backgroundColor: statusStyles.bg, color: statusStyles.color, fontWeight: 600, height: 20, fontSize: '0.7rem' }} /></Box>
                    <Typography variant="caption" color="textSecondary">{order.orderedAt}</Typography>
                  </Box>
                );
              })
            )}
          </Paper>
        </Box>

        {/* 4. Clinical Notes Summary */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: isDarkMode ? theme.palette.text.primary : "#124D81" }}>
            Clinical Notes Summary
          </Typography>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
              {notesSummary.map((item, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                    {item.date}
                  </Typography>
                  <Box sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: '8px',
                    backgroundColor: item.count > 0 ? alpha('#228BE6', 0.1) : '#F9FAFB',
                    border: '1px solid',
                    borderColor: item.count > 0 ? alpha('#228BE6', 0.2) : '#E5E7EB'
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: item.count > 0 ? '#124D81' : '#9CA3AF' }}>
                      {item.count}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {item.count === 1 ? 'Note' : 'Notes'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {latestNote && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  Latest note by <strong>{latestNote.author}</strong>
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {latestNote.time}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Growth & BSL Summary */}
        <Paper elevation={0} sx={{
          p: 3,
          mt: 3,
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: alpha('#059669', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FavoriteIcon sx={{ color: '#059669', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700 }}>
              Growth & BSL Summary
            </Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
            {[
              {
                label: 'Current Weight',
                value: growthData?.weight || "N/A",
                extra: growthData?.trend === 'up' ? <BoltIcon sx={{ color: '#059669', fontSize: 16 }} /> : growthData?.trend === 'down' ? <BoltIcon sx={{ color: '#F43F5E', fontSize: 16, transform: 'rotate(180deg)' }} /> : null
              },
              { label: 'Weight Velocity', value: growthData?.velocity || "0 g/kg/d" },
              { label: 'Blood Sugar (BSL)', value: growthData?.bsl || "N/A" },
              {
                label: 'Growth Tag',
                value: growthData?.tag || "N/A",
                chip: true
              }
            ].map((item, index) => (
              <Box key={index} sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid #F3F4F6',
                backgroundColor: alpha('#059669', 0.02),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '100px'
              }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                  {item.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.chip ? (
                    <Chip
                      label={item.value}
                      size="small"
                      sx={{
                        backgroundColor: item.value === 'AGA' ? alpha('#059669', 0.1) : alpha('#F59E0B', 0.1),
                        color: item.value === 'AGA' ? '#059669' : '#D97706',
                        fontWeight: 700,
                        borderRadius: '6px'
                      }}
                    />
                  ) : (
                    <>
                      <Typography variant="h5" sx={{ color: '#111827', fontWeight: 800 }}>
                        {item.value}
                      </Typography>
                      {item.extra}
                    </>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Clinical Scores Summary */}
        <Paper elevation={0} sx={{
          p: 3,
          mt: 3,
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: alpha('#124D81', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BoltIcon sx={{ color: '#124D81', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#124D81', fontWeight: 700 }}>
              Latest Clinical Scores
            </Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {[
              { label: 'APGAR Score', data: apgarScore },
              { label: 'Ballard Score', data: ballardScore },
              { label: 'Downe Score', data: downeScore }
            ].map((item, index) => (
              <Box key={index} sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1px solid #F3F4F6',
                backgroundColor: item.data ? alpha('#228BE6', 0.02) : '#F9FAFB',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '120px'
              }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                  {item.label}
                </Typography>

                {item.data ? (
                  <>
                    <Typography variant="h4" sx={{ color: '#111827', fontWeight: 800, mb: 0.5 }}>
                      {item.data.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#4B5563', fontWeight: 500 }}>
                      Done by <strong style={{ color: '#1F2937' }}>{item.data.performer}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5 }}>
                      {item.data.dateTime}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ color: '#9CA3AF', fontStyle: 'italic' }}>
                    No score recorded
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Paper>

      </Box>
    </Box>
  );
};
