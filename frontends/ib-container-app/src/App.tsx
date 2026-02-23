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
import { Container, Spinner } from 'react-bootstrap';
const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth';
// Dynamic import for Analytics MFE
// @ts-ignore
const AnalyticsApp = React.lazy(() => import('ib_analytics_app/App'));

const DashboardHome = () => (
  <Container className="text-center py-5">
    <h2 className="display-5 fw-bold text-primary mb-3">Dashboard Home</h2>
    <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
      Welcome to the Infobench Reporting System. Use the sidebar to navigate between different microfrontends and analytical reports.
    </p>
    <div className="row g-4 mt-4">
      <div className="col-md-4">
        <div className="p-4 bg-white rounded-3 shadow-sm border h-100">
          <h4 className="fw-bold h5">Robust Auth</h4>
          <p className="small text-muted mb-0">Secure JWT-based authentication with RBAC and session management.</p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="p-4 bg-white rounded-3 shadow-sm border h-100">
          <h4 className="fw-bold h5">Scalable MFEs</h4>
          <p className="small text-muted mb-0">Independently deployable microfrontends integrated via Module Federation.</p>
        </div>
      </div>
      <div className="col-md-4">
        <div className="p-4 bg-white rounded-3 shadow-sm border h-100">
          <h4 className="fw-bold h5">Enterprise Grade</h4>
          <p className="small text-muted mb-0">Modular architecture designed for scale and enterprise reliability.</p>
        </div>
      </div>
    </div>
  </Container>
);

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
        <Route path="/" element={<DashboardHome />} />
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
