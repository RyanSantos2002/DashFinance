import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { ForgotPassword } from './components/ForgotPassword';
import { UpdatePassword } from './components/UpdatePassword';
import { Loader2 } from 'lucide-react';

// Lazy load pages for better performance
const Principal = React.lazy(() => import('./pages/Principal').then(module => ({ default: module.Principal })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Investments = React.lazy(() => import('./pages/Investments').then(module => ({ default: module.Investments })));
const Settings = React.lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Plan = React.lazy(() => import('./pages/Plan').then(module => ({ default: module.Plan })));

const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[50vh]">
    <Loader2 className="animate-spin text-blue-600" size={32} />
  </div>
);

function App() {
  return (
    <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <Layout>
                  <Navigate to="/principal" replace />
                </Layout>
              </AuthGuard>
            }
          />

          <Route
            path="/principal"
            element={
              <AuthGuard>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Principal />
                  </Suspense>
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Dashboard />
                  </Suspense>
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/investments"
            element={
              <AuthGuard>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Investments />
                  </Suspense>
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Settings />
                  </Suspense>
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/plan" // Assuming plan is protected or public? Keeping protected for now as user settings implies it.
            element={
              <AuthGuard>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Plan />
                  </Suspense>
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
