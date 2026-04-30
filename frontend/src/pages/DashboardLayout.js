import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { MessageSquare, Users, FileText, Settings, Webhook, LogOut } from 'lucide-react';
import './DashboardLayout.css';

function DashboardLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard/chat', icon: <MessageSquare size={20} />, label: 'Conversations' },
    { path: '/dashboard/contacts', icon: <Users size={20} />, label: 'Contacts' },
    { path: '/dashboard/templates', icon: <FileText size={20} />, label: 'Templates' },
    { path: '/dashboard/integration', icon: <Webhook size={20} />, label: 'Integration' },
    { path: '/dashboard/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="url(#gradient)">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M12 2C6.48 2 2 6.48 2 12C2 13.84 2.5 15.57 3.38 17.06L2.1 21.68L6.87 20.44C8.32 21.43 10.1 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17.15 15.65C16.92 16.31 15.82 16.89 15.13 17.02C14.6 17.11 13.85 17.22 11.23 16.14C8.07 14.83 6.03 11.58 5.88 11.38C5.73 11.18 4.64 9.74 4.64 8.24C4.64 6.74 5.4 5.99 5.7 5.67C5.93 5.42 6.32 5.31 6.7 5.31C6.83 5.31 6.94 5.31 7.03 5.32C7.38 5.34 7.55 5.36 7.78 5.92C8.07 6.64 8.79 8.39 8.88 8.57C8.97 8.76 9.07 8.99 8.95 9.21C8.83 9.44 8.74 9.55 8.57 9.75C8.4 9.94 8.24 10.16 8.07 10.33C7.9 10.51 7.71 10.7 7.92 11.06C8.13 11.43 8.86 12.61 9.94 13.56C11.33 14.8 12.44 15.19 12.83 15.36C13.22 15.53 13.46 15.5 13.68 15.26C13.91 15 14.51 14.3 14.71 13.98C14.92 13.67 15.14 13.72 15.48 13.84C15.82 13.95 17.65 14.85 18 15.02C18.35 15.2 18.58 15.28 18.66 15.43C18.75 15.58 18.75 16.32 18.42 16.98" />
          </svg>
          <h2>Vamkor</h2>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <NavLink to="/" className="nav-item">
            <LogOut size={20} />
            <span>Exit Dashboard</span>
          </NavLink>
        </div>
      </aside>
      
      <main className="dashboard-content">
        <header className="content-header">
          <h1>
            {navItems.find(i => location.pathname.includes(i.path))?.label || 'Dashboard'}
          </h1>
        </header>
        <div className="content-scrollable">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
