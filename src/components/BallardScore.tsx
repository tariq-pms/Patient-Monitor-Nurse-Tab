import{ useEffect, useState } from "react";
import {Box,Typography,Button,Grid,Stack,CardContent, TableContainer, TableRow, TableBody, Table, TableCell, TableHead, Paper, Snackbar, Alert, ToggleButton, ToggleButtonGroup,} from "@mui/material";
import posture from '../assets/posture1.png';
import posture1 from '../assets/posture2.png';
import posture2 from '../assets/posture3.png';
import posture3 from '../assets/posture4.png';
import posture4 from '../assets/posture5.png';
import squarewindow from '../assets/SquareWindow.png';
import squarewindow1 from '../assets/SquareWindow1.png';
import squarewindow2 from '../assets/SquareWindow2.png';
import squarewindow3 from '../assets/SquareWindow3.png';
import squarewindow4 from '../assets/SquareWindow4.png';
import squarewindow5 from '../assets/SquareWindow5.png';
import armrecoil from '../assets/armrecoil.png';
import armrecoil1 from '../assets/armrecoil1.png';
import armrecoil2 from '../assets/armrecoil2.png';
import armrecoil3 from '../assets/armrecoil3.png';
import armrecoil4 from '../assets/armrecoil4.png';
import poplitealangle from '../assets/PoplitealAngle.png';
import poplitealangle1 from '../assets/PoplitealAngle1.png';
import poplitealangle2 from '../assets/PoplitealAngle2.png';
import poplitealangle3 from '../assets/PoplitealAngle3.png';
import poplitealangle4 from '../assets/PoplitealAngle4.png';
import poplitealangle5 from '../assets/PoplitealAngle5.png';
import poplitealangle6 from '../assets/PoplitealAngle6.png';
import scarfsign from '../assets/ScarfSign.png';
import scarfsign1 from '../assets/ScarfSign1.png';
import scarfsign2 from '../assets/ScarfSign2.png';
import scarfsign3 from '../assets/ScarfSign3.png';
import scarfsign4 from '../assets/ScarfSign4.png';
import scarfsign5 from '../assets/ScarfSign5.png';
import heeltoear from '../assets/HeeltoEar.png';
import heeltoear1 from '../assets/HeeltoEar1.png';
import heeltoear2 from '../assets/HeeltoEar2.png';
import heeltoear3 from '../assets/HeeltoEar3.png';
import heeltoear4 from '../assets/HeeltoEar4.png';
import heeltoear5 from '../assets/HeeltoEar5.png';
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
  
}
interface BallardScoreProps {

  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
  UserRole: string;
 
}
//export const BallardScore = () => {
  export const  BallardScore: React.FC<BallardScoreProps> = (props) => {
  const categories = [
    {
      label: "Posture",
      options: [
        { label: ">90°", value: 0, image: posture },
        { label: "90°", value: 1, image: posture1 },
        { label: "60°", value: 2, image: posture2 },
        { label: "45°", value: 3,image: posture3 },
        { label: "30°", value: 4, image: posture4 },
       
      ],
      
    },
    {
      label: "Square Window (Wrist)",
      options: [
        { label: ">90°", value: -1 ,image: squarewindow },
        { label: "90°", value: 0 ,image: squarewindow1 },
        { label: "60°", value: 1 ,image: squarewindow2 },
        { label: "45°", value: 2 ,image: squarewindow3},
        { label: "30°", value: 3 ,image: squarewindow4},
        { label: "0°", value: 4 ,image: squarewindow5},
        
      ],
    },
    {
      label: "Arm Recoil",
      options: [
        
        { label: "180°", value: 0,image: armrecoil },
        { label: "140-180°", value: 1,image: armrecoil1  },
        { label: "110-140°", value: 2,image: armrecoil2  },
        { label: "90-110°", value: 3,image: armrecoil3  },
        { label: "<90°", value: 4,image: armrecoil4  },
      ],
    },
    {
      label: "Popliteal Angle",
      options: [
        { value: -1,image: poplitealangle },
        { value: 0,image: poplitealangle1 },
        {  value: 1,image: poplitealangle2 },
        { value: 2,image: poplitealangle3 },
        {  value: 3,image: poplitealangle4 },
        {  value: 4,image: poplitealangle5 },
        {  value: 5,image: poplitealangle6 },
      ],
    },
    {
      label: "Scarf Sign",
      options: [
         {  value: -1,image: scarfsign },
        {  value: 0,image: scarfsign1 },
        {  value: 1,image: scarfsign2 },
        {  value: 2,image: scarfsign3 },
        { value: 3,image: scarfsign4 },
        {  value: 4,image: scarfsign5 },
      
      ],
    },
    {
      label: "Heel to Ear",
      options: [
        { value: -1,image: heeltoear },
        {  value: 0,image: heeltoear1 },
        {  value: 1,image: heeltoear2 },
        {  value: 2,image: heeltoear3 },
        {  value: 3,image: heeltoear4 },
        { value: 4,image: heeltoear5 },
      ],
    },
  ];
  const categories1 = [
    { 
      label: "Skin",
       options: [
        {value: -1,text:"Sticky, Friable, Transparent"},
        {value: 0,text:"Gelatinous, Red, Translucent"},
        {value: 1,text: "Smooth Pink,Visible Veins"},
        {value: 2,text:"Superficial Peeling &/or Rash, Few Veins"},
        {value: 3,text:"Cracking, Pale Areas, Rare Veins"},
        {value: 4,text:"Parchment, Deep Cracking, No Vessels"},
        {value: 5,text:"Leathery, Cracked, Wrinkled"},
         ] },
    { label: "Lanugo",
       options: 
       [
        {value: -1,text: "None"},
        {value: 0,text:"Sparse"},
        {value: 1,text:"Abundant"},
        {value: 2,text:"Thinning"},
         {value: 3,text:"Bald areas"},
        {value: 4,text:"Mostly Bald"}
        ] },
    {
      label: "Plantar Surface",
      options: 
      [
        {value: -1,text:"Heel-toe (40-50mm:-1),(<40mm:-2)"},
        {value: 0,text:">50mm no Crease"},
        {value: 1,text:"Faint Red Marks"},
        {value: 2,text:"Anteriortransverse Crease only"},
        {value: 3,text:"Creases Ant. 2/3"},
        {value: 4,text:"Creases over Entire Sole"},
        
      ],
    },
    {
      label: "Breast",
      options: [
        {value: -1,text:"Imperceptable"},
        {value: 0,text:"Barely perceptable"},
        {value: 1,text:"Flat Areolano Bud"},
        {value: 2,text:"Stippled Areola 1-2 mm Aud"},
        {value: 3,text:"Raised Areola 3-4 mm Bud"},
        {value: 4,text:"Full Areola 5-10 mm Bud"},
      
        ],
    },
    { label: "Eye / Ear", 
      options: [
        {value: -1,text: "Lids Fused Loosely: -1 Tightly: -2"},
        {value: 0,text:"Lids Open Pinna Flat Stays Folded"},
        {value: 1,text:"Sl.Curved Pinna,Soft, Slow Recoil"},
        {value: 2,text:"Well-curved Pinna,Soft but Ready Recoil"},
        {value: 3,text:"Formed & Firm instant Recoil"},
        {value: 4,text:"Thick Cartilage Ear Stiff"}
        
      ] },
    { label: "Genitals (Male)", 
      options: [
        {value: -1,text: "Scrotum Flat, Smooth"},
        {value: 0,text:"Scrotum Empty,Faint Rugae"},
        {value: 1,text:"Testes in Upper Canal,Rare Rugae"},
        {value: 2,text:"Testes Descending,Few Rugae"},
        {value: 3,text:"Testes Down,Good Rugae"},
        {value: 4,text:"Testes Pendulous,Deep Rugae"}
             
      ] },
  ];
 // Combine all options for easier handling
 const allCategories = [...categories, ...categories1];

 // Initialize selectedOptions with null for each category in the combined list
 const [selectedOptions, setSelectedOptions] = useState(new Array(allCategories.length).fill(null));
 const [totalScore, setTotalScore] = useState(0);
 const [activeTab, setActiveTab] = useState(0);
 const [gestationalAge, setGestationalAge] = useState<number | null>(null);

 // Handle option selection and update the score
//  const handleOptionSelect = (categoryIndex: number, optionIndex: number) => {
//    const newSelectedOptions = [...selectedOptions];
//    newSelectedOptions[categoryIndex] = optionIndex; // Store the selected option index
//    setSelectedOptions(newSelectedOptions);

//    // Calculate total score by summing the selected values from both categories
//    const newScore = newSelectedOptions.reduce((score, selectedOption, idx) => {
//      if (selectedOption !== null) {
//        const currentCategory = allCategories[idx]; // Get the current category
//        const option = currentCategory.options[selectedOption];
       
//        // Handle Neuromuscular options (with value)
//        if (typeof option === 'object' && 'value' in option) {
//          return score + option.value; // Add the option value to the score
//        }
       
//        // Handle Physical options (strings)
//        if (typeof option === 'string') {
//          // We can assign a predefined score for each string option, for example, based on index
//          return score + (selectedOption + 1); // Each option in Physical gets a score based on its index
//        }
//      }
//      return score;
//    }, 0);
//    setTotalScore(newScore); // Set the new total score
//  };
const handleOptionSelect = (categoryIndex: number, optionIndex: number) => {
  const newSelectedOptions = [...selectedOptions];
  newSelectedOptions[categoryIndex] = optionIndex; // Store the selected option index
  setSelectedOptions(newSelectedOptions);

  // Calculate total score by summing the selected values from both categories
  const newScore = newSelectedOptions.reduce((score, selectedOption, idx) => {
    if (selectedOption !== null) {
      const currentCategory = allCategories[idx]; // Get the current category
      const option = currentCategory.options[selectedOption];
      
      // Handle Neuromuscular options (with value)
      if (typeof option === 'object' && 'value' in option) {
        return score + option.value; // Add the option value to the score
      }
      
      // Handle Physical options (strings)
      if (typeof option === 'string') {
        // We can assign a predefined score for each string option, for example, based on index
        return score + (selectedOption + 1); // Each option in Physical gets a score based on its index
      }
    }
    return score;
  }, 0);

  setTotalScore(newScore); // Set the new total score

  // Mapping of Ballard score to gestational age
  const ballardScoreToGestationalAge = new Map<number, number>([
    [-10, 20],
    [-5, 22],
    [0, 24],
    [5, 26],
    [10, 28],
    [15, 30],
    [20, 32],
    [25, 34],
    [30, 36],
    [35, 38],
    [40, 40],
    [45, 42],
    [50, 44],
  ]);

  // Function to get the closest gestational age for a given Ballard score
  const getGestationalAge = (score: number): number => {
    // Get all available Ballard score keys
    const scores = Array.from(ballardScoreToGestationalAge.keys()).sort((a, b) => a - b);

    // Find the closest lower and upper scores for interpolation
    let lowerScore = scores[0];
    let upperScore = scores[0];

    for (let i = 1; i < scores.length; i++) {
      if (score <= scores[i]) {
        upperScore = scores[i];
        lowerScore = scores[i - 1];
        break;
      }
    }

    const lowerGA = ballardScoreToGestationalAge.get(lowerScore) || 0; // Default fallback if not found
    const upperGA = ballardScoreToGestationalAge.get(upperScore) || 0; // Default fallback if not found

    // If the score matches exactly with one of the keys, return the corresponding gestational age
    if (score === lowerScore) {
      return lowerGA;
    }

    // Interpolate between the two closest values
    const slope = (upperGA - lowerGA) / (upperScore - lowerScore);
    return lowerGA + slope * (score - lowerScore);
  };

  // Retrieve gestational age using the function
  const gestationalAge = getGestationalAge(newScore);
  setGestationalAge(gestationalAge); // Save gestational age to state
};
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

const handleCloseSnackbar = () => {
  setSnackbarOpen(false);
};


 const handleReset = () => {
   setSelectedOptions(new Array(allCategories.length).fill(null)); // Reset selections
   setTotalScore(0); // Reset score
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
    id: procedureResourceId || undefined, // Include the `id` if updating an existing resource
    status: "completed",
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "32455-3",
          display: "Ballard Score Assessment",
        },
      ],
      text: "Ballard Score Assessment",
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
  };

  try {
    if (procedureResourceId) {
      // Update the existing Procedure resource
      const updateResponse = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/Procedure/${procedureResourceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
          body: JSON.stringify(procedureData),
        }
      );

      if (!updateResponse.ok) {
        const errorBody = await updateResponse.text();
        console.error("Error response body:", errorBody);
        throw new Error(`Update failed: ${updateResponse.statusText}`);
      }

      const contentType = updateResponse.headers.get("content-type");
      const updateData = contentType && contentType.includes("application/json")
        ? await updateResponse.json()
        : null;

      console.log("Procedure updated successfully:", updateData);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setSnackbarMessage("Procedure updated successfully!");
      await fetchProcedureHistory(procedureResourceId);
    } else {
      // Create a new Procedure resource if no existing one is found
      const apiUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Procedure`;
      const createResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa("fhiruser:change-password"),
        },
        body: JSON.stringify(procedureData),
      });

      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        console.error("Error response body:", errorBody);
        throw new Error(`Create failed: ${createResponse.statusText}`);
      }

      const contentType = createResponse.headers.get("content-type");
      const createData = contentType && contentType.includes("application/json")
        ? await createResponse.json()
        : null;

      setProcedureResourceId(createData?.id); // Update state with the new ID
      console.log("Procedure saved successfully:", createData);
      setSnackbarMessage("Procedure saved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  } catch (error) {
  console.error("Error saving Procedure resource:", error);
  
  setSnackbarMessage("An error occurred while saving the procedure.");
  setSnackbarSeverity("error");
  setSnackbarOpen(true);
} finally {
    setLoading(false);
  }
};



const fetchProcedureHistory = async (id: string) => {
  if (!id) return;

  try {
    const searchUrl = `${import.meta.env.VITE_FHIRAPI_URL}/Procedure/${id}/_history?_count=20`;
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("fhiruser:change-password"),
      },
    });

    if (response.ok) {
      const searchData = await response.json();
      const filteredHistory = (searchData.entry || []).filter(
        (entry: { resource: { code: { coding: any[]; text: string } } }) =>
          entry.resource.code?.coding?.some(
            (coding) =>
              coding.system === "http://loinc.org" &&
              coding.code === "32455-3" &&
              coding.display === "Ballard Score Assessment"
          ) && entry.resource.code.text === "Ballard Score Assessment"
      );
      setProcedureHistory(filteredHistory);
    } else {
      console.error("Failed to fetch Procedure resource history.");
    }
  } catch (error) {
    console.error("Error fetching Procedure history:", error);
  }
};
useEffect(() => {
  if (procedureResourceId) {
    fetchProcedureHistory(procedureResourceId);
  }
}, [procedureResourceId]);
 
return (
    <>
   <ProtectedModule module="Assessments" action="create">
    <Box sx={{ borderRadius: "25px",  padding: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", }}>
        {/* <Typography variant="h5" sx={{ color: "#0F3B61" }}>
          Ballard Score
        </Typography> */}
        <ToggleButtonGroup
  value={activeTab}
  exclusive
  onChange={(_e, newValue) => {
    if (newValue !== null) setActiveTab(newValue);
  }}
  color="primary"
  sx={{
    color:'red',
    borderRadius: 2,
    border: '1px solid #ccc',
    overflow: 'hidden',
  }}
>
  <ToggleButton value={0} sx={{ color:'#228BE6' }}>
    Neuromuscular
  </ToggleButton>
  <ToggleButton value={1} sx={{color:'#228BE6' }}>
    Physical
  </ToggleButton>
</ToggleButtonGroup>
      </Box>

      {/* Neuromuscular Tab */}
      {activeTab === 0 && (
        <Grid container direction={'column'} spacing={2} >
          {categories.map((category, index) => (
            <Grid key={category.label} item xs={12} sm={6} md={4}>
              <Box>
              <Typography variant="subtitle1" sx={{ color: "#0F3B61",fontWeight:'bold' }}>
                  {category.label}
                </Typography>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {category.options.map((option, optionIndex) => (
                      <Box
                        key={optionIndex}
                        sx={{
                          border: "1px solid #0F3B61", borderRadius: 2,
                          backgroundColor: selectedOptions[index] === optionIndex ? "#0F3B61" : "#FFFFFF",
                          color: selectedOptions[index] === optionIndex ? "#FFFFFF" : "#000000",
                          cursor: 'pointer',
                          "&:hover": {
                            backgroundColor: selectedOptions[index] === optionIndex ? "#0F3B61" : "#E0E0E0",
                          },
                        }}
                        onClick={() => handleOptionSelect(index, optionIndex)}
                      >
                        <img
                          src={option.image}
                          alt={`${category.label} - Option ${optionIndex}`}
                          style={{
                            width: "90%",
                            height: "100%",
                            filter: selectedOptions[index] === optionIndex ? "brightness(0) invert(1)" : "none",
                            transition: "filter 0.3s ease",
                          }} />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Physical Tab */}
      {activeTab === 1 && (
        <Grid container direction={'column'} spacing={2}>
          {categories1.map((category, index) => (
            <Grid key={category.label} item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: "#0F3B61",fontWeight:'bold' }}>
                  {category.label}
                </Typography>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {category.options.map((option, optionIndex) => (

                      <Box
                        key={optionIndex}
                        sx={{
                          alignContent: 'center',
                          textAlign: 'center',
                          padding: 0.8,
                          border: "1px solid #0F3B61", borderRadius: 2,
                          backgroundColor: selectedOptions[index + categories.length] === optionIndex ? "#0F3B61" : "#FFFFFF",
                          color: selectedOptions[index + categories.length] === optionIndex ? "#FFFFFF" : "#000000",
                          cursor: 'pointer',
                          "&:hover": {
                            backgroundColor: selectedOptions[index + categories.length] === optionIndex ? "#0F3B61" : "#E0E0E0",
                          },
                        }}
                        onClick={() => handleOptionSelect(index + categories.length, optionIndex)}
                      >

                        <Typography variant="subtitle2" style={{ fontWeight: 500, transition: "filter 0.3s ease", }}>{option.text}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 2 }}>
        <Typography variant="h6" sx={{ color: "#0F3B61" }}>
          Total Score: {totalScore}
        </Typography>
        <Typography variant="h6" sx={{ color: "#0F3B61" }}>
        GA: {gestationalAge} weeks
        </Typography>
        <Stack direction={'row'} spacing={2}>
          <Button variant="outlined" color="secondary" onClick={handleReset} sx={{
          border: "1px solid #228BE6",
          color: "#228BE6",
          backgroundColor:'#E9F4FD',
          borderRadius: '8px',
          textTransform: 'none',
          padding: '8px 16px',
          
        }}>Reset</Button>
          <Button  onClick={handleSave}sx={{
          backgroundColor:'#228BE6',
          color:'#FFFFFF',
          borderRadius: '8px',
          textTransform: 'none',
          padding: '8px 16px',
          '&:hover': { 
            backgroundColor: '#0D3252' 
          }
        }}>Submit</Button>
        </Stack>
      </Box>
    </Box> </ProtectedModule>
    <ProtectedModule module="Assessments" action="create">
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
                Ballard Score
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
  </Box> </ProtectedModule>
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
