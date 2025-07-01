import { Box,Typography, TextField, Button,Grid, IconButton, TableRow,TableCell,Table,TableBody,TableContainer,Paper, MenuItem,Select,FormControl,
  Tab,
  Tabs,
  Stack,
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faClock } from "@fortawesome/free-solid-svg-icons";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

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

const medications = [
  { name: "Nutrition 1", dose: "120 ml/day", frequency: "Q36H", route: "IV", time: "12:30 PM", isCritical: true },
  { name: "Nutrition 2", dose: "120 ml/day", frequency: "Q36H", route: "IV", time: "10:00 AM" },
  { name: "Nutrition 3",dose: "120 ml/day", frequency: "Q36H", route: "IV", time: "10:00 AM" },
];
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
  
  return (
    <Box sx={{  borderRadius: "25px", padding: 2 }}>
     <Box sx={{ padding: 3, borderRadius: 5,backgroundColor: "#FFFFFF",marginBottom:3 }} > 
    {/* changing the logic */}
       <Box display="flex" justifyContent="center"  alignItems="center"  >
        <Typography variant="h6" sx={{ color: "#0F3B61" }}>Feeds & Nutrition</Typography>
       
 </Box>
 <Box sx={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", border: "1px solid #DBE2F2" }}>
 <Tabs   value={""} onChange={(_e, newValue) => (newValue)} indicatorColor="primary" textColor="inherit">
          <Tab label="Enteral" />
          <Tab label="Parenteral" />
          <Tab label="Blood Products" />
        </Tabs></Box>
      <Box sx={{ display: "flex", gap: 2,marginTop: 4 , marginBottom: 2 }}>
      <TextField
          label="Feed Type"
          sx={{ flex: 1 ,
         
            '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#DBE2F2', 
        },
      
      },  
            '& .MuiInputBase-root': {
              color: '#0F3B61', // Text color inside the input
            },
            '& .MuiInputLabel-root  ': {
              color: '#9BA1AE', // Label color (optional)
            },
            
          }}
        />
         <Select value={""} onChange={(e) => (e.target.value)} fullWidth 
      MenuProps={{MenuListProps: { disablePadding: true },sx: { '&& .Mui-selected': { backgroundColor: '#124D81',color: '#FFFFFF',},},}}
     sx={{
    '& .MuiSelect-icon': { color: '#0F3B61', backgroundColor: '#F2FBFF' },
    flex: 1,
    color: '#0F3B61',
    border: '1px solid #DBE2F2',
     // Adding the red border here
  }}>
      
      <MenuItem value="Oral">Oral</MenuItem>
      <MenuItem value="Intravenous" >Intravenous</MenuItem>
      <MenuItem value="Rectal">Rectal</MenuItem>
      <MenuItem value="Epidural">Epidural</MenuItem>
      <MenuItem value="Nasal">Nasal</MenuItem>

      </Select>
    

<Select
 
  onChange={(e) => (e.target.value)}
  fullWidth
  MenuProps={{MenuListProps: { disablePadding: true },sx: { '&& .Mui-selected': { backgroundColor: '#124D81',color: '#FFFFFF',},},}}
  sx={{
 '& .MuiSelect-icon': { color: '#0F3B61', backgroundColor: '#F2FBFF' },
 
 flex: 1,
 color: '#0F3B61',
 border: '1px solid #DBE2F2', // Adding the red border here
}}>
  <MenuItem 
    value="Q12H"
   
  >
    Q12H
  </MenuItem>
  <MenuItem  value="Q8H" > Q8H </MenuItem>
  <MenuItem 
    value="Q6H"
   
  >
    Q6H
  </MenuItem>
