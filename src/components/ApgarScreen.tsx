  import React, { useEffect, useState } from "react";
  import { Box, Typography, Button, Grid, Paper, Stack,  Table, TableCell, TableBody, TableHead, TableRow, TableContainer, Snackbar, Alert } from "@mui/material";

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

  interface ApgarScreenProps {

    patient_name: string;
    patient_id: string;
    patient_resource_id: string;
  
  }
  // export const DeviceInService: React.FC<DeviceInServiceProps> = ({
  export const ApgarScreen: React.FC<ApgarScreenProps> = (props) => {
    const categories = [
      { label: "Activity", options: ["Absent", "Flexed limbs", "Active"] },
      { label: "Pulse", options: ["Absent", "Below 100 BPM", "Over 100 BPM"] },
      {
        label: "Grimace",
        options: ["Flaccid", "Some flexion of extremities", "Active motion"],
      },
      {
        label: "Appearance",
        options: ["Blue, pale", "Body pink, extremities blue", "Completely pink"],
      },
      { label: "Respiration", options: ["Absent", "Slow, irregular", "Vigorous cry"] },
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
      await fetchProcedure(); 
      const procedureData: Procedure = {
        resourceType: "Procedure",
        id: procedureResourceId || undefined,
        status: "completed",
        code: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "8480-9",
              display: "Apgar score",
            },
          ],
          text: "Apgar Score",
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
              display: "Dr. Jane Smith",
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
                system: "http://example.org/fhir/CodeSystem/apgar-score",
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
        await fetchProcedureHistory(procedureResourceId || responseData?.id);
      } catch (error) {
        console.error("Error saving Procedure resource:", error);
        setSnackbarMessage("An error occurred while saving the procedure.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    
    
    
   // Move fetchProcedureHistory to component scope
const fetchProcedureHistory = async (id: string) => {
  if (!id) {
    console.log("Procedure ID is not available.");
    return;
  }

  setLoading(true);

  try {
    const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Procedure/${id}/_history?_count=10`;
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

      const filteredHistory = (searchData.entry || []).filter(
        (entry: { resource: { code: { coding: any[]; text: string } } }) =>
          entry.resource.code?.coding?.some(
            (coding) =>
              coding.system === "http://snomed.info/sct" &&
              coding.code === "8480-9" &&
              coding.display === "Apgar score"
          ) && entry.resource.code.text === "Apgar Score"
      );

      setProcedureHistory(filteredHistory);
    } else {
      console.error("Failed to fetch Procedure resource history.");
    }
  } catch (error) {
    console.error("Error fetching Procedure history:", error);
  } finally {
    setLoading(false);
  }
};

// Update useEffect to call on component mount or when ID changes
useEffect(() => {
  if (procedureResourceId) {
    fetchProcedureHistory(procedureResourceId);
  }
}, [procedureResourceId]);

    
    
    return (
      <>
  <Box sx={{ 

  borderRadius: '25px', 
 
}}>
  {/* Header */}
  {/* <Box sx={{ 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 2,
    borderBottom: "1px solid #DBE2F2"
  }}>
    <Typography variant="h5" sx={{ color: "#0F3B61", fontWeight: 'bold' }}>
      APGAR
    </Typography>
    
  </Box> */}

  {/* Score Columns Header */}
  

  {/* Categories */}
  {[
    { letter: 'A', title: 'Activity', options: ['Absent', 'Flexed Limbs', 'Active'] },
    { letter: 'P', title: 'Pulse', options: ['Absent', 'Below 100 BPM', 'Over 100 BPM'] },
    { letter: 'G', title: 'Grimace', options: ['Flaccid', 'Some flexion of Extremities', 'Active motion'] },
    { letter: 'A', title: 'Appearance', options: ['Blue, Pale', 'Body pink, Extremities Blue', 'Completely pink'] },
    { letter: 'R', title: 'Respiration', options: ['Absent', 'Slow, irregular', 'Vigorous cry'] },
  ].map((category, categoryIndex) => (
    <Box key={categoryIndex} sx={{ 
      display: 'flex',
   
      alignItems: 'center',
      textAlign: 'center',
      padding: 2,
      borderBottom: '1px solid #f0f0f0'
    }}>
      {/* Category Label */}
      <Box sx={{ 
        width: '120px',
    
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h3" sx={{ 
          color: '#BFDEFF',
          fontWeight: 'bold',
          
        }}>
          {category.letter}
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          color: '#000000',
          
        }}>
          {category.title}
        </Typography>
      </Box>
      
      {/* Options */}
      {category.options.map((option, optionIndex) => (
       <Box
       key={optionIndex}
       sx={{
         width: 'calc((100% - 120px) / 3)',
         padding: "8px 4px",
         margin: '0 10px',
         height: '35px',
         borderRadius: "12px",
         cursor: "pointer",
         border:selectedOptions[categoryIndex] === optionIndex
         ? '1px solid #228BE6'
         : '1px solid #DEE2E6',
         backgroundColor: selectedOptions[categoryIndex] === optionIndex
           ? "#E9F4FD"
           : "#FFFFFF",
         color: selectedOptions[categoryIndex] === optionIndex
           ? "#228BE6"
           : "#000000",
         display: 'flex',                // Centering horizontally + vertically
         justifyContent: 'center',
         alignItems: 'center',
         textAlign: 'center',            // Optional: helps if content wraps
         "&:hover": {
           backgroundColor: selectedOptions[categoryIndex] === optionIndex
             ? "#228BE633"
             : "#E0E0E0",
         },
       }}
       onClick={() => handleSelect(categoryIndex, optionIndex)}
     >
          {option}
        </Box>
      ))}
    </Box>
  ))}

  {/* Footer */}
  <Box sx={{ 
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 8px",
    marginTop: "16px"
  }}>
    <Typography variant="h5" sx={{ 
      color: "#0F3B61",
      fontWeight: 'bold'
    }}>
      Total Score: {totalScore}
    </Typography>
    <Box sx={{ display: 'flex', gap: '16px' }}>
      <Button
        variant="outlined"
        onClick={handleReset}
        sx={{
          border: "1px solid #228BE6",
          color: "#228BE6",
          backgroundColor:'#E9F4FD',
          borderRadius: '8px',
          textTransform: 'none',
          padding: '8px 16px',
          
        }}
      >
        Reset
      </Button>
      <Button 
       
        onClick={handleSave}
    
        sx={{
          backgroundColor:'#228BE6',
          color:'#FFFFFF',
          borderRadius: '8px',
          textTransform: 'none',
          padding: '8px 16px',
          '&:hover': { 
            backgroundColor: '#0D3252' 
          }
        }}
      >
        Submit 
      </Button>
    </Box>
  </Box>
</Box>
      
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
                APGAR Score
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
      <Typography justifyContent={"center"} align="center">No Data available.</Typography>
    )}
  </Box>
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
