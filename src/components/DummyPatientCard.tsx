import { Box, Card, Stack, Typography } from '@mui/material'
import  { useEffect, useState } from 'react'
import { DummyPatientDetails } from './DummyPatientDetails'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons'; 

export const DummyPatientCard = ():JSX.Element => {
    const [isOpen, setIsOpen] = useState(false)
    
    const [alarmColor,] = useState("#202020");
    const [isBlinking, setIsBlinking] = useState(true);
    
    useEffect(() => {
        let intervalId: number | undefined;
    
        intervalId = setInterval(() => {
          setIsBlinking((prevIsBlinking) => !prevIsBlinking);
        }, 300);
    
        return () => {
          clearInterval(intervalId);
        };
      }, [alarmColor]);
    return (
    <Box  width={{
        xs: "350px",
        sm: "500px",
        md: "500px",
        lg: "500px"
        }} sx={{borderRadius:'18px'}}
        onClick={() => {setIsOpen(true)}}>
        {/* <Card
          style={{ backgroundImage:'linear-gradient(to bottom, #34405D, #151E2F, #34405D)', borderRadius: "25px", height:"300px", boxShadow: `0px 0px 30px 5px ${isBlinking ? 'red': '#202020'}`, border:'1px solid #606060'}}
      > 
            <Stack width={'100%'} height={'100%'}>
                <Stack direction={'row'} display={'flex'} width={'100%'} height={'10%'} paddingTop={'3%'} justifyContent={'space-between'}>
                    <Box marginLeft={'20px'}>
                        <Typography variant="subtitle2" sx={{fontWeight:"bold"}} color={'#CBCFE5'}>
                            INNC-100
                        </Typography>
                    </Box>
                    <Box marginRight={'20px'}>
                        <Typography variant="subtitle2"  color={'#CBCFE5'}>
                            Jessica Adams
                        </Typography> 
                    </Box>                             
                </Stack>
                
                <Stack height={'90%'} width={'100%'} direction={'row'}>
                    <Stack height={'100%'} width={'67%'} borderTop={'1px solid grey'} borderRight={'1px solid grey'}>
                        <Stack height={'50%'} width={'100%'} borderBottom={'1px solid grey'}>
                            <Typography variant='caption' color={"#A8C5D4"}  paddingTop={'5%'} paddingLeft={'35%'} >
                                Devices Connected  
                            </Typography>
                            <Box gap={'3px'} width={'95%'} justifyContent={'center'} textAlign={'center'} height={'50%'} marginLeft={'auto'} marginRight={'auto'} marginBottom={'auto'} marginTop={'auto'} display={'flex'} flexWrap={'wrap'}>
                            <Box boxShadow={`0px 0px 10px 2px #00B1FD`} border={'1px solid #00B1FD'} textAlign={'center'} borderRadius={'10px'} minWidth={'70px'} maxWidth={'70px'} overflow="hidden" textOverflow="ellipsis" >
                                <Typography variant='caption' color={"#A8C5D4"}>
                                Comprehensive Infant Care Centre
                                </Typography>
                            </Box>
                            </Box>
                            
                        </Stack>
                        <Stack height={'50%'} width={'100%'} direction={'row'}>
                            <Box height={'100%'} width={'50%'} borderRight={'1px solid grey'} justifyContent={'center'} textAlign={'center'}>
                                <Box width={'100%'} height={'15%'}></Box>
                                <Typography variant='caption' color={"#A8C5D4"} >
                                    Alarm  
                                </Typography>
                                <Typography  variant='subtitle1' color={`red`} paddingTop={'10%'} >
                                    Test Patient
                                </Typography>
                            </Box>
                            <Box height={'100%'} width={'50%'}></Box>
                        </Stack>
                    </Stack>
                    <Stack height={'100%'} width={'33%'} borderTop={'1px solid grey'} justifyContent={'center'} textAlign={'center'}>
                        <Stack height={'25%'} width={'100%'} borderBottom={'1px solid grey'} justifyContent={'space-between'} direction={'row'}>
                            <Typography variant='caption' color={"#A8C5D4"} paddingLeft={'10px'} paddingTop={'23px'}>SpO2 (%)</Typography>
                            <Typography variant='h6' color={"#5db673"} paddingRight={'10px'} paddingTop={'17px'}>
                            95
                            </Typography>
                            
                        </Stack>
                        <Stack height={'25%'} width={'100%'} borderBottom={'1px solid grey'} justifyContent={'space-between'} direction={'row'}>
                            <Typography variant='caption' color={"#A8C5D4"} paddingLeft={'10px'} paddingTop={'23px'}>PR (BPM)</Typography>
                            <Typography variant='h6' color={"#5db673"} paddingRight={'10px'} paddingTop={'17px'}>
                            120
                            </Typography>
                        </Stack>
                        <Stack height={'25%'} width={'100%'} borderBottom={'1px solid grey'} justifyContent={'space-between'} direction={'row'}>
                            <Typography variant='caption' color={"#A8C5D4"} paddingLeft={'10px'} paddingTop={'23px'}>PI (%)</Typography>
                            <Typography variant='h6' color={"#5db673"} paddingRight={'10px'} paddingTop={'17px'}>
                            90
                            </Typography>
                        </Stack>
                        <Stack height={'25%'} width={'100%'} borderBottom={'1px solid grey'} justifyContent={'space-between'} direction={'row'}>
                            <Typography variant='caption' color={"#A8C5D4"} paddingLeft={'10px'} paddingTop={'23px'}>SIQ</Typography>
                            <Typography variant='h6' color={"#5db673"} paddingRight={'10px'} paddingTop={'17px'}>
                            90
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
                
                
                
            </Stack>

        </Card> */}
        <Card
          style={{ backgroundColor:'#FFFFFF', borderRadius: "18px", height:"300px", boxShadow: `0px 0px 10px #FFD0D0`,border: `6px solid ${isBlinking ? '#FC8A8A' : '#F9F9F9'}` }}
      > 
            <Stack width={'100%'} height={'100%'}>
                
                
                <Stack height={'90%'} width={'100%'} >
                <Stack height={'50%'} width={'100%'}  direction={'row'}>
    <Box width={'50%'} >
    <div style={{marginTop:'7%'}}><Typography variant='h6' color={"#124D81"} paddingLeft={'10%'} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}}>Baby Temp</Typography>

