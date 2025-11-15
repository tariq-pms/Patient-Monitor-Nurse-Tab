
import { Box,  Card, CardContent,Stack, Typography } from "@mui/material";

import { FC, useEffect, useState } from "react";
import {  faBed,  faPrescription } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



export interface PatientDetails {
    onClick: () => void;
    key: string;
    patient_id: string;
    gestational_age:string;
    birthDate:string;
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
   
    patient_name: string;
    darkTheme:boolean;
    // selectedIcon:string; 
  }

  interface Medication {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    frequency: string;
    frequency1?: string; // optional, if some don't have it
    route: string;
    medication:string;
    totalDoses: number;
    orderType:string;
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
export const NurseTaskList: FC<PatientDetails> = (props): JSX.Element => {
    console.log('PatientCard props:', props);


    const [prescriptionHistory, setPrescriptionHistory] = useState<Medication[]>([]);
   
    // const [loading, setLoading] = useState<boolean>(true);
    
 
const calculateIntervals = (startDate: string | number | Date, endDate: string | number | Date, frequencyInHours: number) => {
  const intervals = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    intervals.push(new Date(currentDate)); // Add the current date to the intervals array
    currentDate.setHours(currentDate.getHours() + frequencyInHours); // Increment by the frequency
  }
  return intervals;
  
  
}; 

useEffect(() => {
  fetchPrescription();
 //Fetch Procedure on component mount or when `patient_resource_id` changes
}, [props.patient_resource_id]);


const fetchPrescription = async () => {
  // setLoading(true);
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
    // setLoading(false);
  }
};      

const calculateDuration = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

    const filteredMedications = prescriptionHistory.filter(
      (med) => med.administeredCount < med.totalDoses
    );
  
    return (
      <Box
      width="100%"
      
      sx={{
        mb: 1,
        
     p:0
      }}
    >
      <Card
       
        sx={{
          backgroundColor: props.darkTheme ? "#1C1C1E" : "#FFFFFF",
          borderRadius: "16px",
     
          display: "flex",
         
          flexDirection: "column",
        }}
      >
        <CardContent
          sx={{
         
         
            p: 0,
            height: "100%",
            width: "100%",
          }}
        >
        
          <Box
            sx={{
              flex: { xs: "1 1 auto", md: "0 0 35%" },
              backgroundColor: "#F9FAFF",
              borderRight: { md: "1px solid #E0E0E0" },
              borderBottom: { xs: "1px solid #E0E0E0", md: "none" },
              display: "flex",
              flexDirection: "column",
         
            }}
          >
            {/* Header */}
            <Stack
              direction="row"
              sx={{
           
                backgroundColor: "#2A6194",
                px: 2,
                alignItems: "center",
                justifyContent: "space-between",
            minHeight:'35px',
              }}
            >
              <Typography variant="subtitle1" sx={{ color: "#FFFFFF", fontSize: { xs: "0.875rem", md: "1rem" } }}>
                B/O - {props.patient_name}
              </Typography>
              <Typography variant="subtitle1" color="#FFFFFF" sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                  P/ID - {props.patient_id}
                </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {/* <FontAwesomeIcon icon={faBed} color="#BDC7DF" /> */}
                <Typography variant="subtitle1" color="#FFFFFF" sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                  {props.patient_id}
                </Typography>
                
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <FontAwesomeIcon icon={faBed} color="#BDC7DF" />
                <Typography variant="subtitle1" color="#FFFFFF" sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
               G.A - {props.gestational_age}
                </Typography>
                
              </Stack>
            </Stack>
    
            {/* Weight + GA */}
          
          </Box>
    
         
          <Box
  sx={{
    borderRadius: "15px",
    backgroundColor: "#FFFFFF",
    flexGrow: 1,
    overflowY: filteredMedications.length > 0 ? "auto" : "hidden", // 👈 show scroll only if tasks exist
    maxHeight: "190px", // 👈 adjust scrollable area height
    "&::-webkit-scrollbar": {
      width: "5px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#C1C8D1",
     
      borderRadius: "6px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "#9AA1AA",
    },
  }}
>

 {/* 🔹 Content */}
{filteredMedications.length === 0 ? (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
    
      alignItems: "center",
      minHeight: "40px",
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
      No active Task.
    </Typography>
  </Box>
) : (
  filteredMedications.map((medication, index) => (
    <Box
      key={index}
      sx={{
        display: "flex",
        justifyContent:'space-between',
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
            {medication.orderType || "Regular"}
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
        </CardContent>
      </Card>
    </Box>
    )
}

