import {
  Box,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";

import { SidebarOg } from '../components/SidebarOg';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faNotesMedical } from "@fortawesome/free-solid-svg-icons";

import { FC, useState } from "react";
import  { ApgarScreen } from '../components/ApgarScreen';
import  {BallardScore } from '../components/BallardScore';
import  {PrescriptionScreen } from '../components/PrescriptionScreen';
import { PatientOverview } from "../components/PatientOverview";
import { FeedsScreen } from "../components/FeedsScreen";
import { Assessments } from "../components/AssesmentScreen";
import { useLocation } from "react-router-dom";

// import { Trends } from "../components/Trends";
import { Trends1 } from "../components/Trends1";
import { Notes } from "../components/Notes";
import { Treatment } from "../components/Treatment";

import { Dashboard } from '../components/Dashboard';

// export const NewPatientDetails: FC<PatientDetails> = (props): JSX.Element => {
  export interface PatientDetails {
    newData: boolean;
    key: string;
    patient_id: string;
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
    isSidebarCollapsed:boolean
    
  }


export const PatientDetailView: FC<PatientDetails> = (props): JSX.Element => {
  //const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('overview');
  const location = useLocation();
  
  const { patientName, patientId,deviceId ,observation,patientResourceId} = location.state || {};
  // const handleIconClick = (index: number) => {
  //   setSelectedIndex(index);
  //   console.log('fetched UserRole1',props.UserRole)
  //   console.log('fetched observation',observation)
  // };
  const handleItemClick = (id: string) => {
    setSelectedMenuItemId(id);
  };
  
  return (
    <>
    <Box sx={{ backgroundColor: '#FFFFFFCC',padding:1, alignItems: "center",mb: 2}}>
    <Box sx={{ display: "flex",padding:1, justifyContent: "space-between",backgroundColor:'#FFFFFFCC', alignItems: "center"}}>
   
    <Stack paddingRight={1} paddingLeft={1} sx={{ backgroundColor: "#5E84CC1A",borderRadius:2}}
              >
               
                  <Typography variant="h6" sx={{ color: "#124D81" }}>
                  <span style={{fontSize:'medium',color: "#A7B3CD"}}>B/O:</span>  {patientName} 
                  </Typography>
                </Stack>
               
                <Stack direction="row" spacing={1} alignItems="center">
                  <FontAwesomeIcon icon={faBed} color="#A7B3CD" />
                  <Typography variant="subtitle1" style={{ color: "#124D81", fontWeight: 600 }}>
                
                     {/* {props.patient_id} */}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} style={{ alignItems: "center"}} >
                  <Typography variant="subtitle1" sx={{ color: "#A7B3CD" }}>
                   {/* UHID */}PID:
                  </Typography>
                  <Typography variant="subtitle1"  style={{ color: "#124D81", fontWeight: 600 }}>
                   {patientId}
                  </Typography>
                </Stack>
        <Stack  direction="row" spacing={1} style={{ alignItems: "center"}} >
                    <Typography variant="subtitle1" sx={{ color: "#A7B3CD" }}>
                    GA: 
                    </Typography>
                    <Typography variant="subtitle1"style={{ color: "#124D81", fontWeight: 600 }}>
                    22 W 7 D
                    </Typography>
                    </Stack>
   
                    <Stack direction="row" spacing={1} style={{ alignItems: "center" }}>
                <Typography variant="subtitle1" style={{ color: "#A7B3CD"}}>
                 D.O.B:
                </Typography>
                <Typography variant="subtitle1" style={{ color: "#124D81", fontWeight: 600 }}>
                  11/09/2024
                </Typography>
                </Stack>

   
  </Box>


   </Box>

   {/* main page */}

    <Box sx={{ display: "flex", }}>

      {/* Sidebar */}
      <SidebarOg isSidebarCollapsed={props.isSidebarCollapsed} selectedId={selectedMenuItemId} onIconClick={handleItemClick} UserRole={props.UserRole} />
      {/* Main Content */}

      {(() => {
    switch (selectedMenuItemId) {
      case 'overview':
        return (
          <PatientOverview darkTheme={false} patientName={""} patientId={""} deviceId={""} observationId={""} />
        );
        case 'diagnostics':
        return (
          <Dashboard patient_name={patientName} patient_id={patientId} patient_resource_id={patientResourceId} UserRole={props.UserRole} onClose={function (): void {
            throw new Error("Function not implemented.");
          } }  />
        );
        case 'medication':
        return (
          <Box sx={{ flexGrow: 1, paddingLeft: 2,paddingRight: 2, overflowY: "auto" }}>
           <PrescriptionScreen patient_name={patientName} patient_id={patientId} UserRole={props.UserRole} patient_resource_id={patientResourceId}/>
          
         </Box>
        );
      case 'notes':
        return (
          <Box sx={{ flexGrow: 1, paddingLeft: 2,paddingRight: 2, overflowY: "auto" }}>
          <Notes UserRole={props.UserRole} patient_name={patientName} patient_id={patientId} patient_resource_id={patientResourceId} />
          {/* Other content here */}
        </Box>
        );
      case 'feeds': // Special case
      return (
        <Box sx={{ flexGrow: 1, paddingLeft: 2,paddingRight: 2, overflowY: "auto" }}>
         <FeedsScreen patient_name={patientName} patient_id={patientId} patient_resource_id={patientResourceId} />
        </Box>
      );
      case 'trends': // Special case
      return (
        <Box sx={{ flexGrow: 1, paddingLeft: 2,paddingRight: 2, overflowY: "auto" }}>
        <Trends1    patient_id={patientId} patient_name={patientName} device={[]} patient_resource_id={patientResourceId} observation_resource={[]}  />
        </Box>
      );
      case 'treatment': // Make sure this matches your menu item ID exactly
  return (
    <Box sx={{ flexGrow: 1, paddingLeft: 2, paddingRight: 2, overflowY: "auto" }}>
      <Treatment 
        patient_name={patientName} 
        patient_id={patientId} 
        patient_resource_id={patientResourceId} 
      />
    </Box>
  );
      case 'assessments': // Special case
      return (
        <Box sx={{ flexGrow: 1, paddingLeft: 2,paddingRight: 2, overflowY: "auto" }}>
         {/* <Notes /> */}
         <Assessments  patient_name={patientName} patient_id={patientId} patient_resource_id={patientResourceId}/>
        </Box>
      );
    
      
      default:
        return (
          <Box sx={{ flexGrow: 1, paddingLeft: 2,paddingRight: 2, overflowY: "auto" }}>
          <PatientOverview darkTheme={false} patientName={""} patientId={""} observationId={""} deviceId={""}/></Box>
        
        );
    }
  })()}                           


    </Box>
    </>
  );
};


