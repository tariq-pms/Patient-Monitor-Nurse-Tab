import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Grid, Paper, Stack,  Table, TableCell, TableBody, TableHead, TableRow, TableContainer, Snackbar, Alert } from "@mui/material";
import { ProtectedModule } from "./ProtectedModule";

interface Procedure {
  resourceType: string;
  id?: string; // Optional ID field
  status: string;
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
    display: string;
  };
  performedDateTime: string;
  performer: {
    actor: {
      reference: string;
      display: string;
    };
    function: {
      coding: {
        system: string;
        code: string;
        display: string;
      }[];
    };
  }[];
  note: {
    text: string;
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
}

interface DowneScoreProps {

  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
  UserRole: string;

}
// export const DeviceInService: React.FC<DeviceInServiceProps> = ({
export const DowneScore: React.FC<DowneScoreProps> = (props) => {
  const categories = [
    { label: "Respiratory_Rate", options: ["<60/Min", "60-80/Min", ">80/Min"] },
    { label: "Retractions", options: ["No Retractions", "Mild Retractions", "Severe Retractions"] },
    {
      label: "Cyanosis",
      options: ["No Cyanosis", "Cyanosis Relieved by O2", "Cyanosis on O2"],
    },  
    {
      label: "Air_Entry",
      options: ["Good Bilateral Air Entry", "Mild Decrease in Air Entry", "No Air Entry"],
    },
    { label: "Grunting", options: ["No Grunting", "Audible by Stethoscope", "Audible with Ear"] },
  ];

  const [selectedOptions, setSelectedOptions] = useState(
    Array(categories.length).fill(null)
  );

  // Calculate total score
  const totalScore = selectedOptions.reduce((total, value) => total + value, 0);

  
  const handleSelect = (categoryIndex: number, optionIndex: number) => {
    const updatedSelections = [...selectedOptions];
    updatedSelections[categoryIndex] = optionIndex;
    setSelectedOptions(updatedSelections);
  };

  const handleReset = () => {
    setSelectedOptions(Array(categories.length).fill(null));
  };
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const [procedureResourceId, setProcedureResourceId] = useState<string | null>(null);
  const [procedureHistory, setProcedureHistory] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const fetchProcedure = async () => {
    setLoading(true); // Show loading state
    try {
      const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Procedure?subject=Patient/${props.patient_resource_id}`;
      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
      });
  
      if (response.ok) {
        const searchData = await response.json();
        console.log("Fetched Procedures:", searchData);
  
        if (searchData?.entry && searchData.entry.length > 0) {
          const existingProcedureId = searchData.entry[0].resource.id;
          setProcedureResourceId(existingProcedureId); // Set the Procedure ID
          console.log("Procedure Resource ID fetched:", existingProcedureId);
        }
      } else {
        console.error("Failed to fetch Procedure resource.");
      }
    } catch (error) {
      console.error("Error fetching Procedure:", error);
    } finally {
      setLoading(false); // Hide loading state
    }
  };
  
  // Fetch procedure history
  useEffect(() => {
    fetchProcedure(); // Fetch Procedure on component mount or when `patient_resource_id` changes
  }, [props.patient_resource_id]);
  
  const handleSave = async () => {
    setLoading(true);
  
    const procedureData: Procedure = {
      resourceType: "Procedure",
      id: procedureResourceId || undefined,
      status: "completed",
      code: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: "8480-9",
            display: "Downe score",
          },
        ],
        text: "Downe Score",
      },
      subject: {
        reference: `Patient/${props.patient_resource_id}`,
        display: props.patient_name,
      },
      performedDateTime: new Date().toISOString(),
      performer: [
        {
          actor: {
            reference: "Practitioner/67890",
            display: props.UserRole,
          },
          function: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/participant-role",
                code: "doctor",
                display: "Doctor",
              },
            ],
          },
        },
      ],
      note: [
        {
          text: `${totalScore}`,
        },
      ],
      extension: categories.map((category, index) => ({
        url: `http://example.org/fhir/StructureDefinition/${category.label}`,
        valueCodeableConcept: {
          coding: [
            {
              system: "http://example.org/fhir/CodeSystem/downe-score",
              code:
                selectedOptions[index] !== null
                  ? (selectedOptions[index] + 1).toString()
                  : "0",
              display: category.options[selectedOptions[index] || 0],
            },
          ],
        },
      })),
    };
  
    try {
      const requestConfig = {
        method: procedureResourceId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(procedureData),
      };
  
      const url = procedureResourceId
        ? `${import.meta.env.VITE_FHIRAPI_URL}/Procedure/${procedureResourceId}`
        : `${import.meta.env.VITE_FHIRAPI_URL}/Procedure`;
  
      const response = await fetch(url, requestConfig);
  
      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Error response body:", errorBody);
        throw new Error(`Request failed: ${response.statusText}`);
      }
  
      // Only parse JSON if the response has content
      const contentType = response.headers.get("content-type");
      let responseData = null;
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      }
  
      if (procedureResourceId) {
        console.log("Procedure updated successfully:", responseData);
        setSnackbarMessage("Procedure updated successfully!");
      } else {
        setProcedureResourceId(responseData?.id || null);
        console.log("Procedure saved successfully:", responseData);
        setSnackbarMessage("Procedure saved successfully!");
      }
  
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving Procedure resource:", error);
      setSnackbarMessage("An error occurred while saving the procedure.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  useEffect(() => {
    const fetchProcedureHistory = async () => {
      if (!procedureResourceId) {
        console.log("Procedure ID is not available.");
        return; // Exit if procedureResourceId is not available
      }
  
      setLoading(true); // Set loading state
  
      try {
        const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Procedure/${procedureResourceId}/_history?_count=10`;
        const response = await fetch(searchUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        });
  
        if (response.ok) {
          const searchData = await response.json();
          console.log("Fetched Procedure History:", searchData);
  
          // Filter procedure history based on the Downe score
          const filteredHistory = (searchData.entry || []).filter(
            (entry: { resource: { code: { coding: any[]; text: string } } }) =>
              entry.resource.code?.coding?.some(
                (coding) =>
                  coding.system === "http://snomed.info/sct" &&
                  coding.code === "8480-9" &&
                  coding.display === "Downe score"
              ) && entry.resource.code.text === "Downe Score"
          );
  
          console.log("Filtered Procedure History:", filteredHistory);
          setProcedureHistory(filteredHistory); // Update the state with filtered history
        } else {
          console.error("Failed to fetch Procedure resource history.");
        }
      } catch (error) {
        console.error("Error fetching Procedure history:", error);
      } finally {
        setLoading(false); // Hide loading state
      }
    };
  
    // Trigger fetch when procedureResourceId changes
    fetchProcedureHistory();
  }, [procedureResourceId]); // Dependency array now depends on procedureResourceId
  
 
  
  
  return (
    <><ProtectedModule module="Assessments" action="create">
    <Box sx={{borderRadius: '25px', padding: 2 }}>

    
      {categories.map((category, categoryIndex) => (
        <Box
          key={category.label}

          sx={{ marginBottom: 2, padding: 2 }}
        >
          <Typography variant="h6" sx={{ marginBottom: 1, color: '#0F3B61' }}>
            {category.label}
          </Typography>
          <Grid container spacing={2}>
            {category.options.map((option, optionIndex) => (
              <Grid item xs={4} key={option}>
                <Box
                  sx={{
                    padding: "8px",
                    borderRadius: "25px",
                    alignContent: 'center',
                    textAlign: "center",

                    height: '30px',
                    cursor: "pointer",
                    backgroundColor: selectedOptions[categoryIndex] === optionIndex
                      ? "#124D81"
                      : "#FFFFFF",
                    color: selectedOptions[categoryIndex] === optionIndex
                      ? "#FFFFFF"
                      : "#000000",
                    "&:hover": {
                      backgroundColor: selectedOptions[categoryIndex] === optionIndex
                        ? "#FFFFFF"
                        : "#E0E0E0",
                    },
                  }}
                  onClick={() => handleSelect(categoryIndex, optionIndex)}
                >
                  {option}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
         <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#0F3B61",

            padding: 1,
            borderRadius: "8px",
          }}
        >
          Total Score: {totalScore}
        </Typography>
        <Stack direction={'row'} spacing={3}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}

            sx={{
              border: "1px solid #0F3B61",
              color: "#0F3B61",
              "&:hover": {
                backgroundColor: "#E0E0E0",
                color: "#0F3B61",
              },
            }}
          >
            Reset
          </Button>
          <Button variant="contained" onClick={handleSave} color="primary">
            Save
          </Button>
        </Stack>
          </Box> </Box>
    </ProtectedModule>
    <ProtectedModule module="Assessments" action="view">
    <Box marginTop={5}>
  {loading ? (
    <Typography>Loading...</Typography>
  ) : 
  procedureHistory.length > 0 ? (

    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 3,
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
          <TableCell align="center" sx={{ color: "#124D81", fontWeight: "bold" }}>
              TimeStamp
            </TableCell>
            <TableCell align="center" sx={{ color: "#124D81", fontWeight: "bold" }}>
              Details
            </TableCell>
            <TableCell align="center" sx={{ color: "#124D81", fontWeight: "bold" }}>
              Downe Score
            </TableCell>
            <TableCell align="center" sx={{ color: "#124D81", fontWeight: "bold" }}>
              Done by
            </TableCell>
            
          </TableRow>
        </TableHead>
        <TableBody>
          {procedureHistory.map((entry: any, index: number) => (
            <TableRow key={index}>
              <TableCell align="center" sx={{ color: "#124D81" }}>
                {entry.resource.performedDateTime
                  ? new Date(entry.resource.performedDateTime).toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell align="center" sx={{ color: "#124D81" }}>
  {entry.resource.extension
    ?.map((ext: any, index: number) => (
      <Typography key={index}>
        {ext.valueCodeableConcept?.coding?.[0]?.display}
      </Typography>
    )) || "N/A"}
</TableCell>
              <TableCell align="center" sx={{ color: "#124D81" }}>
                {entry.resource.note?.map((note: any, noteIndex: React.Key) => (
                  <Typography key={noteIndex}>{note.text}</Typography>
                )) || "N/A"}
              </TableCell>
            
<TableCell align="center" sx={{ color: "#124D81" }}>
                {entry.resource.performer
                  ?.map((performer: any) => performer.actor?.display)
                  .filter(Boolean)
                  .join(" ") || "N/A"}
              </TableCell>
              
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Typography>No Data available.</Typography>
  )}
</Box></ProtectedModule>
<Snackbar
    open={snackbarOpen}
    autoHideDuration={6000}
    onClose={handleCloseSnackbar}
   
  >
    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
      {snackbarMessage}
    </Alert>
  </Snackbar>
    </>
  );
};
//   <Snackbar open={snack} autoHideDuration={5000} onClose={handleClose}>
//   <Alert onClose={handleClose} variant="filled" severity={snackSucc ? 'success':'error'}>
//       {snackSucc && "Operation Completed Successfully"}
//       {!snackSucc && "Operation Failed"}
//   </Alert>
// </Snackbar>
