import React, { ReactNode } from 'react';
type AuthContextType = {
    getSession: () => Promise<any>;
    isAuth: () => Promise<boolean>;
    logout: () => Promise<void>;
};
export declare const AuthContext: React.Context<AuthContextType | null>;
declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export default AuthProvider;
