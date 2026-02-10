import React from 'react';
interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}
export declare const useTheme: () => ThemeContextType;
interface ThemeProviderProps {
    children: React.ReactNode;
}
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export default ThemeProvider;
