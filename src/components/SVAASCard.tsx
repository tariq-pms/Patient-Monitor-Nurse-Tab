// import { AccountCircle } from '@mui/icons-material'
import { Box, Card, Stack, Typography} from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faPowerOff, } from '@fortawesome/free-solid-svg-icons'
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
  darkTheme:boolean

}

export const SVAASCard: FC<DeviceDetails> = (props): JSX.Element => {

    const [alarmColor, setAlarmColor] = useState("#202020")
    // const devicetimer = setInterval(timer, 10000)
    const [isOpen, setIsOpen] = useState(false);


    // const devicetimer = setInterval(timer, 10000)

    // setInterval(secondTimer,7000)
    const [newData, setNewData] = useState(false);
    const [alarm, setAlarm] = useState("")
    const [runNo, setRunNo] = useState(0)
    const [requiredForTimer, setRequiredForTimer] = useState(false)

    const [requiredForBorderColor, setRequiredForBorderColor] = useState(false)
    const [isBlinking, setIsBlinking] = useState(false);

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
const [, setControlOpacity] = useState("0.8")
  return (

      <Box  width={{
        xs: "350px",
        sm: "500px",
        md: "500px",
        lg: "470px"
      }} sx={{borderRadius:'25px'}} //border: alarmColor!='transparent' ? `6px solid ${alarmColor}`: ""
      onMouseLeave={() => {setControlOpacity("0.8")}} onMouseEnter={() => {setControlOpacity("1")}} onClick={() => {setIsOpen(true)}}>
        
        {/* <Link to="devicedata" style={{ textDecoration: 'none' }} state={{device_id: props.device_id, device_resource_id: props.device_resource_id, patient: props.patient, observation_resource: props.observation_resource, communication_resource: props.communication_resource, key: props.device_resource_id}}> */}
        <Card
                style={{width:'100%', backgroundColor:props.darkTheme?'#34495F':'#FFFFFF', borderRadius: "25px", height:"300px", opacity: newData ? 1 : 0.7, border: `5px solid ${isBlinking ? alarmColor : '#E4E4E4'}`,}}
              >
            {newData ? (<>
                <Stack width={'100%'} height={'100%'}>
                    
                {/* <Stack width={"100%"} height={'40%'} direction={'row'}>
                       <Box width={'37.5%'} height={'100%'} sx={{ borderRight:'2px solid grey', borderTop:'2px solid grey'}} justifyContent={'center'} textAlign={'center'}>
                        <div style={{marginTop:'7%'}}><Typography variant='caption' color={"#A8C5D4"}>Flow (L/min)</Typography></div>

                      
                                        <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                                            <Typography variant='h3' color={"#5db673"} paddingTop={'5%'} >
                                                {(() => {
                                                        let data = findData("Current FiO2 Flow") //Current FiO2 Flow?? Check with SVAAS Team
                                                        return (data.data)
                                                    }
                                                )()}
                                            </Typography>
                                        </div>
                        </Box>
                        <Box width={'37.5%'} height={'100%'} sx={{ borderRight:'2px solid grey', borderTop:'2px solid grey'}} justifyContent={'center'} textAlign={'center'}>
                        <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'} >Pressure (cmH2O) </Typography>
                                        <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                                            <Typography variant='h3' color={"#5db673"} paddingTop={'5%'} >
                                                {(() => {
                                                        let data = findData("CPAP Pressure") 
                                                        return (data.data)
                                                    }
                                                )()}
                                            </Typography>
                                            </div>
                                           
                        </Box>
                        <Box width={'33.33%'} height={'100%'} justifyContent={'center'} textAlign={'center'} sx={{borderTop:'2px solid grey'}}>
                        <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>FiO2 (%)</Typography>
                                        <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                                            <Typography variant='h3' color={"#5db673"} paddingTop={'5%'} >
                                                {(() => {
                                                        let data = findData("Current FiO2 Flow")
                                                        return (data.data)
                                                    }
                                                )()}
                                            </Typography>
                                            <Typography variant='h5' color={"#5db673"} paddingTop={'5%'} paddingLeft={'3%'}>
                                                {(() => {
                                                        let data = findData("Set FiO2")
                                                        return (data.data)
                                                })()}
                                            </Typography>
                                        </div>
                    </Box>
                    </Stack> */}

                    <Stack width={"100%"} height={'45%'} direction={'row'} marginTop={'10px'}>
                            
                            <Box width={'40%'} >
                        <div style={{marginTop:'10%'}}><Typography variant='subtitle1' color={"#124D81"} paddingLeft={'10%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica',textAlign: 'left'}}>Flow </Typography></div>
                                <div style={{display:'flex', justifyContent:'left',marginLeft:'20px'}}>
                                   
                                    <Typography variant='h2' color={"#124D81"}  >
                                    {(() => {
                                                        let data = findData("Current FiO2 Flow") //Current FiO2 Flow?? Check with SVAAS Team
                                                        return (data.data)
                                                    }
                                                )()}
                                    </Typography>
                                    <Typography variant='subtitle2' color={"#3C89C0"} paddingLeft={'5%'} paddingTop={'25%'} >
                                    L/min
                                    </Typography>
                                   
                                </div>
                             </Box>  
                             <Box width={'35%'} >
        <div style={{marginTop:'10%'}}><Typography variant='subtitle1' color={"#4B7193"} style={{fontWeight: 'bold', fontFamily: 'Helvetica',textAlign: 'left'}} >Pressure</Typography></div>
                                {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                                <div style={{display:'flex', justifyContent:'left'}}>
                                  <Typography variant='h2' color={"#4B7193"} >
                                  {(() => {
                                                        let data = findData("CPAP Pressure") 
                                                        return (data.data)
                                                    }
                                                )()}</Typography>
                                                 <Typography variant='subtitle2' color={"#3C89C0"} paddingLeft={'5%'} paddingTop={'25%'} >
                                                 cmH2O
                                    </Typography>

                                </div>
                            </Box> 
                            
                            <Box width={'35%'} >
                        <div style={{marginTop:'10%'}}><Typography variant='subtitle1' color={"#124D81"} paddingLeft={'10%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica',textAlign: 'left'}}>FiO2 (%)</Typography></div>
                                <div style={{display:'flex', justifyContent:'left',marginLeft:'20px'}}>
                                   
                                    <Typography variant='h2' color={"#124D81"}  >
                                    {(() => {
                                                        let data = findData("CPAP Pressure") 
                                                        return (data.data)
                                                    }
                                                )()}
                                    </Typography>
                                   
                                    <Typography variant='subtitle1' color={"#124D81"} paddingTop={'25%'} >
                                    {(() => {
                                                        let data = findData("Set FiO2")
                                                        return (data.data)
                                                })()}
                                    </Typography>
                                </div>
                             </Box> 
                        </Stack>

                    <Stack width={"100%"} height={'44%'} direction={'row'}>
                        {/* <Box width={'37.5%'} height={'100%'} sx={{ borderRight:'2px solid grey', borderTop:'2px solid grey'}} justifyContent={'center'} textAlign={'center'}>
                        <Box marginTop={'5%'}>
                            <Typography variant='caption' color={"#A8C5D4"}  paddingTop={'7%'} paddingRight={'10px'} >
                                Alarm  
                                </Typography>
                                <FontAwesomeIcon icon={faBell} /></Box>
                           
                            <Typography variant='subtitle1' color={`${alarmColor}`} >
                            {alarm}
                            </Typography>
                            </Box> */}

                            <Box width={'35%'} height={'100%'}  >
                            <Box marginTop={'5%'}>
                                <Typography variant='caption' color={"#A8C5D4"}  paddingTop={'7%'} paddingLeft={'20px'} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >
                                    Alarm  
                                    </Typography>
                                    <FontAwesomeIcon icon={faBell} /></Box>
                               
                                <Typography variant='subtitle1' paddingLeft={'20px'} color={`${alarmColor}`} >
                                    {alarm}
                                    
                                </Typography>
                                
                            </Box>
                            {/* <Box width={'37.5%'} height={'100%'} sx={{ borderRight:'2px solid grey', borderTop:'2px solid grey'}}>
                            <Box display={'flex'} height={'100%'}>
                            <Box display={'flex'} width={'50%'} sx={{borderRight:'2px solid grey',borderTop:'2px solid grey'}} marginTop={'47%'}justifyContent={'space-around'}>
                            <Typography variant='caption'  color={"#A8C5D4"} paddingTop={'15%'}  >PR(BPM)</Typography>
                            <Typography variant='h6' paddingTop={'5%'} color={"#5db673"}>
                                    {(() => {
                                            let data = findData("Pulse Rate")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                        </Box>
                        <Box display={'flex'} width={'50%'} height={'25%'} sx={{borderTop:'2px solid grey'}} marginTop={'47%'} justifyContent={'space-around'}>
                            <Typography variant='caption' paddingTop={'15%'} color={"#A8C5D4"}  >SPO2</Typography>
                            <Typography variant='h6' color={"#5db673"} paddingTop={'5%'}>
                                    {(() => {
                                            let data = findData("SPO2")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                        </Box>
                     </Box>
                       </Box> */}
                       <Box width={'25%'} >
        <div style={{marginTop:'10%'}}><Typography variant='subtitle2' color={"#38AAC3"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >PR</Typography></div>
                                {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                                <div style={{display:'flex', textAlign:'center', justifyContent:'left'}}>
                                  <Typography variant='h3' color={"#38AAC3"} >
                                  {(() => {
                                            let data = findData("Pulse Rate")
                                            return (data.data)
                                        }
                                    )()}
                                    </Typography>
                                    <Typography variant='subtitle2' color={"#38AAC3"}  paddingTop={'25%'} >
                                    BPM
                                    </Typography>
                                </div>
                            </Box>
                            <Box width={'25%'} >
        <div style={{marginTop:'10%',}}>
            <Typography variant='subtitle2' color={"#3C89C0"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >SpO2</Typography></div>
                                {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                                <div style={{display:'flex', textAlign:'center', justifyContent:'left'}}>
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
                        <Box width={'40%'} height={'100%'} >
                            <Box display={'flex'} width={'100%'} height={'30%'}  justifyContent={'space-between'}>
                                
                                <Typography variant='caption' color={"#3C89C0"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} paddingTop={'7%'} paddingLeft={'5%'}>Apnea (s)</Typography>
                                <Typography variant='h6' color={"#3C89C0"}  paddingTop={'2%'}  paddingRight={'5%'}>
                                    {(() => {
                                            let data = findData("Apnea")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>

                            </Box>
                            <Box display={'flex'} width={'100%'} height={'30%'} justifyContent={'space-between'}>
                                <Typography variant='caption' color={"#3C89C0"}  paddingTop={'7%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} paddingLeft={'5%'}>PI</Typography>
                                <Typography variant='h5' color={"#3C89C0"} paddingTop={'2%'} paddingRight={'5%'}>
                                    {(() => {
                                            let data = findData("PI")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                            </Box>
                            
                           
                                 <Box display={'flex'} width={'100%'} height={'34%'}  justifyContent={'space-between'} >
                                <Typography variant='caption' color={"#3C89C0"} paddingLeft={'5%'} paddingTop={'7%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >SIQ</Typography>
                                <Box width={'40%'} marginRight={'4%'} marginTop={'5%'} height={'50%'} sx={{border:'2px solid #3C89C0' , borderRadius:'3px'}}>
                                    {(() => {
                                        let data = findData("SIQ")
                                        return(
                                            <Box width={`${data.data}`+"%"} height={'100%'} sx={{backgroundColor:'#26C5E4'}}></Box>
                                        )
                                    })()}
                                </Box>
                                
                            </Box>
                            
                            {/* <Box display={'flex'} width={'100%'} height={'20%'} sx={{ borderTop:'2px solid grey'}} justifyContent={'space-around'}>
                                <Typography variant='caption' color={"#A8C5D4"} paddingTop={'5%'}>PI</Typography>
                                <Typography variant='h5' color={"#5db673"} paddingTop={'2%'}>
                                    {(() => {
                                            let data = findData("PI")
                                            return (data.data)
                                        }
                                    )()}
                                </Typography>
                            </Box> */}
                            
                        </Box>
                    </Stack>
                    <Box display={'flex'} width={'100%'} height={'10%'} paddingTop={'2.5%'} sx={{borderTop:'2px solid grey'}}  >
                        <Box width={'30%'} height={'100%'} textAlign={'left'} paddingLeft={'5%'} >
                        <Typography variant="subtitle2" sx={{fontWeight:"bold", marginLeft:'5px'}} color={'#7E7E7E'}>
                                    {props.patient?.identifier && props?.patient?.identifier[0]?.value}
                                    </Typography>
                        </Box>
                        <Box width={'40%'} height={'100%'} textAlign={'center'}>
                            <div style={{fontSize: '100%', paddingRight:'3%' , fontWeight:500,color: '#7E7E7E'}} >
                                {(() => {
                                    let data = findData("MODE")
                                    return (data.unit+" "+"MODE")
                                })()}
                            </div>
                            
                        </Box> 
                        {/* <FontAwesomeIcon icon={faPersonBreastfeeding} fontSize={'250%'} color='#CBCFE5'/> */}
                        <Box display={'flex'} width={'30%'} height={'100%'}>
                            
                            <Box paddingRight={'15%'} width={'100%'} height={'65%'} sx={{textAlign:'right'}}>
                                
                                    <Typography variant="subtitle2"   color={'#7E7E7E'}>
                                        {/* {props?.device_id} */}
                                        {props.patient?.extension[0]?.valueString}
                                    </Typography>
                                
                            </Box>
                        </Box>                         
                    </Box>
                </Stack>
            </>):(<>
            <Box width={'100%'} height={'100%'} sx={{backgroundColor:'transparent'}} display={'flex'} textAlign={"center"} justifyContent={"center"}>
            <Stack width={'100%'} height={'100%'} justifyContent={"center"} textAlign={"center"}>
            <FontAwesomeIcon icon={faPowerOff} style={{fontSize: 70, color:props.darkTheme?'#FFFFFF':'#124D81', marginLeft:'auto', marginRight:'auto', fontWeight:'lighter', paddingBottom:'3%'}} />
                    <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:props.darkTheme?'#FFFFFF':'#124D81'}}>{props?.device_id}</Typography>
                        <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:props.darkTheme?'#FFFFFF':'#124D81'}}>Not Active/Connected</Typography>
            </Stack>
            </Box>
                
            </>)}
            

        </Card>
        {/* </Link> */}
        <NewDeviceDetails 
        isDialogOpened={isOpen} 
        handleCloseDialog={() => setIsOpen(false)}
        observation_resource={props.observation_resource}
        communication_resource={props.communication_resource}
        device_id={props.device_id}
        device_resource_id={props.device_resource_id}
        patient={props.patient}
        newData={newData}
        darkTheme={props.darkTheme}
        />
      </Box>
  )
}
