import  { useEffect, useState } from 'react';
import { Box,  Card, Stack, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { DummyDeviceDetails } from './DummyDeviceDetails';

export const DummyCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  
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
    }} sx={{borderRadius:'25px'}}
    onClick={() => {setIsOpen(true)}}>
      <Card
          style={{ backgroundImage:'linear-gradient(to bottom, #34405D, #151E2F, #34405D)', borderRadius: "25px", height:"300px", boxShadow: `0px 0px 30px 5px ${isBlinking ? 'red': '#202020'}`, border:'1px solid #606060'}}
      > 
          <Stack width={'100%'} height={'100%'}>
            <Box display={'flex'} width={'100%'} height={'10%'} paddingTop={'2.5%'}>
              <Box width={'30%'} height={'100%'} textAlign={'left'} paddingLeft={'5%'}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', marginLeft: '5px' }} color={'#CBCFE5'}>
                  Jessica Adams
                </Typography>
              </Box>
              <Box width={'40%'} height={'100%'} textAlign={'center'}>
                Manual Mode
              </Box>
              <Box display={'flex'} width={'30%'} height={'100%'}>
                <Box paddingRight={'3%'} width={'100%'} height={'65%'} sx={{ backgroundColor: 'transparent' }}>
                  <Typography variant="subtitle2" color={'#CBCFE5'} textAlign={'right'}>
                    123456
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Stack width={'100%'} height={'100%'} direction={'row'}>
              <Stack width={'33.33%'} height={'100%'} direction={'column'}>
              <Box width={'100%'} height={'100%'} sx={{ borderRight:'2px solid grey', borderTop:'2px solid grey'}} justifyContent={'center'} textAlign={'center'}>
                            <div style={{marginTop:'7%'}}><Typography variant='caption' color={"#A8C5D4"}>Heater Temp %</Typography></div>
                            {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                               
                                <Typography variant='h3'>
                                    80
                                </Typography>
                                <Typography variant='subtitle1' color={"#5db673"} paddingTop={'13%'} paddingLeft={'3%'}>
                                   100
                                </Typography>
                            </div>
                        </Box>
                <Box width={'100%'} height={'100%'} sx={{ borderRight: '2px solid grey', borderTop: '2px solid grey' }} justifyContent={'center'} textAlign={'center'}>
                  <Box marginTop={'5%'}>
                    <Typography variant='caption' color={"#A8C5D4"} paddingTop={'7%'} paddingRight={'10px'}>
                      Alarm
                    </Typography>
                    <FontAwesomeIcon icon={faBell} />
                  </Box>
                  <Typography  variant='subtitle1' color={`red`} paddingTop={'10%'} >
                                    Test Device
                                </Typography>
                </Box>
              </Stack>
              <Stack width={"33.33%"} height={'100%'} direction={'column'}>
                        <Box width={'100%'} height={'100%'} sx={{ borderRight:'2px solid grey', borderTop:'2px solid grey'}} justifyContent={'center'} textAlign={'center'}>
                        <div style={{marginTop:'7%'}}><Typography variant='caption' color={"#A8C5D4"}>Baby Temp °C</Typography></div>
                            <div style={{display:'flex', textAlign:'center', justifyContent:'center'}}>
                            {/* <FontAwesomeIcon icon={faBaby} color='#CBCFE5' style={{paddingTop:'6%', paddingRight:'7%', fontSize:'200%'}}/> */}
                                <Typography variant='h3'>
                                   34.3
                                </Typography>
                                <Typography variant='h6' color={"#5db673"} paddingTop={'13%'} paddingLeft={'3%'}>
                                    --
                                </Typography>
                            </div>
                            <Typography variant='h6' color={"#5db673"} paddingLeft={'3%'}>
                               36
                            </Typography>
                        </Box>
                        <Box width={'100%'} height={'100%'} sx={{ borderRight:'2px solid grey', borderTop:'2px solid grey'}} justifyContent={'center'} textAlign={'center'}>    
                        </Box>
                        </Stack>
                        <Stack width={"33.33%"} height={'100%'} direction={'column'}>
                        <Box  display={'flex'}  width={"100%"} justifyContent={'space-between'}  height={"20%"} sx={{ borderTop:'2px solid grey'}}>
                            <Typography variant='caption' color={"#A8C5D4"}  paddingTop={'10%'} paddingLeft={'5%'}>SpO2 %</Typography>
                                    <Typography variant='h6' color={"#5db673"} paddingTop={'7%'} paddingRight={'5%'}>
                                        95
                                    </Typography>
                            </Box>
                        <Box width={"100%"} display={'flex'} justifyContent={'space-between'}  height={"20%"} sx={{ borderTop:'2px solid grey'}}>
                                <Typography variant='caption' color={"#A8C5D4"}  paddingTop={'10%'} paddingLeft={'5%'}>PR (BPM)</Typography>
                                <Typography variant='h6' color={"#5db673"} paddingTop={'7%'} paddingRight={'5%'}>
                                   37.8
                                </Typography>
                            </Box>
                        <Box width={"100%"} display={'flex'} justifyContent={'space-between'}  height={"20%"} sx={{ borderTop:'2px solid grey'}}>
                                <Typography variant='caption' color={"#A8C5D4"}  paddingTop={'10%'} paddingLeft={'5%'}>Wt (g)</Typography>
                                <Typography variant='h6' color={"#5db673"} paddingTop={'7%'} paddingRight={'5%'}>
                                  950
                                </Typography>
                            </Box>
                        <Box display={'flex'} width={'100%'} height={'20%'} sx={{ borderTop:'2px solid grey'}} justifyContent={'space-between'} textAlign={'center'}>
                                <Typography variant='caption' color={"#A8C5D4"}  paddingTop={'10%'} paddingLeft={'5%'}>PI</Typography>
                                <Typography variant='h6' color={"#5db673"} paddingTop={'7%'} paddingRight={'5%'}>
                                  100
                                </Typography>
                            </Box>
                        <Box display={'flex'} width={'100%'} height={'20%'} sx={{ borderTop:'2px solid grey'}} justifyContent={'space-between'} >
                                <Typography variant='caption' color={"#A8C5D4"} paddingLeft={'5%'} paddingTop={'10%'} >SIQ</Typography>
                                <Box width={'40%'} marginRight={'4%'} marginTop={'8%'} height={'40%'} sx={{border:'2px solid #A8C5D4' , borderRadius:'3px'}}>
                                  
                                </Box>
                            </Box>
                        </Stack>
            </Stack>
          </Stack>
        </Card>
      
      < DummyDeviceDetails observation_resource ={''} newData={''} isOpen={isOpen}  handleCloseDialog={() => {setIsOpen(false)}}  />


    </Box>
  );
};
