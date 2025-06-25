
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { isArray } from "chart.js/helpers";
import { FC, useEffect, useState } from "react";
import { NewPatientDetails } from "./NewPatientDetails";
import { faBed, faDroplet, faHeartPulse, faLungs, faNotesMedical, faPrescription, faTemperatureHalf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";


export interface PatientDetails {
    onClick: () => void;
    key: string;
    patient_id: string;
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
    observation_resource_id: string;

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
              "valueQuantity": {
                  "value": number;
                  "unit": string;
                  "system": string;
                  "code": string;
              };
          }[];
    }[];
    communication_resource: {
      meta: any;
      "id" : string;
      "status" : string;
      "resourceType": string;
      "sent": string;
      "category" : {
      "coding" : {
          "system" : string;
          "code" : string;
          }[];
          "text" : string;
      }[];
      "subject": {
          "reference": string;
      };
      "sender": {
          "reference": string;};
      "payload":{
          "contentReference":{
              "display": string;
          };}[];
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
    darkTheme:boolean;
    selectedIcon:string; 
  }


export const PatientCard: FC<PatientDetails> = (props): JSX.Element => {
    console.log('PatientCard props:', props);
    const [obsResource, setObsResource] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false);
    const [, setIsBlinking] = useState(false);
    
    const [alarmColor, setAlarmColor] = useState("")
    const [obsmeta, setobsmeta] = useState<any[]>([])
    const [commeta, setcommeta] = useState<any[]>([])
    const [requiredForTimer, setRequiredForTimer] = useState(false)
    const [borderRadiusForRerender, setBorderRadiusForRerender] = useState(true)
    const [newData, setNewData] = useState(false)
    const [, setDisplayAlarm] = useState("")
    
    useEffect(() => {
            if(isArray(props.observation_resource)){
            if(props.observation_resource.length>0){
                // console.log(props.observation_resource)
                var change = false
                    props.observation_resource.map((val, index) => {
                        if(val.meta.versionId!=obsmeta[index]){
                            // console.log(props.patient_id)
                            
                            var tempVar = obsmeta
                            tempVar[index] = String(val.meta.versionId)
                            setobsmeta(tempVar)
                            change = true
                            }
                    })
                    if(change){
                        setBorderRadiusForRerender(!borderRadiusForRerender)
                        setObsResource(props.observation_resource.flat())
                        setRequiredForTimer(!requiredForTimer)
                        setNewData(true);
                    }
            }

        }
        
        if(isArray(props.communication_resource)){
            if(props.communication_resource.length>0 ){
                var change = false
                props.communication_resource.map((val, index) => {
                    if(val.meta.versionId!=commeta[index]){
                        var tempVar2 = commeta
                        tempVar2[index] = String(val.meta.versionId)
                        setcommeta(tempVar2)
                        change=true
                        
                        if(val && val.extension){
                            for(var i=0;i<val.extension[1].valueCodeableConcept.coding.length;i++){
                                if(val.extension[1].valueCodeableConcept.coding[i].code=="High Priority"){
                                    setDisplayAlarm(String(val.extension[0].valueCodeableConcept.coding[i].display))
                                    setAlarmColor('red')
                                    break
                                }
                                else {
                                    setDisplayAlarm(String(val.extension[0].valueCodeableConcept.coding[i].display))
                                    setAlarmColor('yellow')
                                }
                            } } }})}}
},[props])
        
    useEffect(() => {
        let intervalId: number | undefined;
    
        if (newData) {
          intervalId = setInterval(() => {
            setIsBlinking((prevIsBlinking) => !prevIsBlinking);
          }, 300); 
        } else {
            
          clearInterval(intervalId);
          setIsBlinking(false);
        }
    
        return () => {
          clearInterval(intervalId);
        };
      }, [alarmColor]);

    useEffect(() => {
    let timer: number | undefined;
    if(newData){
        timer = setInterval(() => {setNewData(false);setAlarmColor("#202020");clearInterval(timer)},2000)
    }

    return () => {
        
        clearInterval(timer); 
    };
    }, [requiredForTimer,newData])

    function finddata(x: string){
        var hasvalue = false
        for(var i=0;i<obsResource.length;i++){
            let index = obsResource[i].component?.findIndex((item: { code: { text: string; }; }) => item.code.text===x)
            if(index==-1){
                continue;
            }
            else{
                if(index){
                    let data = Number(obsResource[i].component[index]?.valueQuantity.value)
                    data = Math.round((data + Number.EPSILON) * 100) / 100
                    let unit = obsResource[i].component[index]?.valueQuantity.unit
                    hasvalue = true
                    return ({data:data, unit:unit})
                }
                
            }
            
        }
        if(!hasvalue){
            return({data: "--", unit: "--"})
        }
        
    }
    const navigate = useNavigate();

    const handleCardClick = () => {
      navigate(`/patient/${props.patient_resource_id}`, {
        state: {
          patientName:  props.patient_name,
          patientId: props.patient_id,
          deviceId:props.device,
          observation:props.observation_resource_id,
          patientResourceId:props.patient_resource_id
        
           },
            });
    };

  //     const handleCardClick = () => {
  //   navigate(`/service-device/${organizationData.id}`, {
  //     state: {
  //       deviceList,
  //       organizationId: organizationData.id,
  //     },
  //   });
  // };

   
    return (
        <Box
        width={{
          xs: "350px",
          sm: "700px",
          md: "500px",
          lg: "500px"
        }}
        sx={{
          padding: "10px",
          height: "100px", // Set a fixed height for the outer Box
        }}
      >
        <Card
        onClick={handleCardClick}
          sx={{
            backgroundColor: props.darkTheme ? "#1C1C1E" : "#FFFFFF",
            borderRadius: "10px",
            maxHeight: "100%", // Ensure it fills the parent's height
            height: "100%", // Fixed height to match the parent Box
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              padding: "0",
              height: "100%", // Ensures the CardContent fills the Card
            }}
          >
            {/* first Section */}
            <Grid
              item
              sx={{
                width: "40%", // Occupy 50% of the outer Box's width
                backgroundColor: "#F9FAFF",
                borderRight: "1px solid #E0E0E0",
                height: "100%", // Ensures it fills the parent's height
              }}
            >
              {/* Header Section */}
              <Stack
                direction="row"
                height={'40%'}
                justifyContent="space-around"
                sx={{ backgroundColor: "#6B81A1" }}
              >
                <Stack direction="row" alignItems="center">
                  <Typography variant="subtitle1" sx={{ color: "#FFFFFF" }}>
                  B/O - {props.patient_name}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FontAwesomeIcon icon={faBed} color="BDC7DF" />
                  <Typography variant="subtitle2" color="#FFFFFF">
                    {/* 6-II */}
                    {props.patient_id} 
                  </Typography>
                </Stack>
              </Stack>
      
              {/* Weight and Gestation Age */}
              <Stack
               height={'60%'}
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={5}
                sx={{ backgroundColor: "#FFFFFF" }}
              >
                <Typography
                  variant="h5"
                  color="#FF4A4A"
                  sx={{
                    backgroundColor: "#FFEDED",
                    textAlign: "center",
                  }}
                >
                  {(() => {
                             let data = finddata("Measure Weigh")
                                                                             return (data!.data)
                                                                           }
                                                                       )()} g{" "}
                  <Typography
                    component="span"
                    variant="subtitle2"
                    color="#FF4A4A"
                    sx={{ fontWeight: "medium", textAlign: "center" }}
                  >
                    ↓ 125 g
                  </Typography>
                </Typography>
      
                <Typography
                  variant="subtitle1"
                  color="#124D81"
                  sx={{ textAlign: "center" }}
                >
                  G.A.: 22 Wk
                </Typography>
              </Stack>
            </Grid>
            {/* second Section */}
            <Grid
              item
              sx={{
                width: "30%", // Occupy 50% of the outer Box's width
               
                
                height: "100%", // Ensures it fills the parent's height
              }}
            >
            
              <Stack
                direction="row"
                height={'50%'}
                justifyContent="space-around"
               
                
              >
                <Stack direction="row" alignItems="center" >
                  <Typography variant="h6" sx={{ color: "#124D81" }}>
                  <FontAwesomeIcon
                            icon={faHeartPulse}
                           style={{
                             
                              color: "red",
                             
                             }}
                          />  {(() => {
                              // let data = finddata("Pulse Rate")
                              let data = finddata("Current Pulse Rate")

                              return (data!.data)
                      })()}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                
                <Typography variant="h6" sx={{  color: "#124D81" }}>
                <FontAwesomeIcon
                            icon={faDroplet}
                           style={{
                             
                              color: "#0CB0D3",
                             
                             }}
                          />  {(() => {
                              let data = finddata("Current SpO2")
                              return (data!.data)
                      })()}
                  </Typography>
                </Stack>
              </Stack>
      
              {/* Weight and Gestation Age */}
              <Stack
                direction="row"
                height={'50%'}
                justifyContent="space-around"
                
              >
                <Stack direction="row" alignItems="center">
                  <Typography variant="h6" sx={{  color: "#124D81"}}>
                  <FontAwesomeIcon
                            icon={faTemperatureHalf}
                           style={{
                             
                              color: "#FF9D61",
                             
                             }}
                          />    {(() => {
                              let data1 = finddata("Measured Skin Temp 2");
                              let data2 = finddata("Measured Skin Temp 1");
                              if (data1 && data1.data !== 0) {
                                  return data1.data;
                              } else if (data2 && data2.data !== 0) {
                                  return data2.data;
                              } else {
                                  return "No Data Available";
                              }
                          })()}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                
                <Typography variant="h6" sx={{ color: "#124D81"}}>
                <FontAwesomeIcon
                            icon={faLungs}
                           style={{
                             
                              color: "#EACB1C",
                             
                             }}
                          /> 98
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
             {/* third Section */}
            <Grid
              item
              sx={{
                width: "30%", // Occupy 50% of the outer Box's width
                backgroundColor: "#F9FAFF",
                
                height: "100%", // Ensures it fills the parent's height
              }}
            >
            
              <Stack
                direction="row"
                height={'40%'}
                alignItems={'center'}
                justifyContent={'center'}
                sx={{ backgroundColor: "#3496BA" }}
              >
                
                <Stack direction="row" spacing={1} >
                  <FontAwesomeIcon icon={faBed} color="BDC7DF" />
                  <Typography variant="subtitle2" color="#FFFFFF">
                   CBC Test
                  </Typography>
                </Stack>
              </Stack>
      
              {/* Weight and Gestation Age */}
              <Stack
               height={'60%'}
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={5}
                sx={{ backgroundColor: "#FFFFFF" }}
              >
                <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#F2FBFF",
                            textTransform: "none",
                            color: "#FFFFFF",
                            height:'70%',
                            fontWeight: "bold",
                           
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faPrescription}
                           style={{
                              textTransform: "none",
                              color: "#124D81",
                             
                             }}
                          />
                         
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#FFFBF2",
                            textTransform: "none",
                            color: "#FFFFFF",
                            height:'70%',
                            fontWeight: "bold",
                           
                          }}
                        >
                        <FontAwesomeIcon
                            icon={faNotesMedical}
                           style={{
                              textTransform: "none",
                              color: "#124D81",
                             
                             }}
                          />
                        </Button>
              </Stack>
            </Grid>
            
          </CardContent>
        </Card>
      
        {/* Dialog for Patient Details */}
        {/* {props.selectedIcon !== "vertical" && (
          <NewPatientDetails
            isDialogOpened={isOpen}
            handleCloseDialog={() => setIsOpen(false)}
            {...props}
          />
        )} */}
      </Box>
    )
}

