import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Card,
  CardContent,
  TableRow,
  TableCell,
  Table,
  TableBody,
  TableContainer,
  Paper,
  Stack,
  TableHead,
  Chip,
  CircularProgress,
  Skeleton,

} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp,  faChevronRight,  faPrescription } from "@fortawesome/free-solid-svg-icons";
import FavoriteIcon from "@mui/icons-material/Favorite";
import OpacityIcon from "@mui/icons-material/Opacity";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import BoltIcon from "@mui/icons-material/Bolt";


interface PatientOverviewProps {
   
    darkTheme: boolean;
    patientName: string;
    patientId: string;
    deviceId:string;
    observationId:string;
    patient_resource_id: string;
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
  //export const DeviceInService: React.FC<DeviceInServiceProps> = ({
export const PatientOverview : React.FC<PatientOverviewProps> = (props) => {
  const [isLoadingReports, setIsLoadingReports] = useState(false);
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
const patientData = {
    name: "Sharadhabmaram",
    condition: "RDS",
    GA: "22 W 7 D",
    UHD: "635246",
    DOB: "26-04-2029",
    HeRO: "0.52",
    weight: "1.25 kg",
    vitals: {
      heartRate: 148,
      temperature: 34.3,
      spo2: 100,
      respiration: 72,
    },
    labResults: [
      { label: "Hemoglobin Lvl", value: "12.8 ± 2.6" },
      { label: "Retic Count", value: "1.3 ± 1.3", highlight: true },
      { label: "Total Bilirubin Lvl", value: "17.5 ± 4.0" },
      { label: "Conjugated Bilirubin Lvl", value: "0.3 ± 0.3" },
      { label: "TSH", value: "8.7 ± 3.2" },
      { label: "T4", value: "8.7 ± 3.2" },
    ],
    medications: [
      { name: "Apnical/Caffeine citrate", dose: "12.5 mg", frequency: "Q3H", route: "IV", time: "12:30 PM" },
      { name: "Roscillin/Ampicillin", dose: "8 mg", frequency: "Q3H", route: "IV", time: "10:00 AM" },
    ],
    feeds: {
      total: "450 ml/day",
      remaining: "170 ml/day",
      enteral: "180 ml/day",
      parenteral: "180 ml/day",
      vitamins: [
        { name: "Vitamin D", value: "-20" },
        { name: "Calc Syrup", value: "-45" },
        { name: "Iron", value: "-69" },
        { name: "Vitamin A", value: "-120" },
      ],
    },
    conditions: ["Moderate Preterm/LBW", "Sepsis", "Jaundice"],
    treatment: ["Phototherapy", "Blood Transfusion x 1", "IV Therapy"],
    assessment: "BiND Score - 5",
  };

  const [latestManual, setLatestManual] = useState<any | null>(null);
  const [manualTrends, setManualTrends] = useState<any[]>([]);
  const [prescriptionHistory, setPrescriptionHistory] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [statusFilter] = useState<"all" | "ongoing" | "completed">("all");

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
        console.log("🆕 Manual Trends:",manualTrends);
      } else {
        setLatestManual(null);
      }
    };
  
    loadManualTrends();
  }, [props.patient_resource_id]);

  const fetchPatientReports = async () => {
  setIsLoadingReports(true);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/DiagnosticReport?subject=Patient/${props.patient_resource_id}`,
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
    const reports = data.entry || [];

    // 🧠 Sort by effectiveDateTime (or issued) descending
    reports.sort((a: any, b: any) => {
      const dateA =
        new Date(a.resource.effectiveDateTime || a.resource.issued).getTime() || 0;
      const dateB =
        new Date(b.resource.effectiveDateTime || b.resource.issued).getTime() || 0;
      return dateB - dateA;
    });

    // 🩹 Keep only the latest report
    setSavedReports(reports.length > 0 ? [reports[0]] : []);
  } catch (err) {
    console.error("Error fetching reports:", err);
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
  }, [props.patient_resource_id]);

  const ReportViewer = ({ report }: { report: any }) => {
    const tests = parseConclusionToTable(report.resource.conclusion);
  
    return (
      <Box sx={{backgroundColor:'#FFFFFF',borderRadius:'20px'}}>
        <Stack direction={'row'} justifyContent={'space-between'}>
        <Typography color={'#9BA1AE'} variant="subtitle1">Lab Results</Typography>
        <Typography color={'#9BA1AE'} variant="caption" gutterBottom>
          Last Updated:({new Date(report.resource.effectiveDateTime).toLocaleString()})
        </Typography>
        </Stack>
        
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{backgroundColor:'grey'}}>
                <TableCell>Test</TableCell>
                <TableCell >Result</TableCell>
             
                <TableCell >Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.map((test, index) => (
                <TableRow key={index}>
                  <TableCell sx={{color:'#124D81'}}>{test.test}</TableCell>
                  <TableCell sx={{color:'#124D81'}}>{test.result}</TableCell>
                  {/* <TableCell sx={{color:'black'}}>{test.referenceRange || 'N/A'}</TableCell> */}
                  <TableCell sx={{color:'#124D81'}}>
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
          console.log("PrescriptionHistory",medicationData);
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
  
 

  const fluidData = {
    totalFluid: 450,
    remainingFluid: 170,
    enteral: 180,
    parenteral: 180,
    deficits: {
      vitaminD: -20,
      calcSyrup: -45,
      iron: -69,
      vitaminA: -120,
    },
  };

  const deficits = [
    { label: "Vitamin D", value: -20 },
    { label: "Calc Syrup", value: -45 },
    { label: "Iron", value: -69 },
    { label: "Vitamin A", value: -120 },
  ];

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
   
    <Box sx={{ flexGrow: 1, overflowY: "auto",mr:1,ml:1 }}>
        {/* Header */}
     
        <Stack
  direction="row"
  alignItems="center"
  justifyContent="space-evenly"
  sx={{
    backgroundColor: "#FFFFFF",
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
              color: "#333",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Last Update:
            <span style={{ fontWeight: "normal", color: "#555" }}>
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
                <FavoriteIcon sx={{ color: "#E91E63", fontSize: "30px" }} />
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



<Box
  sx={{
    borderRadius: "15px",
    padding: "16px 20px",
    mt: 3,
    backgroundColor: "#FFFFFF",
  }}
>
  {/* 🔹 Header */}
  <Stack
  direction="row"
  justifyContent="space-between"
  alignItems="center"
  sx={{
    borderBottom: "2px solid #E6EAF0",
   
   
  }}
>
  {/* 🩺 Title */}
  <Typography
    variant="h6"
    sx={{
      fontWeight: 700,
      color: "#124D81",
    }}
  >
    Medication
  </Typography>

  {/* 📈 Trend Icon */}
  <IconButton
    sx={{
      mb:1,
      backgroundColor: "#F2FBFF",
      color: "#124D81",
      border: "1px solid #E0E0E0",
      borderRadius: "8px",
      "&:hover": { backgroundColor: "#E0F7FF" },
    }}
  >
    <FontAwesomeIcon
      icon={faPrescription}
      style={{
        color: "#124D81",
      }}
    />
  </IconButton>
</Stack>



 {/* 🔹 Content */}
{filteredMedications.length === 0 ? (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100px",
    }}
  >
    <Typography
      variant="body1"
      sx={{
        color: "#A7B3CD",
        fontWeight: 500,
        textAlign: "center",
      }}
    >
      No active prescriptions.
    </Typography>
  </Box>
) : (
  filteredMedications.map((medication, index) => (
    <Box
      key={index}
      sx={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.2fr 0.8fr",
        alignItems: "center",
        
        padding: "10px",
        borderBottom: "1px solid #E6EAF0",
        backgroundColor: "#FFFFFF",
        "&:hover": {
          backgroundColor: "#F9FBFF",
          cursor: "pointer",
        },
      }}
    >
      {/* 💊 Drug name & icon */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FontAwesomeIcon icon={faPrescription} style={{ color: "#228BE6" }} />
        <Box>
          <Typography
            sx={{
              color: "#124D81",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            {medication.name}
          </Typography>
          <Typography
            sx={{
              color: "#A7B3CD",
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            {medication?.orderType || "Regular"}
          </Typography>
        </Box>
      </Box>

      {/* 💧 Dose */}
      <Typography sx={{ color: "#495057" }}>
        {medication.frequency1}
      </Typography>

      {/* 🚑 Route */}
      <Typography sx={{ color: "#495057" }}>
        {medication.route}
      </Typography>

      {/* 🕒 Duration */}
      <Typography sx={{ color: "#495057" }}>
        {calculateDuration(medication.startDate, medication.endDate)} days
      </Typography>
      {/* 🧾 Status */}
      <Box>
        {medication.administeredCount < medication.totalDoses ? (
          <Typography
            sx={{
              backgroundColor: "#E7F3FF",
              color: "#228BE6",
              borderRadius: "8px",
              padding: "2px 8px",
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "inline-block",
              textAlign: "center",
            }}
          >
            Ongoing
          </Typography>
        ) : (
          <Typography
            sx={{
              backgroundColor: "#E6F4EA",
              color: "#2EB67D",
              borderRadius: "8px",
              padding: "2px 8px",
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "inline-block",
              textAlign: "center",
            }}
          >
            Completed
          </Typography>
        )}
      </Box>
      {/* 📅 Started at */}
      <Box>
        <Typography
        variant="caption"
          sx={{
            color: "#6c757d",
            
          }}
        >
          Started at:
        </Typography>
        <Typography
         variant="subtitle2"
          sx={{
            color: "#495057",
           
          }}
        >
          {new Date(medication.startDate).toLocaleString()}
        </Typography>
      </Box>

      
    </Box>
  ))
)}

</Box>

{/* Feeds */}
     {/* Fluid Summary Section */}
     <Box sx={{ backgroundColor: "#FFFFFF", mb: 2,mt: 2, borderRadius: 3,  }}>
        <Grid style={{padding:15}} container alignItems="center" >
          {/* Fluid Overview */}
          <Grid item xs={7} style={{backgroundColor:'#DBFFD9',borderTopLeftRadius:6,borderBottomLeftRadius:6}}>
            <Typography variant="h6" sx={{ fontWeight: "bold",paddingLeft:1, color: "#124D81" }}>
              {fluidData.totalFluid} ml/day
            </Typography>
            <Typography variant="body2" sx={{ color: "#6c757d",paddingLeft:1, }}>
              Total fluid
            </Typography>
          </Grid>
          <Grid item xs={5} style={{backgroundColor:'#F2F4FB',borderTopRightRadius:6,borderBottomRightRadius:6}}>
            <Typography variant="h6" sx={{ fontWeight: "bold",paddingRight:1, color: "#124D81", textAlign: "right" }}>
              {fluidData.remainingFluid} ml/day
            </Typography>
            <Typography variant="body2" sx={{ color: "#6c757d",paddingRight:1, textAlign: "right" }}>
              Remaining
            </Typography>
          </Grid>
        </Grid>
        <Grid container  sx={{paddingLeft:2,paddingRight:2}}>
          <Grid item xs={2}>
    <Stack style={{ alignItems: "center"}} >
                  <Typography variant="subtitle2" sx={{ color: "#A7B3CD" }}>Enteral</Typography>
                  <Typography variant="subtitle1" sx={{ color: "#124D81" }}>450 ml/day</Typography>
                   </Stack></Grid>
          <Grid item xs={2}>
        <Stack style={{ alignItems: "center"}} >
                        <Typography variant="subtitle2" sx={{ color: "#A7B3CD" }}> Parenteral</Typography>
                        <Typography variant="subtitle1" sx={{ color: "#124D81" }}> 180 ml/day</Typography></Stack>
                       </Grid>
          <Grid item xs={8}>
            <Button variant="outlined" size="small" color="primary" sx={{ float: "right", textTransform: "none" }}>
              Feeds
            </Button>
          </Grid>
        </Grid>
        <Grid style={{padding:'10px'}} container > 
        <TableContainer
      component={Paper}
      elevation={0}
      sx={{ backgroundColor: "#FFFFFF", }}>
      {/* Header */}
      <Typography variant="subtitle2" sx={{color: "#A7B3CD", }} > Deficit </Typography>

      {/* Table */}
      <Table>
        <TableBody>
          <TableRow >
            {/* Iterate over deficits */}
            {deficits.map((item, index) => (
              <TableCell
                key={index}
                sx={{ borderBottom: "none", textAlign: "center", padding:0, color: "#124D81",}}>
                <Typography variant="subtitle1" component="span">{item.label}</Typography>{" "}
                <Typography component="span"sx={{ color: "red"}}  > {item.value}
                </Typography>
              </TableCell>
            ))}
            {/* Arrow Icon */}
            <TableCell
              sx={{ borderBottom: "none",width: "40px", textAlign: "center", }} >
              <IconButton
                sx={{  color: "#124D81", width: 10, height: 10, borderRadius: "8px","&:hover": {  backgroundColor: "#CCE6FF",  },  }}   >
                <FontAwesomeIcon icon={faChevronRight} />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
        </Grid>
        <Box width="100%" sx={{ display: "flex",justifyContent: "space-around",  }}>
<Button sx={{ backgroundColor:'#F2FBFF', color:'#124D81  ', flex: "1 1 50%", maxWidth: "50%", }} > Current</Button>
  <Button sx={{backgroundColor:'#F2F4FB', color:'#9BA1AE', flex: "1 1 50%", maxWidth: "50%",}} >Last Feed </Button>
      </Box> </Box>

 <Box sx={{ display: "flex", justifyContent: "space-around",backgroundColor:'#FFFFFF', alignItems: "center",borderRadius:3, mt: 2 }}>
         
      <Stack  style={{padding:'1%'}} >
      <Typography variant="subtitle1" sx={{  color: "#9BA1AE" }}> Conditions</Typography>
      <Typography variant="subtitle1" sx={{  color: "#124D81" }}> 1.Moderate Preterm/LBW</Typography>
     <Typography variant="subtitle1" sx={{  color: "#124D81" }}> 2.Suspected sepsis</Typography>
     <Typography variant="subtitle1" sx={{  color: "#124D81" }}>3.Jaundice</Typography>
 </Stack>
     <Stack  style={{padding:'1%'}} >
         <Typography variant="subtitle1" sx={{  color: "#9BA1AE" }}>Treatment </Typography>
         <Typography variant="subtitle1" sx={{  color: "#124D81" }}>  1.Moderate Preterm/LBW</Typography>
           <Typography variant="subtitle1" sx={{  color: "#124D81" }}>2.Suspected sepsis</Typography>
           <Typography variant="subtitle1" sx={{  color: "#124D81" }}>  3.Jaundice </Typography>
         </Stack>
        
         <Stack  style={{padding:'1%'}} >
         <Typography variant="subtitle1" sx={{  color: "#9BA1AE" }}> Assessment
 </Typography>
           <Button sx={{width:'100%',height:'100%',backgroundColor: "#F2FBFF", color: "#124D81", border: "1px solid #E0E0E0", borderRadius: 3, "&:hover": {backgroundColor: "#E0F7FF", },}}>Bind Score - 5 </Button>
           <Typography variant="subtitle1" sx={{  color: "#9BA1AE" }}>
        .
           </Typography>
           <Typography variant="subtitle1" sx={{  color: "#9BA1AE" }}>
         .
           </Typography>
           
           
         </Stack></Box>
<Box sx={{ mt: 2,display:'flex',justifyContent:'space-between' }}>
        <Card sx={{backgroundColor:'#FFFFFF',width:'48%',borderRadius:3}}>
          <CardContent>
            
            {isLoadingReports ? (
    <Box display="flex" justifyContent="center" py={4}>
      <CircularProgress />
    </Box>
  ) : savedReports.length === 0 ? (
    <Typography variant="body1" color="Black" textAlign="center" py={2}>
      No Lab Reports found
    </Typography>
  ) : (
    savedReports.map((report, index) => (
      <ReportViewer key={report.resource.id || index} report={report} />
    ))
  )}
          </CardContent>
        </Card>
        <Card sx={{backgroundColor:'#FFFFFF',width:'48%',borderRadius:3}}>
          <CardContent>
            <Typography color={'#9BA1AE'}  variant="subtitle1">Lab Results: Serum</Typography>
            {patientData.labResults.map((result, index) => (
              <Typography key={index} variant="subtitle1" sx={{ color: result.highlight ? "red" : "#124D81" }}>
                {result.label}: {result.value}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Box>
      
    </Box>
       
   
  );
  
};

