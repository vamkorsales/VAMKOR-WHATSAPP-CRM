import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './pages/DashboardLayout';
import Chat from './pages/Chat';
import Contacts from './pages/Contacts';
import Templates from './pages/Templates';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import Integration from './pages/Integration';
import Settings from './pages/Settings';
import Overview from './pages/Overview';
import Billing from './pages/Billing';
import Team from './pages/Team';
import SuperAdmin from './pages/SuperAdmin';
import { AuthGuard } from './AuthGuard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<AuthGuard component={DashboardLayout} />}>
        {/* Default route for /dashboard redirects or defaults to overview */}
        <Route index element={<Overview />} />
        <Route path="overview" element={<Overview />} />
        <Route path="chat" element={<Chat />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="templates" element={<Templates />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="integration" element={<Integration />} />
        <Route path="settings" element={<Settings />} />
        <Route path="billing" element={<Billing />} />
        <Route path="team" element={<Team />} />
        <Route path="super-admin" element={<SuperAdmin />} />
      </Route>
    </Routes>
  );
}

export default App;