// import { AccountCircle } from '@mui/icons-material'
import { Box, Paper, Card, Stack, Typography} from '@mui/material'
// import { red } from '@mui/material/colors'
import { FC, useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
import { Divider } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPersonBreastfeeding, } from '@fortawesome/free-solid-svg-icons'

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

export const SVAASCard: FC<DeviceDetails> = (props): JSX.Element => {

    const [alarmColor, setAlarmColor] = useState("white")
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
        console.log(props.observation_resource.id)
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
        let data = Number(props.observation_resource.component[index].valueQuantity.value)
        data = Math.round((data + Number.EPSILON) * 100) / 100
        let unit = props.observation_resource.component[index].valueQuantity.unit
        return ({data:data, unit:unit})
    }

    useEffect(() => {
        let timer: number | undefined;
        
        if(newData){
            timer = setInterval(() => {setNewData(false);setAlarmColor("white");clearInterval(timer)},7000)

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
const [controlOpacity, setControlOpacity] = useState("0.8")
  return (

      <Box  width={{
        xs: "350px",
        sm: "500px",
        md: "500px",
        lg: "500px"
      }} sx={{backgroundColor:'#00547A', borderRadius:'25px'}} //border: alarmColor!='transparent' ? `6px solid ${alarmColor}`: ""
      onMouseLeave={() => {setControlOpacity("0.8")}} onMouseEnter={() => {setControlOpacity("1")}}>
        
        <Link to="devicedata" style={{ textDecoration: 'none' }} state={{device_id: props.device_id, device_resource_id: props.device_resource_id, patient: props.patient, observation_resource: props.observation_resource, communication_resource: props.communication_resource, key: props.device_resource_id}}>
        <Paper elevation={2} sx={{ borderRadius: "25px", backgroundColor:'transparent', opacity:controlOpacity, boxShadow: `0px 0px 5px 5px ${alarmColor}`}}>
          <Card
            style={{ backgroundColor: "transparent", borderRadius: "25px", height:"300px", boxShadow:'none'
             }}
          >
            {newData ? (<>
                <Stack width={'100%'} height={'100%'} justifyContent={'center'}>
                    <Box display={'flex'} width={'100%'} height={'20%'} paddingTop={'2%'}>
                        <Box width={'70%'} height={'100%'} textAlign={'right'}>
                            <div style={{fontSize: '130%', paddingRight:'3%' ,paddingTop:'3%', fontWeight:800}} >
                                {(() => {
                                    let data = findData("MODE")
                                    return (data.unit+" "+"MODE")
                                })()}
                            </div>
                        </Box> 
                        <FontAwesomeIcon icon={faPersonBreastfeeding} fontSize={'250%'} color='#CBCFE5'/>
                        <Box display={'flex'} width={'30%'} height={'100%'}>
                            
                            <Box width={'30%'} height={'65%'} sx={{backgroundColor:'transparent'}}>
                                <Typography variant="subtitle2" sx={{fontWeight:"bold",marginTop:'5px', marginLeft:'5px'}} color={'#CBCFE5'}>
                                    {props.patient?.identifier && props?.patient?.identifier[0]?.value}<br />
                                    <Typography fontSize={'70%'} sx={{fontWeight:"bold"}} color={'#CBCFE5'}>
                                        {props?.device_id}
                                    </Typography>
                                </Typography>
                            </Box>
                        </Box>                         
                    </Box>
                    <Divider style={{backgroundColor:'#A8A8A8', height:'0.5%'}}/>
                    <Stack direction={'row'} width={'100%'} justifyContent={'space-evenly'} height={'60%'} marginTop={'3%'}>
                        <Stack spacing={'5%'} width={'46%'} height={'100%'}>
                            <Box width={'100%'} height={'40%'} sx={{backgroundColor:'#12232B', borderRadius:'5px'}}></Box>
                            <Box width={'100%'} height={'40%'} sx={{backgroundColor:'#003548', borderRadius:'5px'}}>
                                <Stack direction={'row'} width={'100%'} height={'100%'}>
                                    <Box width={'18%'} height={'100%'} textAlign={'center'} justifyContent={'center'}>
                                        <Typography variant='caption'>SIQ</Typography>
                                        <Box width={'30%'} height={'50%'} sx={{border:'2px solid white' , borderRadius:'3px', margin:'auto'}}>
                                            {(() => {
                                                let data = findData("SIQ")
                                                return(
                                                    <Box width={'100%'} height={`${data.data}`+"%"} sx={{backgroundColor:'#26C5E4', marginTop:'auto'}}></Box>
                                                )
                                            })()}
                                        </Box>
                                    </Box>
                                    <Divider orientation='vertical' sx={{height:'70%', marginTop:'auto', marginBottom:'auto'}}/>
                                    <Box width={'27%'} height={'100%'} textAlign={'center'} justifyContent={'center'}>
                                        <Typography variant='caption'>PI (%)</Typography>
                                        <Typography variant='h5' color={"#26C5E4"} paddingTop={'2%'}>
                                            {(() => {
                                                    let data = findData("PI")
                                                    return (data.data)
                                                }
                                            )()}
                                        </Typography>
                                    </Box>
                                    <Divider orientation='vertical' sx={{height:'70%', marginTop:'auto', marginBottom:'auto'}}/>
                                    <Box width={'27%'} height={'100%'}  textAlign={'center'} justifyContent={'center'}>
                                        <Typography variant='caption'>SpO2 (%)</Typography>
                                        <Typography variant='h5' color={"#26C5E4"} paddingTop={'2%'}>
                                            {(() => {
                                                    let data = findData("SPO2")
                                                    return (data.data)
                                                }
                                            )()}
                                        </Typography>
                                    </Box>
                                    <Divider orientation='vertical' sx={{height:'70%', marginTop:'auto', marginBottom:'auto'}}/>
                                    <Box width={'27%'} height={'100%'} textAlign={'center'} justifyContent={'center'}>
                                        <Typography variant='caption'>PR (bpm)</Typography>
                                        <Typography variant='h5' color={"#26C5E4"} paddingTop={'2%'}>
                                            {(() => {
                                                    let data = findData("Pulse Rate")
                                                    return (data.data)
                                                }
                                            )()}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Stack>
                        <Box width={'46%'} height={'86%'} sx={{backgroundColor:'#003548', borderRadius:'5px'}}>
                            <Stack width={'100%'} height={'100%'}>
                                <Stack direction={'row'} width={'100%'} height={'50%'}>
                                    <Box width={'50%'} height={'100%'} sx={{ borderTopLeftRadius:'5px'}} justifyContent={'center'} textAlign={'center'}>
                                        <Typography variant='caption'>Apnea (s)</Typography>
                                        <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                                            <Typography variant='h5' color={"#26C5E4"} paddingTop={'2%'}>
                                                {(() => {
                                                        let data = findData("Apnea")
                                                        return (data.data)
                                                    }
                                                )()}
                                            </Typography>
                                        </div>
                                    </Box>
                                    <Divider orientation='vertical' sx={{height:'70%', marginTop:'auto', marginBottom:'auto'}}/>
                                    <Box width={'50%'} height={'100%'} sx={{ borderTopRightRadius:'5px'}} justifyContent={'center'} textAlign={'center'}>
                                        <Typography variant='caption'>FiO2 (%)</Typography>
                                        <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                                            <Typography variant='h5' color={"#26C5E4"} paddingTop={'2%'}>
                                                {(() => {
                                                        let data = findData("Current FiO2 Flow")
                                                        return (data.data)
                                                    }
                                                )()}
                                            </Typography>
                                            <Typography variant='caption' color={"#26C5E4"} paddingTop={'13%'} paddingLeft={'3%'}>
                                                {(() => {
                                                        let data = findData("Set FiO2")
                                                        return (data.data)
                                                })()}
                                            </Typography>
                                        </div>


                                    </Box>
                                    
                                </Stack>
                                <Divider orientation='horizontal' sx={{width:'35%', marginLeft:'7%', marginRight:'auto'}}/>
                                <Divider orientation='horizontal' sx={{width:'35%', marginLeft:'auto', marginRight:'7%'}}/>
                                <Stack direction={'row'} width={'100%'} height={'50%'}>
                                    <Box width={'50%'} height={'100%'} sx={{ borderBottomLeftRadius:'5px'}} justifyContent={'center'} textAlign={'center'}>
                                        <Typography variant='caption' >Pressure (cmH2O)</Typography>
                                        <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                                            <Typography variant='h5' color={"#26C5E4"} paddingTop={'2%'}>
                                                {(() => {
                                                        let data = findData("CPAP Pressure") //CPAP Pressure?? Check with SVAAS Team
                                                        return (data.data)
                                                    }
                                                )()}
                                            </Typography>
                                        </div>
                                    </Box>
                                    <Divider orientation='vertical' sx={{height:'70%', marginTop:'auto', marginBottom:'auto'}}/>
                                    <Box width={'50%'} height={'100%'} sx={{ borderBottomRightRadius:'5px'}} justifyContent={'center'} textAlign={'center'}>
                                        <Typography variant='caption'>Flow (L/min)</Typography>
                                        <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                                            <Typography variant='h5' color={"#26C5E4"} paddingTop={'2%'}>
                                                {(() => {
                                                        let data = findData("Current FiO2 Flow") //Current FiO2 Flow?? Check with SVAAS Team
                                                        return (data.data)
                                                    }
                                                )()}
                                            </Typography>
                                        </div>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Box>
                        
                    </Stack>
                    <Box width={'90%'} height={'15%'} marginLeft={'auto'} marginRight={'auto'} marginBottom={'5%'} sx={{backgroundColor:'transparent', border:'2px solid #A8A8A8', borderRadius:'5px'}}>
                        <Typography variant='h6' paddingLeft={'2%'} paddingTop={'0.5%'}>
                            {alarm}
                        </Typography>
                    </Box>
                </Stack>
            </>):(<>
            <Box width={'100%'} height={'100%'} sx={{backgroundColor:'transparent'}} display={'flex'} textAlign={"center"} justifyContent={"center"}>
            <Stack width={'100%'} height={'100%'} justifyContent={"center"} textAlign={"center"}>
                    <PowerSettingsNewIcon sx={{fontSize: 150, color:'red', marginLeft:'auto', marginRight:'auto'}}/>
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
