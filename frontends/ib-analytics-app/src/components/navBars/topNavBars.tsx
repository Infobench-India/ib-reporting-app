import React from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "./TopNavBars.css";
import { Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";

interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

interface TopNavBarProps {
  navItems: NavItem[];
}

class TopNavBars extends React.Component<TopNavBarProps> {
  isActive(href?: string): boolean {
    return href ? window.location.href.includes(href) : false;
  }

  renderNavItem(item: NavItem) {
    if (item.children && item.children.length > 0) {
      return (
        <NavDropdown
          title={item.label}
          id={`nav-dropdown-${item.label}`}
          key={item.label}
          className="nav-item custom-nav-item"
        >
          {item.children.map((child) => (
            <NavDropdown.Item className={this.isActive(child.href) ? "active-item" : "inactive-item"} key={child.label} as={Link} to={child.href ? child.href : "#"}>{child.label}</NavDropdown.Item>
          ))}
        </NavDropdown>
      );
    } else {
      return (
        <Nav.Link
          key={item.label} as={Link} to={item.href ? item.href : "#"}
          className={`custom-nav-link ${this.isActive(item.href) ? "active-item" : "inactive-item"}`}
        >
          {item.label}
        </Nav.Link>
      );
    }
  }

  render() {
    const { navItems } = this.props;

    return (
      <Navbar expand="lg" className="top-navbar sticky-top top-navbar-important">
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ml-auto" navbar>
            {navItems.map((item) => this.renderNavItem(item))}
            <Nav.Item className="d-flex align-items-center ms-3">
              <ThemeToggle />
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default TopNavBars;
