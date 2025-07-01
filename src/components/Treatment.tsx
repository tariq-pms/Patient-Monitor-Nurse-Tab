import { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';

interface TreatmentProps {
  patient_name: string;
  patient_id: string;
  patient_resource_id: string;
}

// Dummy components for each treatment tab
const MedicationsTab = () => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Diagnosis</Typography>
    <Typography>medication data for demonstration:</Typography>
    <ul>
      <li>Paracetamol - 500mg - Every 6 hours</li>
      <li>Amoxicillin - 250mg - Twice daily</li>
      <li>Vitamin D - 400IU - Once daily</li>
    </ul>
  </Box>
);

const ProceduresTab = () => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Treatement</Typography>
    <Typography>Recent procedures:</Typography>
    <ul>
      <li>Blood transfusion - 2023-10-15</li>
      <li>IV line insertion - 2023-10-10</li>
      <li>Umbilical catheterization - 2023-10-05</li>
    </ul>
  </Box>
);

const TherapyTab = () => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6" gutterBottom>Therapy Plans</Typography>
    <Typography>Current therapy plans:</Typography>
    <ul>
      <li>Physical therapy - 3 sessions/week</li>
      <li>Respiratory therapy - Daily</li>
      <li>Occupational therapy - 2 sessions/week</li>
    </ul>
  </Box>
);

export const Treatment = ({  }: TreatmentProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#124D81',
            },
            '& .MuiTab-root': {
              color: '#757575',
              '&.Mui-selected': {
                color: '#124D81',
                fontWeight: 'bold',
              },
            },
          }}
        >
          <Tab label="Diagnosis" />
          <Tab label="Treatment" />
          <Tab label="Care plan" />
        </Tabs>
      </Box>
      
      <Box sx={{ pt: 2 }}>
        {activeTab === 0 && <MedicationsTab />}
        {activeTab === 1 && <ProceduresTab />}
        {activeTab === 2 && <TherapyTab />}
      </Box>
    </Box>
  );
};

