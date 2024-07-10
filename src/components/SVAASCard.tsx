// import { AccountCircle } from '@mui/icons-material'
import { Box, Card, Stack, Typography} from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faPowerOff, } from '@fortawesome/free-solid-svg-icons'
import { NewDeviceDetails } from './NewDeviceDetails';
import PlethEDA from "./PlethEDA";

export interface DeviceDetails {
onClick: () => void;
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
    "effectiveDateTime":string; 
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
  pleth_resource: {
    "device_id": string;
    "patient_id": string;
    "timestamp": string;
    "data": number[];
  };
  darkTheme:boolean;
  selectedIcon:string;

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
            const interval = alarmColor === 'red' ? 300 : 600;
          intervalId = setInterval(() => {
            setIsBlinking((prevIsBlinking) => !prevIsBlinking);
          }, interval); // Adjust the blinking interval (in milliseconds) as needed
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
const getCardWidth = () => {
    switch (props.selectedIcon) {
      case 'view':
        return '24.7%';
      case 'apps':
        return '33.1%';
    case 'vertical':
            return '80%';  
        
      default:
        return '24.7%';
    }
  };

  const getOnClickHandler = () => {
    if (props.selectedIcon === 'vertical'){
        return props.onClick;
    }
    else{
        return () => {setIsOpen(true)};
    }
};

