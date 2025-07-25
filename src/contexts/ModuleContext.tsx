import React, { createContext, useContext, useState } from 'react';

type Module = { name: string; active: boolean };
type ModuleMap = { [orgId: string]: Module[] };

const ModuleContext = createContext<{
  activeModules: ModuleMap;
  setActiveModules: (orgId: string, modules: Module[]) => void;
} | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModules, setModules] = useState<ModuleMap>({});

  const setActiveModules = (orgId: string, modules: Module[]) => {
    setModules((prev) => ({ ...prev, [orgId]: modules }));
  };

  return (
    <ModuleContext.Provider value={{ activeModules, setActiveModules }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModuleContext = () => {
  const context = useContext(ModuleContext);
  if (!context) throw new Error('useModuleContext must be used inside a ModuleProvider');
  return context;
};
