import { Box, Card, Stack, Typography } from '@mui/material'
import  { useEffect, useState } from 'react'
import { DummyPatientDetails } from './DummyPatientDetails'

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
        }} sx={{borderRadius:'25px'}}
        onClick={() => {setIsOpen(true)}}>
        <Card
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

        </Card>
        <DummyPatientDetails 
          isOpen={isOpen}  handleCloseDialog={() => {setIsOpen(false)}}
            
        />
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


