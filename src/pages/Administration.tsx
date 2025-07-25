import {Box,Typography,} from "@mui/material";
import { FC, useState } from "react";
import  { DeviceManagement }  from "../components/DeviceManagement";
import { Sidebar1 } from "../components/Sidebar1";
import { Patient } from "../components/Patient";
import { AdminPage } from "./AdminPage";

interface AdministrationPageProps {
  openDialog: boolean; 
  onCloseDialog: () => void;
  isSidebarCollapsed:boolean;
  userOrganization: string;
  darkTheme:boolean
  
}

export const Administration: FC<AdministrationPageProps>= ({ isSidebarCollapsed ,openDialog,onCloseDialog,userOrganization}) => {

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
     
      case 0:
        return (
          <Box sx={{ flexGrow: 1, paddingLeft: 2,paddingRight: 2, overflowY: "auto" }}>
          <Patient  openDialog={openDialog} onCloseDialog={onCloseDialog}/>
         </Box>
        );
        
      case 1: // Special case
      return (
        <Box sx={{ flexGrow: 1, paddingLeft: 1,paddingRight: 1, overflowY: "auto" }}>
         {/* <AssessmentScreen /> */}
         <DeviceManagement userOrganization={userOrganization}  darkTheme={false}/>
        </Box>
      );
      case 2: // Special case
      return (
        <Box sx={{ flexGrow: 1, paddingLeft: 1,paddingRight: 1, overflowY: "auto" }}>
         {/* <AssessmentScreen /> */}
         <AdminPage userOrganization={userOrganization} darkTheme={false}/>
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