  return (

    //   <Box  width={{
    //     xs: "350px",
    //     sm: "500px",
    //     md: "500px",
    //     lg: "470px"
    //   }} sx={{borderRadius:'25px'}} //border: alarmColor!='transparent' ? `6px solid ${alarmColor}`: ""
    //   onMouseLeave={() => {setControlOpacity("0.8")}} onMouseEnter={() => {setControlOpacity("1")}} onClick={() => {setIsOpen(true)}}>
    // <Card style={{width:'100%', backgroundColor:props.darkTheme?'#34495F':'#FFFFFF', borderRadius: "25px", height:"300px", opacity: newData ? 1 : 0.7, border: `5px solid ${isBlinking ? alarmColor : '#E4E4E4'}`,}}>
    //         {newData ? (<>
    //             <Stack width={'100%'} height={'100%'}>
                    
    //   <Stack width={"100%"} height={'45%'} direction={'row'} marginTop={'10px'}>
                            
    //                         <Box width={'40%'} >
    //                     <div style={{marginTop:'10%'}}><Typography variant='subtitle1' color={"#124D81"} paddingLeft={'10%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica',textAlign: 'left'}}>Flow </Typography></div>
    //                             <div style={{display:'flex', justifyContent:'left',marginLeft:'20px'}}>
                                   
    //                                 <Typography variant='h2' color={"#124D81"}  >
    //                                 {(() => {
    //                                                     let data = findData("Current FiO2 Flow") //Current FiO2 Flow?? Check with SVAAS Team
    //                                                     return (data.data)
    //                                                 }
    //                                             )()}
    //                                 </Typography>
    //                                 <Typography variant='subtitle2' color={"#3C89C0"} paddingLeft={'5%'} paddingTop={'25%'} >
    //                                 L/min
    //                                 </Typography>
                                   
    //                             </div>
    //                          </Box>  
    //                          <Box width={'35%'} >
    //     <div style={{marginTop:'10%'}}><Typography variant='subtitle1' color={"#4B7193"} style={{fontWeight: 'bold', fontFamily: 'Helvetica',textAlign: 'left'}} >Pressure</Typography></div>
    //                             {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
    //                             <div style={{display:'flex', justifyContent:'left'}}>
    //                               <Typography variant='h2' color={"#4B7193"} >
    //                               {(() => {
    //                                                     let data = findData("CPAP Pressure") 
    //                                                     return (data.data)
    //                                                 }
    //                                             )()}</Typography>
    //                                              <Typography variant='subtitle2' color={"#3C89C0"} paddingLeft={'5%'} paddingTop={'25%'} >
    //                                              cmH2O
    //                                 </Typography>

    //                             </div>
    //                         </Box> 
                            
    //                         <Box width={'35%'} >
    //                     <div style={{marginTop:'10%'}}><Typography variant='subtitle1' color={"#124D81"} paddingLeft={'10%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica',textAlign: 'left'}}>FiO2 (%)</Typography></div>
    //                             <div style={{display:'flex', justifyContent:'left',marginLeft:'20px'}}>
                                   
    //                                 <Typography variant='h2' color={"#124D81"}  >
    //                                 {(() => {
    //                                                     let data = findData("CPAP Pressure") 
    //                                                     return (data.data)
    //                                                 }
    //                                             )()}
    //                                 </Typography>
                                   
    //                                 <Typography variant='subtitle1' color={"#124D81"} paddingTop={'25%'} >
    //                                 {(() => {
    //                                                     let data = findData("Set FiO2")
    //                                                     return (data.data)
    //                                             })()}
    //                                 </Typography>
    //                             </div>
    //                          </Box> 
    //                     </Stack>

    //                 <Stack width={"100%"} height={'44%'} direction={'row'}>
                        

    //                         <Box width={'35%'} height={'100%'}  >
    //                         <Box marginTop={'5%'}>
    //                             <Typography variant='caption' color={"#A8C5D4"}  paddingTop={'7%'} paddingLeft={'20px'} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >
    //                                 Alarm  
    //                                 </Typography>
    //                                 <FontAwesomeIcon icon={faBell} /></Box>
                               
    //                             <Typography variant='subtitle1' paddingLeft={'20px'} color={`${alarmColor}`} >
    //                                 {alarm}
                                    
    //                             </Typography>
                                
    //                         </Box>
                          
    //                    <Box width={'25%'} >
    //     <div style={{marginTop:'10%'}}><Typography variant='subtitle2' color={"#38AAC3"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >PR</Typography></div>
    //                             {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
    //                             <div style={{display:'flex', textAlign:'center', justifyContent:'left'}}>
    //                               <Typography variant='h3' color={"#38AAC3"} >
    //                               {(() => {
    //                                         let data = findData("Pulse Rate")
    //                                         return (data.data)
    //                                     }
    //                                 )()}
    //                                 </Typography>
    //                                 <Typography variant='subtitle2' color={"#38AAC3"}  paddingTop={'25%'} >
    //                                 BPM
    //                                 </Typography>
    //                             </div>
    //                         </Box>
    //                         <Box width={'25%'} >
    //     <div style={{marginTop:'10%',}}>
    //         <Typography variant='subtitle2' color={"#3C89C0"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >SpO2</Typography></div>
    //                             {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
    //                             <div style={{display:'flex', textAlign:'center', justifyContent:'left'}}>
    //                               <Typography variant='h3' color={"#3C89C0"} >
    //                               {(() => {
    //                                             let data = findData("SpO2")
    //                                             return (data.data)
    //                                         }
    //                                     )()}
    //                                 </Typography>
    //                                 <Typography variant='subtitle2' color={"#3C89C0"}  paddingTop={'25%'} >
    //                                 %
    //                                 </Typography>
    //                             </div>
    //                         </Box>
    //                     <Box width={'40%'} height={'100%'} >
    //                         <Box display={'flex'} width={'100%'} height={'30%'}  justifyContent={'space-between'}>
                                
    //                             <Typography variant='caption' color={"#3C89C0"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} paddingTop={'7%'} paddingLeft={'5%'}>Apnea (s)</Typography>
    //                             <Typography variant='h6' color={"#3C89C0"}  paddingTop={'2%'}  paddingRight={'5%'}>
    //                                 {(() => {
    //                                         let data = findData("Apnea")
    //                                         return (data.data)
    //                                     }
    //                                 )()}
    //                             </Typography>

    //                         </Box>
    //                         <Box display={'flex'} width={'100%'} height={'30%'} justifyContent={'space-between'}>
    //                             <Typography variant='caption' color={"#3C89C0"}  paddingTop={'7%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} paddingLeft={'5%'}>PI</Typography>
    //                             <Typography variant='h5' color={"#3C89C0"} paddingTop={'2%'} paddingRight={'5%'}>
    //                                 {(() => {
    //                                         let data = findData("PI")
    //                                         return (data.data)
    //                                     }
    //                                 )()}
    //                             </Typography>
    //                         </Box>
                            
                           
    //                              <Box display={'flex'} width={'100%'} height={'34%'}  justifyContent={'space-between'} >
    //                             <Typography variant='caption' color={"#3C89C0"} paddingLeft={'5%'} paddingTop={'7%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >SIQ</Typography>
    //                             <Box width={'40%'} marginRight={'4%'} marginTop={'5%'} height={'50%'} sx={{border:'2px solid #3C89C0' , borderRadius:'3px'}}>
    //                                 {(() => {
    //                                     let data = findData("SIQ")
    //                                     return(
    //                                         <Box width={`${data.data}`+"%"} height={'100%'} sx={{backgroundColor:'#26C5E4'}}></Box>
    //                                     )
    //                                 })()}
    //                             </Box>
                                
    //                         </Box>    
    //                     </Box>
    //                 </Stack>
    //                 <Box display={'flex'} width={'100%'} height={'10%'} paddingTop={'2.5%'} sx={{borderTop:'2px solid grey'}}  >
    //                     <Box width={'30%'} height={'100%'} textAlign={'left'} paddingLeft={'5%'} >
    //                     <Typography variant="subtitle2" sx={{fontWeight:"bold", marginLeft:'5px'}} color={'#7E7E7E'}>
    //                                 {props.patient?.identifier && props?.patient?.identifier[0]?.value}
    //                                 </Typography>
    //                     </Box>
    //                     <Box width={'40%'} height={'100%'} textAlign={'center'}>
    //                         <div style={{fontSize: '100%', paddingRight:'3%' , fontWeight:500,color: '#7E7E7E'}} >
    //                             {(() => {
    //                                 let data = findData("MODE")
    //                                 return (data.unit+" "+"MODE")
    //                             })()}
    //                         </div>
                            
    //                     </Box> 
    //                 <Box display={'flex'} width={'30%'} height={'100%'}>
                            
    //                         <Box paddingRight={'15%'} width={'100%'} height={'65%'} sx={{textAlign:'right'}}>
                                
    //                                 <Typography variant="subtitle2"   color={'#7E7E7E'}>
    //                                     {/* {props?.device_id} */}
    //                                     {props.patient?.extension[0]?.valueString}
    //                                 </Typography>
                                
    //                         </Box>
    //                     </Box>                         
    //                 </Box>
    //             </Stack>
    //         </>):(<>
    //         <Box width={'100%'} height={'100%'} sx={{backgroundColor:'transparent'}} display={'flex'} textAlign={"center"} justifyContent={"center"}>
    //         <Stack width={'100%'} height={'100%'} justifyContent={"center"} textAlign={"center"}>
    //         <FontAwesomeIcon icon={faPowerOff} style={{fontSize: 70, color:props.darkTheme?'#FFFFFF':'#124D81', marginLeft:'auto', marginRight:'auto', fontWeight:'lighter', paddingBottom:'3%'}} />
    //                 <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:props.darkTheme?'#FFFFFF':'#124D81'}}>{props?.device_id}</Typography>
    //                     <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:props.darkTheme?'#FFFFFF':'#124D81'}}>Not Active/Connected</Typography>
    //         </Stack>
    //         </Box>
                
    //         </>)}
            

    //     </Card>
    //     {/* </Link> */}
    //     <NewDeviceDetails 
    //     isDialogOpened={isOpen} 
    //     handleCloseDialog={() => setIsOpen(false)}
    //     observation_resource={props.observation_resource}
    //     communication_resource={props.communication_resource}
    //     device_id={props.device_id}
    //     device_resource_id={props.device_resource_id}
    //     patient={props.patient}
    //     newData={newData}
    //     darkTheme={props.darkTheme}
    //     />
    //   </Box>
    <Box width={getCardWidth()}  sx={{borderRadius:'18px'}} onClick={getOnClickHandler()}>
    <Card style={{ backgroundColor:props.darkTheme?'#1C1C1E':'#FFFFFF', borderRadius: "10px", height:"260px", border: `6px solid ${isBlinking ? alarmColor : props.darkTheme?'#1C1C1E':'#FFFFFF'}` }}>
    
    {newData ? (<>
    <Stack width={'100%'} height={'100%'}>
                  <Stack direction={'row'} display={'flex'} width={'100%'} height={'10%'} borderBottom={'0.8px solid #444446'} sx={{backgroundColor:`${isBlinking ? alarmColor : props.darkTheme?'#1C1C1E':'#FFFFFF'}`}} justifyContent={'space-between'}>
                      <Box >
                          <Typography variant="subtitle2" style={{ fontFamily: 'Helvetica',paddingLeft:'8px'}}  color={props.darkTheme?'#FFFFFF':'#7E7E7E'}>
                          ({props.patient?.identifier && props?.patient?.identifier[0]?.value}) - B/O: {props.patient?.extension[0]?.valueString}
                          </Typography>
              
                      </Box>
                      <Box marginRight={'5px'}>
                          <Typography variant="subtitle2" style={{ fontFamily: 'Helvetica'}}  color={props.darkTheme?'#FFFFFF':'#7E7E7E'}>
                              {/* {props.patient_name} */}
                              <FontAwesomeIcon icon={faBell } color={props.darkTheme?'#FFFFFF':'#7E7E7E'}/>  {alarm}
                          </Typography> 
                      </Box>                             
                  </Stack>
          
         
            


              <Stack height={'80%'} width={'100%'}>
                          <Stack height={'60%'} width={'100%'}  direction={'row'}>
                             
                          <Box width={'100%'} sx={{ padding: '10px',textAlign:'center'}}>
                                <PlethEDA patientId={props.patient?.id}  pleth_resource={props.pleth_resource}/>
                                </Box>
                          
                          </Stack>


                           <Stack height={'40%'} width={'100%'} direction={'row'}>
                              <Box width={'28%'} sx={{ textAlign: 'left', paddingLeft: '10px' }}><div><Typography variant='subtitle1' color={"#62ECFF"} style={{ fontFamily: 'Helvetica' }}>P <span style={{ fontSize: '12px' }}>cmH2O</span></Typography></div>
                                
                                  <div style={{ display: 'flex', justifyContent: 'left' }}>

                                      <Typography variant='h3' color={"#62ECFF"}> 
                                      {(() => {
                                                       let data = findData("CPAP Pressure") 
                                                        return (data.data)
                                                 }
                                           )()}
                                          </Typography>

                                  </div></Box>
                             
                              <Box width={'28%'} sx={{ textAlign: 'left' }}><div><Typography variant='subtitle1' color={"#FF59BD"} style={{ fontFamily: 'Helvetica' }}>Flow <span style={{ fontSize: '13px' }}>L/min</span></Typography></div>
                                  
                                  <div style={{ display: 'flex', textAlign: 'left', justifyContent: 'left' }}>

                                      <Typography variant='h3' color={"#FF59BD"}>
                                        
                                            {(() => {
                                                    let data = findData("Current FiO2 Flow") //Current FiO2 Flow?? Check with SVAAS Team
                                                      return (data.data)
                                              }
                                           )()}
                                      </Typography>

                                  </div></Box>
                            
                              <Box width={'22%'} sx={{ textAlign: 'left', paddingLeft: '10px' }}><div><Typography variant='subtitle1' color={"#00D1FF"} style={{ fontFamily: 'Helvetica' }}>Fio2 <span style={{ fontSize: '13px' }}>% </span></Typography></div>
                                 
                                  <div style={{ display: 'flex', textAlign: 'left', justifyContent: 'left' }}>

                                      <Typography variant='h3' color={"#00D1FF"}>
                                      {(() => {
                                                       let data = findData("Current FiO2 Flow") //Current FiO2 Flow?? Check with SVAAS Team
                                                         return (data.data)
                                                 }
                                              )()}
                                      </Typography>

                                  </div></Box>
                            
                              <Box width={'22%'} sx={{ textAlign: 'left' }}><div><Typography variant='subtitle1' color={"#0BB1FA"} style={{ fontFamily: 'Helvetica' }}>Spo2 <span style={{ fontSize: '13px' }}>%</span></Typography></div>
                                  
                                  <div style={{ display: 'flex', textAlign: 'left', justifyContent: 'left' }}>

                                      <Typography variant='h3' color={"#0BB1FA"}>
                                     
                                                {(() => {
                                              let data = findData("SpO2");
                                              return (data!.data);
                                          })()}
                                      </Typography>

                                  </div></Box>
                          </Stack>
                      </Stack> 
                     

                      <Stack direction={'row'} display={'flex'} width={'100%'} borderTop={'0.8px solid #444446'} height={'10%'} justifyContent={'space-between'}>
                              <Box marginLeft={'10px'} marginTop={'5px'}>
                                  <Typography variant="subtitle2" style={{ fontFamily: 'Helvetica' }} color={props.darkTheme?'#FFFFFF':'#7E7E7E'}>
                                  {(() => {
                                      let data = findData("MODE")
                                      return (data.unit+" "+"MODE")
                                  })()}
                                  </Typography>
                              </Box>

                              <Box marginRight={'10px'} marginTop={'5px'}>
                                  <Typography variant="subtitle2" style={{ fontFamily: 'Helvetica' }} color={props.darkTheme?'#FFFFFF':'#7E7E7E'}>
                                      CPAP
                                  </Typography>
                              </Box>
                          </Stack>
           </Stack> </>):(
             <><Stack height={'100%'} width={'100%'}>
             <Stack direction={'row'} display={'flex'} width={'100%'} height={'10%'} borderBottom={'0.5px solid #444446'} sx={{backgroundColor:`${isBlinking ? alarmColor : props.darkTheme?'#1C1C1E':'#FFFFFF'}`}} justifyContent={'space-between'}>
         <Box >
             <Typography variant="subtitle2" style={{ fontFamily: 'Helvetica',paddingLeft:'8px'}}  color={'#7E7E7E'}>
             ({props.patient?.identifier && props?.patient?.identifier[0]?.value}) - B/O: {props.patient?.extension[0]?.valueString}
             </Typography>
 
         </Box>
         <Box marginRight={'20px'}>
             <Typography variant="subtitle2" style={{ fontFamily: 'Helvetica'}}   color={'#7E7E7E'}>
                 {/* {props.patient_name} */}
                
             </Typography> 
         </Box>                             
     </Stack>
                 <Stack height={'60%'} width={'100%'} borderBottom={'0.8px solid #444446'} justifyContent={'center'} textAlign={'center'}>
                 <FontAwesomeIcon icon={faPowerOff} style={{fontSize: 50, color:'#7E7E7E', marginLeft:'auto', marginRight:'auto', fontWeight:'lighter', paddingBottom:'3%'}} />
   <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:'#7E7E7E'}}>{props?.device_id}</Typography>
   {/* <Typography variant='subtitle1' sx={{marginLeft:'auto', marginRight:'auto', marginBottom:'auto', color:'#7E7E7E'}}>Not Active/Connected</Typography> */}

                 </Stack>
                 <Stack height={'40%'} width={'100%'} direction={'row'} textAlign={'center'} justifyContent={'center'}>
                 <Box width={'28%'} sx={{ textAlign: 'left', paddingLeft: '10px' }}><div><Typography variant='subtitle1' color={"#7E7E7E"} style={{ fontFamily: 'Helvetica' }}>P <span style={{ fontSize: '12px' }}>cmH2O</span></Typography></div>
                     {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                     <div style={{ display: 'flex', justifyContent: 'left' }}>

                         <Typography variant='h3' color={"#7E7E7E"}>--</Typography>

                     </div></Box>
                     <Box width={'22%'} sx={{ textAlign: 'left' }}><div><Typography variant='subtitle1' color={"#7E7E7E"} style={{ fontFamily: 'Helvetica' }}>Flow <span style={{ fontSize: '13px' }}>L/min</span></Typography></div>
                     {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                     <div style={{ display: 'flex', textAlign: 'left', justifyContent: 'left' }}>

                         <Typography variant='h3' color={"#7E7E7E"}>
                            --
                         </Typography>

                     </div></Box>
                     <Box width={'28%'} sx={{ textAlign: 'left', paddingLeft: '10px' }}><div><Typography variant='subtitle1' color={"#7E7E7E"} style={{ fontFamily: 'Helvetica' }}>Fio2 <span style={{ fontSize: '13px' }}>%</span></Typography></div>
                     {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                     <div style={{ display: 'flex', textAlign: 'left', justifyContent: 'left' }}>

                         <Typography variant='h3' color={"#7E7E7E"}>
                             --
                         </Typography>

                     </div></Box>
                     <Box width={'22%'} sx={{ textAlign: 'left' }}><div><Typography variant='subtitle1' color={"#7E7E7E"} style={{ fontFamily: 'Helvetica' }}>Spo2 <span style={{ fontSize: '13px' }}>%</span></Typography></div>
                     {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                     <div style={{ display: 'flex', textAlign: 'left', justifyContent: 'left' }}>

                         <Typography variant='h3' color={"#7E7E7E"}>
                             --
                         </Typography>

                     </div></Box>
                 </Stack>
                 <Stack direction={'row'} display={'flex'} width={'100%'} borderTop={'0.5px solid #444446'} height={'10%'} justifyContent={'space-between'}>
                 <Box marginLeft={'5px'} marginTop={'5px'}>
                     <Typography variant="subtitle2" style={{  fontFamily: 'Helvetica' }} color={'#7E7E7E'}>
                     Not Active/No Data
                     </Typography>
                 </Box>

                 <Box marginRight={'5px'} marginTop={'5px'}>
                     <Typography variant="subtitle2" style={{ fontFamily: 'Helvetica' }} color={'#7E7E7E'}>
                         CPAP
                     </Typography>
                 </Box>
             </Stack>
             </Stack>
             </>
     )}
          </Card>
          {props.selectedIcon !== 'vertical' && (
      <NewDeviceDetails 
            isDialogOpened={isOpen}
            handleCloseDialog={() => { console.log("MY BOI"); setIsOpen(false); } }
            observation_resource={props.observation_resource}
            communication_resource={props.communication_resource}
            device_id={props.device_id}
            device_resource_id={props.device_resource_id}
            patient={props.patient}
            newData={newData}
            darkTheme={props.darkTheme} 
            selectedIcon={props.selectedIcon}/>  )} 
    </Box> 

  )
}
