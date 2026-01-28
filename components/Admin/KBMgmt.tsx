
import React, { useState, useEffect } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { KBEntry, KBStatus } from '../../types';

const KBMgmt: React.FC = () => {
  const [kb, setKB] = useState<KBEntry[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    firebaseService.getKB().then(setKB);
  }, []);

  const handleStatusToggle = async (id: string, currentStatus: KBStatus) => {
    const nextStatus = currentStatus === KBStatus.APPROVED ? KBStatus.UNAPPROVED : KBStatus.APPROVED;
    await firebaseService.updateKBStatus(id, nextStatus);
    setKB(prev => prev.map(e => e.id === id ? { ...e, status: nextStatus } : e));
  };

  const filteredKB = kb.filter(entry => 
    entry.question.toLowerCase().includes(filter.toLowerCase()) ||
    entry.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Knowledge Base</h3>
          <p className="text-sm text-gray-500">Seed content and approved answers</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Search KB..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-12 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 outline-none w-64 text-sm"
            />
          </div>
          <button className="px-6 py-2 bg-[#98C13C] text-white rounded-xl font-bold shadow-md hover:bg-[#86ac34] transition-all">
            Add New Entry
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-400 font-black tracking-widest">
            <tr>
              <th className="px-8 py-4">Category</th>
              <th className="px-8 py-4">Question</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Last Updated</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredKB.map(entry => (
              <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    entry.category === 'Programmes' ? 'bg-blue-100 text-blue-600' :
                    entry.category === 'Locations' ? 'bg-purple-100 text-purple-600' :
                    // Corrected 'Application' to 'Applications' to match fixed type definitions.
                    entry.category === 'Applications' ? 'bg-orange-100 text-orange-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {entry.category}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-semibold text-gray-700 max-w-md truncate">{entry.question}</td>
                <td className="px-8 py-6">
                  <div className={`flex items-center gap-2 text-xs font-bold ${entry.status === KBStatus.APPROVED ? 'text-green-500' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${entry.status === KBStatus.APPROVED ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    {entry.status}
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-gray-500">{entry.lastUpdated.toLocaleDateString()}</td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => handleStatusToggle(entry.id, entry.status)}
                    className={`p-2 rounded-lg text-lg transition-colors ${entry.status === KBStatus.APPROVED ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                  >
                    <i className={`fas ${entry.status === KBStatus.APPROVED ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                  </button>
                  <button className="p-2 text-gray-300 hover:text-blue-500 transition-colors ml-2">
                    <i className="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KBMgmt;
