import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Principal } from './pages/Principal';
import { Dashboard } from './pages/Dashboard';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { Settings } from './pages/Settings';
import { Investments } from './pages/Investments';
import { Plan } from './pages/Plan';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

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
                  <Principal />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Layout>
                  <Dashboard />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/investments"
            element={
              <AuthGuard>
                <Layout>
                  <Investments />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Layout>
                  <Settings />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/plan" // Assuming plan is protected or public? Keeping protected for now as user settings implies it.
            element={
              <AuthGuard>
                <Layout>
                  <Plan />
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
