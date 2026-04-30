import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import './DashboardPages.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Integration() {
  const [integration, setIntegration] = useState(null);
  const [formData, setFormData] = useState({
    phoneNumberId: '',
    whatsappBusinessAccountId: '',
    accessToken: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/integration`);
      if (res.data && res.data.phoneNumberId) {
        setIntegration(res.data);
        setFormData({
          phoneNumberId: res.data.phoneNumberId,
          whatsappBusinessAccountId: res.data.whatsappBusinessAccountId,
          accessToken: res.data.accessToken
        });
      }
    } catch (err) {
      console.error('Failed to fetch integration:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.post(`${API_URL}/api/integration`, formData);
      await fetchIntegration();
      alert('Integration settings saved successfully.');
    } catch (err) {
      console.error('Failed to save integration:', err);
    }
    setIsSaving(false);
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      
      {integration && integration.webhookVerified ? (
        <div className="alert success-alert glass-panel">
          <ShieldCheck size={24} />
          <div>
            <h4>WhatsApp API Connected</h4>
            <p>Your WhatsApp Business account is successfully integrated and webhook is verified.</p>
          </div>
        </div>
      ) : (
        <div className="alert warning-alert glass-panel">
          <AlertTriangle size={24} />
          <div>
            <h4>Integration Pending</h4>
            <p>Please configure your Meta App credentials to start sending and receiving messages.</p>
          </div>
        </div>
      )}

      <form className="glass-panel settings-form" onSubmit={handleSave}>
        <h3>Meta API Credentials</h3>
        <p className="text-muted" style={{marginBottom: '24px'}}>Enter the details from your Meta Developer Portal.</p>
        
        <div className="form-group">
          <label>Phone Number ID</label>
          <input 
            type="text" 
            required
            value={formData.phoneNumberId}
            onChange={(e) => setFormData({...formData, phoneNumberId: e.target.value})}
            placeholder="e.g. 1045938294829"
          />
        </div>
        
        <div className="form-group">
          <label>WhatsApp Business Account ID</label>
          <input 
            type="text" 
            required
            value={formData.whatsappBusinessAccountId}
            onChange={(e) => setFormData({...formData, whatsappBusinessAccountId: e.target.value})}
            placeholder="e.g. 102938475620"
          />
        </div>
        
        <div className="form-group">
          <label>Temporary or Permanent Access Token</label>
          <input 
            type="password" 
            required
            value={formData.accessToken}
            onChange={(e) => setFormData({...formData, accessToken: e.target.value})}
            placeholder="EAA..."
          />
        </div>

        <div className="form-group">
          <label>Webhook URL (Configure this in Meta)</label>
          <div className="readonly-input">
            {API_URL}/api/whatsapp/webhook
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}

export default Integration;
