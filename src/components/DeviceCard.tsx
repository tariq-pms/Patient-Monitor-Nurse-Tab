// import { AccountCircle } from '@mui/icons-material'
import { Box, Paper, Card, CardContent, Stack, Typography, LinearProgress,  } from '@mui/material'
// import { red } from '@mui/material/colors'
import { FC, useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
import { Divider } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Link } from 'react-router-dom';

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
    function timer() {
        setNewData(false)
        setAlarmColor("white")
        }
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
      for (var i=0; i< props?.communication_resource?.extension?.[1].valueCodeableConcept?.coding?.length; i++){
        
        if(props.communication_resource?.extension[1]?.valueCodeableConcept?.coding[i]?.code=='high'){
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

      <Box  width={{
        xs: "320px",
        sm: "350px",
        md: "450px",
        lg: "450px"
      }} sx={{backgroundColor:'transparent', borderRadius:'25px', border: `4px solid ${alarmColor}`}} >
        
        <Link to="devicedata" state={{device_id: props.device_id, device_resource_id: props.device_resource_id, patient: props.patient, observation_resource: props.observation_resource, communication_resource: props.communication_resource, key: props.device_resource_id}}>
        <Paper  elevation={2} sx={{ borderRadius: "25px", backgroundColor:'transparent' }}>
          <Card
            style={{ backgroundColor: "transparent", borderRadius: "25px", minHeight:"280px",
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
                    <Stack direction={'row'} width={"100%"}>
                      <Typography variant="subtitle1" component={"h2"}>
                      {props.device_id}
                      </Typography>
                      <Typography variant="subtitle1" sx={{marginLeft:'auto'}}>
                      {props.patient?.identifier[0].value}
                      </Typography>
                    </Stack>
                    
                  </Stack>
                  <Divider />
                  { newData ? (<>
                  <Stack marginTop={'10px'} marginBottom={'10px'}>
                    <Stack direction={'row'} width={'100%'} sx={{ justifyContent:'center'}}>
                        <Stack marginLeft={'auto'} marginRight={'auto'}>
                            <Typography variant='subtitle1' component={"h2"}>
                                {props.observation_resource.component[0].code.text}&nbsp;
                            </Typography>
                            <Typography variant='h5' component={"h2"} sx={{marginLeft:'auto', fontWeight:"bold"}} paddingRight={'20px'} >
                            {(() => {
                                if (props.observation_resource.component[0].valueQuantity.value==0) {
                                    return 'P';
                                } else if (props.observation_resource.component[0].valueQuantity.value==1){
                                    return 'M';
                                }
                                else{
                                    return 'B';
                                }
                            })()}
                            </Typography>
                        </Stack>
                        <Stack marginLeft={'auto'} marginRight={'auto'}>
                            <Typography variant='subtitle1' component={"h2"}>
                            Set Temp.&nbsp;
                            </Typography>
                            <Typography variant='h5' component={"h2"} sx={{marginLeft:'auto'}} paddingRight={'20px'}>
                            {props.observation_resource.component[1].valueQuantity.value}{props.observation_resource.component[1].valueQuantity.unit}
                            </Typography>
                        </Stack>
                        <Stack marginLeft={'auto'} marginRight={'auto'}>
                            <Typography variant='subtitle1' component={"h2"}>
                            Temp 1&nbsp;
                            </Typography>
                            <Typography variant='h5' component={"h2"} sx={{marginLeft:'auto'}} paddingRight={'20px'}>
                            {props.observation_resource.component[2].valueQuantity.value}{props.observation_resource.component[2].valueQuantity.unit} 
                            </Typography>
                        </Stack>
                        <Stack marginLeft={'auto'} marginRight={'auto'}>
                            <Typography variant='subtitle1' component={"h2"}>
                            Heater %&nbsp;
                            </Typography>
                            <Typography variant='h5' component={"h2"} sx={{marginLeft:'auto'}} paddingRight={'20px'}>
                            {props.observation_resource.component[3].valueQuantity.value}{props.observation_resource.component[3].valueQuantity.unit}
                            </Typography>
                        </Stack>
                    </Stack>
                  </Stack>
                  <Divider />
                  {props.observation_resource.component[6] && 
                  <Stack marginTop={'10px'} marginBottom={'10px'}>
                  <Stack direction={'row'} width={'100%'} sx={{justifyContent:'center'}} >
                  <Stack marginLeft={'auto'} marginRight={'auto'}>
                          <Typography variant='subtitle1' component={"h2"}>
                              SpO2&nbsp;
                          </Typography>
                          <Typography variant='h5' component={"h2"} sx={{marginLeft:'auto'}} paddingRight={'20px'}>
                          {props.observation_resource.component[5].valueQuantity.value}{props.observation_resource.component[5].valueQuantity.unit}
                          </Typography>
                      </Stack>
                      <Stack marginLeft={'auto'} marginRight={'auto'}>
                          <Typography variant='subtitle1' component={"h2"}>
                          PI&nbsp;
                          </Typography>
                          <Typography variant='h5' component={"h2"} sx={{marginLeft:'auto'}} paddingRight={'20px'}>
                          {props.observation_resource.component[7].valueQuantity.value}{props.observation_resource.component[7].valueQuantity.unit}
                          </Typography>
                      </Stack>
                      <Stack marginLeft={'auto'} marginRight={'auto'}>
                          <Typography variant='subtitle1' component={"h2"}>
                          PR&nbsp;
                          </Typography>
                          <Typography variant='h5' component={"h2"} sx={{marginLeft:'auto'}} paddingRight={'20px'}>
                          {props.observation_resource.component[6].valueQuantity.value}{props.observation_resource.component[6].valueQuantity.unit} 
                          </Typography>
                      </Stack>
                      <Stack marginLeft={'auto'} marginRight={'auto'}>
                          <Typography variant='subtitle1' component={"h2"}>
                          SIQ&nbsp;
                          </Typography>
                          <LinearProgress variant="determinate" value={props.observation_resource.component[8].valueQuantity.value} />
                          {/* <Typography variant='h5' component={"h2"} sx={{marginLeft:'auto'}} paddingRight={'20px'}>
                          {props.observation_resource.component[8].valueQuantity.value}{props.observation_resource.component[8].valueQuantity.unit}
                          </Typography> */}
                      </Stack>
                  </Stack>
                </Stack>
                }
                {!props.observation_resource.component[6] && 
                    <Stack marginTop={'10px'} marginBottom={'10px'} sx={{justifyContent:'center'}}>
                        <Typography variant='subtitle1' component={'h2'} sx={{fontWeight:'bold', justifySelf:'center'}}>Oximeter Not connected</Typography>
                    </Stack>
                }
                  
                  <Divider /></>) : (
                    <Stack width={"100%"}>
                        <PowerSettingsNewIcon sx={{fontSize: 150, color:'red', marginLeft:'auto', marginRight:'auto'}}/>
                        <Typography variant='h6' sx={{marginLeft:'auto', marginRight:'auto'}}>Device not active/connected</Typography>
                    </Stack>
                  )}               
                </CardContent>
              </div>
            
          </Card>
        </Paper>
        </Link>
        
      </Box>
  )
}
