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
    const [alarmColor, setAlarmColor] = useState("")
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
      }} sx={{backgroundColor:'#CDDBE6', borderRadius:'25px', border: `6px solid ${alarmColor}`}} >
        
        <Link to="devicedata" style={{ textDecoration: 'none' }} state={{device_id: props.device_id, device_resource_id: props.device_resource_id, patient: props.patient, observation_resource: props.observation_resource, communication_resource: props.communication_resource, key: props.device_resource_id}}>
        <Paper elevation={2} sx={{ borderRadius: "25px", backgroundColor:'transparent' }}>
          <Card
            style={{ backgroundColor: "transparent", borderRadius: "25px", height:"400px",
             }}
          >
            {newData ? (<>
                <Stack width={"100%"} height={"100%"}>
                
                <Box width={'100%'} height={'20%'} sx={{backgroundColor:'#0570D6'}}>
                    <Stack width={"100%"} direction={"row"} height={"100%"}>
                        <Box display={'flex'} width={'70%'} height={'100%'} justifyContent='right' sx={{backgroundColor:'transparent'}}>
                            <Box display={'flex'} width={'50%'} height={'60%'} sx={{backgroundColor:'#CBCFE5', marginTop:'auto', marginBottom:'auto', marginRight:'10px', borderRadius:'7px'}}>
                                <Typography variant='h6' sx={{fontWeight:"bold", color:'#2271AF'}} margin={'auto'}>
                                    {(() => {
                                        let data = findData("MODE")
                                        return (data.unit+" "+"MODE")
                                    })()}
                                    {/* {props?.observation_resource?.component[0]?.valueQuantity?.unit} MODE */}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box width={'30%'} height={'100%'}>
                            <Stack width={'100%'} height={'100%'} direction={'row'} justifyItems={'center'} sx={{marginTop:'12%'}}>
                                <FontAwesomeIcon icon={faPersonBreastfeeding} fontSize={'250%'} color='#CBCFE5'/>
                                <Box width={'30%'} height={'65px'} sx={{backgroundColor:'transparent'}}>
                                    <Typography variant="subtitle2" sx={{fontWeight:"bold",marginTop:'5px', marginLeft:'5px'}} color={'#CBCFE5'}>
                                        {props.patient?.identifier && props?.patient?.identifier[0]?.value}<br />
                                        <Typography fontSize={'70%'} sx={{fontWeight:"bold"}} color={'#CBCFE5'}>
                                            {props?.device_id}
                                        </Typography>
                                    </Typography>
                                </Box>
                            </Stack>
                            
                        </Box>
                    </Stack>


                    <Box width={'30%'} height={'65px'} sx={{backgroundColor:'transparent'}}></Box>
                </Box>
                <Box width={'100%'} height={"220px"} sx={{backgroundColor:'transparent'}}>
                    <Stack width={"90%"} sx={{margin:'auto', marginTop:'15px'}} spacing={'10px'}>
                        <Stack spacing={'10px'} direction={'row'}>
                            {/* Temperature Box */}
                            <Box width={"35%"} height={"80px"} sx={{backgroundColor:'#99C9DD', borderRadius:'10px'}}>
                                <Stack direction={'row'} width={'100%'}>
                                    <Box width={'30%'} height={'80px'} sx={{backgroundColor:'transparent'}} display="flex" justifyContent="center" alignItems="center">
                                        <FontAwesomeIcon icon={faBaby} fontSize={'40px'} color={'black'}/>
                                    </Box>
                                    <Stack width={'70%'}>
                                        <Box width={'100%'} height={'40px'} sx={{backgroundColor:'transparent'}} textAlign={'center'}>
                                            <Typography fontSize={'170%'} sx={{color:'#984C38'}}>
                                                {(() => {
                                                    let data = findData("Measured Skin Temp 1")
                                                    return (data.data+data.unit)
                                                })()}
                                            </Typography>
                                        </Box>
                                        <Box width={'100%'} height={'40px'} sx={{backgroundColor:'transparent'}} textAlign={'center'}>
                                            <Typography fontSize={'170%'} sx={{color:'#1786B8'}}>
                                                {(() => {
                                                    let data = findData("Measured Skin Temp 2")
                                                    return (data.data+data.unit)
                                                })()}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>
                            {/* Heater Box */}
                            <Box width={"35%"} height={"80px"} sx={{backgroundColor:'#99C9DD', borderRadius:'10px'}}>
                                {/* To be done by Tariq */}
                            </Box>
                            {/* Weight box */}
                            <Box width={"35%"} height={"60px"} sx={{backgroundColor:'#B4CFE4', borderRadius:'5px'}}>
                                <Stack direction={'row'} height={'100%'}>
                                    <Box width={'70%'} height={'100%'} sx={{backgroundColor:'transparent'}} textAlign={'center'} justifyContent={'center'}>
                                        <Typography variant='h5' component={"h2"} sx={{color:'black'}}>
                                            {(() => {
                                                let data = findData("Measure Weigh")
                                                return (data.data+data.unit)
                                            })()}
                                        </Typography>
                                    </Box>
                                    <Stack width={'30%'} height={"100%"}>
                                        <Box width={'97%'} height={'45%'} justifyContent={'right'} textAlign={'right'} marginTop={"10%"}>
                                            <FontAwesomeIcon icon={faBaby} fontSize={'30px'} color={'black'}/>
                                        </Box>
                                        <Box width={'97%'} height={'45%'} justifyContent={'left'} textAlign={'left'} marginTop={"10%"}>
                                            <FontAwesomeIcon icon={faWeightHanging} fontSize={'20px'} color={'black'}/>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Stack>
                        {/* Alarm Box */}
                        <Box width={'66%'} height={'50px'} sx={{backgroundColor:'#B4CFE4', borderRadius:'7px'}} textAlign={'center'} justifyContent={'center'}>
                            <Typography variant='h6' component={"h2"} sx={{fontWeight:"bold", marginTop:'3px', color:'#2271AF'}}>
                                {alarm}
                            </Typography>
                        </Box>
                        <Stack spacing={'10px'} direction={'row'}>
                            {/* Pleth Box */}
                            <Box width={"70%"} height={"70px"} sx={{backgroundColor:'#93CCE0', borderRadius:'10px'}}>
                            </Box>
                            {/* Masmimo Alarm Box */}
                            <Box width={"35%"} height={"60px"} sx={{backgroundColor:'#B4CFE4', borderRadius:'5px'}}>
                            </Box>
                        </Stack>
                        <Stack spacing={'10px'} direction={'row'}>
                            {/* SIQ Box */}
                            <Box width={"10%"} height={'50px'} sx={{backgroundColor:'transparent', border:'3px solid #2879AF', borderRadius:'5px'}} justifyContent={'center'} textAlign={'center'} justifyItems={'center'}>
                                <Stack width={"100%"} height={"100%"}>
                                    <Typography variant='caption' sx={{fontWeight:"bold", color:'#2271AF'}}>
                                        SIQ
                                    </Typography>
                                    <Box display={'flex'} height={'40%'} width={'60%'} sx={{backgroundColor:'transparent', border:'2px solid #2879AF', borderRadius:'5px', margin:'auto'}}>
                                        {(()=>{
                                            let data = findData("SIQ")
                                            return (
                                                <Box width={'100%'} height={String(data.data)} sx={{backgroundColor:'red'}} marginTop={'auto'}></Box>
                                            )
                                        })()}
                                        
                                    </Box>
                                </Stack>
                            </Box>
                            {/* PI Box */}
                            <Box width={'15%'} height={'50px'} sx={{backgroundColor:'transparent', border:'3px solid #2879AF', borderRadius:'5px'}} justifyContent={'center'} textAlign={'center'} justifyItems={'center'}>
                                <Stack width={"100%"} height={"100%"}>
                                    <Typography variant='caption' sx={{fontWeight:"bold", color:'#2271AF'}}>
                                        PI (%)
                                    </Typography>
                                    <Typography variant='h6' sx={{fontWeight:"bold", color:'red'}}>
                                        {(() => {
                                            let data = findData("PI")
                                            return (data.data)
                                        })()}
                                    </Typography>
                                </Stack>
                            </Box>
                            {/* PVI Box */}
                            <Box width={'15%'} height={'50px'} sx={{backgroundColor:'transparent', border:'3px solid #2879AF', borderRadius:'5px'}} justifyContent={'center'} textAlign={'center'} justifyItems={'center'}>
                                <Stack width={"100%"} height={"100%"}>
                                    <Typography variant='caption' sx={{fontWeight:"bold", color:'#2271AF'}}>
                                        PVI (%)
                                    </Typography>
                                    <Typography variant='h6' sx={{fontWeight:"bold", color:'red'}}>
                                        {(() => {
                                            let data = findData("PVI")
                                            return (data.data)
                                        })()}
                                    </Typography>
                                </Stack>
                            </Box>
                            <Box width={'27%'} height={'50px'} sx={{backgroundColor:'transparent', border:'3px solid #2879AF', borderRadius:'5px'}}>
                                <Stack direction="row" width={'100%'} height={'100%'}>
                                    <Box display={'flex'} width={'50%'} height={'100%'} sx={{backgroundColor:'transparent'}} justifyContent={'center'}>
                                        <Typography variant='caption' sx={{fontWeight:"bold", color:'#2271AF'}} marginBottom={'auto'} marginTop={'auto'} marginLeft={'5px'}>
                                            SPO2(%)
                                        </Typography>
                                    </Box>
                                    <Typography variant='h5' sx={{fontWeight:"bold", color:'red'}} marginBottom={'auto'} marginTop={'auto'} margin={'auto'}>
                                        {(() => {
                                            let data = findData("SpO2")
                                            return (data.data)
                                        })()}
                                    </Typography>
                                </Stack>
                            </Box>
                            <Box width={'27%'} height={'50px'} sx={{backgroundColor:'transparent', border:'3px solid #2879AF', borderRadius:'5px'}}>
                                <Stack direction="row" width={'100%'} height={'100%'}>
                                    <Box display={'flex'} width={'50%'} height={'100%'} sx={{backgroundColor:'transparent'}} justifyContent={'center'}>
                                        <Typography variant='caption' sx={{fontWeight:"bold", color:'#2271AF'}} marginBottom={'auto'} marginTop={'auto'} marginLeft={'5px'}>
                                            BPM
                                        </Typography>
                                    </Box>
                                    <Typography variant='h5' sx={{fontWeight:"bold", color:'red'}} marginBottom={'auto'} marginTop={'auto'} margin={'auto'}>
                                        {(() => {
                                            let data = findData("Pulse Rate")
                                            return (data.data)
                                        })()}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
            </>):(<>
            <Box width={'100%'} height={'100%'} sx={{backgroundColor:'transparent'}} display={'flex'}>
            <Stack width={'100%'} height={'400px'} sx={{marginLeft:'auto', marginRight:'auto', marginTop:'auto', marginBottom:'auto'}}>
                    <PowerSettingsNewIcon sx={{fontSize: 200, color:'red', marginLeft:'auto', marginRight:'auto', marginTop:'auto', marginBottom:'auto'}}/>
                    <Typography variant='h6' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:'grey'}}>Device {props?.device_id} not active/connected</Typography>
                </Stack>
            </Box>
                
            </>)}
            

          </Card>
        </Paper>
        </Link>
        
      </Box>
  )
}
