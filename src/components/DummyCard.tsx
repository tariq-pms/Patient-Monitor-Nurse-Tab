import { Box, Card, Stack, Typography } from '@mui/material'
import  { FC, useEffect, useState } from 'react'
import { DummyPatientDetails } from './DummyPatientDetails'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faDroplet } from '@fortawesome/free-solid-svg-icons'; 
import { Line } from 'react-chartjs-2';




export interface DummyDeviceDetails {
    darkTheme:boolean
   }
   interface ChartData {
    labels: number[];
    datasets: {
        label: string;
        data: number[];
        fill: boolean;
        borderColor: string;
        tension: number;
    }[];
}

    export const  DummyCard: FC<DummyDeviceDetails> = ({darkTheme}): JSX.Element => {

    const [isOpen, setIsOpen] = useState(false)
    const [alarmColor,] = useState("#202020");
    const [isBlinking, setIsBlinking] = useState(true);
    const [data, setData] = useState<ChartData>({
        labels: [],
        datasets: [
            {
                label: 'Random Values',
                data: Array.from({ length: 32 }, () => 0), // Initialize with 32 zeros
                fill: false,
                borderColor: '#43D7E5', // Adjust color as needed
                tension: 0.1,
            },
        ],
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const newData = {
                labels: Array.from({ length: 32 }, (_, i) => i + 1), // Generate labels 1 to 32
                datasets: [
                    {
                        ...data.datasets[0],
                        data: [...data.datasets[0].data.slice(1), Math.random() * 100], // Add new random value, remove oldest value
                    },
                ],
            };
            setData(newData);
        }, 1000);

        return () => clearInterval(interval);
    }, [data]); // Update only when data changes

    const options = {
        scales: {
            x: {
                display: false, // Hide x-axis
            },
            y: {
                display: false, // Hide y-axis
            },
        },
        plugins: {
            legend: {
                display: false, // Hide legend
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    };


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
            xs: "100%", // Full width on extra small screens (mobile)
            sm: "48%", // Full width on small screens (tablet)
            md: "33.33%", // 75% width on medium screens (laptop)
            lg: "24.7%", // 60% width on large screens (TV)
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
          style={{ backgroundColor: darkTheme ? '#242424':'#FFFFFF', borderRadius: "5px", height:"270px",border: `5px solid ${isBlinking ? '#F60D4C' : '#34495F'}` }}
      > 
            <Stack width={'100%'} height={'100%'}>
            {/* <Stack textAlign={'center'} width={'100%'} sx={{backgroundColor:`${isBlinking ? '#FC8A8A' : '#F9F9F9'}`}}  height={'10%'}  justifyContent={'space-between'}>
                   
            <Box marginLeft={'20px'}>
                        <Typography variant="subtitle2"  style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} color={'#7E7E7E'}>
                        Jessica Adams
                        </Typography>
                        <Typography  variant='subtitle1' style={{fontWeight:'bold'}} color={"red"} >
                    <FontAwesomeIcon icon={faBell } color='red'/>  Test Device
                                </Typography> 
                    </Box>
                    <Box marginLeft={'20px'}>
                        
                    <Typography  variant='subtitle1' style={{fontWeight:'bold'}} color={"#FFFFFF"} >
                    <FontAwesomeIcon icon={faBell } color='#FFFFFF'/>  Test Device
                                </Typography> 
                    </Box>
                                      
                </Stack> */}
                <Stack direction={'row'} display={'flex'}   width={'100%'} sx={{backgroundColor:`${isBlinking ? '#F60D4C' : '#34495'}`}} height={'10%'} justifyContent={'space-between'}>
                <Box>
                        <Typography variant="subtitle2"  style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} color={darkTheme?"#FFFFFF":'#9B9B9B'}>121-23  B/O Jessica Adams</Typography>
                       
                    </Box>
                    <Box marginRight={'10px'} >
                        
                        <Typography  variant='subtitle1' style={{fontWeight:'bold'}} color={ darkTheme?"#FFFFFF":'#9B9B9B'} >
                        <FontAwesomeIcon icon={faBell } color= {darkTheme?"#FFFFFF":'#9B9B9B'}/>  Test Device
                                    </Typography> 
                        </Box>
                                                
                </Stack>
                
                <Stack height={'80%'} width={'100%'}  >
                <Stack height={'60%'} width={'100%'} direction={'row'}>
                {/* <Box width={'40%'} >
    <Typography variant='subtitle1' color={"#124D81"} style={{ fontWeight: 'bold', fontFamily: 'Helvetica', textAlign: 'center' }}>Baby Temp</Typography>

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
        <div style={{ display: 'flex',  width: '100%' }}>
            <div>
                <Typography variant='h2'  color={"#124D81"}>34.3</Typography>
            </div>
            <div>
                <Typography variant='subtitle1' color={"#124D81"}>℃</Typography>
                <Typography variant='subtitle1' color={"#124D81"} sx={{paddingTop:'25px'}}>36</Typography>
            </div>
        </div>
    </div>
</Box> */}
{/* <Box width={'40%'} >
    <Typography variant='subtitle1' color={"#124D81"} style={{ fontWeight: 'bold', fontFamily: 'Helvetica', textAlign: 'center' }}>Baby Temp</Typography>

    <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{paddingLeft:'5px'}}>
            <Typography variant='h2' color={"#124D81"}>34.3</Typography>
        </div>
        <div>
            <Typography variant='subtitle1' color={"#124D81"} >℃</Typography>
            <Typography variant='subtitle1' color={"#124D81"}style={{marginTop:'15px'}} >36</Typography>
        </div>
    </div>
</Box> */}




    <Box width={'100%'} sx={{padding:'10px'}} >
    
    <Line data={data} options={options} />
    </Box>
    
    {/* <Box width={'30%'} sx={{textAlign:'center'}} > 
    <Typography variant='subtitle1' style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} color={darkTheme?'':"#124D81"}  >Alarm <FontAwesomeIcon icon={faBell } color='#124D81'/></Typography>
   
                          
                           
                               
                            <Typography  variant='subtitle1' color={"#FF7354"} sx={{fontWeight:"bold"}} paddingTop={'5%'} >
                                    Test Device
                                </Typography> 
                                
                           </Box> */}
</Stack>


<Stack height={'40%'} width={'100%'}  direction={'row'}>
<Box width={'25%'} sx={{textAlign:'center'}}  ><div ><Typography variant='subtitle1' color={"#F60D4C"} style={{ fontFamily: 'Helvetica'}} >B.Temp <span style={{fontSize:'12px'}}>℃</span></Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                               
                               <Typography variant='h3' color={"#F60D4C"} >34</Typography>
                              
                           </div></Box>
    <Box width={'25%'}  sx={{textAlign:'center'}}><div ><Typography variant='subtitle1' color={"#EFA701"} style={{ fontFamily: 'Helvetica'}} >PR <span style={{fontSize:'13px'}}>B/min</span></Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                               
                               <Typography variant='h3' color={"#EFA701"} >
                                 80
                               </Typography>
                               
                           </div></Box>
    <Box width={'25%'} sx={{textAlign:'center'}}  ><div><Typography variant='subtitle1' color={"#94FF37"} style={{ fontFamily: 'Helvetica'}} >Spo2 <span style={{fontSize:'13px'}}>%</span></Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                               
                               <Typography variant='h3' color={"#94FF37"} >
                                 92
                               </Typography>
                             
                           </div></Box>
    <Box width={'25%'} sx={{textAlign:'center'}}  ><div ><Typography variant='subtitle1'  color={"#0BB1FA"} style={{ fontFamily: 'Helvetica'}} >RR <span style={{fontSize:'13px'}}>B/Min</span></Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                               
                               <Typography variant='h3' color={"#0BB1FA"} >
                                 44
                               </Typography>
                               
                           </div></Box>
    {/* <Box width={'33.33%'} ><div style={{marginTop:'7%'}}><Typography variant='subtitle2'  color={"#38AAC3"}  style={{fontWeight: 'bold', fontFamily: 'Helvetica'}}  paddingLeft={'10%'}>Weight</Typography></div>
                           
                            <div style={{display:'flex', textAlign:'center', paddingLeft:'6%', justifyContent:'left'}}>
                               
                               <Typography variant='h4' color={"#38AAC3"} >
                                   1.2
                               </Typography>
                               <Typography variant='subtitle1' color={"#38AAC3"} paddingTop={'10%'} paddingLeft={'3%'}>
                                 KG
                               </Typography>
                           </div></Box> */}
</Stack>
                </Stack>
                
                
                <Stack direction={'row'} display={'flex'}   width={'100%'} borderTop={'1px solid #E4E4E4'} height={'10%'} justifyContent={'space-between'}>
                    <Box marginLeft={'10px'}>
                        <Typography variant="subtitle2" style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} color={'#7E7E7E'}>
                            28 week
                        </Typography>
                    </Box>
                    
                    <Box marginRight={'10px'}>
                        <Typography variant="subtitle2"   style={{fontWeight: 'bold', fontFamily: 'Helvetica'}} color={'#7E7E7E'}>
                        <FontAwesomeIcon icon={faDroplet} /> IV Pump
                        </Typography> 
                    </Box>                             
                </Stack>
            </Stack>

        </Card>
        <DummyPatientDetails 
                isOpen={isOpen} handleCloseDialog={() => { setIsOpen(false); } } darkTheme={darkTheme}/>
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


