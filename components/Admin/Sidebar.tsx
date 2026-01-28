
import React from 'react';

interface Props {
  activeTab: 'reports' | 'kb' | 'escalations';
  setActiveTab: (tab: 'reports' | 'kb' | 'escalations') => void;
}

const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'reports', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'kb', label: 'Knowledge Base', icon: 'fa-database' },
    { id: 'escalations', label: 'Escalations', icon: 'fa-headset' },
  ];

  return (
    <aside className="w-64 bg-[#4F6B72] text-white flex flex-col shadow-2xl z-10">
      <div className="h-20 flex items-center px-6 gap-3 bg-[#3a4e54]">
        <div className="w-10 h-10 bg-[#98C13C] rounded-lg flex items-center justify-center text-white rotate-3">
          <i className="fas fa-cube text-xl"></i>
        </div>
        <span className="text-xl font-black tracking-tighter">mLab AI</span>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-[#98C13C] text-white shadow-lg' 
                : 'hover:bg-white/10 text-white/70'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-xs text-white/50 mb-2 uppercase font-bold">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-medium">All systems normal</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
