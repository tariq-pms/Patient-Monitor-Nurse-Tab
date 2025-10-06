
import { Box,  Card, CardContent, Grid, IconButton, Stack, Typography } from "@mui/material";
import { isArray } from "chart.js/helpers";
import { FC, useEffect, useState } from "react";
import { faArrowTrendUp, faBed,  faDroplet,  faFlask, faHeartPulse, faLungs, faNotesMedical, faPrescription, faTemperatureHalf } from "@fortawesome/free-solid-svg-icons";
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
    // selectedIcon:string; 
  }


export const PatientCard: FC<PatientDetails> = (props): JSX.Element => {
    console.log('PatientCard props:', props);
    const [obsResource, setObsResource] = useState<any[]>([])
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
      let intervalId: ReturnType<typeof setInterval> | undefined;

    
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
      let timer: ReturnType<typeof setInterval> | undefined;
   
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
          observation:props.observation_resource,
          patientResourceId:props.patient_resource_id
        
           },
            });
    };

   
    return (
      <Box
      width="100%"
      sx={{
        mb: 1,
      height:'80px'
      }}
    >
      <Card
        onClick={handleCardClick}
        sx={{
          backgroundColor: props.darkTheme ? "#1C1C1E" : "#FFFFFF",
          borderRadius: "16px",
          height: "100%",
          display: "flex",
          mb: 1,
          flexDirection: "column",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            p: 0,
            height: "100%",
            width: "100%",
          }}
        >
          {/* First Section - Patient Info */}
          <Box
            sx={{
              flex: { xs: "1 1 auto", md: "0 0 35%" },
              backgroundColor: "#F9FAFF",
              borderRight: { md: "1px solid #E0E0E0" },
              borderBottom: { xs: "1px solid #E0E0E0", md: "none" },
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: "80px", md: "100%" },
            }}
          >
            {/* Header */}
            <Stack
              direction="row"
              sx={{
                height: { xs: "40px", md: "60%" },
                backgroundColor: "#2A6194",
                px: 2,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle1" sx={{ color: "#FFFFFF", fontSize: { xs: "0.875rem", md: "1rem" } }}>
                B/O - {props.patient_name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <FontAwesomeIcon icon={faBed} color="#BDC7DF" />
                <Typography variant="subtitle1" color="#FFFFFF" sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                  {props.patient_id}
                </Typography>
              </Stack>
            </Stack>
    
            {/* Weight + GA */}
            <Stack
              sx={{
                height: { xs: "40px", md: "50%" },
                flexDirection: "row",
                justifyContent: { xs: "space-around", md: "space-evenly" },
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                flexWrap: "wrap",
                gap: { xs: 1, md: 0 },
              
              }}
            >
              <Typography
                variant="h6"
                color="#FF4A4A"
                sx={{
                  backgroundColor: "#FFEDED",
                  borderRadius: 2,
                  px: 1,
                  textAlign: "center",
                  fontSize: { xs: "0.875rem", md: "1.25rem" },
                }}
              >
                2130{" "}
                <Typography
                  component="span"
                  variant="subtitle2"
                  color="#FF4A4A"
                  sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                >
                  ↓ 125 g
                </Typography>
              </Typography>
              <Typography variant="subtitle1" color="#124D81" sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                G.A.: 22 Wk
              </Typography>
            </Stack>
          </Box>
    
          {/* Second Section - Vital Signs */}
          <Box
            sx={{
              flex: { xs: "1 1 auto", md: "0 0 35%" },
              display: "flex",flexDirection: "column",minHeight: { xs: "80px", md: "50%" },
              borderRight: { md: "1px solid #E0E0E0" },
              borderBottom: { xs: "1px solid #E0E0E0", md: "none" },
            }}
          >
            {/* First Row */}
            <Stack
              direction="row"
              sx={{
                height: { xs: "40px", md: "50%" },
                justifyContent: "space-around",
                alignItems: "center",
                flexWrap: "wrap",
                gap: { xs: 1, md: 0 },
                px: 1,
              }}
            >
              <Typography variant="h6" sx={{ color: "#124D81", fontSize: { xs: "0.875rem", md: "1.25rem" } }}>
                <FontAwesomeIcon icon={faHeartPulse} style={{ fontSize: { xs: "1rem", md: "1.2rem" }, color: "red" }} />{" "}
                {finddata("Current Pulse Rate")?.data}
              </Typography>
              <Typography variant="h6" sx={{ color: "#124D81", fontSize: { xs: "0.875rem", md: "1.25rem" } }}>
                <FontAwesomeIcon icon={faDroplet} style={{ fontSize: { xs: "1rem", md: "1.2rem" }, color: "#0CB0D3" }} />{" "}
                {finddata("Current SpO2")?.data}
              </Typography>
            </Stack>
    
            {/* Second Row */}
            <Stack
              direction="row"
              sx={{
                height: { xs: "40px", md: "50%" },
                justifyContent: "space-around",
                alignItems: "center",
                flexWrap: "wrap",
                gap: { xs: 1, md: 0 },
                px: 1,
              }}
            >
              <Typography variant="h6" sx={{ color: "#124D81", fontSize: { xs: "0.875rem", md: "1.25rem" } }}>
                <FontAwesomeIcon icon={faTemperatureHalf} style={{ fontSize: { xs: "1rem", md: "1.2rem" }, color: "#FF9D61" }} />{" "}
                {(() => {
                  let t2 = finddata("Measured Skin Temp 2");
                  let t1 = finddata("Measured Skin Temp 1");
                  return t2?.data || t1?.data || "No Data";
                })()}
              </Typography>
              <Typography variant="h6" sx={{ color: "#124D81", fontSize: { xs: "0.875rem", md: "1.25rem" } }}>
                <FontAwesomeIcon icon={faLungs} style={{ fontSize: { xs: "1rem", md: "1.2rem" }, color: "#EACB1C" }} />{" "}
                98
              </Typography>
            </Stack>
          </Box>
    
          {/* Third Section - Action Buttons */}
          
          <Box sx={{marginTop:'0.5%',
              flex: { xs: "1 1 auto", md: "0 0 30%" },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              
            }}
          >
            <Stack 
              direction="row" 
              sx={{
                flexWrap: "wrap",
                justifyContent: "space-around",
                gap: { xs: 1, md: 2 },
                width: "100%",
                px: 1,
              }}
            >
              {[faPrescription, faNotesMedical, faArrowTrendUp, faFlask].map((icon, idx) => (
                <IconButton
                  key={idx}
                  sx={{
                    backgroundColor: props.darkTheme ? "#3A3A3E" : "#E6F7FF",
                    borderRadius: 2,
                    width: { xs: "40px", sm: "50px", md: "60px" },
                    height: { xs: "40px", sm: "50px", md: "60px" },
                    '&:hover': {
                      backgroundColor: props.darkTheme ? "#4A4A4E" : "#D0F0FF",
                    }
                  }}
                >
                  <FontAwesomeIcon 
                    icon={icon} 
                    style={{ 
                      color: props.darkTheme ? "#228BE6" : "#228BE6",
                      fontSize: { xs: "0.9rem", md: "1rem" } 
                    }} 
                  />
                </IconButton>
              ))}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
    

    )
}

