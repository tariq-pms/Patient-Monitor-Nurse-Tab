// import { AccountCircle } from '@mui/icons-material'
import { Box, Card, Stack, Typography, ButtonBase  } from '@mui/material'
// import { red } from '@mui/material/colors'
import { FC, useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faBell, faPowerOff, } from '@fortawesome/free-solid-svg-icons'
import { NewDeviceDetails } from './NewDeviceDetails';

export interface DeviceDetails {
  key: string;
  device_id: string;
  patient: {
    "resourceType": string;
    "id": string;
    "meta": {
        "versionId": string;
        "lastUpdated": string;
    };
    "extension": 
        {
            "url": string;
            "valueString":string;
        }[];

    "identifier": 
        {
            "system": string;
            "value": string;
        }[];
    
} | null;
  device_resource_id: string;
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
  };
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
  };
  
}


export const CICCard: FC<DeviceDetails> = (props): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);
    const [alarmColor, setAlarmColor] = useState("#202020")
    // const devicetimer = setInterval(timer, 10000)
    // const devicetimer = setInterval(timer, 10000)

    // setInterval(secondTimer,7000)
    const [newData, setNewData] = useState(false);
    const [alarm, setAlarm] = useState("")
    const [runNo, setRunNo] = useState(0)

    // function secondTimer() {
        
    // }
    const [requiredForTimer, setRequiredForTimer] = useState(false)

    const [requiredForBorderColor, setRequiredForBorderColor] = useState(false)
    
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
    // let devicetimer = setInterval(timer, 10000)    
    setRunNo(runNo+1)
    // clearInterval(devicetimer)
    // console.log(devicetimer)
    // runtimer = setInterval(timer, 10000)

    if (props.observation_resource?.component?.[1] && runNo>=2 && props.communication_resource?.extension?.[1]) {
        
        setNewData(true);
        setRequiredForBorderColor(!requiredForBorderColor)
        // clearInterval(tick);
        
        // console.log(props.observation_resource.identifier[0].value);
        for (var i=0; i< props?.communication_resource?.extension?.[1].valueCodeableConcept?.coding?.length; i++){
        console.log(props.communication_resource?.extension[1]?.valueCodeableConcept?.coding[i]?.code)
        if(props.communication_resource?.extension[1]?.valueCodeableConcept?.coding[i]?.code=='High Priority'){
            setAlarmColor('red')
            setAlarm(props.communication_resource.extension[0].valueCodeableConcept.coding[i].display)
            break
        }else{
            setAlarmColor('yellow')
            setAlarm(props.communication_resource.extension[0].valueCodeableConcept.coding[i].display)
        }
    }
    setRequiredForTimer(!requiredForTimer)
    }
    console.log("New call")
    }, [props.observation_resource]);

    function findData(x: string){
        let index = props?.observation_resource?.component.findIndex(item => item.code.text===x)
        if(index==-1){
            return({data: "--", unit: "--"})
        }
        let data = Number(props.observation_resource.component[index].valueQuantity.value)
        data = Math.round((data + Number.EPSILON) * 100) / 100
        let unit = props.observation_resource.component[index].valueQuantity.unit
        return ({data:data, unit:unit})
    }

    useEffect(() => {
     let intervalId: number | undefined;
 
     if (newData) {
       intervalId = setInterval(() => {
         setIsBlinking((prevIsBlinking) => !prevIsBlinking);
       }, 300); // Adjust the blinking interval (in milliseconds) as needed
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

    // function timer() {
    //     // if((tempColor!=alarmColor) && (newData==true)){
    //     //     const x = alarmColor
    //     //     setAlarmColor(tempColor)
    //     //     setTempColor(x)
    //     // }
    //     console.log(newData)
    // }

    // const tick =setInterval(timer,1000)
//   useEffect(() => {console.log(props.patient_id)},[props.patient_id])

  return (

      <Box  width={{
        xs: "350px",
        sm: "500px",
        md: "500px",
        lg: "500px"
      }} sx={{ borderRadius:'25px', cursor:'pointer'}}  //border: alarmColor!='transparent' ? `6px solid ${alarmColor}`: "", opacity:controlOpacity, boxShadow: '0px 0px 5px 5px white'
        onClick={() => {setIsOpen(true)}}
      >
        <ButtonBase sx={{width:'100%', borderRadius:'25px'}}>
        {/* <Link to="devicedata" style={{ textDecoration: 'none' }} state={{device_id: props.device_id, device_resource_id: props.device_resource_id, patient: props.patient, observation_resource: props.observation_resource, communication_resource: props.communication_resource, key: props.device_resource_id}}> */}
        
        <Card
            style={{width:'100%', backgroundColor:'#FFFFFF', borderRadius: "25px", height:"300px", opacity: newData ? 1 : 0.7, border: `5px solid ${isBlinking ? alarmColor : '#E4E4E4'}`,

        }}
          >
            {newData ? (<>
                
<Stack width={'100%'} height={'100%'}>
                    
                    <Stack width={"100%"} height={'45%'} direction={'row'} marginTop={'10px'}>
                        
                        <Box width={'35%'} >
                    <div style={{marginTop:'10%'}}><Typography variant='subtitle1' color={"#124D81"} paddingLeft={'10%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica',textAlign: 'left'}}>Baby Temp °C</Typography></div>
                            <div style={{display:'flex', justifyContent:'left',marginLeft:'20px'}}>
                               
                                <Typography variant='h2' color={"#124D81"}  >
                                {(() => {
                                        let data = findData("Measured Skin Temp 1")
                                        return (data.data)
                                    })()}
                                </Typography>
                                <Typography variant='subtitle1' color={"#124D81"}  >
                                {(() => {
                                        if(props.observation_resource?.component[0].valueQuantity.unit=="BABY"){
                                            let data = findData("Set Skin Temp")
                                            return (data.data)
                                        }
                                        else{return ""}
                                    })()}
                                </Typography>
                                <Typography variant='subtitle1' color={"#124D81"} paddingTop={'25%'} >
                                {(() => {
                                    let data = findData("Measured Skin Temp 2")
                                    return (data.data)
                                }
                            )()}
                                </Typography>
                            </div>
                         </Box>  
                         <Box width={'30%'} >
    <div style={{marginTop:'10%'}}><Typography variant='subtitle1' color={"#4B7193"} style={{fontWeight: 'bold', fontFamily: 'Helvetica',textAlign: 'left'}} >Heater Temp %</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', justifyContent:'left'}}>
                              <Typography variant='h2' color={"#4B7193"} >
                              {(() => {
                                        let data = findData("Heater Level")
                                        return (data.data)
                                    })()}
                                </Typography>
                                
                                <Typography variant='subtitle1' color={"#4B7193"} paddingTop={'25%'} >
                                {(() => {
                                        if(props.observation_resource?.component[0].valueQuantity.unit=="MANUAL"){
                                            let data = findData("Set Heater")
                                            return (data.data)
                                        }
                                        else{return ""}
                                    })()}
                                </Typography>
                            </div>
                        </Box> 
                        <Box width={'35%'} height={'100%'} justifyContent={'center'} textAlign={'center'}>
                            <Box display={'flex'} justifyContent={'space-between'}   width={"100%"} height={"50%"} textAlign={'center'}>
                                <Typography variant='subtitle1' color={"#4B7193"}  paddingTop={'7%'} paddingLeft={'5%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}}>RH %</Typography>
                                <Typography variant='h4' color={"#4B7193"} paddingTop={'3%'} paddingRight={'15%'}>
                                    {(() => {
                                            let data = findData("Measure Humidity")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                            </Box>
                            <Box display={'flex'} justifyContent={'space-between'}  width={"100%"} height={"50%"} >
                                <Typography variant='subtitle1' color={"#4B7193"} paddingLeft={'5%'} paddingTop={'10%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}}>O2 %</Typography>
                                <Typography variant='h4' color={"#4B7193"} paddingTop={'3%'} paddingRight={'15%'}>
                                    {(() => {
                                            let data = findData("O2")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                            </Box>
                            {/* <Box display={'flex'} justifyContent={'space-between'} width={"100%"} height={"33.33%"} sx={{ borderTop:'2px solid grey'}}>
                                <Typography variant='caption' color={"#A8C5D4"} paddingLeft={'5%'}  paddingTop={'5%'}>Wt (g)</Typography>
                                <Typography variant='h6' color={"#5db673"} paddingTop={'3%'} paddingRight={'5%'}>
                                    {(() => {
                                            let data = findData("Measure Weigh")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                            </Box> */}
                        </Box>
                    </Stack>
                    <Stack width={"100%"} height={'45%'} direction={'row'} marginTop={'10px'}>
                    <Box width={'20%'} >
    <div style={{marginTop:'10%'}}><Typography variant='subtitle2' color={"#3C89C0"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >Heart Rate</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                              <Typography variant='h3' color={"#3C89C0"} >
                              {(() => {
                                                let data = findData("Pulse Rate")
                                                return (data.data)
                                            }
                                        )()}
                                </Typography>
                                <Typography variant='subtitle2' color={"#3C89C0"}  paddingTop={'25%'} >
                             BPM
                                </Typography>
                            </div>
                        </Box>
                        <Box width={'20%'} >
    <div style={{marginTop:'10%'}}><Typography variant='subtitle2' color={"#3C89C0"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >SpO2</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                              <Typography variant='h3' color={"#3C89C0"} >
                              {(() => {
                                            let data = findData("SpO2")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                                <Typography variant='subtitle2' color={"#3C89C0"}  paddingTop={'25%'} >
                                %
                                </Typography>
                            </div>
                        </Box>
                        <Box width={'20%'} >
    <div style={{marginTop:'10%'}}><Typography variant='subtitle2' color={"#38AAC3"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >Weight</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                              <Typography variant='h3' color={"#38AAC3"} >
                              {(() => {
                                            let data = findData("Measure Weigh")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                                <Typography variant='subtitle2' color={"#38AAC3"}  paddingTop={'25%'} >
                                KG
                                </Typography>
                            </div>
                        </Box>
                        
                        
                        <Box width={'40%'} height={'100%'}  justifyContent={'center'} textAlign={'center'}>
                        <Box marginTop={'5%'}><Typography variant='caption' color={"#A8C5D4"}  paddingTop={'7%'} paddingRight={'10px'} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >
                                Alarm  
                                </Typography>
                                <FontAwesomeIcon icon={faBell} /></Box>
                           
                            <Typography variant='subtitle1'color={`${alarmColor}`} >
                                
                                {alarm}
                                
                            </Typography>
                            
                        </Box>
                    </Stack>
                    <Box display={'flex'} width={'100%'} height={'10%'} paddingTop={'2.5%'} sx={{borderTop:'2px solid grey'}}  >
                        <Box width={'30%'} height={'100%'} textAlign={'left'} paddingLeft={'5%'} >
                        <Typography variant="subtitle2" sx={{fontWeight:"bold", marginLeft:'5px'}} color={'#7E7E7E'}>
                                    {props.patient?.identifier && props?.patient?.identifier[0]?.value}
                                    </Typography>
                        </Box>
                        <Box width={'40%'} height={'100%'} textAlign={'center'} >
                            <div style={{fontSize: '100%', paddingRight:'3%' , fontWeight:500,color: '#7E7E7E'}} >
                                {(() => {
                                    let data = findData("MODE")
                                    return (data.unit+" "+"MODE")
                                })()}
                            </div>
                            
                        </Box> 
                        {/* <FontAwesomeIcon icon={faPersonBreastfeeding} fontSize={'250%'} color='#CBCFE5'/> */}
                        <Box display={'flex'} width={'30%'} height={'100%'}>
                            
                            <Box paddingRight={'2%'} width={'100%'} height={'65%'} sx={{backgroundColor:'transparent'}}>
                                
                                    <Typography variant="subtitle2"  color={'#7E7E7E'}>
                                        {props?.device_id}
                                    </Typography>
                                
                            </Box>
                        </Box>                         
                    </Box>
                </Stack>
            </>):(<>
            <Box width={'100%'} height={'100%'} sx={{backgroundColor:'transparent'}} display={'flex'} textAlign={"center"} justifyContent={"center"}>
            <Stack width={'100%'} height={'100%'} justifyContent={"center"} textAlign={"center"}>
                    <FontAwesomeIcon icon={faPowerOff} style={{fontSize: 70, color:'#124D81', marginLeft:'auto', marginRight:'auto', fontWeight:'lighter', paddingBottom:'3%'}} />
                    <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:'#124D81'}}>{props?.device_id}</Typography>
                    <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:'#124D81'}}>Not Active/Connected</Typography>
            </Stack>
            </Box>
                
            </>)}
            </Card>
          </ButtonBase>
        {/* </Link> */}
        <NewDeviceDetails 
        isDialogOpened={isOpen} 
        handleCloseDialog={() => {console.log("MY BOI");setIsOpen(false)}}
        observation_resource={props.observation_resource}
        communication_resource={props.communication_resource}
        device_id={props.device_id}
        device_resource_id={props.device_resource_id}
        patient={props.patient}
        newData={newData}
        />   
      </Box>    
  )
}
