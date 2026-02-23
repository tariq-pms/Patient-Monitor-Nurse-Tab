
import { Box, Card, IconButton, Stack, Typography, Chip } from "@mui/material";
import { FC, useEffect, useState } from "react";
import {
  faArrowTrendUp,
  faBed,
  faDroplet,
  faHeartPulse,
  faNotesMedical,
  faPrescription,
  faTemperatureHalf,

  faWind,
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
  const hasAlertVitals =
    isVitalOutOfRange(latestVitals.hr, VITAL_THRESHOLDS.hr) ||
    isVitalOutOfRange(latestVitals.temp, VITAL_THRESHOLDS.temp) ||
    isVitalOutOfRange(latestVitals.spo2, VITAL_THRESHOLDS.spo2) ||
    isVitalOutOfRange(latestVitals.rr, VITAL_THRESHOLDS.rr);

  const headerGradient = hasAlertVitals
    ? "linear-gradient(135deg, #C62828 0%, #B71C1C 100%)"
    : "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)";

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
      label: "°C",
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
      icon: faWind,
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
    { icon: faArrowTrendUp, id: "growthchart", label: "Growth" },
    { icon: faNotesMedical, id: "treatment", label: "Notes" },
    { icon: faFlask, id: "diagnostics", label: "Lab" },
  ];

  return (
    <Card
      onClick={() => handleCardClick("overview")}
      sx={{
        mb: 2,
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        backgroundColor: "#FFFFFF",
        cursor: "pointer",
      
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* ===== HEADER BAR ===== */}
      <Box
        sx={{
          background: headerGradient,
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
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexWrap: "wrap" }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: { xs: "0.85rem", md: "0.95rem" },
              letterSpacing: "0.3px",
            }}
          >
            B/O {props.patient_name}
          </Typography>
          <Chip
            label={props.patient_id || "N/A"}
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,0.25)",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: "22px",
              backdropFilter: "blur(4px)",
            }}
          />
        </Stack>

        {/* Right: Location */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <FontAwesomeIcon
            icon={faBed}
            style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px" }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          >
            NICU 1 - A1
          </Typography>
        </Stack>
      </Box>

      {/* ===== DETAILS ROW ===== */}
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 1.5, md: 2 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={{ xs: 2, sm: 2 }}
        >
          {/* Left: Weight + GA */}
          <Box sx={{ minWidth: { xs: "100%", sm: 140 } }}>
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#1E293B",
                  fontSize: { xs: "1rem", md: "1.15rem" },
                  lineHeight: 1.2,
                }}
              >
                {currentWeight !== "--"
                  ? `${currentWeight}${weightUnit}`
                  : "--"}
              </Typography>
              {gainLoss !== "--" && (
                <Stack direction="row" alignItems="center" spacing={0.3}>
                  <FontAwesomeIcon
                    icon={faArrowTrendUp}
                    style={{
                      color: gainLoss.includes("-") ? "#EF4444" : "#059669",
                      fontSize: "11px",
                      transform: gainLoss.includes("-")
                        ? "rotate(180deg)"
                        : "none",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: gainLoss.includes("-") ? "#EF4444" : "#059669",
                      fontSize: "0.7rem",
                    }}
                  >
                    {gainLoss}
                  </Typography>
                </Stack>
              )}
            </Stack>
            <Typography
              variant="caption"
              sx={{
                color: "#64748B",
                fontWeight: 500,
                fontSize: "0.75rem",
                mt: 0.3,
                display: "block",
              }}
            >
              GA: {props.gestational_age || "--"}
            </Typography>
          </Box>

          {/* Center: Vitals */}
          <Stack
            direction="row"
            spacing={{ xs: 1.5, sm: 2, md: 3 }}
            alignItems="center"
            justifyContent="center"
            sx={{ flex: 1, flexWrap: "wrap", rowGap: 1 }}
          >
            {vitalsConfig.map((vital, idx) => {
              const outOfRange = isVitalOutOfRange(
                vital.value,
                vital.threshold
              );
              return (
                <Stack
                  key={idx}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  {/* Circular Icon */}
                  <Box
                    sx={{
                      width: { xs: 32, md: 38 },
                      height: { xs: 32, md: 38 },
                      borderRadius: "50%",
                      backgroundColor: outOfRange
                        ? "#FEE2E2"
                        : vital.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={vital.icon}
                      style={{
                        color: outOfRange ? "#EF4444" : vital.color,
                        fontSize: "14px",
                      }}
                    />
                  </Box>
                  {/* Value + Label */}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: outOfRange ? "#EF4444" : "#1E293B",
                        fontSize: { xs: "0.85rem", md: "0.95rem" },
                        lineHeight: 1.2,
                      }}
                    >
                      {vital.value}
                      {vital.label === "SPO2" && vital.value !== "--"
                        ? " %"
                        : ""}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#94A3B8",
                        fontSize: "0.6rem",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        lineHeight: 1,
                      }}
                    >
                      {vital.label}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>

          {/* Timestamp */}
          <Typography
  variant="caption"
  sx={{
    color: "#94A3B8",
    fontSize: "0.65rem",
    display: { xs: "none", md: "block" },
    minWidth: 130,
    textAlign: "center",
    lineHeight: 1.3,
  }}
>
  Last Update:
  <br />
  {latestVitals.lastUpdate}
</Typography>

          {/* Right: Action Buttons */}
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
                  width: 58,
                  height: 34,
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
        </Stack>

        {/* Mobile-only timestamp */}
        <Typography
          variant="caption"
          sx={{
            color: "#94A3B8",
            fontSize: "0.65rem",
            display: { xs: "block", md: "none" },
            mt: 1,
            textAlign: "right",
          }}
        >
          Last Update: {latestVitals.lastUpdate}
        </Typography>
      </Box>
    </Card>
  );
};
