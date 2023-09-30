import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { ChangeEvent } from 'react'
import "../App.css"
import { useState } from 'react';

interface SelectorProps {
  onTabChange: (selectedTab: number) => void;
}

export const Selector:  React.FC<SelectorProps> = ({ onTabChange }) => {
    const [value, setValue] = useState<number>(0);
    const handleChange = (_event: ChangeEvent<{}>, newValue: number): void => {
      setValue(newValue);
      onTabChange(newValue); 
    };


    
  return (
    <Box sx={{ marginTop:'25px'}} >
      <Tabs
        variant='fullWidth'
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="secondary tabs example"
      >
        <Tab value={0} label="INC" sx={{fontSize:'23px'}} />
        <Tab value={1} label="CIC" sx={{fontSize:'23px'}} />
        <Tab value={2} label="SVAAS" sx={{fontSize:'23px'}} />
      </Tabs>
    </Box>
  )
}
