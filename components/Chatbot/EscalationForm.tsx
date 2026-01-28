
import React, { useState } from 'react';
import { firebaseService } from '../../services/firebaseService';

interface Props {
  onSubmit: () => void;
  onCancel: () => void;
}

const EscalationForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      alert("Please provide POPIA consent to proceed.");
      return;
    }
    setSubmitting(true);
    try {
      await firebaseService.createEscalation({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        category: 'Out of Scope / Security',
        popiaConsent: formData.consent
      });
      onSubmit();
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <p className="text-sm font-bold text-black/80 mb-6 leading-tight">
        Help us direct you to the right person. Please provide your contact details below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase mb-1 text-gray-800">Full Name:*</label>
          <input 
            required
            type="text" 
            placeholder="John Doe"
            className="w-full p-4 bg-white/20 rounded-xl border-none outline-none text-gray-900 placeholder-gray-600 font-bold focus:bg-white transition-all"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase mb-1 text-gray-800">Email Address:*</label>
          <input 
            required
            type="email" 
            placeholder="john@example.com"
            className="w-full p-4 bg-white/20 rounded-xl border-none outline-none text-gray-900 placeholder-gray-600 font-bold focus:bg-white transition-all"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase mb-1 text-gray-800">Phone Number:</label>
          <input 
            type="tel" 
            placeholder="+27 72 ..."
            className="w-full p-4 bg-white/20 rounded-xl border-none outline-none text-gray-900 placeholder-gray-600 font-bold focus:bg-white transition-all"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase mb-1 text-gray-800">Inquiry:*</label>
          <textarea 
            required
            rows={3}
            placeholder="Tell us what you need help with..."
            className="w-full p-4 bg-white/20 rounded-xl border-none outline-none text-gray-900 placeholder-gray-600 font-bold resize-none focus:bg-white transition-all"
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
          />
        </div>

        <div className="bg-black/5 p-4 rounded-xl flex gap-3 border border-black/5">
          <input 
            type="checkbox" 
            id="popia"
            className="w-5 h-5 rounded mt-0.5 accent-[#013444]" 
            checked={formData.consent}
            onChange={e => setFormData({...formData, consent: e.target.checked})}
          />
          <label htmlFor="popia" className="text-[10px] leading-tight font-bold text-gray-800 select-none">
            I consent to mLab processing this data for support purposes according to POPIA regulations.
          </label>
        </div>

        <div className="flex gap-4 pt-4 pb-2">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-4 bg-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] text-gray-800 hover:bg-white/30 transition-all"
          >
            Back
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="flex-1 py-4 bg-[#013444] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Escalate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EscalationForm;
