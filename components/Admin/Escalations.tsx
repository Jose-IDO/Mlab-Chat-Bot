
import React, { useState, useEffect } from 'react';
import { firebaseService } from '../../services/firebaseService';
import { Escalation, EscalationStatus } from '../../types';

const Escalations: React.FC = () => {
  const [escalations, setEscalations] = useState<Escalation[]>([]);

  useEffect(() => {
    firebaseService.getEscalations().then(setEscalations);
  }, []);

  const handleStatusUpdate = async (id: string, status: EscalationStatus) => {
    await firebaseService.updateEscalationStatus(id, status);
    setEscalations(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100">
        <h3 className="text-xl font-bold">Escalation Queue</h3>
        <p className="text-sm text-gray-500">Manage high-priority human support tickets</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-400 font-black tracking-widest">
            <tr>
              <th className="px-8 py-4">Ticket ID</th>
              <th className="px-8 py-4">Customer</th>
              <th className="px-8 py-4">Summary</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">POPIA</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {escalations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-gray-400 italic font-medium">No open escalations currently. Great job!</td>
              </tr>
            ) : (
              escalations.map(esc => (
                <tr key={esc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 font-mono text-xs font-bold text-blue-600">{esc.id}</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">{esc.fullName}</span>
                      <span className="text-xs text-gray-500">{esc.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-600 max-w-xs truncate">{esc.message}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      esc.status === EscalationStatus.OPEN ? 'bg-red-100 text-red-600' :
                      esc.status === EscalationStatus.ASSIGNED ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {esc.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <i className={`fas fa-check-circle ${esc.popiaConsent ? 'text-green-500' : 'text-gray-200'} text-lg`}></i>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(esc.id, EscalationStatus.ASSIGNED)}
                        className="px-4 py-1.5 bg-[#4F6B72] text-white text-[10px] font-black uppercase rounded-lg hover:bg-black transition-colors"
                      >
                        Assign
                      </button>
                      <button 
                         onClick={() => handleStatusUpdate(esc.id, EscalationStatus.CLOSED)}
                         className="px-4 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Escalations;
