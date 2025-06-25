import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { ApgarScreen} from './ApgarScreen';
import {BallardScore} from './BallardScore';
 // Create this if needed

interface AssessmentsProps {
  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
}

export const  Assessments = ({ patient_name, patient_id, patient_resource_id }: AssessmentsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%',borderRadius:'20px'}}>
      <Box sx={{ borderColor: 'divider' }}>
      <Tabs 
  value={activeTab} 
  onChange={handleTabChange}
  sx={{ color: '#228BE6',
    '& .MuiTabs-indicator': {
      backgroundColor: '#124D81',
    },
    '& .MuiTab-root': {
      color: '#757575',
      '&.Mui-selected': {
        color: '#228BE6',
        fontWeight: 'bold',
      },
    },
  }}
>
  <Tab label="APGAR" />
  <Tab label="Ballard Score" />

</Tabs>
      </Box>
      
      <Box >
        {activeTab === 0 && (
          <ApgarScreen 
            patient_name={patient_name} 
            patient_id={patient_id} 
            patient_resource_id={patient_resource_id} 
          />
        )}
        {activeTab === 1 && (
          <BallardScore 
            patient_name={patient_name} 
            patient_id={patient_id} 
            patient_resource_id={patient_resource_id} 
          />
        )}
      
      </Box>
    </Box>
  );
};

