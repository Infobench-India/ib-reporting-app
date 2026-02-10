import React from "react";
import "./TopNavBars.css";
interface NavItem {
    label: string;
    href?: string;
    children?: NavItem[];
}
interface TopNavBarProps {
    navItems: NavItem[];
}
declare class TopNavBars extends React.Component<TopNavBarProps> {
    isActive(href?: string): boolean;
    renderNavItem(item: NavItem): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default TopNavBars;
