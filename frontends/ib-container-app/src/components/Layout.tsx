import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import { Menu, LayoutDashboard, Database, Settings, LogOut, User, Fingerprint, Lock } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { brandingConfig } from '../config/brandingConfig';

interface SidebarProps {
    show: boolean;
    onHide: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ show, onHide }) => {
    const { user, logout, isFeatureEnabled } = useAuth();

    return (
        <Offcanvas show={show} onHide={onHide} className="custom-sidebar text-white shadow" style={{ width: '280px' }}>
            <Offcanvas.Header closeButton closeVariant="white" className="border-bottom border-white border-opacity-10 py-4">
                <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
                    {brandingConfig.logoUrl ? (
                        <img src={brandingConfig.logoUrl} alt="Logo" style={{ height: '32px' }} />
                    ) : (
                        <Fingerprint size={24} className="text-primary" />
                    )}
                    <span className="sidebar-brand-text">{brandingConfig.appName}</span>
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0 d-flex flex-column">
                <Nav className="flex-column mt-3 flex-grow-1">
                    <Nav.Link as={NavLink} to="/" end className="sidebar-link d-flex align-items-center gap-3 p-3">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Nav.Link>

                    <Nav.Link
                        as={NavLink}
                        to="/apps/analytics_web_app"
                        className={`sidebar-link d-flex align-items-center justify-content-between p-3 ${!isFeatureEnabled('sql_analytics') ? 'opacity-75' : ''}`}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <Database size={20} />
                            <span>Analytics</span>
                        </div>
                        {!isFeatureEnabled('sql_analytics') && (
                            <div className="bg-warning bg-opacity-25 rounded-circle p-1 d-flex align-items-center justify-content-center border border-warning border-opacity-25 shadow-sm">
                                <Lock size={12} className="text-warning" />
                            </div>
                        )}
                    </Nav.Link>

                    {user?.role === 'Admin' && (
                        <Nav.Link as={NavLink} to="/admin" className="sidebar-link d-flex align-items-center gap-3 p-3">
                            <Settings size={20} />
                            <span>Admin Panel</span>
                        </Nav.Link>
                    )}
                </Nav>

                <div className="mt-auto p-3">
                    <div className="user-profile-box p-3 rounded-3 mb-3">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="bg-primary bg-opacity-25 rounded-circle p-2 border border-primary border-opacity-25">
                                <User size={20} className="text-primary" />
                            </div>
                            <div className="overflow-hidden">
                                <div className="fw-bold text-truncate small">{user?.firstName} {user?.lastName}</div>
                                <small className="text-light text-opacity-50 d-block text-truncate x-small" style={{ fontSize: '0.7rem' }}>{user?.email}</small>
                            </div>
                        </div>
                        <Button variant="danger" className="w-100 btn-sm d-flex align-items-center justify-content-center gap-2 py-2" onClick={logout}>
                            <LogOut size={16} />
                            Logout
                        </Button>
                    </div>

                    <div className="text-center pb-2">
                        <small className="copyright-text">{brandingConfig.copyrightText}</small>
                    </div>
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
        <Navbar bg="white" className="border-bottom sticky-top py-2 px-3 shadow-sm custom-header">
            <Button variant="link" className="text-dark p-0 me-3 hover-scale" onClick={onMenuClick}>
                <Menu size={24} />
            </Button>
            <Navbar.Brand href="/" className="fw-bold d-flex align-items-center gap-2">
                <span className="text-dark">{brandingConfig.clientName}</span>
                <span className="text-primary fw-light">| Portal</span>
            </Navbar.Brand>
            <Nav className="ms-auto align-items-center">
                <Nav.Item className="text-secondary small d-none d-sm-block bg-light px-2 py-1 rounded border">
                    v2.0-PROD
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
        <div className="min-vh-100 bg-light-soft">
            <Header onMenuClick={() => setShowSidebar(true)} />
            <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />
            <Container fluid className="py-4 px-md-5 main-content-fade">
                {children}
            </Container>

            <style>{`
        .bg-light-soft {
            background-color: #fdfdfe;
        }
        .custom-sidebar {
            background-color: #0f172a !important; /* Navy Blue */
        }
        .sidebar-brand-text {
            font-size: 1.1rem;
            letter-spacing: -0.5px;
        }
        .sidebar-link {
            color: rgba(255, 255, 255, 0.7) !important;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-left: 4px solid transparent;
            margin: 4px 12px;
            border-radius: 8px;
        }
        .sidebar-link:hover {
            color: #fff !important;
            background-color: rgba(255, 255, 255, 0.1);
            transform: translateX(4px);
        }
        .sidebar-link.active {
            color: #fff !important;
            background-color: #3b82f6 !important; /* Primary Blue for Active */
            border-left-color: #60a5fa;
            font-weight: 600;
        }
        .user-profile-box {
            background-color: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .copyright-text {
            font-size: 0.65rem;
            color: rgba(255, 255, 255, 0.4);
            font-weight: 300;
        }
        .hover-scale {
            transition: transform 0.2s;
        }
        .hover-scale:hover {
            transform: scale(1.1);
        }
        .main-content-fade {
            animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .sidebar-brand-text {
            font-size: 1.1rem;
            font-weight: 700;
        }
      `}</style>
        </div>
    );
}
