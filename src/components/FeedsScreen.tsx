import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Divider,
  Dialog,
TextField,
Checkbox,
  Chip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AirIcon from "@mui/icons-material/Air";
import OpacityIcon from "@mui/icons-material/Opacity";
import { alpha  } from "@material-ui/core";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import React from "react";
function DailyBalanceCard() {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        backgroundColor: "#FFFFFF",
        p: 2,
      }}
    >
      {/* ===== Header ===== */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingUpIcon sx={{ color: "#2563EB", fontSize: 18 }} />
          <Typography fontWeight={600} color="#111827">
            Daily Balance
          </Typography>
        </Box>

      
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="caption" color="#6B7280">
             1340
          </Typography>
          
          <Chip
            size="small"
            label="+130"
            sx={{
              backgroundColor: "#DCFCE7",
              color: "#16A34A",
              fontSize: "0.7rem",
              height: 20,
            }}
          />

          <Typography variant="caption" color="#6B7280">
            Day 01
          </Typography>
        </Box>
      </Box>

      {/* ===== Metrics Row ===== */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(7, 1fr)"
        gap={2}
        alignItems="center"
      >
        {/* Intake */}
        <Metric
          label="Intake"
          value="10 ml"
          sub="Oral"
          color="#2563EB"
        />

        {/* Target */}
        <Metric
          label="Target"
          value="230 ml"
          sub="(Total)"
        />

        {/* Total Output */}
        <Metric
          label="Total Output"
          value="10 ml"
          color="#DC2626"
        />

        {/* Urine */}
        <Metric label="Urine" value="0 ml" />

        {/* Aspiration */}
        <Metric label="Aspiration" value="0 ml" />

        {/* Stool */}
        <Metric label="Stool Output" value="0" />

        {/* Fluid Balance */}
        <Box
          sx={{
            backgroundColor: "#ECFDF5",
            borderRadius: "10px",
            p: 1.5,
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#16A34A", fontWeight: 600 }}
          >
            FLUID BALANCE
          </Typography>

          <Typography
            fontWeight={700}
            fontSize="1rem"
            color="#16A34A"
          >
            0 ml
          </Typography>

          <Chip
            size="small"
            label="Balanced"
            sx={{
              mt: 0.5,
              backgroundColor: "#BBF7D0",
              color: "#166534",
              fontSize: "0.7rem",
              height: 20,
            }}
          />
        </Box>
      </Box>
    </Paper>

  );
}

/* ===== Reusable Metric Component ===== */
function Metric({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    
    <Box>
      <Typography variant="caption" color="#6B7280">
        {label}
      </Typography>

      <Typography
        fontWeight={700}
        fontSize="0.95rem"
        color={color || "#111827"}
      >
        {value}
      </Typography>

      {sub && (
        <Typography variant="caption" color="#9CA3AF">
          {sub}
        </Typography>
      )}
    </Box>
  );
}
export const FeedsScreen = () => {
 

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

  // const handlePrescribe = () => {
  //   const medicationRequest = {
  //     resourceType: "MedicationRequest",
  //     status: "active", // You can change this based on your use case
  //     intent: "order",  // Can be "plan" if it's just a planned prescription
  //     medicationCodeableConcept: {
  //       coding: [
  //         {
  //           system: "http://www.nlm.nih.gov/research/umls/rxnorm",
  //           code: "12345", // Replace this with the actual RxNorm code or other medication code
  //           display: selectedDrugName,  // Drug name from the form
  //         }
  //       ]
  //     },
  //     subject: {
  //       reference: "Patient/123",  // Replace with the actual patient reference
  //     },
  //     dosageInstruction: [
  //       {
  //         sequence: 1,
  //         text: `Take ${dose} mg ${route} every ${frequency}`,
  //         route: {
  //           coding: [
  //             {
  //               system: "http://terminology.hl7.org/CodeSystem/medication-route",
  //               code: route.toLowerCase(),  // Ensure this matches the route selection in your form
  //               display: route,
  //             }
  //           ]
  //         },
  //         timing: {
  //           repeat: {
  //             frequency: parseInt(frequency),  // Frequency in hours (e.g., Q12H -> 12)
  //             period: 1,
  //             periodUnit: "h",  // Period unit in hours
  //           }
  //         }
  //       }
  //     ],
  //     dispenseRequest: {
  //       quantity: {
  //         value: days,  // Number of days to dispense
  //         unit: "day",  // Unit for the prescription duration
  //       }
  //     },
  //     dateWritten: new Date().toISOString(),  // Current date-time
  //     reasonCode: [
  //       {
  //         text: indication,  // Indication for the medication
  //       }
  //     ],
  //     note: [
  //       {
  //         text: additionalNote,  // Additional notes about the medication
  //       }
  //     ],
  //   };

  //   // Send the POST request to the FHIR server
  //   fetch("YOUR_FHIR_SERVER_URL/MedicationRequest", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(medicationRequest),  // Send the MedicationRequest as JSON
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       console.log("MedicationRequest successfully saved:", data);
  //       // Optionally handle success (e.g., show confirmation, reset form)
  //     })
  //     .catch(error => {
  //       console.error("Error saving MedicationRequest:", error);
  //       // Optionally handle error (e.g., show error message)
  //     });
  // };

  

  // Function to calculate the end date


// In your component
type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Section = ({ title, children }: SectionProps) => (
  <Box mt={2}>
    <Typography fontWeight={600} mb={0.5} color="#111827">
      {title}
    </Typography>
    {children}
  </Box>
);

const QuantityInput = () => (
  <TextField
    fullWidth
    placeholder="Enter or pick qty"
    InputProps={{
      endAdornment: (
        <Typography variant="caption" color="#6B7280">
          mL
        </Typography>
      ),
    }}
    sx={{
      backgroundColor: "#F9FAFB",
      borderRadius: "10px",
      mt: 0.5,
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
      },
    }}
  />
);

type ChipRowProps = {
  values: string[];
};

const ChipRow = ({ values }: ChipRowProps) => (
  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
    {values.map((value) => (
      <Chip
        key={value}
        label={value}
        clickable
        sx={{
          backgroundColor: "#E0F2FE",
          color: "#0284C7",
          borderRadius: "999px",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "#BAE6FD",
          },
        }}
      />
    ))}
  </Box>
);



const [openEntryDialog, setOpenEntryDialog] = React.useState(false);

return (
  <Box>
    <Dialog
  open={openEntryDialog}
  onClose={() => setOpenEntryDialog(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: "16px",
      p: 2.5,
    },
  }}
>
  {/* ===== Header ===== */}
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography fontWeight={600}>Input Output Entry</Typography>
    <IconButton onClick={() => setOpenEntryDialog(false)}>
      <CloseIcon />
    </IconButton>
  </Box>

  {/* ===== Vitals ===== */}
  <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={1.5} mt={2}>
    {[
      { icon: <FavoriteIcon color="error" />, value: "150" },
      { icon: <WaterDropIcon color="primary" />, value: "98" },
      { icon: <LocalFireDepartmentIcon color="warning" />, value: "35.6" },
      { icon: <AirIcon color="info" />, value: "71" },
    ].map((v, i) => (
      <Box
        key={i}
        display="flex"
        alignItems="center"
        gap={1}
        px={1.5}
        py={1}
        border="1px solid #E5E7EB"
        borderRadius="10px"
      >
        {v.icon}
        <Typography>{v.value}</Typography>
      </Box>
    ))}
  </Box>

  {/* ===== IV Fluid ===== */}
  <Section title="I.V Fluid">
    <QuantityInput />
    <ChipRow values={["2.0 mL", "5.0 mL", "10.0 mL", "15.0 mL", "50.0 mL"]} />
  </Section>

  {/* ===== By Mouth ===== */}
  <Section title="By Mouth">
    <QuantityInput />
  </Section>

  {/* ===== RT Feed ===== */}
  <Section title="RT Feed / NG">
    <QuantityInput />
    <ChipRow values={["12.0 mL", "13.0 mL", "15.0 mL", "20.0 mL", "NBM"]} />
  </Section>

  {/* ===== Outputs ===== */}
  <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1.5} mt={2}>
    {["Aspiration", "Urine", "Drain / Stool"].map(label => (
      <Box
        key={label}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1.2}
        border="1px solid #E5E7EB"
        borderRadius="10px"
      >
        <Typography fontWeight={500}>{label}</Typography>
        <Checkbox />
      </Box>
    ))}
  </Box>

  {/* ===== Remarks ===== */}
  <Box mt={2}>
    <Typography fontWeight={600} mb={0.5}>
      Remarks
    </Typography>
    <TextField
      fullWidth
      placeholder="Type or Search"
      sx={{ backgroundColor: "#F9FAFB", borderRadius: "10px" }}
    />
  </Box>

  {/* ===== Footer ===== */}
  <Divider sx={{ my: 2 }} />

  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
    <Button
      disabled
      sx={{
        backgroundColor: "#E5E7EB",
        color: "#9CA3AF",
        borderRadius: "10px",
      }}
    >
      Cancel
    </Button>

    <Button
      startIcon={<AddIcon />}
      sx={{
        backgroundColor: "#E0F2FE",
        color: "#0284C7",
        borderRadius: "10px",
        fontWeight: 600,
      }}
    >
      Add
    </Button>
  </Box>
