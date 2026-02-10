import React, { ReactNode } from 'react';
interface ProtectedRoutesProps {
    isAuthenticated: boolean;
    role: string;
    children: ReactNode;
}
declare const ProtectedRoutes: React.FC<ProtectedRoutesProps>;
export default ProtectedRoutes;
