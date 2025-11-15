import {Box,Typography,Stack} from "@mui/material";
import { SidebarOg } from '../components/SidebarOg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed } from "@fortawesome/free-solid-svg-icons";
import { FC, useState } from "react";
import  {PrescriptionScreen } from '../components/PrescriptionScreen';
import { PatientOverview } from "../components/PatientOverview";
import { FeedsScreen } from "../components/FeedsScreen";
import { Assessments } from "../components/AssesmentScreen";
import { useLocation } from "react-router-dom";
import { Trends1 } from "../components/Trends1";
import { Notes } from "../components/Notes";
import { Treatment } from "../components/Treatment";
import { Dashboard } from '../components/Dashboard';
import { GrowthChart } from '../components/GrowthChart';
import { usePermissions } from '../contexts/PermissionContext';
import { ProtectedModule } from '../components/ProtectedModule'; // ADD THIS IMPORT

export interface PatientDetails {
  newData: boolean;
  key: string;
  patient_id: string;
  gestational_age:string;
  birthDate:string;
  device: {
    "resourceType": string;
    "id": string;
    "meta": {
        "versionId": string;
        "lastUpdated": string;
    };
    "status": string;
    "patient": {
      "reference": string
    };
    "location": {
      "reference": string
    };
    "identifier": 
        {
            "system": string;
            "value": string;
        }[];
    
  }[];
  patient_resource_id: string;
  observation_resource: {
    "resourceType": string;
    "id": string;
    "meta": {
        "versionId": string;
        "lastUpdated": string;
    },
    "identifier": 
        {
            "value": string;
        }[];
    "status": string;
    "category":
        {
            "coding":
                {
                    "system": string;
                    "code": string;
                    "display": string;
                }[];
        }[];
    "code": {
        "coding": 
            {
                "system": string;
                "code": string;
                "display": string;
            }[];
        
        "text": string;
    };
    "subject": {
        "reference": string;
    };
    "device": {
        "reference": string;
    };
    "component": 
        {
            "code": {
                "coding": 
                    {
                        "system": string;
                        "code": string;
                        "display": string;
                    }[];
                "text": string;
            };
            "valueQuantity": {
                "value": number;
                "unit": string;
                "system": string;
                "code": string;
            };
        }[];
  }[];
  communication_resource: {
    meta: any;
    "id" : string;
    "status" : string;
    "resourceType": string;
    "sent": string;
    "category" : {
    "coding" : {
        "system" : string;
        "code" : string;
        }[];
        "text" : string;
    }[];
    "subject": {
        "reference": string;
    };
    "sender": {
        "reference": string;};
    "payload":{
        "contentReference":{
            "display": string;
        };}[];
    "extension":
        {
            "url": string;
            "valueCodeableConcept": {
                "coding": {
                    "system": string;
                    "code": string;
                    "display": string;
                }[];
            };
        }[];
  }[];
  patient_name: string;
  darkTheme:boolean;
  UserRole:string;
  selectedIcon:string;
  isSidebarCollapsed:boolean;
  userOrganization: string;
}

export const PatientDetailView: FC<PatientDetails> = (props): JSX.Element => {
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('overview');
  const location = useLocation();
  const { patientName, patientId, patientResourceId,gestationAge,birthDate } = location.state || {};
  
  // ADD PERMISSION HOOK
  const { canViewModule, loading } = usePermissions();

  const handleItemClick = (id: string) => {
    // Map menu IDs to module names for permission checking
    const moduleMap: { [key: string]: string } = {
      'overview': 'Patients Overview',
      'diagnostics': 'Diagnostics',
      'medication': 'Medications',
      'notes': 'Clinical Notes',
      'feeds': 'Vitals & Trends',
      'trends': 'Vitals & Trends',
      'treatment': 'Patients Clinical List',
      'assessments': 'Assessments',
      'growthchart':'Diagnostics'
    };
    
    const moduleName = moduleMap[id];
    if (moduleName && canViewModule(moduleName)) {
      setSelectedMenuItemId(id);
    }
  };

  // Show loading state while permissions are being fetched
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading permissions...</Typography>
      </Box>
    );
  }

  return (
    <>
     <Box
  sx={{
    position: "sticky",    
    top: 0,                 
    zIndex: 1000,           
    backgroundColor: "#FFFFFFCC", 
    backdropFilter: "blur(8px)",  
    padding: 1,
    alignItems: "center",
    mb: 2,
    borderBottom: "1px solid #E0E0E0", 
  }}
>
        <Box sx={{ display: "flex", padding: 1, justifyContent: "space-between", backgroundColor: '#FFFFFFCC', alignItems: "center" }}>
          <Stack paddingRight={1} paddingLeft={1} sx={{ backgroundColor: "#5E84CC1A", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: "#124D81" }}>
              <span style={{ fontSize: 'medium', color: "#A7B3CD" }}>B/O:</span>  {patientName} 
            </Typography>
          </Stack>
         
          <Stack direction="row" spacing={1} alignItems="center">
            <FontAwesomeIcon icon={faBed} color="#A7B3CD" />
            <Typography variant="subtitle1" style={{ color: "#124D81", fontWeight: 600 }}>
              {/* {props.patient_id} */}
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1} style={{ alignItems: "center" }} >
            <Typography variant="subtitle1" sx={{ color: "#A7B3CD" }}>
              PID:
            </Typography>
            <Typography variant="subtitle1" style={{ color: "#124D81", fontWeight: 600 }}>
              {patientId}
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1} style={{ alignItems: "center" }} >
            <Typography variant="subtitle1" sx={{ color: "#A7B3CD" }}>
              GA: 
            </Typography>
            <Typography variant="subtitle1" style={{ color: "#124D81", fontWeight: 600 }}>
             {gestationAge}
            </Typography>
          </Stack>
   
          <Stack direction="row" spacing={1} style={{ alignItems: "center" }}>
            <Typography variant="subtitle1" style={{ color: "#A7B3CD"}}>
              D.O.B:
            </Typography>
            <Typography variant="subtitle1" style={{ color: "#124D81", fontWeight: 600 }}>
              {birthDate}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Main page */}
      <Box sx={{ display: "flex" }}>
        {/* Sidebar - Updated to handle permissions */}
        <Box
  sx={{
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
    height: "100vh",
   
  
    backgroundColor: "#FFFFFF", // adjust for dark mode if needed
  }}
