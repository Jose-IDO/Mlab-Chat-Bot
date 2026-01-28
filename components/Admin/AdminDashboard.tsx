
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Reports from './Reports';
import KBMgmt from './KBMgmt';
import Escalations from './Escalations';
import { firebaseService } from '../../services/firebaseService';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'kb' | 'escalations'>('reports');
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    firebaseService.getMetrics().then(setMetrics);
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-gray-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#4F6B72]">Admin Control Panel</h1>
            <p className="text-sm text-gray-500">Managing mLab Support Ecosystem</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">Admin User</p>
              <p className="text-xs text-green-500 font-medium">Online</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#98C13C] flex items-center justify-center text-white shadow-md">
              <i className="fas fa-user"></i>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          {activeTab === 'reports' && <Reports metrics={metrics} />}
          {activeTab === 'kb' && <KBMgmt />}
          {activeTab === 'escalations' && <Escalations />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
