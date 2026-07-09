import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import StatsPage from './components/StatsPage';
import HorasPage from './components/HorasPage';
import ManualPage from './components/ManualPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="stats" replace />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="horas" element={<HorasPage />} />
          <Route path="manual" element={<ManualPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;