import React from 'react';
import { 
  Box, Grid, Paper, Typography, Card, CardContent, Divider, LinearProgress, Avatar
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Message, GroupAdd, CheckCircle, Warning, FlashOn
} from '@mui/icons-material';

// --- MOCK DATA ---
const funnelData = [
  { name: 'Total Leads', value: 4000 },
  { name: 'Contacted', value: 3000 },
  { name: 'Replied', value: 2000 },
  { name: 'Closed', value: 800 },
];

const aiScoringData = [
  { name: 'Hot Leads', value: 400, color: '#ef4444' },
  { name: 'Warm Leads', value: 1200, color: '#f59e0b' },
  { name: 'Cold Leads', value: 2400, color: '#3b82f6' },
];

const countryData = [
  { country: 'India 🇮🇳', leads: 1200, conversion: 24 },
  { country: 'UAE 🇦🇪', leads: 850, conversion: 18 },
  { country: 'USA 🇺🇸', leads: 600, conversion: 32 },
];

const agentData = [
  { name: 'Sarah J.', closed: 145, rating: 4.8 },
  { name: 'Mike T.', closed: 112, rating: 4.5 },
  { name: 'Elena R.', closed: 98, rating: 4.9 },
];

const campaignPerformance = [
  { name: 'Mon', sent: 4000, read: 2400 },
  { name: 'Tue', sent: 3000, read: 1398 },
  { name: 'Wed', sent: 2000, read: 9800 },
  { name: 'Thu', sent: 2780, read: 3908 },
  { name: 'Fri', sent: 1890, read: 4800 },
  { name: 'Sat', sent: 2390, read: 3800 },
  { name: 'Sun', sent: 3490, read: 4300 },
];

// --- COMPONENTS ---

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>{title}</Typography>
          <Typography variant="h4" fontWeight="bold">{value}</Typography>
          <Typography variant="body2" sx={{ color: color || 'success.main', mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUp fontSize="small" /> {subtitle}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color || 'primary'}.light`, color: `${color || 'primary'}.main` }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

function Overview() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Top KPI Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Leads (Monthly)" value="4,000" subtitle="+12% from last month" icon={<GroupAdd />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Messages Sent" value="24,500" subtitle="+5% this week" icon={<Message />} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Overall Conversion" value="18.5%" subtitle="Target: 20%" icon={<CheckCircle />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Campaigns" value="12" subtitle="3 pending approval" icon={<FlashOn />} color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Funnel & AI Lead Scoring */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Campaign Performance & Funnel</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Messages Sent vs Read over the last 7 days.</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={campaignPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="sent" stroke="#10B981" fillOpacity={1} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="read" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRead)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>AI Lead Scoring</Typography>
            <Typography variant="body2" color="text.secondary">Real-time prediction of conversion likelihood.</Typography>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={aiScoringData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {aiScoringData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
              {aiScoringData.map(item => (
                <Box key={item.name} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: item.color, fontWeight: 'bold' }}>{item.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.name}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Country Performance */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Top Countries ROI 🌍</Typography>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {countryData.map((country, idx) => (
                <Box key={idx}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontWeight="500">{country.country}</Typography>
                    <Typography fontWeight="bold">{country.conversion}% Conversion</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={country.conversion * 2} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{country.leads} Leads generated</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Agent Performance */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Agent Performance Tracking</Typography>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {agentData.map((agent, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{agent.name.charAt(0)}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight="bold">{agent.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{agent.closed} Deals Closed</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="primary.main">{agent.rating} ⭐</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

    </Box>
  );
}

export default Overview;
