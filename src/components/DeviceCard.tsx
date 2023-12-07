// import { AccountCircle } from '@mui/icons-material'
import { Box, Paper, Card, CardContent, Stack, Typography  } from '@mui/material'
// import { red } from '@mui/material/colors'
import { FC, useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
import { Divider } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Link } from 'react-router-dom';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

export const DeviceCard: FC<DeviceDetails> = (props): JSX.Element => {
    const [alarmColor, setAlarmColor] = useState("")
    // const devicetimer = setInterval(timer, 10000)
  const [newData, setNewData] = useState(false);
  const [runNo, setRunNo] = useState(0)
  useEffect(() => {
    // let devicetimer = setInterval(timer, 10000)    
    setRunNo(runNo+1)
    // clearInterval(devicetimer)
    // console.log(devicetimer)
    // runtimer = setInterval(timer, 10000)
    if (props.observation_resource?.component?.[1] && runNo==2 && props.communication_resource?.extension?.[1]) {
      setNewData(true);
      console.log(props.observation_resource.identifier[0].value);
      for (var i=0; i< props?.communication_resource?.extension?.[1].valueCodeableConcept?.coding?.length; i++){
        console.log(props.communication_resource?.extension[1]?.valueCodeableConcept?.coding[i]?.code)
        if(props.communication_resource?.extension[1]?.valueCodeableConcept?.coding[i]?.code=='High Priority'){
            setAlarmColor('red')
            break
        }else{
            setAlarmColor('yellow')
        }
    }
    }

  }, [props.observation_resource]);
//   useEffect(() => {console.log(props.patient_id)},[props.patient_id])
  return (

      <Box  width={{ xs: "350px", sm: "500px", md: "500px", lg: "500px" }} sx={{ borderRadius:'25px'}} >
        
        <Link to="devicedata" style={{ textDecoration: 'none' }} state={{device_id: props.device_id, device_resource_id: props.device_resource_id, patient: props.patient, observation_resource: props.observation_resource, communication_resource: props.communication_resource, key: props.device_resource_id}}>
       
        <Card
            style={{width:'100%', backgroundImage:'linear-gradient(to bottom, #34405D, #151E2F, #34405D)', borderRadius: "25px", height:"300px",  border:'1px solid #606060'
        }}
          >
              <div>
                <CardContent>
                  <Stack
                    direction={{ xs: "row" }}
                    spacing={{ xs: 1, md: 1.5 }}
                    useFlexGap
                    flexWrap={"wrap"}
                  >
                    
                    
                  </Stack>
                  
                  { newData ? (<>
                  <Stack marginTop={'10px'} marginBottom={'10px'}>
                    <Stack spacing={'5px'} direction={'row'} width={'100%'} sx={{ justifyContent:'center', display: 'flex', alignItems: 'center'}}>
                        <Stack marginLeft={'auto'} marginRight={'auto'}>
                            <Typography variant='subtitle1' component={"h2"}>
                                {props.observation_resource.component[0].code.text}&nbsp;
                            </Typography>        
                            <Typography variant='h5' component={"h2"} sx={{marginLeft:'auto', fontWeight:"bold"}} paddingRight={'20px'} >
                            {(() => {
                                if (props.observation_resource.component[0].valueQuantity.unit=="PREWARM") {
                                    return 'P';
                                } else if (props.observation_resource.component[0].valueQuantity.unit=="MANUAL"){
                                    return 'M';
                                } else if(props.observation_resource.component[0].valueQuantity.unit=="BABY"){
                                    return 'B'
                                } else if(props.observation_resource.component[0].valueQuantity.unit="AIR"){
                                    return 'A'
                                }
                                else{
                                    return 'NF';
                                }
                            })()}
                            </Typography>
                        </Stack>
                        <Stack marginLeft={'auto'} marginRight={'auto'}>
                            <Typography variant='subtitle1' component={"h2"}>
                                {(() => {
                                    let x = props.observation_resource.component[1].code.text
                                    let arr = x.split(" ")
                                    let vvtemp = ""
                                    arr.map((val) => {
                                        
                                        if (val.length>4){
                                            vvtemp+=val.substring(0,4)
                                            vvtemp+= ". "
                                        }
                                        else{
                                            vvtemp+=val
                                            vvtemp+=" "
                                        }
                                    })
                                    return vvtemp
                                })()}
                            &nbsp;
                            </Typography>
                            <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                                <Typography variant='h5' component={"h2"}>
                                {Math.round((props.observation_resource.component[1].valueQuantity.value + Number.EPSILON) * 100) / 100}&nbsp;
                                </Typography>
                                <Typography variant='subtitle2' component={"h2"}>
                                {props.observation_resource.component[1].valueQuantity.unit}
                                </Typography>
                            </div>
                        </Stack>
                        <Stack marginLeft={'auto'} marginRight={'auto'} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant='subtitle1' component={"h2"}>
                            {(() => {
                                    let x = props.observation_resource.component[2].code.text
                                    let arr = x.split(" ")
                                    let vvtemp = ""
                                    arr.map((val) => {
                                        
                                        if (val.length>4){
                                            vvtemp+=val.substring(0,4)
                                            vvtemp+= ". "
                                        }
                                        else{
                                            vvtemp+=val
                                            vvtemp+=" "
                                        }
                                    })
                                    return vvtemp
                                })()}
                            &nbsp;
                            </Typography>
                            <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                                <Typography variant='h5' component={"h2"}>
                                {Math.round((props.observation_resource.component[2].valueQuantity.value + Number.EPSILON) * 100) / 100}&nbsp;
                                </Typography>
                                <Typography variant='subtitle2' component={"h2"}>
                                {props.observation_resource.component[2].valueQuantity.unit}
                                </Typography>
                            </div>
                        </Stack>
                        <Stack marginLeft={'auto'} marginRight={'auto'} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant='subtitle1' component={"h2"}>
                            {(() => {
                                    let x = props.observation_resource.component[3].code.text
                                    let arr = x.split(" ")
                                    let vvtemp = ""
                                    arr.map((val) => {
                                        
                                        if (val.length>4){
                                            vvtemp+=val.substring(0,4)
                                            vvtemp+= ". "
                                        }
                                        else{
                                            vvtemp+=val
                                            vvtemp+=" "
                                        }
                                    })
                                    return vvtemp
                                })()}
                            &nbsp;
                            </Typography>
                            <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                                <Typography variant='h5' component={"h2"}>
                                {Math.round((props.observation_resource.component[3].valueQuantity.value + Number.EPSILON) * 100) / 100}&nbsp;
                                </Typography>
                                <Typography variant='subtitle2' component={"h2"}>
                                {props.observation_resource.component[3].valueQuantity.unit}
                                </Typography>
                            </div>
                        </Stack>
                    </Stack>
                  </Stack>
                  <Divider />
                {props.observation_resource.component[4].code.text=="SpO2" &&                
                    <Stack marginTop={'10px'} marginBottom={'10px'}>
                    <Stack direction={'row'} width={'100%'} sx={{justifyContent:'center'}} >
                    <Stack marginLeft={'auto'} marginRight={'auto'}>
                        <Typography variant='subtitle1' component={"h2"}>
                        {(() => {
                                    let x = props.observation_resource.component[4].code.text
                                    let arr = x.split(" ")
                                    let vvtemp = ""
                                    arr.map((val) => {
                                        
                                        if (val.length>4){
                                            vvtemp+=val.substring(0,4)
                                            vvtemp+= ". "
                                        }
                                        else{
                                            vvtemp+=val
                                            vvtemp+=" "
                                        }
                                    })
                                    return vvtemp
                                })()}
                            &nbsp;
                        </Typography>
                        <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                                <Typography variant='h5' component={"h2"}>
                                {Math.round((props.observation_resource.component[4].valueQuantity.value + Number.EPSILON) * 100) / 100}&nbsp;
                                </Typography>
                                <Typography variant='subtitle2' component={"h2"}>
                                {props.observation_resource.component[4].valueQuantity.unit}
                                </Typography>
                            </div>
                    </Stack>
                    <Stack marginLeft={'auto'} marginRight={'auto'}>
                        <Typography variant='subtitle1' component={"h2"}>
                        {(() => {
                                    let x = props.observation_resource.component[5].code.text
                                    let arr = x.split(" ")
                                    let vvtemp = ""
                                    arr.map((val) => {
                                        
                                        if (val.length>4){
                                            vvtemp+=val.substring(0,4)
                                            vvtemp+= ". "
                                        }
                                        else{
                                            vvtemp+=val
                                            vvtemp+=" "
                                        }
                                    })
                                    return vvtemp
                                })()}
                            &nbsp;
                        </Typography>
                        <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                                <Typography variant='h5' component={"h2"}>
                                {Math.round((props.observation_resource.component[5].valueQuantity.value + Number.EPSILON) * 100) / 100}&nbsp;
                                </Typography>
                                <Typography variant='subtitle2' component={"h2"}>
                                {props.observation_resource.component[5].valueQuantity.unit}
                                </Typography>
                            </div>
                    </Stack>
                    <Stack marginLeft={'auto'} marginRight={'auto'}>
                        <Typography variant='subtitle1' component={"h2"}>
                        {(() => {
                                    let x = props.observation_resource.component[6].code.text
                                    let arr = x.split(" ")
                                    let vvtemp = ""
                                    arr.map((val) => {
                                        
                                        if (val.length>4){
                                            vvtemp+=val.substring(0,4)
                                            vvtemp+= ". "
                                        }
                                        else{
                                            vvtemp+=val
                                            vvtemp+=" "
                                        }
                                    })
                                    return vvtemp
                                })()}
                            &nbsp;
                        </Typography>
                        <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                                <Typography variant='h5' component={"h2"}>
                                {Math.round((props.observation_resource.component[6].valueQuantity.value + Number.EPSILON) * 100) / 100}&nbsp;
                                </Typography>
                                <Typography variant='subtitle2' component={"h2"}>
                                {props.observation_resource.component[6].valueQuantity.unit}
                                </Typography>
                            </div>
                    </Stack>
                    <Stack marginLeft={'auto'} marginRight={'auto'}>
                        <Typography variant='subtitle1' component={"h2"}>
                        {(() => {
                                    let x = props.observation_resource.component[7].code.text
                                    let arr = x.split(" ")
                                    let vvtemp = ""
                                    arr.map((val) => {
                                        
                                        if (val.length>4){
                                            vvtemp+=val.substring(0,4)
                                            vvtemp+= ". "
                                        }
                                        else{
                                            vvtemp+=val
                                            vvtemp+=" "
                                        }
                                    })
                                    return vvtemp
                                })()}
                            &nbsp;
                        </Typography>
                        {(() => {
                            
                            if(props.observation_resource.component[7].valueQuantity.unit=="SIQ"){
                                return (
                                    <Box width={'50px'} height={'25px'} sx={{backgroundColor:'white', borderRadius:'6px'}}>
                                        <Box width={String(props.observation_resource.component[7].valueQuantity.value)+'%'} height={'100%'} sx={{backgroundColor:'blue', borderRadius:'6px'}}>
                                        </Box>
                                    </Box>
                                )
                            }
                            else{
                                return(
                                    <div style={{ display: 'flex',marginLeft:'auto', marginRight:'auto', paddingRight:'10px' }}>
                                        <Typography variant='h5' component={"h2"}>
                                        {Math.round((props.observation_resource.component[7].valueQuantity.value + Number.EPSILON) * 100) / 100}
                                        </Typography>
                                        <Typography variant='subtitle2' component={"h2"}>
                                        {props.observation_resource.component[7].valueQuantity.unit}
                                        </Typography>
                                    </div> 
                                )
                            }
                        })()}
                        
                        {/* <Typography variant='h5' component={"h2"} sx={{marginLeft:'auto'}} paddingRight={'20px'}>
                        {props.observation_resource.component[8].valueQuantity.value}{props.observation_resource.component[8].valueQuantity.unit}
                        </Typography> */}
                    </Stack>
                    </Stack>
                    </Stack>
                }
                {props.observation_resource.component[4].code.text!="SpO2" && 
                    <Stack marginTop={'10px'} marginBottom={'10px'} sx={{justifyContent:'center'}}>
                        <Typography variant='subtitle1' component={'h2'} sx={{fontWeight:'bold', justifySelf:'center'}}>Oximeter Not connected</Typography>
                    </Stack>
                }
                {/* <Divider /> */}
                </>) : (
                <Box width={'100%'} height={'100%'} marginTop={'15%'} sx={{backgroundColor:'transparent'}} display={'flex'} textAlign={"center"} justifyContent={"center"}>
                <Stack width={'100%'} height={'100%'} justifyContent={"center"} textAlign={"center"}>
                        <FontAwesomeIcon icon={faPowerOff} style={{fontSize: 70, color:'white', marginLeft:'auto', marginRight:'auto', fontWeight:'lighter', paddingBottom:'3%'}} />
                        <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:'grey'}}>{props?.device_id}</Typography>
                        <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:'grey'}}>Not Active/Connected</Typography>
                </Stack>
                </Box>
                  )}               
                </CardContent>
              </div>
            
          </Card>
        
        </Link>
        
      </Box>
  )
}
