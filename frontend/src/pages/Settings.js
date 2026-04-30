import React from 'react';
import { User, Bell, Shield } from 'lucide-react';
import './DashboardPages.css';

function Settings() {
  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      
      <div className="settings-section glass-panel">
        <div className="settings-header">
          <User className="settings-icon" />
          <div>
            <h3>Profile Settings</h3>
            <p className="text-muted">Manage your account details and preferences.</p>
          </div>
        </div>
        <div className="settings-content">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" defaultValue="Pratiksha Nandedkar" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" defaultValue="pratiksha@vamkor.com" />
          </div>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>

      <div className="settings-section glass-panel">
        <div className="settings-header">
          <Bell className="settings-icon" />
          <div>
            <h3>Notifications</h3>
            <p className="text-muted">Configure how you receive alerts.</p>
          </div>
        </div>
        <div className="settings-content">
          <div className="toggle-group">
            <label className="toggle-label">
              <span>Email Notifications</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="toggle-label">
              <span>Desktop Notifications for New Messages</span>
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Settings;
