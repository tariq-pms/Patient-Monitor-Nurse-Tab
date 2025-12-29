// contexts/PermissionContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface ModulePermissions {
  [moduleName: string]: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface PermissionContextType {
  permissions: ModulePermissions;
  loading: boolean;
  hasPermission: (module: string, action: 'create' | 'view' | 'edit' | 'delete') => boolean;
  canViewModule: (module: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

const defaultPermissions: ModulePermissions = {
  "Patients Clinical List": { create: false, view: false, edit: false, delete: false },
  "Patients Overview": { create: false, view: false, edit: false, delete: false },
  "Vitals & Trends": { create: false, view: false, edit: false, delete: false },
  "Medications": { create: false, view: false, edit: false, delete: false },
  "Assessments": { create: false, view: false, edit: false, delete: false },
  "Clinical Notes": { create: false, view: false, edit: false, delete: false },
  "Patient Birth Details": { create: false, view: false, edit: false, delete: false },
  "Diagnostics": { create: false, view: false, edit: false, delete: false },
  "Consent Forms":{ create: false, view: false, edit: false, delete: false }
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<ModulePermissions>(defaultPermissions);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth0();

  const fetchUserPermissions = async (userName: string) => {
    try {
      // URL encode the name for the FHIR query
      const encodedUserName = encodeURIComponent(userName);
      console.log("🔍 Searching for practitioner by name:", userName);
      
      const response = await fetch(
        `${import.meta.env.VITE_FHIRAPI_URL}/Practitioner?name=${encodedUserName}`, 
        {
          headers: {
            Authorization: "Basic " + btoa("fhiruser:change-password"),
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch practitioner');
      
      const data = await response.json();
      console.log("🔍 FHIR Response:", data);
      
      let practitioner = null;
      if (data.entry && data.entry.length > 0) {
        console.log(`✅ Found ${data.entry.length} practitioners with name: ${userName}`);
        
        const sortedEntries = data.entry.sort((a: any, b: any) => {
          const dateA = new Date(a.resource.meta?.lastUpdated || 0);
          const dateB = new Date(b.resource.meta?.lastUpdated || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        practitioner = sortedEntries[0].resource;
        console.log("👨‍⚕️ Selected practitioner:", practitioner);
      } else {
        console.warn(`⚠️ No practitioners found with name: ${userName}`);
      }

      if (practitioner && practitioner.extension) {
        console.log("🔍 Practitioner extensions:", practitioner.extension);
        
        const permissionExtension = practitioner.extension.find(
          (ext: any) => ext.url === "http://example.org/fhir/StructureDefinition/permissions"
        );
        
        if (permissionExtension && permissionExtension.valueString) {
          console.log("✅ Found permission extension");
          
          try {
            const userPermissions = JSON.parse(permissionExtension.valueString);
            console.log("🔐 Parsed permissions:", userPermissions);
            setPermissions(userPermissions);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error("❌ Error parsing permissions JSON:", parseError);
            console.error("❌ Raw valueString:", permissionExtension.valueString);
          }
        } else {
          console.warn("⚠️ No permission extension found");
        }
      } else {
        console.warn("⚠️ No practitioner or extensions found");
      }
      
      // Fallback to default permissions
      console.log("🔄 Using default permissions");
      setPermissions(defaultPermissions);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error fetching permissions:', error);
      setPermissions(defaultPermissions);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      // Try to get the name from different possible properties
      const userName = user.name || user.nickname || user.email || '';
      console.log("👤 Auth0 user info:", { name: user.name, nickname: user.nickname, email: user.email });
      
      if (userName) {
        fetchUserPermissions(userName);
      } else {
        console.warn("⚠️ No user name available for permission lookup");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const hasPermission = (module: string, action: 'create' | 'view' | 'edit' | 'delete') => {
    return permissions[module]?.[action] || false;
  };

  const canViewModule = (module: string) => {
    return hasPermission(module, 'view');
  };

  return (
    <PermissionContext.Provider value={{ permissions, loading, hasPermission, canViewModule }}>
      {children}
    </PermissionContext.Provider>
  );
};