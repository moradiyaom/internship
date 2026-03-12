import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import PublicMenu from './pages/PublicMenu';
import QRCodePage from './pages/QRCode';
import './App.css';

function AppContent() {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/menu/:tableId" element={<PublicMenu />} />
        <Route path="/menu" element={<PublicMenu />} />
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
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

