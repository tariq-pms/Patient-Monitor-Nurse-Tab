import {Box,Typography,} from "@mui/material";
import { FC, useState } from "react";
import  { DeviceManagement }  from "../components/DeviceManagement";
import { Sidebar1 } from "../components/Sidebar1";
import { Patient } from "../components/Patient";

interface AdministrationPageProps {
  openDialog: boolean; 
  onCloseDialog: () => void;
  isSidebarCollapsed:boolean
}

export const Administration: FC<AdministrationPageProps>= ({ isSidebarCollapsed ,openDialog,onCloseDialog}) => {

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const handleIconClick = (index: number) => {
    setSelectedIndex(index); 
  };
   
  return (
    <>
    <Box sx={{ display: "flex"}}>

      {/* Sidebar */}
      <Sidebar1  isSidebarCollapsed={isSidebarCollapsed} onIconClick={handleIconClick} selectedIndex={selectedIndex} />
      {/* Main Content */}

      {(() => {
    switch (selectedIndex) {
     
      case 1:
        return (
          <Box sx={{ flexGrow: 1, paddingLeft: 2,paddingRight: 2, overflowY: "auto" }}>
          <Patient  openDialog={openDialog} onCloseDialog={onCloseDialog}/>
         </Box>
        );
        
      case 5: // Special case
      return (
        <Box sx={{ flexGrow: 1, paddingLeft: 1,paddingRight: 1, overflowY: "auto" }}>
         {/* <AssessmentScreen /> */}
         <DeviceManagement userOrganization={""}/>
        </Box>
      );
      
    
      
      default:
        return (
          <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',   // centers vertically
            alignItems: 'center',       // centers horizontally
            textAlign: 'center',
            height: '100vh',  
            width:'100%'  ,        // full viewport height
            paddingLeft: 2,
            paddingRight: 2,
          }}
        >
          <Typography variant="h4" gutterBottom>
            🚧 Page Under Construction
          </Typography>
          <Typography variant="body1">
            We're working  to bring this page .
          </Typography> </Box>);
    }
  })()}                           
</Box>
    </>
  );
};


