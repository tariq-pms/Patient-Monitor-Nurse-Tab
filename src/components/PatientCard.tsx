
import { Box, Card, Stack, Typography } from "@mui/material";
import { isArray } from "chart.js/helpers";
import { FC, useEffect, useState } from "react";
import { NewPatientDetails } from "./NewPatientDetails";


export interface PatientDetails {
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
  
  }


export const PatientCard: FC<PatientDetails> = (props): JSX.Element => {
    console.log('PatientCard props:', props);
    const [obsResource, setObsResource] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [alarmColor, setAlarmColor] = useState("#202020")
    
    const [obsmeta, setobsmeta] = useState<any[]>([])
    const [commeta, setcommeta] = useState<any[]>([])
    
    // const [newData, setNewData] = useState(false);
    const [requiredForTimer, setRequiredForTimer] = useState(false)
    const [borderRadiusForRerender, setBorderRadiusForRerender] = useState(true)
    const [newData, setNewData] = useState(false)
    
    const [displayAlarm, setDisplayAlarm] = useState("")
    // const [dontRunFirstTime, setDontRunFirstTime] = useState(0)
    const getDevices = () => {
        
        if(props.device?.length>0){
           
            return (props.device?.map((val) => {
                return(
                    <Box boxShadow={`0px 0px 10px 2px #00B1FD`} border={'1px solid #00B1FD'} textAlign={'center'} borderRadius={'10px'} minWidth={'70px'} maxWidth={'70px'} overflow="hidden"        // Handle overflow by hiding it
                    textOverflow="ellipsis"    >
                        <Typography variant='caption' color={"#A8C5D4"}>
                            {val.identifier[1].value}
                        </Typography>
                    </Box>
                )
            }))
        }
        else{
            return ('Patient Discharged')
        }
    }

    useEffect(() => {
            
        if(isArray(props.observation_resource)){
            if(props.observation_resource.length>0){
                // console.log(props.observation_resource)
                var change = true
                    props.observation_resource.map((val, index) => {
                        if(val.meta.versionId!=obsmeta[index]){
                            // console.log(props.patient_id)
                            
                            var tempVar = obsmeta
                            tempVar[index] = String(val.meta.versionId)
                            setobsmeta(tempVar)
                            change = false
                            
                        }
                        
                        
                    })
                    if(change){
                        setBorderRadiusForRerender(!borderRadiusForRerender)
                        setObsResource(props.observation_resource.flat())
                        setRequiredForTimer(!requiredForTimer)
                        setNewData(true);
                    }
                    // else{
                        
                    // }
                    
                        
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
                            }
                        }
                        
                    }
                    
                })
                
            }
        }
    

    
    

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
        timer = setInterval(() => {setNewData(false);setAlarmColor("#202020");clearInterval(timer)},15000)
    }

    return () => {
        
        clearInterval(timer); 
    };
    }, [requiredForTimer])

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

    
    return (
        <Box  width={{
            xs: "350px",
            sm: "500px",
            md: "500px",
            lg: "500px"
          }} sx={{borderRadius:borderRadiusForRerender?'25px':'25.5px'}}
          onClick={() => {setIsOpen(true)}}>
            <Card
                style={{ backgroundImage:'linear-gradient(to bottom, #34405D, #151E2F, #34405D)', borderRadius: "25px", height:"300px", boxShadow: `0px 0px 30px 5px ${isBlinking ? alarmColor: '#202020'}`, border:'1px solid #606060'}}
            > 
                <Stack width={'100%'} height={'100%'}>
                    <Stack direction={'row'} display={'flex'} width={'100%'} height={'10%'} paddingTop={'3%'} justifyContent={'space-between'}>
                        <Box marginLeft={'20px'}>
                            <Typography variant="subtitle2" sx={{fontWeight:"bold"}} color={'#CBCFE5'}>
                                {props.patient_id}
                            </Typography>
                        </Box>
                        <Box marginRight={'20px'}>
                            <Typography variant="subtitle2"  color={'#CBCFE5'}>
                                {props.patient_name}
                            </Typography> 
                        </Box>                             
                    </Stack>
                    {newData ? (
                    <Stack height={'90%'} width={'100%'} direction={'row'}>
                        <Stack height={'100%'} width={'67%'} borderTop={'1px solid grey'} borderRight={'1px solid grey'}>
                            <Stack height={'50%'} width={'100%'} borderBottom={'1px solid grey'}>
                                <Typography variant='caption' color={"#A8C5D4"}  paddingTop={'5%'} paddingLeft={'35%'} >
                                    Devices Connected  
                                </Typography>
                                <Box gap={'3px'} width={'95%'} justifyContent={'center'} textAlign={'center'} height={'50%'} marginLeft={'auto'} marginRight={'auto'} marginBottom={'auto'} marginTop={'auto'} display={'flex'} flexWrap={'wrap'}>
                                    {getDevices()}
                                </Box>
                                
                            </Stack>
                            <Stack height={'50%'} width={'100%'} direction={'row'}>
                                <Box height={'100%'} width={'50%'} borderRight={'1px solid grey'} justifyContent={'center'} textAlign={'center'}>
                                    <Box width={'100%'} height={'15%'}></Box>
                                    <Typography variant='caption' color={"#A8C5D4"} >
                                        Alarm  
                                    </Typography>
                                    <Typography  variant='subtitle1' color={`${alarmColor}`} paddingTop={'10%'} >
                                        {displayAlarm}
                                    </Typography>
                                </Box>
                                <Box height={'100%'} width={'50%'}></Box>
                            </Stack>
                        </Stack>
                        <Stack height={'100%'} width={'33%'} borderTop={'1px solid grey'} justifyContent={'center'} textAlign={'center'}>
                            <Stack height={'25%'} width={'100%'} borderBottom={'1px solid grey'} justifyContent={'space-between'} direction={'row'}>
                                <Typography variant='caption' color={"#A8C5D4"} paddingLeft={'10px'} paddingTop={'23px'}>SpO2 (%)</Typography>
                                <Typography variant='h6' color={"#5db673"} paddingRight={'10px'} paddingTop={'17px'}>
                                {(() => {
                                        let data = finddata("SpO2")
                                        return (data!.data)
                                })()}
                                </Typography>
                                
                            </Stack>
                            <Stack height={'25%'} width={'100%'} borderBottom={'1px solid grey'} justifyContent={'space-between'} direction={'row'}>
                                <Typography variant='caption' color={"#A8C5D4"} paddingLeft={'10px'} paddingTop={'23px'}>PR (BPM)</Typography>
                                <Typography variant='h6' color={"#5db673"} paddingRight={'10px'} paddingTop={'17px'}>
                                {(() => {
                                        let data = finddata("Pulse Rate")
                                        return (data!.data)
                                })()}
                                </Typography>
                            </Stack>
                            <Stack height={'25%'} width={'100%'} borderBottom={'1px solid grey'} justifyContent={'space-between'} direction={'row'}>
                                <Typography variant='caption' color={"#A8C5D4"} paddingLeft={'10px'} paddingTop={'23px'}>PI (%)</Typography>
                                <Typography variant='h6' color={"#5db673"} paddingRight={'10px'} paddingTop={'17px'}>
                                {(() => {
                                        let data = finddata("PI")
                                        return (data!.data)
                                })()}
                                </Typography>
                            </Stack>
                            <Stack height={'25%'} width={'100%'} borderBottom={'1px solid grey'} justifyContent={'space-between'} direction={'row'}>
                                <Typography variant='caption' color={"#A8C5D4"} paddingLeft={'10px'} paddingTop={'23px'}>SIQ</Typography>
                                <Typography variant='h6' color={"#5db673"} paddingRight={'10px'} paddingTop={'17px'}>
                                {(() => {
                                        let data = finddata("SIQ")
                                        return (data!.data)
                                })()}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                    ):(
                        <Stack height={'100%'} width={'100%'} borderTop={'1px solid grey'} >
                            <Stack height={'50%'} width={'100%'} borderBottom={'1px solid grey'} justifyContent={'center'} textAlign={'center'}>
                                <Typography variant='caption' color={"#A8C5D4"}  paddingTop={'5%'}  >
                                    Devices Connected  
                                </Typography>
                                <Box gap={'3px'} width={'95%'} height={'50%'} marginLeft={'auto'} marginRight={'auto'} marginBottom={'auto'} marginTop={'auto'} display={'flex'} flexWrap={'wrap'}>
                                    {getDevices()}
                                </Box>
                                
                            </Stack>
                            <Stack height={'50%'} width={'100%'} direction={'row'} textAlign={'center'} justifyContent={'center'}>
                                <Typography variant='caption' color={"#A8C5D4"} paddingTop={'9%'} >
                                    No Therapy Running
                                </Typography>
                            </Stack>
                            
                        </Stack>
                    )}
                    
                    
                </Stack>

            </Card>
            <NewPatientDetails 
                isDialogOpened={isOpen}
                handleCloseDialog={() => { setIsOpen(false); } }
                observation_resource={props.observation_resource}
                communication_resource={props.communication_resource}
                device={props.device}
                patient_id={props.patient_id}
                patient_name={props.patient_name}
                newData={newData}
                key={props.patient_resource_id}
                patient_resource_id={props.patient_resource_id} />
        </Box>
    )
}

