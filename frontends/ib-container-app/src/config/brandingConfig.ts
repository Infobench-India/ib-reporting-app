export interface BrandingConfig {
    appName: string;
    clientName: string;
    logoUrl?: string;
    copyrightText: string;
}

export const brandingConfig: BrandingConfig = {
    appName: import.meta.env.VITE_APP_NAME || "Infobench Reporting",
    clientName: import.meta.env.VITE_CLIENT_NAME || "Infobench",
    logoUrl: import.meta.env.VITE_LOGO_URL || "",
    copyrightText: import.meta.env.VITE_COPYRIGHT_TEXT || "Created and Copyright By Infobench Solutions LLP"
};