</Select>
         
 </Box>
      <Box sx={{ display: "flex", gap: 2,marginTop: 2 , marginBottom: 2 }}>
      <TextField
          label="EBM (ml)"
      
          type="number"
          // InputProps={{
          //   endAdornment: <InputAdornment position="end"  style={{color:'red',backgroundColor:'red'}} sx={{color:'red',backgroundColor:'red'}}>mg</InputAdornment>,
          // }}
        sx={{ flex: 1 ,
         
            '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#DBE2F2', 
        },
       
      },'& .MuiInputBase-root': {
              color: '#0F3B61', // Text color inside the input
            },
            '& .MuiInputLabel-root  ': {
              color: '#9BA1AE', // Label color (optional)
            },
            
          }}
        />
         <TextField
          label="Doxolac (ml)"
      
          type="number"
          // InputProps={{
          //   endAdornment: <InputAdornment position="end"  style={{color:'red',backgroundColor:'red'}} sx={{color:'red',backgroundColor:'red'}}>mg</InputAdornment>,
          // }}
        sx={{ flex: 1 ,
         
            '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#DBE2F2', 
        },
       
      },'& .MuiInputBase-root': {
              color: '#0F3B61', // Text color inside the input
            },
            '& .MuiInputLabel-root  ': {
              color: '#9BA1AE', // Label color (optional)
            },
            
          }}
        />
         <TextField
          label="Enfamil (ml)"
      
          type="number"
          // InputProps={{
          //   endAdornment: <InputAdornment position="end"  style={{color:'red',backgroundColor:'red'}} sx={{color:'red',backgroundColor:'red'}}>mg</InputAdornment>,
          // }}
        sx={{ flex: 1 ,
         
            '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#DBE2F2', 
        },
       
      },'& .MuiInputBase-root': {
              color: '#0F3B61', // Text color inside the input
            },
            '& .MuiInputLabel-root  ': {
              color: '#9BA1AE', // Label color (optional)
            },
            
          }}
        />

     

      </Box>
       <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
       <LocalizationProvider dateAdapter={AdapterDateFns}>
          <FormControl fullWidth>
            <DateTimePicker
              label="Start"
            
              format="dd/MM/yyyy hh:mm a"
              minDateTime={new Date()}
              slotProps={{
                textField: {
                  variant: "outlined",
                  fullWidth: true,
                  size: "medium",
                },
              }}
              sx={{ 
                marginBottom: 2, 
                '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#DBE2F2', // Border color when the field is not focused
            },
           
          },
                '& .MuiInputBase-root': {
                  color: '#0F3B61', // Text color inside the input
                },
                '& .MuiInputLabel-root  ': {
                  color: '#9BA1AE', // Label color (optional)
                },
                
              }}
            />
          </FormControl>
        </LocalizationProvider>
        <FormControl fullWidth>
        <TextField
          label="Category"
         
          sx={{ flex: 1 ,
         
            '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#DBE2F2', // Border color when the field is not focused
        },
       
      },
            '& .MuiInputBase-root': {
              color: '#0F3B61', // Text color inside the input
            },
            '& .MuiInputLabel-root  ': {
              color: '#9BA1AE', // Label color (optional)
            },
            
          }}
        />
       </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
          <FormControl fullWidth>
            <DateTimePicker
              label="End"
           
              format="dd/MM/yyyy hh:mm a"
              minDateTime={new Date()} // Prevent selecting past dates/times
              slotProps={{
                textField: {
                  variant: "outlined",
                  fullWidth: true,
                  size: "medium",
                },
              }}
              sx={{ 
                marginBottom: 2, 
                '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#DBE2F2', // Border color when the field is not focused
            },},
                '& .MuiInputBase-root': {
                  color: '#0F3B61', // Text color inside the input
                },
                '& .MuiInputLabel-root  ': {
                  color: '#9BA1AE', // Label color (optional)
                },}}
            />
          </FormControl>
        </LocalizationProvider>
      
       </Box>
      

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button variant="outlined" sx={{ borderColor: "#0F3B61", color: "#0F3B61" }}>
          Reset
        </Button>
        <Button
          variant="contained"
          
        >
          Submit
        </Button>
      </Box>

      <Box sx={{ marginTop: 3, display: "flex", alignItems: "center" }}>
        <Typography variant="body2" sx={{ color: "#0F3B61" }}>
          Assessed by
        </Typography>
        <Typography
          variant="body2"
          sx={{
            marginLeft: 1,
            display: "flex",
            alignItems: "center",
            color: "#0F3B61",
          }}
        >
          Dr.John
          <span style={{ color: "green", marginLeft: 4 }}></span>
        </Typography>
      </Box>
    </Box>
    <Box sx={{ backgroundColor: "#FFFFFF", mb: 2, borderRadius: 3,  }}>
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
</Box>
 </Box>

 <Box >
  <TableContainer
    component={Paper}
    elevation={0}
    sx={{
      backgroundColor: "#FFFFFF",
      borderRadius: 3,
      boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.1)",
    }}
  >
    <Table
      sx={{
        "& .MuiTableCell-root": {
          borderBottom: "none", // Remove default row border
        },
        "& .MuiTableRow-root:not(:last-child)": {
          borderBottom: "1px solid #E0E0E0", // Row border color
        },
      }}
    >
      <TableBody>
        {medications.map((medication, index) => (
          <TableRow
            key={index}
            sx={{"&:before": { content: '""', display: "block", width: "4px", height: "100%",  backgroundColor: medication.isCritical  ? "#FF5A5F"  : medication.isCritical ? "#FFD700"  : "#4CAF50", position: "absolute",  left: 0,  top: 0, },  position: "relative",  backgroundColor: medication.isCritical ? "#FFF7F7" : "inherit",  }} >
            {/* Medication Name */}
            <TableCell sx={{ color: medication.isCritical ? "red" : "#124D81" }}>
              {medication.name}
            </TableCell>

            {/* Dose */}
            <TableCell
              style={{ color: "#124D81" }}
              align="center"
            >
              {medication.dose}
            </TableCell>

            {/* Frequency */}
            <TableCell style={{ color: "#124D81" }} align="center">
              <FontAwesomeIcon
                icon={faClock}
                style={{
                  marginRight: "6px",
                  color: "#A7B3CD",
                }}
              />
              {medication.frequency}
            </TableCell>

            {/* Route */}
            <TableCell align="center">
              <Typography color="#A7B3CD">
                Route:{" "}
                <Typography
                  component="span"
                  color="#124D81"
                  fontWeight="bold"
                >
                  {medication.route}
                </Typography>
              </Typography>
            </TableCell>

            {/* Time */}
            <TableCell
              style={{
                color: medication.isCritical ? "red" : "#124D81",
                fontWeight: medication.isCritical ? "bold" : "normal",
              }}
              align="center"
            >
              {medication.time}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Box>
 </Box>
   
  );
};

