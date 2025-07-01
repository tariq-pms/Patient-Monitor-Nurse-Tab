import { FC } from "react";
import {Box,List,ListItem,ListItemText,ListItemIcon} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowRestore,faBell,faSmile,faUserGroup,faClock,faFileImport,faFileWaveform,faChartSimple,faGear,} from "@fortawesome/free-solid-svg-icons";

export interface SidebarProps {
  onIconClick: (index: number) => void;
  isSidebarCollapsed:boolean, // Callback to handle icon clicks
}

export const Sidebar1: FC<SidebarProps & { onIconClick: (index: number) => void; selectedIndex: number | null }> = ({
  onIconClick,
  selectedIndex,
  isSidebarCollapsed
}) => {
  

  const menuItems = [
    { label: "Overview", icon: faWindowRestore },
    { label: "Patients", icon: faSmile },
    { label: "Staffs management", icon: faUserGroup },
    { label: "Shift Handovers", icon: faClock },
    { label: "Transfers/Discharge", icon: faFileImport },
    { label: "Device management", icon: faFileWaveform },
    { label: "Notifications & Alerts", icon: faBell },
    { label: "Reports & Analytics", icon: faChartSimple },
    { label: "Setting", icon: faGear },
  
    
  ];

 return (
    <Box
      sx={{
        width: isSidebarCollapsed ? 237: 60,
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // Fixed padding
       
       
        transition: "width 0.3s",
      }}
    >
      
      <List sx={{ width: "100%", padding: 0 }}>
        {menuItems.map((item, index) => (
        <ListItem
        key={index}
        sx={{
          display: "flex",
          alignItems: "center",
          height: 40, 
          fontSize:'1.3rem',// consistent height
          paddingX: 1,
          backgroundColor: selectedIndex === index ? "#CCE6FF" : "transparent",
          marginBottom: 2,
          cursor: "pointer",
          "&:hover": { backgroundColor: "#E6F2FF" },
        }}
        onClick={() => onIconClick(index)}
      >
        <ListItemIcon
          sx={{
            color: selectedIndex === index ? "#124D81" : "#757575",
            minWidth: 36,
            justifyContent: "center",
          }}
        >
          <FontAwesomeIcon icon={item.icon} style={{ fontSize: "100%" }} />
        </ListItemIcon>
      
        <ListItemText
          primary={item.label}
          sx={{
            color: selectedIndex === index ? "#124D81" : "#757575",
            fontWeight: selectedIndex === index ? "bold" : "normal",
            marginLeft: 2,
            opacity: isSidebarCollapsed ? 1 : 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            transition: "opacity 0.3s ease",
            width: isSidebarCollapsed ? "auto" : 0,
          }}
        />
      </ListItem>
      
        ))}
      </List>
    </Box>
  );
};