</div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                               
                                <Typography variant='h1' color={"#124D81"} >
                                    34.3
                                </Typography>
                                <Typography variant='subtitle1' color={"#124D81"}  >
                                ℃
                                </Typography>
                                <Typography variant='subtitle1' color={"#124D81"} paddingTop={'25%'} >
                                   36
                                </Typography>
                            </div>
    </Box>
    <Box width={'25%'} >
    <div style={{marginTop:'15%'}}><Typography variant='subtitle1' color={"#4B7193"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} >Heater Temp</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                              <Typography variant='h2' color={"#4B7193"} >
                                    34.3
                                </Typography>
                                <Typography variant='subtitle1' color={"#4B7193"} paddingTop={'13%'} paddingLeft={'3%'}>
                                   %
                                </Typography>
                            </div>
    </Box>
    
    <Box width={'25%'} > <div style={{marginTop:'15%'}}><Typography variant='subtitle1' style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} color={"#124D81"}  paddingLeft={'20%'}>Alarm <FontAwesomeIcon icon={faBell } color='#124D81'/></Typography>
    </div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                               
                            <Typography  variant='subtitle1' color={"#FF7354"} sx={{fontWeight:"bold"}} paddingTop={'10%'} >
                                    Test Device
                                </Typography> 
                                
                            </div></Box>
</Stack>


<Stack height={'50%'} width={'100%'} marginTop={'5%'} direction={'row'}>
    <Box width={'25%'} ><div style={{marginTop:'7%'}}><Typography variant='subtitle1' color={"#3C89C0"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}}  paddingLeft={'10%'}>Heart Rate</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center',paddingLeft:'8%', justifyContent:'left'}}>
                               
                               <Typography variant='h4' color={"#3C89C0"} >
                                 80
                               </Typography>
                               <Typography variant='subtitle2' color={"#3C89C0"} paddingTop={'15%'} paddingLeft={'3%'}>
                                 BPM
                               </Typography>
                           </div></Box>
    <Box width={'25%'} ><div style={{marginTop:'7%'}}><Typography variant='subtitle1' color={"#3C89C0"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} paddingLeft={'10%'}>Spo2</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', paddingLeft:'6%', justifyContent:'left'}}>
                               
                               <Typography variant='h4' color={"#3C89C0"} >
                                 92
                               </Typography>
                               <Typography variant='subtitle2' color={"#3C89C0"} paddingTop={'15%'} paddingLeft={'3%'}>
                                 %
                               </Typography>
                           </div></Box>
    <Box width={'25%'} ><div style={{marginTop:'7%'}}><Typography variant='subtitle2'  color={"#3C89C0"} style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} paddingLeft={'10%'}>RR</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', paddingLeft:'6%', justifyContent:'left'}}>
                               
                               <Typography variant='h4' color={"#3C89C0"} >
                                 44
                               </Typography>
                               <Typography variant='subtitle2' color={"#3C89C0"} paddingTop={'15%'} paddingLeft={'3%'}>
                                 BPM
                               </Typography>
                           </div></Box>
    <Box width={'25%'} ><div style={{marginTop:'7%'}}><Typography variant='subtitle2'  color={"#38AAC3"}  style={{fontWeight: 'bold', fontFamily: 'Helvetica'}}  paddingLeft={'10%'}>Weight</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', paddingLeft:'6%', justifyContent:'left'}}>
                               
                               <Typography variant='h4' color={"#38AAC3"} >
                                   1.2
                               </Typography>
                               <Typography variant='subtitle1' color={"#38AAC3"} paddingTop={'10%'} paddingLeft={'3%'}>
                                 KG
                               </Typography>
                           </div></Box>
</Stack>
                </Stack>
                
                
                <Stack direction={'row'} display={'flex'} width={'100%'} borderTop={'1px solid #E4E4E4'} height={'10%'} paddingTop={'1.5%'} justifyContent={'space-between'}>
                    <Box marginLeft={'10px'}>
                        <Typography variant="subtitle2" style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} color={'#7E7E7E'}>
                            INC-100
                        </Typography>
                    </Box>
                    <Box marginLeft={'20px'}>
                        <Typography variant="subtitle2"  style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} color={'#7E7E7E'}>
                        Jessica Adams
                        </Typography>
                    </Box>
                    <Box marginRight={'20px'}>
                        <Typography variant="subtitle2"   style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} color={'#7E7E7E'}>
                           DOB
                        </Typography> 
                    </Box>                             
                </Stack>
            </Stack>

        </Card>
        <DummyPatientDetails 
          isOpen={isOpen}  handleCloseDialog={() => {setIsOpen(false)}}/>
        {/* <NewPatientDetails 
            isDialogOpened={isOpen}
            handleCloseDialog={() => { setIsOpen(false); } }
            observation_resource={props.observation_resource}
            communication_resource={props.communication_resource}
            device={props.device}
            patient_id={props.patient_id}
            patient_name={props.patient_name}
            newData={newData}
            key={props.patient_resource_id}
            patient_resource_id={props.patient_resource_id} /> */}
    </Box>
    )
}


