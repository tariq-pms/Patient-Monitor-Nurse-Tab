// components/ProtectedModule.tsx
import { usePermissions } from '../contexts/PermissionContext';

interface ProtectedModuleProps {
  module: string;
  action?: 'create' | 'view' | 'edit' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedModule: React.FC<ProtectedModuleProps> = ({ 
  module, 
  action = 'view', 
  children, 
  fallback = null 
}) => {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  return hasPermission(module, action) ? <>{children}</> : <>{fallback}</>;
};