import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import DashboardLayout from './pages/DashboardLayout';
import Chat from './pages/Chat';
import Contacts from './pages/Contacts';
import Templates from './pages/Templates';
import Integration from './pages/Integration';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Default route for /dashboard redirects or defaults to chat */}
        <Route index element={<Chat />} />
        <Route path="chat" element={<Chat />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="templates" element={<Templates />} />
        <Route path="integration" element={<Integration />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;