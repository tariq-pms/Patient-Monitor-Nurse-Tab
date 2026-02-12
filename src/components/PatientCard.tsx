
import { Box, Card, CardContent, IconButton, Stack, Typography } from "@mui/material";

import { FC, useEffect, useState } from "react";
import { faArrowTrendUp, faBed, faDroplet, faFlask, faHeartPulse, faNotesMedical, faPrescription, faTemperatureHalf, faWeightHanging } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";


export interface PatientDetails {
  onClick: () => void;
  key: string;
  patient_id: string;
  gestational_age: string;
  birthDate: string;
  gender: string;
  birthWeight: string,
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
      "valueQuantity"?: {
        "value": number;
        "unit": string;
        "system": string;
        "code": string;
      };
      "valueString"?: string;
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
  // selectedIcon:string; 
}


export const PatientCard: FC<PatientDetails> = (props): JSX.Element => {
  console.log('PatientCard props:', props);




  // State for specific data
  const [growthData, setGrowthData] = useState<{ weight: string, gain: string } | null>(null);
  const [latestVitals, setLatestVitals] = useState<{ hr: string, spo2: string, temp: string, rr: string, lastUpdate: string }>({ hr: '--', spo2: '--', temp: '--', rr: '--', lastUpdate: '--' });

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
            const weightComp = obs.component?.find((c: any) => c.code?.text === "Current Weight");
            const gainComp = obs.component?.find((c: any) => c.code?.text === "Gain/Loss in 24 hrs");
            const prevWeightComp = obs.component?.find((c: any) => c.code?.text === "Previous Weight");

            let displayGain = "--";
            if (gainComp?.valueString) {
              if (gainComp.valueString.includes("g/kg/d")) {
                displayGain = gainComp.valueString;
              } else if (weightComp?.valueQuantity?.value && prevWeightComp?.valueQuantity?.value) {
                // Legacy format found, calculate g/kg/d on the fly
                const curr = weightComp.valueQuantity.value;
                const prev = prevWeightComp.valueQuantity.value;
                const avgWeight = (curr + prev) / 2;
                // Assuming 1 day duration for "Gain/Loss in 24 hrs"
                const velocity = ((curr - prev) * 1000) / avgWeight;
                const sign = velocity > 0 ? "+" : "";
                displayGain = `${sign}${velocity.toFixed(2)} g/kg/d`;
              } else {
                // Fallback to old string if calculation impossible
                displayGain = gainComp.valueString;
              }
            }

            setGrowthData({
              weight: weightComp?.valueQuantity?.value ? String(Math.round(weightComp.valueQuantity.value * 100) / 100) : "--",
              gain: displayGain
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
            const result = { hr: '--', spo2: '--', temp: '--', rr: '--', lastUpdate: '--' };

            if (obs.component) {
              let foundHr = '', foundPr = '', foundRr = '', foundSpo2 = '';
              let foundTempSkin = '', foundTempCore = '';

              obs.component.forEach((c: any) => {
                const coding = c.code?.coding?.[0];
                const display = coding?.display || c.code?.text || "";
                const val = c.valueQuantity?.value ?? c.valueString;

                if (val === undefined || val === null) return;
                const valStr = String(Math.round(Number(val) * 100) / 100);

                // Match by display name or LOINC code (same logic as Treatment.tsx)
                if (display === "Heart Rate" || display === "CURRENT HEART RATE" || c.code?.coding?.some((x: any) => x.code === "8867-4")) {
                  foundHr = valStr;
                } else if (display === "Pulse Rate" || display === "CURRENT PULSE RATE" || c.code?.coding?.some((x: any) => x.code === "8888-4")) {
                  foundPr = valStr;
                } else if (display === "Respiratory Rate" || display === "CURRENT RESPIRATORY RATE" || c.code?.coding?.some((x: any) => x.code === "9279-1")) {
                  foundRr = valStr;
                } else if (display === "SpO₂" || display === "SpO2" || display === "CURRENT SPO2" || c.code?.coding?.some((x: any) => x.code === "20564-1")) {
                  foundSpo2 = valStr;
                } else if (display === "Skin Temperature" || display === "CURRENT SKIN TEMPERATURE" || (c.code?.coding?.some((x: any) => x.code === "60839-8") && display.includes("Skin"))) {
                  foundTempSkin = valStr;
                } else if (display === "Core Temperature" || display === "CURRENT CORE TEMPERATURE" || (c.code?.coding?.some((x: any) => x.code === "60839-8") && display.includes("Core"))) {
                  foundTempCore = valStr;
                }
              });

              result.hr = foundHr || foundPr || '--';
              result.rr = foundRr || '--';
              result.spo2 = foundSpo2 || '--';
              result.temp = foundTempCore || foundTempSkin || '--';
              result.lastUpdate = obs.meta?.lastUpdated
                ? new Date(obs.meta.lastUpdated).toLocaleString("en-IN", {
                  hour12: true,
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
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
  const currentWeight = growthData?.weight && growthData.weight !== "--" ? growthData.weight : "--";
  const weightUnit = currentWeight !== "--" ? "g" : "";
  const gainLoss = growthData?.gain && growthData.gain !== "--" ? growthData.gain : "--";

  const heartRate = { data: latestVitals.hr, unit: "" };
  const spo2 = { data: latestVitals.spo2, unit: "" };
  const temp = { data: latestVitals.temp, unit: "" };

  

  const navigate = useNavigate();

  const handleCardClick = (initialTab: string = 'overview') => {
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
        initialTab: initialTab // Pass the tab to open
      },
    });
  };


  return (
    <Card
      onClick={() => handleCardClick('overview')}
      sx={{
        mb: 2,
        borderRadius: "12px",
        border: "1px solid #E2E8F0",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
        backgroundColor: "#FFFFFF",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        '&:hover': {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderColor: "#CBD5E1",
          transform: "translateY(-1px)"
        }
      }}
    >
      <CardContent sx={{ p: "16px !important" }}>
        <Stack direction={{ xs: "column", md: "row" }} alignItems="center" spacing={2} width="100%">

          {/* 1. Left: Avatar + Name + Weight */}
          <Box sx={{ flex: 1.5, minWidth: 200 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              {/* Avatar Circle */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#2563EB", // Brand Blue
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFF"
                }}
              >
                <FontAwesomeIcon icon={faBed} style={{ fontSize: "18px" }} />
                {/* Note: Image used a person icon, but Bed/Baby icon is fine. Using Bed for now or similar generic */}
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="#1E293B">
                B/O {props.patient_name}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight={600} color="#059669" sx={{ fontSize: "0.95rem" }}>
                {currentWeight !== "--" ? `${currentWeight}${weightUnit}` : "--"}
              </Typography>
              {gainLoss !== "--" && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <FontAwesomeIcon
                    icon={gainLoss.includes("-") ? faArrowTrendUp : faArrowTrendUp}
                    style={{
                      color: gainLoss.includes("-") ? "#EF4444" : "#059669",
                      fontSize: "12px",
                      transform: gainLoss.includes("-") ? "rotate(180deg)" : "none"
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color={gainLoss.includes("-") ? "#EF4444" : "#059669"}
                  >
                    {gainLoss}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* 2. Center: Location + GA */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", md: "center" } }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <FontAwesomeIcon icon={faBed} color="#64748B" size="sm" />
              <Typography variant="body2" fontWeight={600} color="#475569">
                NICU 1 - A1 {/* Placeholder for Location */}
              </Typography>
            </Stack>
            <Typography variant="caption" fontWeight={500} color="#64748B">
              GA: {props.gestational_age}
            </Typography>
          </Box>

          {/* 3. Right: Vitals Grid */}
          <Box sx={{ flex: 1.5 }}>
            <Stack spacing={1}>
              {/* Row 1: HR & SpO2 */}
              <Stack direction="row" justifyContent="flex-end" spacing={3}>
                <Stack direction="row" spacing={1} alignItems="center" width={70}>
                  <FontAwesomeIcon icon={faHeartPulse} style={{ color: "#EF4444" }} />
                  <Typography variant="body2" fontWeight={600} color="#334155">{heartRate.data}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" width={70}>
                  <FontAwesomeIcon icon={faDroplet} style={{ color: "#0EA5E9" }} />
                  <Typography variant="body2" fontWeight={600} color="#334155">{spo2.data}</Typography>
                </Stack>
              </Stack>

              {/* Row 2: Temp & RR/Other */}
              <Stack direction="row" justifyContent="flex-end" spacing={3}>
                <Stack direction="row" spacing={1} alignItems="center" width={70}>
                  <FontAwesomeIcon icon={faTemperatureHalf} style={{ color: "#F97316" }} />
                  <Typography variant="body2" fontWeight={600} color="#334155">{temp.data}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" width={70}>
                  <FontAwesomeIcon icon={faArrowTrendUp} style={{ color: "#EAB308" }} />
                  <Typography variant="body2" fontWeight={600} color="#334155">{latestVitals.rr}</Typography>
                </Stack>
              </Stack>
            </Stack>
            {/* Last Update Timestamp */}
            <Typography variant="caption" color="#94A3B8" sx={{ display: 'block', textAlign: 'right', mt: 1, fontSize: "0.7rem" }}>
              Last Update: {latestVitals.lastUpdate}
            </Typography>
          </Box>

          {/* 4. Far Right: Actions (2x2 Grid) */}
          <Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1
              }}
            >
              {[
                { icon: faPrescription, id: 'medication' },
                { icon: faNotesMedical, id: 'treatment' },
                { icon: faWeightHanging, id: 'growthchart' },
                { icon: faFlask, id: 'diagnostics' }
              ].map((item, idx) => (
                <IconButton
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(item.id);
                  }}
                  size="small"
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "#F1F5F9",
                    color: "#64748B",
                    width: 32,
                    height: 32,
                    '&:hover': {
                      backgroundColor: "#E2E8F0",
                      color: "#0F172A"
                    }
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} size="sm" />
                </IconButton>
              ))}
            </Box>
          </Box>

        </Stack>
      </CardContent>
    </Card>
  );
}

