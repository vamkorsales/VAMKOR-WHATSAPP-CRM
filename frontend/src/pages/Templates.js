import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle2, Clock } from 'lucide-react';
import './DashboardPages.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', category: 'MARKETING', content: '' });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/templates`);
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/templates`, newTemplate);
      setIsCreating(false);
      setNewTemplate({ name: '', category: 'MARKETING', content: '' });
      fetchTemplates();
    } catch (err) {
      console.error('Failed to create template:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-actions" style={{ justifyContent: 'space-between' }}>
        <h2 style={{margin: 0, fontSize: '1.2rem'}}>Message Templates</h2>
        <button className="btn-primary" onClick={() => setIsCreating(!isCreating)}>
          <Plus size={18} /> {isCreating ? 'Cancel' : 'Create Template'}
        </button>
      </div>

      {isCreating && (
        <form className="glass-panel template-form" onSubmit={handleCreate}>
          <h3>Create New Template</h3>
          <div className="form-group">
            <label>Template Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. holiday_promo_1"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select 
              value={newTemplate.category}
              onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
            >
              <option value="MARKETING">Marketing</option>
              <option value="UTILITY">Utility</option>
              <option value="AUTHENTICATION">Authentication</option>
            </select>
          </div>
          <div className="form-group">
            <label>Message Content (use {'{{1}}'} for variables)</label>
            <textarea 
              required
              rows={4}
              placeholder="Hi {{1}}, here is your discount code: {{2}}"
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
            ></textarea>
          </div>
          <button type="submit" className="btn-primary" style={{alignSelf: 'flex-start'}}>Submit for Approval</button>
        </form>
      )}

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card glass-panel">
            <div className="template-header">
              <h4>{template.name}</h4>
              <span className={`status-badge ${template.status.toLowerCase()}`}>
                {template.status === 'APPROVED' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                {template.status}
              </span>
            </div>
            <div className="template-category">{template.category}</div>
            <div className="template-content">
              {template.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Templates;
