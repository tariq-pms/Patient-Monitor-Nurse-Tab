import { Box, Card, Stack, Typography } from '@mui/material'
import  { FC, useEffect, useState } from 'react'
import { DummyPatientDetails } from './DummyPatientDetails'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faDroplet  } from '@fortawesome/free-solid-svg-icons'; 
import { Line } from 'react-chartjs-2';




export interface DummyPatientDetails {
    
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
 export const  DummyPatientCard: FC<DummyPatientDetails> = ({darkTheme}): JSX.Element => {
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
          xs: "90%", // Full width on extra small screens (mobile)
          sm: "48%", // Full width on small screens (tablet)
          md: "33.33%", // 75% width on medium screens (laptop)
          lg: "24.7%", // 60% width on large screens (TV)
          }}
          
          sx={{borderRadius:'18px'}}
      onClick={() => {setIsOpen(true)}}>
      

      <Card 
        style={{ backgroundColor: darkTheme ? '#1C1C1E':'#FFFFFF', borderRadius: "10px", height:"260px",border:  `4px solid ${isBlinking ?'#F60D4C' :'#1C1C1E'}` }}
    > 
          <Stack width={'100%'} height={'100%'}>
         
              <Stack direction={'row'} display={'flex'} borderBottom={'0.8px solid #444446'} width={'100%'} sx={{backgroundColor:`${isBlinking ?'#F60D4C' :'#1C1C1E'}`}} height={'10%'} justifyContent={'space-between'}>
              <Box>
                      <Typography variant="subtitle2"  style={{ fontFamily: 'Helvetica',paddingLeft:'8px'}} color={darkTheme?"#FFFFFF":'#9B9B9B'}>121-23  B/O Jessica Adams</Typography>
                     
                  </Box>
                  <Box marginRight={'10px'} >
                      
                      <Typography  variant='subtitle2' color={ darkTheme?"#FFFFFF":'#9B9B9B'} >
                      <FontAwesomeIcon icon={faBell } color= {darkTheme?"#FFFFFF":'#9B9B9B'}/> Test Device
                                  </Typography> 
                      </Box>
                                              
              </Stack>
              
              <Stack height={'80%'} width={'100%'}  >
              <Stack height={'60%'} width={'100%'} direction={'row'}>
        
  <Box width={'100%'} sx={{padding:'10px'}} >
  
  <Line data={data} options={options} />
  </Box>
  
 
</Stack>


<Stack height={'40%'} width={'100%'}  direction={'row'}>
<Box width={'28%'} sx={{textAlign:'left',paddingLeft:'10px'}}  ><div ><Typography variant='subtitle1' color={"#F60D4C"} style={{ fontFamily: 'Helvetica'}} >B.Temp <span style={{fontSize:'12px'}}>℃</span></Typography></div>
                          {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                          <div style={{display:'flex', justifyContent:'left'}}>
                             
                             <Typography variant='h3' color={"#F60D4C"} >34.3</Typography>
                            
                         </div></Box>
  <Box width={'22%'}  sx={{textAlign:'left',paddingLeft:'10px'}}><div ><Typography variant='subtitle1' color={"#FFC017"} style={{ fontFamily: 'Helvetica'}} >RR <span style={{fontSize:'13px'}}>B/min</span></Typography></div>
                          {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                          <div style={{display:'flex', textAlign:'left', justifyContent:'left'}}>
                             
                             <Typography variant='h3' color={"#FFC017"} >
                               42
                             </Typography>
                             
                         </div></Box>
  <Box width={'28%'} sx={{textAlign:'left',paddingLeft:'10px'}}  ><div><Typography variant='subtitle1' color={"#94FF37"} style={{ fontFamily: 'Helvetica'}} >PR <span style={{fontSize:'13px'}}>B/Min</span></Typography></div>
                          {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                          <div style={{display:'flex', textAlign:'left', justifyContent:'left'}}>
                             
                             <Typography variant='h3' color={"#94FF37"} >
                               170
                             </Typography>
                           
                         </div></Box>
  <Box width={'22%'} sx={{textAlign:'left'}}  ><div ><Typography variant='subtitle1'  color={"#0BB1FA"} style={{ fontFamily: 'Helvetica'}} >Spo2 <span style={{fontSize:'13px'}}>%</span></Typography></div>
                          {/* <Typography variant='subtitle2' color={"#A8C5D4"} marginTop={'10px'} paddingTop={'4%'}>Heater Temp %</Typography> */}
                          <div style={{display:'flex', textAlign:'left', justifyContent:'left'}}>
                             
                             <Typography variant='h3' color={"#0BB1FA"} >
                               90
                             </Typography>
                             
                         </div></Box>

</Stack>
              </Stack>
              
              
              <Stack direction={'row'} display={'flex'}   width={'100%'} borderTop={'0.8px solid #444446'} height={'10%'} justifyContent={'space-between'}>
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

  </Box>
  )
}

