import React, { useState } from 'react';
import { Container, Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import { Menu, X, LayoutDashboard, Database, Settings, LogOut, User } from 'lucide-react';
import useAuth from '../hooks/useAuth';

interface SidebarProps {
    show: boolean;
    onHide: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ show, onHide }) => {
    const { user, logout } = useAuth();

    return (
        <Offcanvas show={show} onHide={onHide} className="bg-dark text-white shadow" style={{ width: '280px' }}>
            <Offcanvas.Header closeButton closeVariant="white">
                <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
                    <LayoutDashboard size={24} />
                    Infobench Reporting
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
                <Nav className="flex-column mt-3">
                    <Nav.Link href="/" className="text-white d-flex align-items-center gap-3 p-3 hover-effect">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Nav.Link>
                    <Nav.Link href="/analytics" className="text-white d-flex align-items-center gap-3 p-3 hover-effect">
                        <Database size={20} />
                        Analytics
                    </Nav.Link>
                    {user?.role === 'Admin' && (
                        <Nav.Link href="/admin" className="text-white d-flex align-items-center gap-3 p-3 hover-effect">
                            <Settings size={20} />
                            Admin Panel
                        </Nav.Link>
                    )}
                </Nav>

                <div className="mt-auto p-3 position-absolute bottom-0 w-100 border-top border-secondary">
                    <div className="d-flex align-items-center gap-2 mb-3 px-2">
                        <div className="bg-primary rounded-circle p-2">
                            <User size={20} />
                        </div>
                        <div className="overflow-hidden">
                            <div className="fw-bold text-truncate">{user?.firstName} {user?.lastName}</div>
                            <small className="text-secondary d-block text-truncate">{user?.email}</small>
                        </div>
                    </div>
                    <Button variant="outline-danger" className="w-100 d-flex align-items-center justify-content-center gap-2" onClick={logout}>
                        <LogOut size={18} />
                        Logout
                    </Button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <Navbar bg="white" className="border-bottom sticky-top py-2 px-3 shadow-sm">
            <Button variant="link" className="text-dark p-0 me-3" onClick={onMenuClick}>
                <Menu size={24} />
            </Button>
            <Navbar.Brand href="/" className="fw-bold text-primary">IB Container</Navbar.Brand>
            <Nav className="ms-auto align-items-center">
                <Nav.Item className="text-secondary small d-none d-sm-block">
                    System v2.0
                </Nav.Item>
            </Nav>
        </Navbar>
    );
};

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [showSidebar, setShowSidebar] = useState(false);
    const { user } = useAuth();

    if (!user) return <>{children}</>;

    return (
        <div className="min-vh-100 bg-light">
            <Header onMenuClick={() => setShowSidebar(true)} />
            <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />
            <Container fluid className="py-4 px-md-4">
                {children}
            </Container>

            <style>{`
        .hover-effect:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
        }
        .nav-link {
          border-left: 3px solid transparent;
        }
        .nav-link:hover {
          border-left-color: #0d6efd;
        }
      `}</style>
        </div>
    );
}
