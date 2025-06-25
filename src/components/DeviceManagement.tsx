import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Button,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import HotelIcon from "@mui/icons-material/Hotel";
interface DeviceManagementProps {
  userOrganization: string;
}

interface LocationResource {
  id: string;
  name: string;
  identifierValue?: string;
  status?: string;
  managingOrg?: string;
}

export const DeviceManagement: React.FC<DeviceManagementProps> = ({ userOrganization }) => {

  const [locations, setLocations] = useState<LocationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const orgId = "190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83";
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  


  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL as string}/Location?organization=190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83`,
          {
            credentials: "omit",
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
          }
        );
        const data = await res.json();
        if (data.entry) {
          const fetchedLocations = data.entry.map((entry: any) => {
            const resource = entry.resource;
            return {
              id: resource.id,
              name: resource.name,
              identifierValue: resource.identifier?.[0]?.value,
              status: resource.status,
              managingOrg: resource.managingOrganization?.reference,
            };
          });
          setLocations(fetchedLocations);
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [userOrganization]);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // Fetch devices associated with the current organization
  //       const response = await fetch(`${import.meta.env.VITE_FHIRAPI_URL as string}/Device?organization=190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83`, {
  //         headers: {
  //           Authorization: 'Basic ' + btoa('fhiruser:change-password'),
  //         },
  //       });
  //       const data = await response.json();
  //       const devices = data.entry || [];

  //       setDeviceList(devices);
     

      
        
        
  //     } catch (error) {
  //       console.error('Error fetching devices or metrics:', error);
      
  //     }
  //   };

  //   fetchData();
  // }, []);
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Device?organization=${orgId}`,
          {
            headers: {
              Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
          }
        );
        const data = await res.json();
        setDeviceList(data.entry || []);
      } catch (err) {
        console.error("Error fetching devices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

 
  const getDevicesByLocation = (locId: string) => {
    return deviceList.filter(
      (d) =>
        d.resource?.location?.reference === `Location/${locId}`
    );
  };
const handleRenameSubmit = async (loc: LocationResource) => {
    try {
    const updatedResource = {
    resourceType: "Location",
    id: loc.id,
    name: newName,
    status: loc.status,
    identifier: [{ value: loc.identifierValue }],
    managingOrganization: { reference: loc.managingOrg }
    };
    const response = await fetch(
      `${import.meta.env.VITE_FHIRAPI_URL}/Location/${loc.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: "Basic " + btoa("fhiruser:change-password"),
          "Content-Type": "application/fhir+json"
        },
        body: JSON.stringify(updatedResource)
      }
    );
    
    if (response.ok) {
      // refetch or locally update the locations list
      setEditingLocationId(null);
     
    } else {
      console.error("Failed to update location");
    }
  } catch (err) {
    console.error("Error updating location:", err);
    }
    };
    
    const handleAddRoom = async () => {
      if (!newRoomName.trim()) return;
      
      const newLocation = {
      resourceType: "Location",
      name: newRoomName,
      status: "active",
      managingOrganization: {
      reference: "Organization/190a1bc01d5-74da227d-60cc-459b-9046-3173eee76c83"
      }
      };
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL as string}/Location`,
          {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: "Basic " + btoa("fhiruser:change-password"),
            },
            body: JSON.stringify(newLocation)
          }
        );
      if (response.ok) {
        const created = await response.json();
        setLocations((prev) => [...prev, {
          id: created.id,
          name: created.name,
          status: created.status,
          identifierValue: created.identifier?.[0]?.value,
          managingOrg: created.managingOrganization?.reference
        }]);
        setNewRoomName("");
        setShowAddForm(false);
      } else {
        console.error("Failed to create location");
      }
      } catch (error) {
console.error("Error creating location:", error);
}
};
  return (
    <><Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        NICU Rooms
      </Typography>
      <Grid container spacing={3}>
      {
locations.map((loc) => {
const locDevices = getDevicesByLocation(loc.id);
const isEditing = editingLocationId === loc.id;
return (
  <Grid item xs={12} sm={6} md={3} key={loc.id} >
   <Card sx={{ position: "relative", borderRadius: 5, backgroundColor: '#FFFFFF' }}>
   <IconButton
size="small"
sx={{ position: "absolute", top: 8, right: 8, color: "black" }}
onClick={() => {
setEditingLocationId(loc.id);
setNewName(loc.name);
}}
>
<EditIcon fontSize="small" />
</IconButton>
<CardContent>
      {isEditing ? (
        <>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ width: "100%", marginBottom: "8px" }}
          />
          <button onClick={() => handleRenameSubmit(loc)}>Save</button>
          <button onClick={() => setEditingLocationId(null)}>Cancel</button>
        </>
      ) : (
        <>
          <Typography variant="h6" color="black">
            {loc.name}
          </Typography>
          <Typography variant="body2" color="black">
            Devices: {locDevices.length}
          </Typography>
          {/* <Typography variant="body2" color="black">
            Status: {loc.status}
          </Typography> */}
        </>
      )}
    </CardContent>
    </Card>
  </Grid>
);})
}


        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          sx={{
            display: 'flex',

            alignItems: 'center'
          }}
        >
      <Button
variant="outlined"
startIcon={<AddIcon />}
onClick={() => setShowAddForm(true)}
sx={{
textTransform: "none",
borderRadius: 2,
backgroundColor: "#e5effb",
color: "#1976d2",
fontWeight: 500,
px: 2,
py: 1,
"&:hover": {
backgroundColor: "#d0e5f7"
}
}}
>
Add Rooms
</Button>
{showAddForm && (
<Box mt={2}>
<TextField
label="Room Name"
variant="outlined"
value={newRoomName}
onChange={(e) => setNewRoomName(e.target.value)}
size="small"
/>
<Button onClick={handleAddRoom} sx={{ ml: 1 }} variant="contained">
Create
</Button>
<Button onClick={() => setShowAddForm(false)} sx={{ ml: 1 }}>
Cancel
</Button>
</Box>
)}
        </Grid>

      </Grid>
    </Box><Box sx={{ p: 2}}>
       
        <Typography variant="h6" sx={{ mb: 2 }}>
        Device-Bed management
      </Typography>

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              minWidth: 120,
              color: "#6e6e6e",
            },
            "& .Mui-selected": {
              color: "#1976d2",
              fontWeight: 600,
            },
          }}
        >
          {locations.map((loc) => (
            <Tab
              key={loc.id}
              icon={<HotelIcon fontSize="small" />}
              iconPosition="start"
              label= {loc.name} />
          ))}
        </Tabs>

        {/* Add Devices Button */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#e5effb",
              color: "#1976d2",
              fontWeight: 500,
              px: 2,
              py: 1,
              "&:hover": {
                backgroundColor: "#d0e5f7",
              },
            }}
          >
            Add Devices
          </Button>
        </Box>
      </Box></>
  );
};


