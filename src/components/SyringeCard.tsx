import { Box, Card, Stack, Typography, ButtonBase  } from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { NewDeviceDetails } from './NewDeviceDetails';
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
  darkTheme:boolean
}

export const SyringeCard: FC<DeviceDetails> = (props): JSX.Element => {
      
      const [isOpen, setIsOpen] = useState(false);
      const [alarmColor, setAlarmColor] = useState("#202020")
      const [newData, setNewData] = useState(false);
      const [alarm, setAlarm] = useState("")
      const [runNo, setRunNo] = useState(0)
      const [requiredForTimer, setRequiredForTimer] = useState(false)
      const [requiredForBorderColor, setRequiredForBorderColor] = useState(false)
      const [isBlinking, setIsBlinking] = useState(false);
     useEffect(() => {
      setRunNo(runNo+1)
      if (props.observation_resource?.component?.[1] && runNo>=2 && props.communication_resource?.extension?.[1]) {
          setNewData(true);
          setRequiredForBorderColor(!requiredForBorderColor)
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
  
      useEffect(() => {
          let timer: number | undefined;
          if(newData){
              timer = setInterval(() => {setNewData(false);setAlarmColor("#202020");clearInterval(timer)},15000)
  
          }
          return () => {
              clearInterval(timer); 
          };
      }, [requiredForTimer])
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
       const findData = (x: string) => {
        if (props.observation_resource && props.observation_resource.component) {
          let index = props.observation_resource.component.findIndex((item) => item.code.text === x);
          if (index === -1) {
            return { data: "--", unit: "--" };
          }
          let data = Number(props.observation_resource.component[index].valueQuantity.value);
          data = Math.round((data + Number.EPSILON) * 100) / 100;
          let unit = props.observation_resource.component[index].valueQuantity.unit;
          return ({data:data, unit:unit})
        } else {
          return { data: "--", unit: "--" };
        }
      };
       return (
      <Box
        width={{ xs: '350px', sm: '500px', md: '500px', lg: '500px' }}
        sx={{ borderRadius: '25px', cursor: 'pointer' }}
        onClick={() => { setIsOpen(true) }}>
        <ButtonBase sx={{ width: '100%', borderRadius: '25px' }}>
          <Card
            style={{width: '100%',backgroundImage: 'linear-gradient(to bottom, #34405D, #151E2F, #34405D)', borderRadius: '25px', height: '300px',opacity: 1,boxShadow: `0px 0px 30px 5px ${isBlinking ? alarmColor : '#202020'}`,border: '1px solid #606060',}}>
           {newData ? (<>
            <Stack width={'100%'} height={'100%'}>
              <Box display={'flex'} width={'100%'} height={'10%'} paddingTop={'2.5%'}>
                <Box width={'30%'} height={'100%'} textAlign={'left'} paddingLeft={'5%'}>
                <Typography variant="subtitle2" sx={{fontWeight:"bold", marginLeft:'5px'}} color={'#CBCFE5'}>
                                    {props.patient?.identifier && props?.patient?.identifier[0]?.value}
                </Typography>
                </Box>
                <Box width={'40%'} height={'100%'} textAlign={'center'}>
                  <div style={{ fontSize: '100%', paddingRight: '3%', fontWeight: 500 }}>
                    {(() => {
                                    let data = findData("Infusion Mode")
                                    return (data.unit)
                                })()}
                    </div>
                </Box>
                <Box display={'flex'} width={'30%'} height={'100%'}>
                  <Box paddingRight={'2%'} width={'100%'} height={'65%'} sx={{ backgroundColor: 'transparent' }}>
                  <Typography variant="subtitle2"  color={'#CBCFE5'}>
                                        {props?.device_id}
          </Typography>
                  </Box>
                </Box>
              </Box>
              {/* <Stack width={'100%'} height={'45%'} direction={'row'}>
                <Box width={'33.33%'} height={'100%'} sx={{ borderRight: '2px solid grey', borderTop: '2px solid grey' }} justifyContent={'center'} textAlign={'center'}>
                <Box marginTop={'5%'}>
                    <Typography variant="caption" color={'#A8C5D4'} paddingTop={'7%'} paddingRight={'10px'}>
                    Dose Rate
                    </Typography>
                  </Box>
                    <Typography variant="h3" color={'#5db673'} paddingLeft={'3%'}>
                   {(() => {
                    let data = findData("Dose Rate")
                    return (data.data)
                })()}
                  </Typography>
             </Box>
                <Box width={'33.33%'} height={'100%'} sx={{ borderRight: '2px solid grey', borderTop: '2px solid grey' }} justifyContent={'center'} textAlign={'center'}>
                <div style={{marginTop:'7%'}}><Typography variant='caption' color={"#A8C5D4"}>VTBI</Typography></div>
                  <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'center' ,color:'#5db673'}}>
                    <Typography variant="h3" paddingLeft={'20%'}>{(() => {
                    let data = findData("VTBI")
                    return (data.data)
                })()}</Typography>
                    <Typography variant="h6" color={'white'} paddingTop={'15%'} paddingLeft={'3%'}>
                    {(() => {
                    let data = findData("VTBI")
                    return (data.unit)
                })()}
                    </Typography>
                  </div>
                 </Box>
                <Box width={'33.33%'} height={'100%'} sx={{  borderTop: '2px solid grey' }} justifyContent={'center'} textAlign={'center'}>
                <div style={{marginTop:'7%'}}><Typography variant='caption' color={"#A8C5D4"}>Rate</Typography></div>
                  <div style={{ display: 'flex', textAlign: 'center', justifyContent: 'center',color:'#5db673' }}>
                    <Typography variant="h3" paddingLeft={'20%'}>{(() => {
                    let data = findData("Rate")
                    return (data.data)
                })()}</Typography>
                    <Typography variant="h6" color={'white'} paddingTop={'15%'} paddingLeft={'3%'}>
                    {(() => {
                    let data = findData("Rate")
                    return (data.unit)
                })()}
                    </Typography>
                  </div>
                </Box>
              </Stack> */}
              

              {/* <Stack width={'100%'} height={'45%'} direction={'row'} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box width={'33.33%'} height={'100%'} sx={{ borderRight: '2px solid grey', borderTop: '2px solid grey', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" color={'#A8C5D4'}>
            Dose Rate
        </Typography>
        <Typography variant="h4" color={'#5db673'}>
            {(() => {
                let data = findData("Dose Rate");
                return (data.data);
            })()}
        </Typography>
    </Box>
    <Box width={'33.33%'} height={'100%'} sx={{ borderRight: '2px solid grey', borderTop: '2px solid grey', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant='caption' color={"#A8C5D4"}>Volume</Typography>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5db673' }}>
            <Typography variant="h4">
                {(() => {
                    let data = findData("Volume");
                    return (data.data);
                })()}
            </Typography>
            <Typography variant="subtitle1" color={'white'} paddingTop={'20%'}>
                {(() => {
                    let data = findData("Volume");
                    return (data.unit);
                })()}
            </Typography>
        </div>
    </Box>
    <Box width={'33.33%'} height={'100%'} sx={{ borderTop: '2px solid grey', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant='caption' color={"#A8C5D4"}>Time Left</Typography>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5db673' }}>
            <Typography variant="h4">
                {(() => {
                    let data = findData("Time Left");
                    return (data.data);
                })()}
            </Typography>
            <Typography variant="subtitle1" color={'white'} paddingTop={'20%'} sx={{color:'#5db673'}}>
                {(() => {
                    let data = findData("Time Left");
                    return (data.unit);
                })()}
            </Typography>
        </div>
    </Box>
</Stack> */}

<Stack width={"100%"} height={'50%'} direction={'row'}>
                        <Box width={'33.33%'} height={'100%'} sx={{ borderRight:'2px solid grey', borderTop:'2px solid grey'}} justifyContent={'center'} textAlign={'center'}>
                            <div style={{marginTop:'7%'}}><Typography variant='caption' color={"#A8C5D4"}>Dose Rate</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', marginTop:'10%',textAlign:'center', justifyContent:'center'}}>
                               
                                <Typography variant='h4'>
                                    {(() => {
                                        let data = findData("Dose Rate")
                                        return (data.data)
                                    })()}
                                </Typography>
            
                            </div>
                        </Box>
                        <Box width={'33.33%'} height={'100%'} sx={{ borderRight:'2px solid grey', borderTop:'2px solid grey'}} justifyContent={'center'} textAlign={'center'}>
                        <div style={{marginTop:'7%'}}><Typography variant='caption' color={"#A8C5D4"}>Volume</Typography></div>
                            <div style={{display:'flex', textAlign:'center',marginTop:'10%', justifyContent:'center'}}>
                            {/* <FontAwesomeIcon icon={faBaby} color='#CBCFE5' style={{paddingTop:'6%', paddingRight:'7%', fontSize:'200%'}}/> */}
                                <Typography variant='h4'>
                                    {(() => {
                                        let data = findData("Volume")
                                     return (data.data)
                                    })()}
                                </Typography>
                                <Typography variant='subtitle1' color={"#5db673"} paddingTop={'13%'} paddingLeft={'3%'}>
                                {(() => {
                                        let data = findData("Volume")
                                     return (data.unit)
                                    })()}
                                </Typography>
                            </div>
                           
                        </Box>
                        <Box width={'33.33%'} height={'100%'} sx={{ borderTop:'2px solid grey'}} justifyContent={'center'} textAlign={'center'}>
                        <div style={{marginTop:'7%'}}><Typography variant='caption' color={"#A8C5D4"}>Time Left</Typography></div>
                            <div style={{display:'flex', textAlign:'center', marginTop:'10%',justifyContent:'center'}}>
                            {/* <FontAwesomeIcon icon={faBaby} color='#CBCFE5' style={{paddingTop:'6%', paddingRight:'7%', fontSize:'200%'}}/> */}
                                <Typography variant='h4'>
                                    {(() => {
                                        let data = findData("Time Left")
                                        return (data.data)
                                    })()}
                                </Typography>
                                <Typography variant='subtitle1' color={"#5db673"} paddingTop={'13%'} paddingLeft={'3%'}>
                                {(() => {
                                        let data = findData("Time Left")
                                        return (data.unit)
                                    })()}
                                </Typography>
                            </div>
                            
                        </Box>
                    </Stack>
              {/* <Stack width={'100%'} height={'45%'} direction={'row'}>
                <Box width={'33.3%'} height={'100%'} sx={{ borderRight: '2px solid grey', borderTop: '2px solid grey' }} justifyContent={'center'} textAlign={'center'}>
                  <Box marginTop={'5%'}>
                    <Typography variant="caption" color={'#A8C5D4'} paddingTop={'7%'} paddingRight={'10px'}>
                    Alarm
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" color={alarmColor}>
                  {alarm}
                   </Typography>
                </Box>
                <Box width={'33.3%'} height={'100%'} sx={{borderRight:'2px solid grey', borderTop: '2px solid grey', display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                <Box marginTop={'5%'}>
                    <Typography variant="caption"  color={"#A8C5D4"} paddingTop={'7%'} paddingRight={'10px'}>
                    Pump Status
                    </Typography>
                  </Box>
                  <Typography variant="h5" >
                  {(() => {
                    let data = findData("Pump Status")
                    return (data.unit)
                })()}
                   </Typography>
                </Box>
                 <Box width={'33.3%'} height={'100%'} sx={{ borderTop: '2px solid grey', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <Box display={'flex'} justifyContent={'space-between'} width={'100%'} height={'50%'} paddingTop={'5%'}>
        <Typography variant="caption" color={'#A8C5D4'} paddingLeft={'5%'} paddingTop={'7%'}>
            Volume
        </Typography>
        <Typography variant="h5" paddingTop={'3%'} color={'#5db673'}>
            {(() => {
                let data = findData("Volume");
                return data.data;
            })()}
        </Typography>
        <Typography variant="subtitle1" paddingTop={'5%'} paddingRight={'5%'}  color={'white'} >
            {(() => {
                let data = findData("Volume");
                return data.unit;
            })()}
        </Typography>
    </Box>
    <Box display={'flex'} justifyContent={'space-between'} width={'100%'} height={'50%'} sx={{ borderTop: '2px solid grey' }}  paddingTop={'5%'}>
        <Typography variant="caption" color={'#A8C5D4'} paddingLeft={'5%'} paddingTop={'7%'}>
            Time Left
        </Typography>
        <Typography variant="h5" paddingTop={'3%'}   color={'#5db673'}>
            {(() => {
                let data = findData("Time Left");
                return data.data;
            })()}
        </Typography>
        <Typography variant="subtitle1" paddingTop={'5%'} paddingRight={'5%'}color={'white'} >
            {(() => {
                let data = findData("Time Left");
                return data.unit;
            })()}
        </Typography>
    </Box>
</Box>
  </Stack> */}
  <Stack width={'100%'} height={'45%'} direction={'row'} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box width={'33.3%'} height={'100%'} sx={{ borderRight: '2px solid grey', borderTop: '2px solid grey', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Box marginTop={'5%'}>
            <Typography variant="caption" color={'#A8C5D4'} paddingTop={'7%'} paddingRight={'10px'}>
                Alarm
            </Typography>
        </Box>
        <Typography variant="subtitle1" color={alarmColor}>
            {alarm}
        </Typography>
    </Box>
    <Box width={'33.3%'} height={'100%'} sx={{ borderRight: '2px solid grey', borderTop: '2px solid grey', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Box marginTop={'5%'}>
            <Typography variant="caption" color={"#A8C5D4"} paddingTop={'10%'} >
                Pump Status
            </Typography>
        </Box>
        <Typography variant="h5">
            {(() => {
                let data = findData("Pump Status");
                return (data.unit);
            })()}
        </Typography>
    </Box>
    <Box width={'33.3%'} height={'100%'} sx={{ borderTop: '2px solid grey', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box display={'flex'} justifyContent={'space-between'} width={'100%'} height={'50%'} paddingTop={'5%'}>
        <Typography variant="caption" color={'#A8C5D4'} paddingLeft={'5%'} paddingTop={'7%'}>
               Rate
            </Typography>
            <Typography variant="h5" paddingTop={'3%'} >
                {(() => {
                    let data = findData("Rate");
                    return data.data;
                })()}
            </Typography>
            <Typography variant="subtitle1" paddingTop={'5%'} paddingRight={'5%'}color={"#5db673"}>
                {(() => {
                    let data = findData("Rate");
                    return data.unit;
                })()}
            </Typography>
        </Box>
        <Box display={'flex'} justifyContent={'space-between'} width={'100%'} height={'50%'} sx={{ borderTop: '2px solid grey' }} paddingTop={'5%'}>
            

            <Typography variant="caption" color={'#A8C5D4'} paddingLeft={'5%'} paddingTop={'7%'}>
                VTBI
            </Typography>
            <Typography variant="h5" paddingTop={'3%'} >
                {(() => {
                    let data = findData("VTBI");
                    return data.data;
                })()}
            </Typography>
            <Typography variant="subtitle1" paddingTop={'5%'} paddingRight={'5%'} color={"#5db673"}>
                {(() => {
                    let data = findData("VTBI");
                    return data.unit;
                })()}
            </Typography>
        </Box>
    </Box>
</Stack>
</Stack>
            </>):(<>
              <Box width={'100%'} height={'100%'} sx={{backgroundColor:'transparent'}} display={'flex'} textAlign={"center"} justifyContent={"center"}>
            <Stack width={'100%'} height={'100%'} justifyContent={"center"} textAlign={"center"}>
                    <FontAwesomeIcon icon={faPowerOff} style={{fontSize: 70, color:'white', marginLeft:'auto', marginRight:'auto', fontWeight:'lighter', paddingBottom:'3%'}} />
                    <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:'grey'}}>{props?.device_id}</Typography>
                    <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:'grey'}}>Not Active/Connected</Typography>
            </Stack>
            </Box>
            </>)}
          </Card>
        </ButtonBase>
        <NewDeviceDetails 
                   isDialogOpened={isOpen}
                   handleCloseDialog={() => { console.log("MY BOI"); setIsOpen(false); } }
                   observation_resource={props.observation_resource}
                   communication_resource={props.communication_resource}
                   device_id={props.device_id}
                   device_resource_id={props.device_resource_id}
                   patient={props.patient}
                   newData={newData}
                   darkTheme={props.darkTheme} selectedIcon={''}        />
      </Box>
    );
  };