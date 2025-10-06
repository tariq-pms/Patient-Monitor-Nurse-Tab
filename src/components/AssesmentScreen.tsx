import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { ApgarScreen} from './ApgarScreen';
import {BallardScore} from './BallardScore';
import { DowneScore } from './DowneScore';
 // Create this if needed

interface AssessmentsProps {
  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
  UserRole: string;
}

export const  Assessments = ({ patient_name, patient_id, patient_resource_id ,UserRole}: AssessmentsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%',borderRadius:'20px'}}>
      <Box sx={{ borderColor: 'divider' }}>
      <Tabs 
  value={activeTab} 
  onChange={handleTabChange}
  sx={{ color: '#228BE6',
    borderBottom: "1px solid #DBE2F2",
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
  <Tab label="APGAR Score" />
  <Tab label="Ballard Score" />
  <Tab label="Downe Score" />

</Tabs>
      </Box>
      
      <Box >
        {activeTab === 0 && (
          <ApgarScreen 
            patient_name={patient_name} 
            patient_id={patient_id} 
            patient_resource_id={patient_resource_id} 
            UserRole={UserRole}
          />
        )}
        {activeTab === 1 && (
          <BallardScore 
            patient_name={patient_name} 
            patient_id={patient_id} 
            patient_resource_id={patient_resource_id} 
            UserRole={UserRole}
          />
        )}
        {activeTab === 2 && (
          <DowneScore 
            patient_name={patient_name} 
            patient_id={patient_id} 
            patient_resource_id={patient_resource_id} 
            UserRole={UserRole}
          />
        )}
      </Box>
    </Box>
  );
};

