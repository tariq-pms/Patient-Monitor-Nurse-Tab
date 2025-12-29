import React, { useState, useEffect } from 'react';
import { Switch, FormControlLabel, Box, Typography } from '@mui/material';

interface ModuleToggleListProps {
  organizationId: string;
  onModulesUpdated?: (modules: {name: string, enabled: boolean}[]) => void;
}

const MODULE_OPTIONS = [
  'Real-Time Vitals & Trends',
  'Prescription & Drug Administration',
  'Nutrition & Feeds',
  'Assessments',
  'Diagnostics, Labs & Imaging',
  'Diagnosis, Treatment & Care plan',
  'Patient Profile & Birth Data',
  'Clinical Notes',
  'Consent Forms',          // ✅ ADD THIS
  'Alarm Logs',
  'Nurse task list'
];


export const ModuleToggleList: React.FC<ModuleToggleListProps> = ({ organizationId }) => {
  const [modules, setModules] = useState<{name: string, enabled: boolean}[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current module status
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${organizationId}`,
          {
            headers: {
              Authorization: 'Basic ' + btoa('fhiruser:change-password'),
            },
          }
        );

        const orgData = await response.json();
        const orgModules = orgData.extension?.find((ext: any) => 
          ext.url === "http://yourdomain.com/fhir/StructureDefinition/module-access"
        )?.extension || [];

        const initializedModules = MODULE_OPTIONS.map(name => {
          const moduleData = orgModules.find((m: any) => 
            m.url === "module" && m.valueString === name
          );
          return {
            name,
            enabled: moduleData ? 
              orgModules.find((m: any) => 
                m.url === "enabled" && m.valueBoolean
              )?.valueBoolean || false : false
          };
        });

        setModules(initializedModules);
      } catch (error) {
        console.error("Error fetching modules:", error);
        setModules(MODULE_OPTIONS.map(name => ({ name, enabled: false })));
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [organizationId]);

  const handleToggle = async (moduleName: string) => {
    const updatedModules = modules.map(module => 
      module.name === moduleName 
        ? { ...module, enabled: !module.enabled } 
        : module
    );
    
    setModules(updatedModules);

    try {
      // First fetch current organization data
      const getResponse = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${organizationId}`,
        {
          headers: {
            Authorization: 'Basic ' + btoa('fhiruser:change-password'),
          },
        }
      );

      if (!getResponse.ok) throw new Error("Failed to fetch organization data");
      const currentOrg = await getResponse.json();

      // Prepare updated organization
      const updatedOrg = {
        ...currentOrg,
        extension: [
          ...(currentOrg.extension?.filter((ext: any) => 
            ext.url !== "http://yourdomain.com/fhir/StructureDefinition/module-access"
          ) || []),
          {
            url: "http://yourdomain.com/fhir/StructureDefinition/module-access",
            extension: updatedModules.flatMap(module => [
              { url: "module", valueString: module.name },
              { url: "enabled", valueBoolean: module.enabled }
            ])
          }
        ]
      };

      const putResponse = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/Organization/${organizationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/fhir+json",
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
          body: JSON.stringify(updatedOrg)
        }
      );

      if (!putResponse.ok) {
        const errorData = await putResponse.json();
        console.error("Server error:", errorData);
        throw new Error("Failed to update modules");
      }

      // Success - no need to call onModulesUpdated unless you have a specific need
      console.log("Modules updated successfully");
      
    } catch (error) {
      console.error("Error updating modules:", error);
      setModules(modules); // Revert on error
      alert(`Failed to update module: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (loading) return <Typography>Loading modules...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Module Access Control
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {modules.map((module) => (
          <FormControlLabel
            key={module.name}
            control={
              <Switch
                checked={module.enabled}
                onChange={() => handleToggle(module.name)}
                color="primary"
              />
            }
            label={module.name}
          />
        ))}
      </Box>
    </Box>
  );
};