>
  <SidebarOg 
    isSidebarCollapsed={props.isSidebarCollapsed} 
    selectedId={selectedMenuItemId} 
    onIconClick={handleItemClick} 
    UserRole={props.UserRole} 
  />
</Box>
        
        {/* Main Content with Permission Protection */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Overview */}
          {selectedMenuItemId === 'overview' && (
            <ProtectedModule module="Patients Overview">
              <PatientOverview 
                darkTheme={false} 
                patientName={patientName || ""} 
                patientId={patientId || ""} 
                deviceId={""} 
                observationId={""} 
                patient_resource_id={patientResourceId} 
              />
            </ProtectedModule>
          )}

          {/* Diagnostics */}
          {selectedMenuItemId === 'diagnostics' && (
            <ProtectedModule module="Diagnostics">
              <Dashboard 
            
                UserRole={props.UserRole} 
                onClose={() => {}} 
                patient={""}  
                patient_resource_id={patientResourceId}  
                  patient_name={patientName} 
                  patient_id={patientId}
                  birth_date={birthDate}
                  gestational_age= {gestationAge}
              />
            </ProtectedModule>
          )}

          {/* Medication */}
          {selectedMenuItemId === 'medication' && (
            <ProtectedModule module="Medications">
              <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                <PrescriptionScreen 
              
                  UserRole={props.UserRole} 
                  patient_resource_id={patientResourceId}  
                  patient_name={patientName} 
                  patient_id={patientId}
                  birth_date={birthDate}
                  gestational_age= {gestationAge}
                  
                />
              </Box>
            </ProtectedModule>
          )}

          {/* Notes */}
          {selectedMenuItemId === 'notes' && (
            <ProtectedModule module="Clinical Notes">
              <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                <Notes 
                  UserRole={props.UserRole} 
                  patient_resource_id={patientResourceId}  
                  patient_name={patientName} 
                  patient_id={patientId}
                  birth_date={birthDate}
                  gestational_age= {gestationAge} 
                />
              </Box>
            </ProtectedModule>
          )}

          {/* Feeds */}
          {selectedMenuItemId === 'feeds' && (
            <ProtectedModule module="Vitals & Trends">
              <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                <FeedsScreen />
              </Box>
            </ProtectedModule>
          )}

          {/* Trends */}
          {selectedMenuItemId === 'trends' && (
            <ProtectedModule module="Vitals & Trends">
              <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                <Trends1 
                  device_id={""} 
                  patient_resource_id={patientResourceId}  
                  patient_name={patientName} 
                  patient_id={patientId}
                  birth_date={birthDate}
                  gestational_age= {gestationAge}
                  device_resource_id={""} 
                  userOrganization={props.userOrganization}
                  darkTheme={false} 
                  selectedIcon={""}  
                />
              </Box>
            </ProtectedModule>
          )}

          {/* Treatment */}
          {selectedMenuItemId === 'treatment' && (
            <ProtectedModule module="Patients Clinical List">
              <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                <Treatment 
                  patient_name={patientName} 
                  patient_id={patientId} 
                  patient_resource_id={patientResourceId} 
                />
              </Box>
            </ProtectedModule>
          )}

          {/* Assessments - User can EDIT this module */}
          {selectedMenuItemId === 'assessments' && (
            <ProtectedModule module="Assessments">
              <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                <Assessments 
                  userOrganization={props.userOrganization}
                  UserRole={props.UserRole} 
                  patient_resource_id={patientResourceId}  
                  patient_name={patientName} 
                  patient_id={patientId}
                  birth_date={birthDate}
                  gestational_age= {gestationAge}
                />
              </Box>
            </ProtectedModule>
          )}

{selectedMenuItemId === 'growthchart' && (
  <ProtectedModule module="Diagnostics">
    <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
      <GrowthChart
        patient_resource_id={patientResourceId}  
        patient_name={patientName} 
        patient_id={patientId}
        birth_date={birthDate}
        gestational_age= {gestationAge} 
        userOrganization={props.userOrganization}
      />
    </Box>
  </ProtectedModule>
)}


          {/* Default view */}
          {!selectedMenuItemId && (
            <ProtectedModule module="Patients Overview">
              <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
                <PatientOverview 
                  darkTheme={false}
                  patientName={patientName || ""}
                  patientId={patientId || ""}
                  observationId={""}
                  deviceId={""} patient_resource_id={""}                />
              </Box>
            </ProtectedModule>
          )}
        </Box>
      </Box>
    </>
  );
};