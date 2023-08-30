// import { AccountCircle } from '@mui/icons-material'
import { Box, Paper, Card, CardContent, Stack, Typography, LinearProgress,  } from '@mui/material'
// import { red } from '@mui/material/colors'
import { FC, useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
import { Divider } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPersonBreastfeeding, faBaby, faWeightHanging } from '@fortawesome/free-solid-svg-icons'
import WavesIcon from '@mui/icons-material/Waves';
import { Container } from '@material-ui/core';
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
    
};
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
    const [alarmColor, setAlarmColor] = useState("transparent")
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
    
    useEffect(() => {
    // let devicetimer = setInterval(timer, 10000)    
    setRunNo(runNo+1)
    // clearInterval(devicetimer)
    // console.log(devicetimer)
    // runtimer = setInterval(timer, 10000)
    if (props.observation_resource?.component?.[1] && runNo>=2 && props.communication_resource?.extension?.[1]) {
        console.log("called")
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
    
    }, [props.observation_resource]);

    function findData(x: string){
        let index = props.observation_resource.component.findIndex(item => item.code.text===x)
        if(index==-1){
            return({data: "--", unit: "--"})
        }
        let data = props.observation_resource.component[index].valueQuantity.value
        let unit = props.observation_resource.component[index].valueQuantity.unit
        return ({data:data, unit:unit})
    }

    useEffect(() => {
        let timer: number | undefined;
        
        if(newData){
            timer = setInterval(() => {setNewData(false);setAlarmColor("");clearInterval(timer)},7000)

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
      }} sx={{backgroundColor:'#262626', borderRadius:'25px', border: `6px solid ${alarmColor}`}} >
        
        <Link to="devicedata" style={{ textDecoration: 'none' }} state={{device_id: props.device_id, device_resource_id: props.device_resource_id, patient: props.patient, observation_resource: props.observation_resource, communication_resource: props.communication_resource, key: props.device_resource_id}}>
        <Paper elevation={2} sx={{ borderRadius: "25px", backgroundColor:'transparent'}}>
          <Card
            style={{ backgroundColor: "transparent", borderRadius: "25px", height:"300px",
             }}
          >
            {newData ? (<>
                <Stack width={'100%'} height={'100%'}>
                    <Box display={'flex'} width={'100%'} height={'20%'} paddingTop={'2%'}>
                        <Box width={'70%'} height={'100%'} textAlign={'right'}>
                            <div style={{fontSize: '130%', paddingRight:'3%' ,paddingTop:'3%', fontWeight:800}} >
                                {(() => {
                                    let data = findData("MODE")
                                    return (data.unit+" "+"MODE")
                                })()}
                            </div>
                        </Box> 
                        <FontAwesomeIcon icon={faPersonBreastfeeding} fontSize={'200%'} color='#CBCFE5'/>
                        <Box display={'flex'} width={'30%'} height={'100%'}>
                            <Box width={'30%'} height={'65%'} sx={{backgroundColor:'transparent'}}>
                                <Typography variant='caption' sx={{fontWeight:"bold",marginTop:'5px', marginLeft:'5px'}} color={'#CBCFE5'}>
                                    {props.patient?.identifier && props?.patient?.identifier[0]?.value}<br />
                                    <Typography variant='caption' color={'#CBCFE5'}>
                                        {props?.device_id}
                                    </Typography>
                                </Typography>
                            </Box>
                        </Box>                         
                    </Box>
                    <Stack width={"100%"} height={'40%'} direction={'row'}>
                        <Box width={'33.3%'} height={'100%'} sx={{ borderRight:'1px solid #A8A8A8', borderTop:'1px solid #A8A8A8'}} justifyContent={'center'} textAlign={'center'}>
                            <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography>
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                                <WavesIcon sx={{paddingTop:'6%', paddingRight:'7%', fontSize:'200%'}}/>
                                <Typography variant='h3'>
                                    {(() => {
                                        let data = findData("Heater Level")
                                        return (data.data)
                                    })()}
                                </Typography>
                                <Typography variant='subtitle1' color={"#26C5E4"} paddingTop={'13%'} paddingLeft={'3%'}>
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
                        <Box width={'33.3%'} height={'100%'} sx={{ borderRight:'1px solid #A8A8A8', borderTop:'1px solid #A8A8A8'}} justifyContent={'center'} textAlign={'center'}>
                        <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Baby Temp °C</Typography>
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                            <FontAwesomeIcon icon={faBaby} color='#CBCFE5' style={{paddingTop:'6%', paddingRight:'7%', fontSize:'200%'}}/>
                                <Typography variant='h3'>
                                    {(() => {
                                        let data = findData("Measured Skin Temp 1")
                                        return (data.data)
                                    })()}
                                </Typography>
                                <Typography variant='h6' color={"#26C5E4"} paddingTop={'13%'} paddingLeft={'3%'}>
                                    {(() => {
                                        if(props.observation_resource?.component[0].valueQuantity.unit=="BABY"){
                                            let data = findData("Set Skin Temp 1")
                                            return (data.data)
                                        }
                                        else{return ""}
                                    })()}
                                </Typography>
                            </div>
                            <Typography variant='h6' color={"#26C5E4"} paddingLeft={'3%'}>
                                {(() => {
                                        let data = findData("Measured Skin Temp 2")
                                        return (data.data)
                                    }
                                )()}
                            </Typography>
                        </Box>
                        <Box width={'33.3%'} height={'100%'} justifyContent={'center'} textAlign={'center'}>
                            <Box width={"100%"} height={"50%"} sx={{ borderTop:'1px solid #A8A8A8'}}>
                                <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>PR (BPM)</Typography>
                                <Typography variant='h5' color={"#26C5E4"}>
                                    {(() => {
                                            let data = findData("Pulse Rate")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                            </Box>
                            <Box width={"100%"} height={"50%"} sx={{ borderTop:'1px solid #A8A8A8'}}>
                                <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>SpO2 %</Typography>
                                <Typography variant='h5' color={"#26C5E4"}>
                                    {(() => {
                                            let data = findData("SpO2")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                    <Stack width={"100%"} height={'48%'} direction={'row'}>
                        <Box width={'33%'} height={'100%'} sx={{ borderRight:'1px solid #A8A8A8', borderTop:'1px solid #A8A8A8'}} justifyContent={'center'} textAlign={'center'}>
                            <Typography variant='h6'>
                                {alarm}
                            </Typography>
                        </Box>
                        <Box width={'42%'} height={'100%'} sx={{ borderRight:'1px solid #A8A8A8', borderTop:'1px solid #A8A8A8'}}></Box>
                        <Box width={'25%'} height={'100%'} >
                            <Box display={'flex'} width={'100%'} height={'33%'} sx={{ borderTop:'1px solid #A8A8A8'}} justifyContent={'space-between'} textAlign={'center'}>
                                
                                <Typography variant='subtitle2' color={"#A8C5D4"} paddingLeft={'5%'} paddingTop={'7%'}>PVI</Typography>
                                <Typography variant='h5' color={"#26C5E4"} paddingRight={'13%'} paddingTop={'2%'}>
                                    {(() => {
                                            let data = findData("PVI")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                            </Box>
                            <Box display={'flex'} width={'100%'} height={'33%'} sx={{ borderTop:'1px solid #A8A8A8'}} justifyContent={'space-between'} textAlign={'center'}>
                                <Typography variant='subtitle2' color={"#A8C5D4"} paddingLeft={'5%'} paddingTop={'7%'}>PI</Typography>
                                <Typography variant='h5' color={"#26C5E4"} paddingRight={'13%'} paddingTop={'2%'}>
                                    {(() => {
                                            let data = findData("PI")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                            </Box>
                            <Box display={'flex'} width={'100%'} height={'34%'} sx={{ borderTop:'1px solid #A8A8A8'}} justifyContent={'space-between'} textAlign={'center'}>
                                <Typography variant='subtitle2' color={"#A8C5D4"} paddingLeft={'5%'} paddingTop={'5%'}>SIQ</Typography>
                                <Box width={'40%'} marginRight={'13%'} height={'60%'} sx={{border:'2px solid #A8C5D4' , borderRadius:'3px'}}>
                                    {(() => {
                                        let data = findData("SIQ")
                                        return(
                                            <Box width={`${data.data}`+"%"} height={'100%'} sx={{backgroundColor:'#26C5E4'}}></Box>
                                        )
                                    })()}
                                </Box>
                                
                            </Box>
                        </Box>
                    </Stack>
                    
                </Stack>
            </>):(<>
            <Box width={'100%'} height={'100%'} sx={{backgroundColor:'transparent'}} display={'flex'} textAlign={"center"} justifyContent={"center"}>
            <Stack width={'100%'} height={'100%'} justifyContent={"center"} textAlign={"center"}>
                    <PowerSettingsNewIcon sx={{fontSize: 200, color:'red', marginLeft:'auto', marginRight:'auto'}}/>
                    <Typography variant='h6' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:'white'}}>Device {props?.device_id} not active/connected</Typography>
                </Stack>
            </Box>
                
            </>)}
            

          </Card>
        </Paper>
        </Link>
        
      </Box>
  )
}
