import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import DebugPage from './pages/DebugPage';

const SimpleApp = () => {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/debug" element={<DebugPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default SimpleApp;