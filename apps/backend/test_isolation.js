async function runTests() {
  const API = 'http://localhost:5001/api';
  
  try {
    console.log('--- Registering User 1 ---');
    let res = await fetch(`${API}/auth/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
      email: 'user1@gmail.com', password: 'password', username: 'User One', contactNumber: '1', companyName: 'Co 1', country: 'US'
    })});
    const u1 = await res.json();
    const t1 = u1.token;
    
    console.log('--- Registering User 2 ---');
    res = await fetch(`${API}/auth/register`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
      email: 'user2@gmail.com', password: 'password', username: 'User Two', contactNumber: '2', companyName: 'Co 2', country: 'US'
    })});
    const u2 = await res.json();
    const t2 = u2.token;
    
    console.log('--- User 1 Adds Contact ---');
    await fetch(`${API}/customers`, { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${t1}`}, body: JSON.stringify({ name: 'Secret Contact', phone: '9999', email: 'secret@gmail.com' }) });
    
    console.log('--- User 2 Fetching Contacts ---');
    res = await fetch(`${API}/customers`, { headers: {'Authorization': `Bearer ${t2}`} });
    const u2Contacts = await res.json();
    console.log('User 2 Contacts Length:', u2Contacts.length);
    console.log('User 2 sees User 1 data?:', u2Contacts.some(c => c.name === 'Secret Contact'));
    
    console.log('--- Role Check: User 2 creates Agent ---');
    res = await fetch(`${API}/auth/agents`, { method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${t2}`}, body: JSON.stringify({ email: 'agent@gmail.com', password: 'pass', username: 'Agent', role: 'Sales Agent' }) });
    console.log('Agent creation status:', res.status);
    
    console.log('--- API Role Check: Agent trying to fetch Agents ---');
    res = await fetch(`${API}/auth/login`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email: 'agent@gmail.com', password: 'pass' }) });
    const agentToken = (await res.json()).token;
    
    res = await fetch(`${API}/auth/agents`, { headers: {'Authorization': `Bearer ${agentToken}`} });
    console.log('Agent fetch agents status:', res.status);
    console.log('Agent fetch error:', await res.json());

  } catch (error) {
    console.error('Error during tests:', error.message);
  }
}
runTests();
