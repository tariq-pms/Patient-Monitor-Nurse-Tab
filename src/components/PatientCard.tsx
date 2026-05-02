
import { Box, Card, IconButton, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import HotelIcon from '@mui/icons-material/Hotel';
import {
  faArrowTrendUp,
  
  faDroplet,
  faHeartPulse,
  faNotesMedical,
  faPrescription,
  faTemperatureHalf,

  faLungs,
  faFlask,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";


export interface PatientDetails {
  onClick: () => void;
  key: string;
  patient_id: string;
  gestational_age: string;
  birthDate: string;
  gender: string;
  birthWeight: string;
  device: {
    resourceType: string;
    id: string;
    meta: {
      versionId: string;
      lastUpdated: string;
    };
    status: string;
    patient: {
      reference: string;
    };
    location: {
      reference: string;
    };
    identifier: {
      system: string;
      value: string;
    }[];
  }[];
  patient_resource_id: string;
  observation_resource: {
    resourceType: string;
    id: string;
    meta: {
      versionId: string;
      lastUpdated: string;
    };
    identifier: {
      value: string;
    }[];
    status: string;
    category: {
      coding: {
        system: string;
        code: string;
        display: string;
      }[];
    }[];
    code: {
      coding: {
        system: string;
        code: string;
        display: string;
      }[];
      text: string;
    };
    subject: {
      reference: string;
    };
    device: {
      reference: string;
    };
    component: {
      code: {
        coding: {
          system: string;
          code: string;
          display: string;
        }[];
        text: string;
      };
      valueQuantity?: {
        value: number;
        unit: string;
        system: string;
        code: string;
      };
      valueString?: string;
    }[];
  }[];
  communication_resource: {
    meta: any;
    id: string;
    status: string;
    resourceType: string;
    sent: string;
    category: {
      coding: {
        system: string;
        code: string;
      }[];
      text: string;
    }[];
    subject: {
      reference: string;
    };
    sender: {
      reference: string;
    };
    payload: {
      contentReference: {
        display: string;
      };
    }[];
    extension: {
      url: string;
      valueCodeableConcept: {
        coding: {
          system: string;
          code: string;
          display: string;
        }[];
      };
    }[];
  }[];
  patient_name: string;
  darkTheme: boolean;
}

// Neonatal vital sign threshold limits
const VITAL_THRESHOLDS = {
  hr: { low: 100, high: 180 },
  temp: { low: 36.0, high: 37.8 },
  spo2: { low: 88, high: 100 },
  rr: { low: 25, high: 70 },
};

const isVitalOutOfRange = (
  value: string,
  thresholds: { low: number; high: number }
): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  return num < thresholds.low || num > thresholds.high;
};

export const PatientCard: FC<PatientDetails> = (props): JSX.Element => {
  const [growthData, setGrowthData] = useState<{
    weight: string;
    gain: string;
  } | null>(null);
  const [latestVitals, setLatestVitals] = useState<{
    hr: string;
    spo2: string;
    temp: string;
    rr: string;
    lastUpdate: string;
  }>({ hr: "--", spo2: "--", temp: "--", rr: "--", lastUpdate: "--" });

  const [patientLocation, setPatientLocation] = useState<string>("Loading...");

  // Fetch Patient Location dynamically based on Active Encounter
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const baseUrl = import.meta.env.VITE_FHIRAPI_URL;
        const encounterUrl = `${baseUrl}/Encounter?subject=Patient/${props.patient_resource_id}&status=in-progress`;
        const encRes = await fetch(encounterUrl, {
          headers: { Authorization: "Basic " + btoa("fhiruser:change-password") },
        });

        if (encRes.ok) {
          const encData = await encRes.json();
          if (encData.entry && encData.entry.length > 0) {
            
            // A patient might have multiple in-progress encounters (admission vs bed assignment)
            // Iterate and find the one that specifically maps them to a Location
            for (const entry of encData.entry) {
              const encounter = entry.resource;
            
              // Check if location array exists inside this Encounter
              if (encounter.location && encounter.location.length > 0) {
                const locRef = encounter.location[0].location?.reference; // e.g. Location/1234
                if (locRef) {
                  const locRes = await fetch(`${baseUrl}/${locRef}`, {
                    headers: { Authorization: "Basic " + btoa("fhiruser:change-password") },
                  });
                  
                  if (locRes.ok) {
                    const locData = await locRes.json();
                    const locName = locData.name || locData.identifier?.[0]?.value || "Bed Assigned";
                    setPatientLocation(locName);
                    return; // Successfully found and set the location
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
  }, [props.patient_resource_id]);

  // Fetch Growth Chart Data (Weight & Gain)
  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_FHIRAPI_URL;
        const url = `${baseUrl}/Observation?subject=Patient/${props.patient_resource_id}&category=growth-chart&_sort=-date&_count=1`;

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.entry && data.entry.length > 0) {
            const obs = data.entry[0].resource;
            const weightComp = obs.component?.find(
              (c: any) => c.code?.text === "Current Weight"
            );
            const gainComp = obs.component?.find(
              (c: any) => c.code?.text === "Gain/Loss in 24 hrs"
            );
            const prevWeightComp = obs.component?.find(
              (c: any) => c.code?.text === "Previous Weight"
            );

            let displayGain = "--";
            if (gainComp?.valueString) {
              if (gainComp.valueString.includes("g/kg/d")) {
                displayGain = gainComp.valueString;
              } else if (
                weightComp?.valueQuantity?.value &&
                prevWeightComp?.valueQuantity?.value
              ) {
                const curr = weightComp.valueQuantity.value;
                const prev = prevWeightComp.valueQuantity.value;
                const avgWeight = (curr + prev) / 2;
                const velocity = ((curr - prev) * 1000) / avgWeight;
                const sign = velocity > 0 ? "+" : "";
                displayGain = `${sign}${velocity.toFixed(2)} g/kg/d`;
              } else {
                displayGain = gainComp.valueString;
              }
            }

            setGrowthData({
              weight:
                weightComp?.valueQuantity?.value
                  ? String(
                    Math.round(weightComp.valueQuantity.value * 100) / 100
                  )
                  : "--",
              gain: displayGain,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching growth data:", err);
      }
    };

    fetchGrowthData();
    const interval = setInterval(fetchGrowthData, 10000);
    return () => clearInterval(interval);
  }, [props.patient_resource_id]);

  // Fetch Latest Vitals directly (HR, SpO2, Temp, RR) using category=vital-signs
  useEffect(() => {
    const fetchLatestVitals = async () => {
      try {
        const baseUrl = import.meta.env.VITE_FHIRAPI_URL;
        const url = `${baseUrl}/Observation?subject=Patient/${props.patient_resource_id}&category=vital-signs&_sort=-date&_count=1`;

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.entry && data.entry.length > 0) {
            const obs = data.entry[0].resource;
            const result = {
              hr: "--",
              spo2: "--",
              temp: "--",
              rr: "--",
              lastUpdate: "--",
            };

            if (obs.component) {
              let foundHr = "",
                foundPr = "",
                foundRr = "",
                foundSpo2 = "";
              let foundTempSkin = "",
                foundTempCore = "";

              obs.component.forEach((c: any) => {
                const coding = c.code?.coding?.[0];
                const display = coding?.display || c.code?.text || "";
                const val = c.valueQuantity?.value ?? c.valueString;

                if (val === undefined || val === null) return;
                const valStr = String(
                  Math.round(Number(val) * 100) / 100
                );

                if (
                  display === "Heart Rate" ||
                  display === "CURRENT HEART RATE" ||
                  c.code?.coding?.some((x: any) => x.code === "8867-4")
                ) {
                  foundHr = valStr;
                } else if (
                  display === "Pulse Rate" ||
                  display === "CURRENT PULSE RATE" ||
                  c.code?.coding?.some((x: any) => x.code === "8888-4")
                ) {
                  foundPr = valStr;
                } else if (
                  display === "Respiratory Rate" ||
                  display === "CURRENT RESPIRATORY RATE" ||
                  c.code?.coding?.some((x: any) => x.code === "9279-1")
                ) {
                  foundRr = valStr;
                } else if (
                  display === "SpO₂" ||
                  display === "SpO2" ||
                  display === "CURRENT SPO2" ||
                  c.code?.coding?.some((x: any) => x.code === "20564-1")
                ) {
                  foundSpo2 = valStr;
                } else if (
                  display === "Skin Temperature" ||
                  display === "CURRENT SKIN TEMPERATURE" ||
                  (c.code?.coding?.some((x: any) => x.code === "60839-8") &&
                    display.includes("Skin"))
                ) {
                  foundTempSkin = valStr;
                } else if (
                  display === "Core Temperature" ||
                  display === "CURRENT CORE TEMPERATURE" ||
                  (c.code?.coding?.some((x: any) => x.code === "60839-8") &&
                    display.includes("Core"))
                ) {
                  foundTempCore = valStr;
                }
              });

              result.hr = foundHr || foundPr || "--";
              result.rr = foundRr || "--";
              result.spo2 = foundSpo2 || "--";
              result.temp = foundTempCore || foundTempSkin || "--";
              result.lastUpdate = obs.meta?.lastUpdated
                ? new Date(obs.meta.lastUpdated).toLocaleString("en-IN", {
                  hour12: true,
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                : "--";
            }

            setLatestVitals(result);
          }
        }
      } catch (err) {
        console.error("Error fetching vitals:", err);
      }
    };

    fetchLatestVitals();
    const interval = setInterval(fetchLatestVitals, 10000);
    return () => clearInterval(interval);
  }, [props.patient_resource_id]);

  // Derived display values
  const currentWeight =
    growthData?.weight && growthData.weight !== "--" ? growthData.weight : "--";
  const weightUnit = currentWeight !== "--" ? "g" : "";
  const gainLoss =
    growthData?.gain && growthData.gain !== "--" ? growthData.gain : "--";

  const navigate = useNavigate();

  const handleCardClick = (initialTab: string = "overview") => {
    navigate(`/patient/${props.patient_resource_id}`, {
      state: {
        patientName: props.patient_name,
        patientId: props.patient_id,
        gestationAge: props.gestational_age,
        gender: props.gender,
        birthDate: props.birthDate,
        deviceId: props.device,
        observation: props.observation_resource,
        patientResourceId: props.patient_resource_id,
        initialTab: initialTab,
      },
    });
  };

  // Determine if any vital is out of range for dynamic header color
  // const hasAlertVitals =
  //   isVitalOutOfRange(latestVitals.hr, VITAL_THRESHOLDS.hr) ||
  //   isVitalOutOfRange(latestVitals.temp, VITAL_THRESHOLDS.temp) ||
  //   isVitalOutOfRange(latestVitals.spo2, VITAL_THRESHOLDS.spo2) ||
  //   isVitalOutOfRange(latestVitals.rr, VITAL_THRESHOLDS.rr);

  // const headerGradient = hasAlertVitals
  //   ? "linear-gradient(135deg, #C62828 0%, #B71C1C 100%)"
  //   : "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)";

  // Vitals config for rendering
  const vitalsConfig = [
    {
      icon: faHeartPulse,
      value: latestVitals.hr,
      label: "BPM",
      color: "#EF4444",
      bgColor: "#FEE2E2",
      threshold: VITAL_THRESHOLDS.hr,
    },
    {
      icon: faTemperatureHalf,
      value: latestVitals.temp,
      label: "TEMP",
      color: "#F97316",
      bgColor: "#FFEDD5",
      threshold: VITAL_THRESHOLDS.temp,
    },
    {
      icon: faDroplet,
      value: latestVitals.spo2,
      label: "SPO2",
      color: "#0EA5E9",
      bgColor: "#E0F2FE",
      threshold: VITAL_THRESHOLDS.spo2,
    },
    {
      icon: faLungs,
      value: latestVitals.rr,
      label: "RR",
      color: "#EAB308",
      bgColor: "#FEF9C3",
      threshold: VITAL_THRESHOLDS.rr,
    },
  ];

  // Action buttons config
  const actionButtons = [
    { icon: faPrescription, id: "medication", label: "Rx" },
    { icon: faArrowTrendUp, id: "trends", label: "Trends" },
    { icon: faNotesMedical, id: "treatment", label: "Notes" },
    { icon: faFlask, id: "diagnostics", label: "Lab" },
  ];

  return (
    <Card
      onClick={() => handleCardClick("overview")}
      sx={{
        mb: 2,
        borderRadius: "8px", // Sharper radius matching design
        overflow: "hidden",
        border: "1px solid #E5E7EB", // Lighter border
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        backgroundColor: props.darkTheme ? '#1E293B' : "#FFFFFF",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        },
      }}
    >
      {/* ===== HEADER BAR ===== */}
      <Box
        sx={{
          backgroundColor: "#1E68C2", // Flat solid blue matching the design
          px: { xs: 2, md: 3 },
          py: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {/* Left: Patient Name + ID Badge */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {/* Smiley Icon */}
          <Box sx={{ color: "rgba(255,255,255,0.7)", display: 'flex', alignItems: 'center' }}>
           <EmojiEmotionsIcon  style={{ fontSize: "20px"}} />
          </Box>
          <Typography
            sx={{
              color: "#FFFFFF",
              fontWeight: 500, // Medium weight, not too bold
              fontSize: "0.9rem",
              letterSpacing: "0.3px",
            }}
          >
            B/O {props.patient_name}
          </Typography>
          <Box
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "12px",
              px: 1.5,
              py: 0.2,
            }}
          >
            <Typography sx={{ color: "#FFFFFF", fontWeight: 500, fontSize: "0.75rem" }}>
              {props.patient_id || "N/A"}
            </Typography>
          </Box>
        </Stack>

        {/* Right: Location */}
        <Stack direction="row" alignItems="center" spacing={0.8}>
          <Box sx={{ color: "rgba(255,255,255,0.7)", display: 'flex', alignItems: 'center' }}>
            <HotelIcon  style={{ fontSize: "20px"}} />
          </Box>
          <Typography
            sx={{
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: "0.9rem",
            }}
          >
            {patientLocation}
          </Typography>
        </Stack>
      </Box>

      {/* ===== DETAILS ROW ===== */}
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 2 }, display: 'flex',  alignItems:  "center" , justifyContent: "space-between", gap: 2 }}>
        
        {/* === Left: Weight + GA === */}
        <Box >
          <Typography
          variant="caption"
            sx={{
              color: "#9CA3AF",
           
              textTransform: "uppercase",
              
            }}
          >
            CURR.WT
          </Typography>
          <Stack  alignItems="left" >
            <Typography
            variant="h5"
              sx={{
               
                color: props.darkTheme ? "#10B981" : "#059669",
                
                
              }}
            >
              {currentWeight} <span style={{ fontSize: "0.9rem" }}>{weightUnit}</span>
            </Typography>
            {gainLoss !== "--" && (
              <Box
              
                sx={{
                  backgroundColor: gainLoss.includes("-") ? "#FEE2E2" : "#D1FAE5",
                  borderRadius: "12px",
                  px: 1,
                  py: 0.3,
                  display: "flex",
                  alignItems: "left",
                  gap: 0.5,
                }}
              >
                <FontAwesomeIcon
                  icon={faArrowTrendUp}
                  style={{
                    color: gainLoss.includes("-") ? "#EF4444" : "#059669",
                    fontSize: "9px",
                    transform: gainLoss.includes("-") ? "rotate(180deg)" : "none",
                  }}
                />
                <Typography
                variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: gainLoss.includes("-") ? "#EF4444" : "#059669",
                    
                  }}
                >
                  {gainLoss}
                </Typography>
              </Box>
            )}
          </Stack>
          <Stack mt={1}> <Typography
          variant="subtitle2"
            sx={{
              color: props.darkTheme ? "#9CA3AF" : "#64748B",
             
            
            }}
          >
            GA: <span style={{ fontWeight: 700, color: props.darkTheme ? "#FFFFFF" : "#334155" }}>{props.gestational_age || "--"}</span>
          </Typography></Stack>
         
        </Box>

        {/* === Center: Vitals === */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Stack
            direction="row"
            spacing={{ xs: 2, sm: 3, md: 2 }}
            alignItems="center"
            justifyContent="center"
            sx={{ flexWrap: "wrap", rowGap: 1 }}
          >
            {vitalsConfig.map((vital, idx) => {
              const outOfRange = isVitalOutOfRange(vital.value, vital.threshold);
              const noData = !vital.value || vital.value === "--";
              return (
                <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                  {/* Circular Icon */}
                  <Box 
                    sx={{
                      width: { xs: 38, md: 46 },
                      height: { xs: 38, md: 46 },
                      borderRadius: "50%",
                      backgroundColor: noData
  ? "#E5E7EB"
  : outOfRange
  ? "#FEE2E2"
  : vital.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {/* For HR, let's use a specific thin path if faHeartPulse is too thick, but FontAwesome works */}
                    <FontAwesomeIcon
                      icon={vital.icon}
                      style={{
                        color: noData
  ? "#9CA3AF"
  : outOfRange
  ? "#EF4444"
  : vital.color,
                        fontSize: "18px",
                      }}
                    />
                  </Box>
                  {/* Value + Label */}
                  <Box>
                    <Stack direction="row" alignItems="self-start" spacing={0.5}>
                      <Typography variant="h6"
                        sx={{
                         
                         color: noData
  ? "#9CA3AF"
  : outOfRange
  ? "#EF4444"
  : (props.darkTheme ? "#FFFFFF" : "#1F2937"),
                          fontSize: { xs: "1rem", md: "1.05rem" },
                          lineHeight: 1,
                        }}
                      >
                        {vital.value}
                      </Typography>
                      <Typography variant="caption"
  sx={{
    color: "#9CA3AF",
  
    
    lineHeight: 1,
  }}
>
  {
    vital.label === "BPM"
      ? "bpm"
      : vital.label === "SPO2"
      ? "%"
      : vital.label === "RR"
      ? "rpm"
      : vital.label === "TEMP"
      ? "°C"   // ✅ ADD THIS
      : vital.label
  }
</Typography>
                    </Stack>
                    <Typography variant="caption"
                      sx={{
                        color: "#9CA3AF",
                       
                      
                        textTransform: "uppercase",
                        mt: 0.3,
                      }}
                    >
                      {vital.label === "BPM" ? "PR" : vital.label}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
          
          {/* Last Update Centered Below Vitals */}
          <Stack mt={1}> <Typography variant="caption" 
            sx={{
              color: "#9CA3AF",
             
              textAlign: "center",
            }}
          >
            Last entered at {latestVitals.lastUpdate !== "--" ? latestVitals.lastUpdate.split(', ')[1] || latestVitals.lastUpdate : "--"}
          </Typography></Stack>
         
        </Box>

        {/* === Right: Action Buttons === */}
       <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 2fr)",
              gap: 1,
              flexShrink: 0,
            }}
          >
            {actionButtons.map((item, idx) => (
              <IconButton
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(item.id);
                }}
                size="small"
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#64748B",
                  width: 62,
                  height: 40,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: "#EFF6FF",
                    borderColor: "#93C5FD",
                    color: "#2563EB",
                  },
                }}
              >
                <FontAwesomeIcon icon={item.icon} style={{ fontSize: "13px" }} />
              </IconButton>
            ))}
          </Box>
      </Box>
    </Card>
  );
};
