
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Mon', convs: 400, esc: 24, latency: 1.2 },
  { name: 'Tue', convs: 300, esc: 13, latency: 1.5 },
  { name: 'Wed', convs: 200, esc: 98, latency: 1.1 },
  { name: 'Thu', convs: 278, esc: 39, latency: 1.8 },
  { name: 'Fri', convs: 189, esc: 48, latency: 1.4 },
  { name: 'Sat', convs: 239, esc: 38, latency: 1.3 },
  { name: 'Sun', convs: 349, esc: 43, latency: 1.2 },
];

const Reports: React.FC<{ metrics: any }> = ({ metrics }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon="fa-comments" 
          label="Total Chats" 
          value={metrics?.totalConversations || '0'} 
          color="bg-blue-500" 
          trend="+12%"
        />
        <StatCard 
          icon="fa-ticket-alt" 
          label="Escalations" 
          value={metrics?.escalations || '0'} 
          color="bg-orange-500" 
          trend="-5%"
        />
        <StatCard 
          icon="fa-bolt" 
          label="p95 Latency" 
          value={`${metrics?.p95Latency || '0'}ms`} 
          color="bg-purple-500" 
          trend="Steady"
        />
        <StatCard 
          icon="fa-shield-halved" 
          label="Deflection Rate" 
          value={`${metrics?.deflectionRate || '0'}%`} 
          color="bg-[#98C13C]" 
          trend="+8%"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Conversation Volume</h3>
            <button className="text-xs text-blue-500 font-bold hover:underline">Export CSV</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorConvs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#98C13C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#98C13C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="convs" stroke="#98C13C" strokeWidth={3} fillOpacity={1} fill="url(#colorConvs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Escalation Trends</h3>
            <button className="text-xs text-blue-500 font-bold hover:underline">Full Report</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="esc" fill="#4F6B72" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, trend }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <h4 className="text-3xl font-black text-gray-800">{value}</h4>
      <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${trend.includes('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {trend}
      </p>
    </div>
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
      <i className={`fas ${icon} text-xl`}></i>
    </div>
  </div>
);

export default Reports;
