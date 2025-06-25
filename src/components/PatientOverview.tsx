import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  IconButton,
  Card,
  CardContent,
  Tooltip,
  TableRow,
  TableCell,
  Table,
  TableBody,
  TableContainer,
  Paper,
  Autocomplete,
  MenuItem,
  Select,
 
  FormControl,
  Stack,

} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faCapsules, faChevronRight, faClock, faDroplet, faHeartPulse, faLungs, faPrescription, faTemperatureHalf } from "@fortawesome/free-solid-svg-icons";
interface PatientOverviewProps {
   
    darkTheme: boolean;
    patientName: string;
    patientId: string;
    deviceId:string;
    observationId:string;
  }
  //export const DeviceInService: React.FC<DeviceInServiceProps> = ({
export const PatientOverview : React.FC<PatientOverviewProps> = () => {

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
  const medications = [
    { name: "Apnical/Caffeine citrate", dose: "12.5 mg", frequency: "Q36H", route: "IV", time: "12:30 PM", isCritical: true },
    { name: "Rosicillin/Ampicillin", dose: "8 mg", frequency: "Q36H", route: "IV", time: "10:00 AM" },
    { name: "Rosicillin/Ampicillin", dose: "8 mg", frequency: "Q36H", route: "IV", time: "10:00 AM" },
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
   
    <Box sx={{ flexGrow: 1, overflowY: "auto",mr:1,ml:1 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-around",backgroundColor: "#FFFFFF", alignItems: "center",borderRadius:3, mb: 2 }}>
          <Stack direction="row" >
                  <Typography variant="h4" sx={{ color: "#124D81" }}>
                  <FontAwesomeIcon
                            icon={faHeartPulse}
                           style={{
                             
                              color: "red",
                             
                             }}
                          />  55
                  </Typography>
                </Stack>
                <Stack direction="row"  style={{padding:'1%'}}>
                  <Typography variant="h4" sx={{  color: "#124D81"}}>
                  <FontAwesomeIcon
                            icon={faTemperatureHalf}
                           style={{
                             
                              color: "#FF9D61",
                             
                             }}
                          />  99
                  </Typography>
                </Stack>
                <Stack direction="row" style={{padding:'1%'}} >
                
                <Typography variant="h4" sx={{  color: "#124D81" }}>
                <FontAwesomeIcon icon={faDroplet} style={{ color: "#0CB0D3" }}/>  111
                  </Typography>
                </Stack>
             
      
              {/* Weight and Gestation Age */}
             
               
                <Stack direction="row"style={{padding:'1%'}}>
                
                <Typography variant="h4" sx={{ color: "#124D81"}}>
                <FontAwesomeIcon
                            icon={faLungs}
                           style={{
                             
                              color: "#EACB1C",
                             
                             }}
                          /> 98
                  </Typography>
                </Stack>
                <Stack direction="row"  >
                
                <IconButton
  sx={{
    width:'100%',
    height:'100%',
    backgroundColor: "#F2FBFF", // Light blue background
    color: "#124D81", // Text/icon color
    border: "1px solid #E0E0E0", // Grey border
    borderRadius: "8px", // Slightly rounded edges
   // Spacing inside the button
     // Subtle shadow effect
    "&:hover": {
      backgroundColor: "#E0F7FF", // Lighter shade on hover
    },
  }}
><FontAwesomeIcon
                            icon={faArrowTrendUp}
                           style={{
                             
                              color: "#124D81",
                             
                             }}
                          /> </IconButton>  
                
                 
                </Stack>
             
         
        </Box>
     <Box sx={{ backgroundColor: "#FFFFFF", mb: 2, borderRadius: 3,  }}>
    <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 1,
          borderBottom: "1px solid #E0E0E0",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#9BA1AE" }}>
        <FontAwesomeIcon
                            icon={faCapsules}
                           style={{
                              
                              color: "#9BA1AE",
                             
                             }}
                          /> Medications
        </Typography>
        <IconButton
  sx={{
    backgroundColor: "#F2FBFF", // Light blue background
    color: "#124D81", // Text/icon color
    border: "1px solid #E0E0E0", // Grey border
    borderRadius:3, // Slightly rounded edges
    padding: "12px", // Spacing inside the button
     // Subtle shadow effect
    "&:hover": {
      backgroundColor: "#E0F7FF", // Lighter shade on hover
    },
  }}
>
  <FontAwesomeIcon
    icon={faPrescription}
    style={{
      fontSize: "1.5rem", // Adjust the size of the icon
      color: "#124D81", // Icon color
    }}
  />
</IconButton>

      </Box>
<Box sx={{ padding: 2 }}>
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
{/* Feeds */}
     {/* Fluid Summary Section */}
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
            <Typography color={'#9BA1AE'} variant="subtitle1">Lab Results</Typography>
         
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

