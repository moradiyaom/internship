import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Tables from './pages/Tables';
import Reservations from './pages/Reservations';
import Staff from './pages/Staff';
import Download from './pages/Download';
import CustomerMenu from './pages/CustomerMenu';
import QRCodePage from './pages/QRCode';
import './App.css';

function AppContent() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isCustomer = location.pathname.startsWith('/menu');
  
  return (
    <div className="App">
      {!isCustomer && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu/:tableId" element={<CustomerMenu />} />
        <Route path="/menu" element={<CustomerMenu />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/menu-management"
          element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <PrivateRoute>
              <Tables />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <PrivateRoute>
              <Reservations />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <PrivateRoute>
              <Staff />
            </PrivateRoute>
          }
        />
        <Route
          path="/QRCode"
          element={
            <PrivateRoute>
              <QRCodePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/download"
          element={
            <PrivateRoute>
              <Download />
            </PrivateRoute>
          }
        />
      </Routes>
      {!isCustomer && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename={process.env.PUBLIC_URL || '/'}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

