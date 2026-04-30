import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Download, Search } from 'lucide-react';
import './DashboardPages.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers`);
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const handleMockImport = async () => {
    setIsImporting(true);
    try {
      // Mock CSV data import
      const mockNewContacts = [
        { name: 'Alice Johnson', phone: '+1122334455', email: 'alice@example.com' },
        { name: 'Bob Williams', phone: '+9988776655', email: 'bob@example.com' }
      ];
      await axios.post(`${API_URL}/api/contacts/import`, { contacts: mockNewContacts });
      await fetchContacts();
      alert('Successfully imported 2 contacts (Mock)');
    } catch (err) {
      console.error('Import failed', err);
    }
    setIsImporting(false);
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="page-container">
      <div className="page-actions">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="action-buttons">
          <button className="btn-secondary">
            <Download size={18} /> Export CSV
          </button>
          <button className="btn-primary" onClick={handleMockImport} disabled={isImporting}>
            <Upload size={18} /> {isImporting ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
      </div>

      <div className="data-table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => (
              <tr key={contact.id}>
                <td className="font-medium">{contact.name}</td>
                <td>{contact.phone}</td>
                <td className="text-muted">{contact.email || '-'}</td>
                <td className="text-muted">{new Date(contact.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {filteredContacts.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-8 text-muted">No contacts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Contacts;