</Dialog>

  <Box mt={2} mb={2}><Typography variant="inherit" fontWeight={500}>Input Output Chart</Typography>
  <Box display={"flex"}  alignItems="center"
  justifyContent="flex-end"
  gap={1.5}>
    <IconButton sx={{
          backgroundColor: alpha("#228BE6", 0.1),
          color: "#228BE6",
          textTransform: "none",
          borderRadius: "8px",
          px: 2,py:0.9,
          "&:hover": {
            backgroundColor: alpha("#228BE6", 0.2),
          },
        }}><DownloadIcon/></IconButton>
   <Button
  startIcon={<AddIcon fontSize="small" />}
  onClick={() => setOpenEntryDialog(true)}
  sx={{
    backgroundColor: alpha("#228BE6", 0.1),
    color: "#228BE6",
    textTransform: "none",
    borderRadius: "8px",
    px: 3,
  }}
>
  Entry
</Button>

  </Box>
  </Box>

    <Paper
      elevation={0}
      sx={{
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        overflow: "hidden",
      }}
    >
      {/* ===== Header Row ===== */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        alignItems="center"
        px={2}
        py={1}
        sx={{
          backgroundColor: "#F9FAFB",
          fontSize: "0.75rem",
          color: "#6B7280",
        }}
      >
        <Typography variant="caption">Time</Typography>

        <Box display="flex" alignItems="center" gap={0.4}>
          <LocalFireDepartmentIcon fontSize="inherit" color="warning" />
          <Typography variant="caption">T°</Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.4}>
          <FavoriteIcon fontSize="inherit" color="error" />
          <Typography variant="caption">P</Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.4}>
          <AirIcon fontSize="inherit" color="info" />
          <Typography variant="caption">R</Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.4}>
          <OpacityIcon fontSize="inherit" color="primary" />
          <Typography variant="caption">SpO₂</Typography>
        </Box>

        <Typography variant="caption">IV Fluid</Typography>
        <Typography variant="caption">By Mouth</Typography>
        <Typography variant="caption">RT Feed</Typography>
        <Typography variant="caption">Aspiration</Typography>
        <Typography variant="caption">Urine</Typography>
        <Typography variant="caption">Drain / Stool</Typography>
        <Typography variant="caption">Remark</Typography>
      </Box>

      {/* ===== Empty State ===== */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={1}
        py={3}
      >
        <Typography variant="caption" color="#9CA3AF">
          Add first charting
        </Typography>

        <Button
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          sx={{
          backgroundColor: alpha("#228BE6", 0.1),
          color: "#228BE6",
          textTransform: "none",
          borderRadius: "8px",
          px: 3,
          "&:hover": {
            backgroundColor: alpha("#228BE6", 0.2),
          },
        }}
        >
          Entry
        </Button>
      </Box>
    </Paper>
     <Box
     
    sx={{
      position: "fixed",
      bottom: 0,
      px: 2,
      pb: 1.5,
      backgroundColor: "#F9FAFB",
      borderTop: "1px solid #E5E7EB",
    }}
  >
    <DailyBalanceCard />
  </Box>
    </Box>
  );



};

