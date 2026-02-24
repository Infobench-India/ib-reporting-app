import React, { Suspense, useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Activation from './pages/Activation';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminPanel from './components/AdminPanel';
import RemoteLoader from './components/RemoteLoader';
import useAuth from './hooks/useAuth';
import {
  BarChart3,
  ShieldCheck,
  CalendarClock,
  Zap,
  Layers,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Container, Spinner, Row, Col, Button } from 'react-bootstrap';
import { brandingConfig } from './config/brandingConfig';
const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth';
// Dynamic import for Analytics MFE
// @ts-ignore
const AnalyticsApp = React.lazy(() => import('ib_analytics_app/App'));

const LandingHome = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-light min-vh-100"
    >
      <Container className="py-5">
        <div className="text-center mb-5 pt-4">
          <motion.div variants={itemVariants} className="mb-4">
            <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 border border-primary border-opacity-25">
              Production Ready v2.0
            </span>
          </motion.div>
          <motion.h2 variants={itemVariants} className="display-4 fw-bold text-dark mb-3">
            {brandingConfig.clientName} <span className="text-primary">{brandingConfig.appName.replace(brandingConfig.clientName, '').trim()}</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="lead text-muted mx-auto mb-5" style={{ maxWidth: '750px' }}>
            An enterprise-grade platform centralizing manufacturing intelligence for {brandingConfig.clientName}.
            Transform raw production data into actionable insights through automated scheduling,
            real-time monitoring, and advanced SQL analytics.
          </motion.p>
          <motion.div variants={itemVariants} className="d-flex justify-content-center gap-3">
            <Button
              variant="primary"
              size="lg"
              className="rounded-3 px-4 py-3 shadow-sm d-flex align-items-center"
              onClick={() => window.location.href = '/apps/analytics_web_app'}
            >
              <LayoutDashboard className="me-2" size={20} />
              Open Analytics Dashboard
              <ArrowRight className="ms-2" size={18} />
            </Button>
          </motion.div>
        </div>

        <Row className="g-4 mt-2">
          <Col md={6} lg={4}>
            <motion.div variants={itemVariants} className="p-4 bg-white rounded-4 shadow-sm border border-0 h-100">
              <div className="mb-3 p-3 rounded-3 d-inline-block bg-primary bg-opacity-10 text-primary">
                <BarChart3 size={28} />
              </div>
              <h4 className="fw-bold h5">SQL Report Analytics</h4>
              <p className="text-muted small mb-0">
                Execute complex queries and visualize production data through interactive charts.
                Full integration with SQL Server for deep-dive reporting.
              </p>
            </motion.div>
          </Col>
          <Col md={6} lg={4}>
            <motion.div variants={itemVariants} className="p-4 bg-white rounded-4 shadow-sm border border-0 h-100">
              <div className="mb-3 p-3 rounded-3 d-inline-block bg-success bg-opacity-10 text-success">
                <CalendarClock size={28} />
              </div>
              <h4 className="fw-bold h5">Automated Scheduler</h4>
              <p className="text-muted small mb-0">
                Set and forget. Configure automated report generation for Daily, Shift, or Weekly
                intervals with direct delivery to key stakeholders.
              </p>
            </motion.div>
          </Col>
          {/* <Col md={6} lg={4}>
            <motion.div variants={itemVariants} className="p-4 bg-white rounded-4 shadow-sm border border-0 h-100">
              <div className="mb-3 p-3 rounded-3 d-inline-block bg-info bg-opacity-10 text-info">
                <Zap size={28} />
              </div>
              <h4 className="fw-bold h5">Live Event Tracking</h4>
              <p className="text-muted small mb-0">
                Real-time event logs and machine monitoring via high-performance WebSocket streams.
                Instant visibility into line status and alarms.
              </p>
            </motion.div>
          </Col> */}
          <Col md={6} lg={4}>
            <motion.div variants={itemVariants} className="p-4 bg-white rounded-4 shadow-sm border border-0 h-100">
              <div className="mb-3 p-3 rounded-3 d-inline-block bg-warning bg-opacity-10 text-warning">
                <ShieldCheck size={28} />
              </div>
              <h4 className="fw-bold h5">Security & RBAC</h4>
              <p className="text-muted small mb-0">
                Comprehensive Role-Based Access Control. Granular permissions management for
                admins, managers, and operators to ensure data security.
              </p>
            </motion.div>
          </Col>
          {/* <Col md={6} lg={4}>
            <motion.div variants={itemVariants} className="p-4 bg-white rounded-4 shadow-sm border border-0 h-100">
              <div className="mb-3 p-3 rounded-3 d-inline-block bg-danger bg-opacity-10 text-danger">
                <Layers size={28} />
              </div>
              <h4 className="fw-bold h5">Micro-frontend Core</h4>
              <p className="text-muted small mb-0">
                Built on a scalable MFE architecture using Webpack Module Federation for
                independent deployment and seamless integration of services.
              </p>
            </motion.div>
          </Col> */}
          <Col md={6} lg={4}>
            <motion.div variants={itemVariants} className="p-4 bg-white rounded-4 shadow-sm border border-0 h-100">
              <div className="mb-3 p-3 rounded-3 d-inline-block bg-secondary bg-opacity-10 text-secondary">
                <LayoutDashboard size={28} />
              </div>
              <h4 className="fw-bold h5">Document History</h4>
              <p className="text-muted small mb-0">
                Centralized archive for all generated PDF and Excel reports.
                Track historical data and download reports instantly whenever needed.
              </p>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('login'); // login, register, forgot, reset
  const navigateRef = React.useRef<any>(null);
  const navigate = useNavigate();
  useEffect(() => {
    // check activation status on app start; redirect to /activation if not activated
    (async () => {
      try {
        const res = await fetch(`${API_URL}/activation/status`, { credentials: 'include' });
        if (res.status === 403) {
          // if user not on auth pages, navigate to activation
          window.location.pathname !== '/activation' && navigate('/activation');
        }
      } catch (err) {
        console.error('Activation check failed:', err);
        // ignore network errors here
      }
    })();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token')) setView('reset');
  }, []);

  if (loading) {
    return (
      <div className="d-flex vh-100 align-items-center justify-content-center bg-light">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Auth pages if not logged in
  if (!user) {
    return (
      <div className="auth-wrapper vh-100 overflow-auto bg-light">
        <Toaster position="top-right" />
        {view === 'login' && <Login onToggleRegister={() => setView('register')} onToggleForgot={() => setView('forgot')} />}
        {view === 'register' && <Register onToggleLogin={() => setView('login')} />}
        {view === 'forgot' && <ForgotPassword onBackToLogin={() => setView('login')} />}
        {view === 'reset' && <ResetPassword onBackToLogin={() => setView('login')} />}
      </div>
    );
  }

  return (
    <Layout>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/activation" element={<Activation />} />
        <Route path="/" element={<LandingHome />} />
        <Route path="/admin" element={user.role === 'Admin' ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/apps/analytics_web_app/*" element={
          <Suspense fallback={
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-2" />
              <p className="text-muted">Loading Analytics Report...</p>
            </div>
          }>
            <AnalyticsApp baseUrl="/apps/analytics_web_app" />
          </Suspense>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
