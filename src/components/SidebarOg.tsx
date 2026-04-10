import { FC, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPrescription,
  faFile,
  faBell,
  faClipboardCheck,
  faDroplet,
  faWeightHanging,
  faTasks,
  faHeartPulse,
  faInbox,
  faTableColumns,
  faFileSignature,
  faNotesMedical,
  faMaskVentilator,
  faFaceSmile
} from "@fortawesome/free-solid-svg-icons";
import { usePermissions } from "../contexts/PermissionContext";
import { Tooltip } from "@mui/material";

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  fhirModuleName: string;
}

export interface SidebarProps {
  onIconClick: (id: string) => void;
  isSidebarCollapsed: boolean;
  selectedId: string;
  UserRole: string;
}

export const SidebarOg: FC<SidebarProps> = ({
  onIconClick,
  selectedId,
  isSidebarCollapsed,
  UserRole
}) => {
  const { canViewModule, loading, permissions } = usePermissions(); // Added permissions to debug

  useEffect(() => {
    console.log("📦 SidebarOg: checking side bar for user role", UserRole);
    console.log("📦 Available permissions:", permissions); // Debug: see what permissions are loaded
  }, [UserRole, permissions]);

  // CORRECTED MAPPING - Match exact FHIR module names
  const baseMenuItems: MenuItem[] = [
    { id: 'overview', label: "Overview", icon: faTableColumns, fhirModuleName: "Patients Overview" },
    { id: 'medication', label: "Medication", icon: faPrescription, fhirModuleName: "Medications" },
    { id: 'feeds', label: "Feeds&Nutrition", icon: faInbox, fhirModuleName: "Clinical Notes" },
    { id: 'trends', label: "Trends", icon: faHeartPulse, fhirModuleName: "Vitals & Trends" },
    { id: 'diagnostics', label: "Diagnostics", icon: faDroplet, fhirModuleName: "Diagnostics" }, 
     { id: 'treatment', label: "Treatment", icon: faNotesMedical, fhirModuleName: "Clinical Notes"},
    // Changed to Patients Clinical List
    { id: 'notes', label: "Notes", icon: faFile, fhirModuleName: "Clinical Notes" },
    { id: 'assessments', label: "Scoring", icon: faClipboardCheck, fhirModuleName: "Assessments" },
    { id: 'growthchart', label: "Growth Chart", icon: faWeightHanging, fhirModuleName: "Diagnostics" },
    { id: 'consentforms', label: "Consent Forms", icon: faFileSignature, fhirModuleName: "Consent Forms" },
    //  { id: 'treatment', label: "Treatment", icon: faFaceSmile, fhirModuleName: "Initial Assessment"},
     { id: 'initialassessment', label: "Assessment", icon: faFaceSmile, fhirModuleName: "Initial Assessment" },
     { id: 'ventichart', label: "VentiChart", icon: faMaskVentilator, fhirModuleName: "Venti Chart" }

  ];

  const nicuNurseItems: MenuItem[] = [
    { id: 'alltask', label: "All Tasks", icon: faTasks, fhirModuleName: "Patients Clinical List" },
  ];

  const otherRoleItems: MenuItem[] = [

    { id: 'alarms', label: "Notification", icon: faBell, fhirModuleName: "Vitals & Trends" },
   
    // { id: 'newPage', label: "New Page", icon: faFile, fhirModuleName: "Patients Overview" },
  ];

  // Combine menu items based on user role
  const allMenuItems = [
    ...baseMenuItems,
    ...(UserRole === "NICU Nurse" ? nicuNurseItems : otherRoleItems)
  ];

  // Debug: Log which modules are being checked
  useEffect(() => {
    if (!loading) {
      console.log("🔍 Checking permissions for menu items:");
      allMenuItems.forEach(item => {
        const hasAccess = canViewModule(item.fhirModuleName);
        console.log(`- ${item.fhirModuleName}: ${hasAccess ? '✅ Access' : '❌ No access'}`);
      });
    }
  }, [loading, allMenuItems]);

  // Filter menu items based on user permissions
  const filteredMenuItems = loading
    ? []
    : allMenuItems.filter(item => canViewModule(item.fhirModuleName));
  // const filteredMenuItems = allMenuItems;

  // Debug: Show what's being filtered
  useEffect(() => {
    if (!loading) {
      console.log("📋 Filtered menu items:", filteredMenuItems.map(item => item.label));
    }
  }, [filteredMenuItems, loading]);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  if (loading) {
    return (
      <Box
        sx={{
          width: isSidebarCollapsed ? 237 : 60,
          backgroundColor: isDarkMode ? '#21262D' : "#FFFFFF",
          height: '100vh',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.text.secondary,
        }}
      >
        <div>Loading permissions...</div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: isSidebarCollapsed ? 237 : 60,
        backgroundColor: isDarkMode ? '#21262D' : "#FFFFFF",
        display: "flex",
        height: '100vh',
        flexDirection: "column",
        alignItems: "center",
        borderRadius: '10px',
        transition: "width 0.3s, background-color 0.3s",
        borderRight: isDarkMode ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      {/* Debug info - remove in production */}
      {/* {!loading && (
        <Box sx={{ p: 1, fontSize: '10px', color: 'gray', textAlign: 'center' }}>
          Permissions loaded: {Object.keys(permissions).length} modules
        </Box>
      )} */}

      <List sx={{ width: "100%", padding: 0 }}>
        {filteredMenuItems.length === 0 && !loading ? (
          <ListItem sx={{ justifyContent: "center", color: "#757575", fontStyle: "italic" }}>
            No modules available
          </ListItem>
        ) : (
      filteredMenuItems.map((item) => (
  <Tooltip
    key={item.id}
    title={item.label}
    placement="right"
    arrow
    disableHoverListener={isSidebarCollapsed} // optional
  >
    <ListItem
      sx={{
        display: "flex",
        alignItems: "center",
        height: 40,
        fontSize: '1.3rem',
        paddingX: 1,
        backgroundColor: selectedId === item.id
          ? (isDarkMode ? 'rgba(88, 166, 255, 0.15)' : "#CCE6FF")
          : "transparent",
        marginBottom: 2,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : "#E6F2FF"
        },
      }}
      onClick={() => onIconClick(item.id)}
    >
      <ListItemIcon
        sx={{
          color: selectedId === item.id
            ? (isDarkMode ? '#58A6FF' : "#124D81")
            : (isDarkMode ? theme.palette.text.secondary : "#757575"),
          minWidth: 36,
          justifyContent: "center",
        }}
      >
        <FontAwesomeIcon icon={item.icon} style={{ fontSize: "100%" }} />
      </ListItemIcon>

      <ListItemText
        primary={item.label}
        sx={{
          color: selectedId === item.id
            ? (isDarkMode ? '#58A6FF' : "#124D81")
            : (isDarkMode ? theme.palette.text.secondary : "#757575"),
          fontWeight: selectedId === item.id ? "bold" : "normal",
          marginLeft: 2,
          opacity: isSidebarCollapsed ? 1 : 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          transition: "opacity 0.3s ease",
          width: isSidebarCollapsed ? "auto" : 0,
        }}
      />
    </ListItem>
  </Tooltip>
))
        )}
      </List>
    </Box>
  );
};