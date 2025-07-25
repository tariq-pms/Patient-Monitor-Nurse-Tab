import { FC, useState } from "react";
import { Box, List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSmile,
  faHospital,
  faUserGroup,
  faFileWaveform,
  faGear,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";

export interface SidebarProps {
  onIconClick: (index: number) => void;
  selectedIndex: number | null;
}

export const Sidebar1: FC<SidebarProps> = ({ onIconClick, selectedIndex }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const menuItems = [
    { label: "Patients", icon: faSmile },
    { label: "Rooms & Beds", icon: faHospital },
    { label: "User management", icon: faUserGroup },
    { label: "Device management", icon: faFileWaveform },
    { label: "Setting", icon: faGear },
  ];

  return (
    <Box
      sx={{
        width: isSidebarCollapsed ? 60 : 270,  // fixed width depending on collapse only
        backgroundColor: "#FFFFFF",
        display: "flex",
        height: "90vh",
        flexDirection: "column",
        alignItems: "center",
        transition: "width 0.3s",
        justifyContent: "space-between",
        paddingY: 0,
        overflowX: "hidden",  // prevent horizontal scroll when collapsed
      }}
    >
      <List sx={{ width: "100%", paddingX: 0 }}>
        {menuItems.map((item, index) => (
          <ListItem
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              height: 40,
              fontSize: "1.3rem",
              paddingX: 1,
              backgroundColor: selectedIndex === index ? "#CCE6FF" : "transparent",
              marginBottom: 1,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#E6F2FF" },
            }}
            onClick={() => onIconClick(index)}
          >
            <ListItemIcon
              sx={{
                color: selectedIndex === index ? "#124D81" : "#757575",
                justifyContent: "center",
                minWidth: 36,
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
                whiteSpace: "nowrap",
                overflow: "hidden",
                // Use opacity and fixed width instead of 'auto' to avoid layout shifts
                opacity: isSidebarCollapsed ? 0 : 1,
                transition: "opacity 0.3s ease",
                width: isSidebarCollapsed ? 0 : 180,  // fixed width for text area when expanded
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Collapse/Expand Button */}
      <ListItem
        sx={{
          display: "flex",
          alignItems: "center",
          height: 40,
          fontSize: "1.3rem",
          paddingX: 1,
          cursor: "pointer",
          "&:hover": { backgroundColor: "#E6F2FF" },
          width: "100%",
        }}
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      >
        <ListItemIcon
          sx={{
            color: "#757575",
            minWidth: 36,
            justifyContent: "center",
          }}
        >
          <FontAwesomeIcon
            icon={isSidebarCollapsed ? faAngleDoubleRight : faAngleDoubleLeft}
            style={{ fontSize: "100%" }}
          />
        </ListItemIcon>

        <ListItemText
          primary={isSidebarCollapsed ? "" : "Collapse"} // only show text when expanded
          sx={{
            color: "#757575",
            marginLeft: 2,
            opacity: isSidebarCollapsed ? 0 : 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            transition: "opacity 0.3s ease",
            width: isSidebarCollapsed ? 0 : 180,
          }}
        />
      </ListItem>
    </Box>
  );
};
