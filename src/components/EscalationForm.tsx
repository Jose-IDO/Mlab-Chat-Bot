import React, { useState } from 'react';

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
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      alert("Please provide POPIA consent to proceed.");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const escalationData = {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        category: 'Out of Scope / Security',
        popiaConsent: formData.consent
      };

      // Send to backend API (replace with your actual backend URL in production)
      const API_URL =  'http://localhost:3001';
      
      const response = await fetch(`${API_URL}/api/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(escalationData)
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit escalation');
      }

      // Store ticket ID
      setTicketId(result.ticketId);
      
      // Show success message with ticket ID
      alert(
        `✅ Your request has been escalated successfully!\n\n` +
        `Ticket ID: ${result.ticketId}\n\n` +
        `Our team will contact you within 24 hours.\n` +
        `You will also receive a confirmation email.`
      );
      
      // Close form and notify parent
      onSubmit();
      
    } catch (err) {
      console.error('Escalation submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit. Please check your connection and try again.';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <p className="text-sm font-bold text-black/80 mb-6 leading-tight">
        Help us direct you to the right person. Please provide your contact details below.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {ticketId && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-xl text-sm">
          <strong>Success!</strong> Your ticket ID is: <code className="font-mono font-bold">{ticketId}</code>
        </div>
      )}

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
            disabled={submitting}
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
            disabled={submitting}
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
            disabled={submitting}
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
            disabled={submitting}
          />
        </div>

        <div className="bg-black/5 p-4 rounded-xl flex gap-3 border border-black/5">
          <input 
            type="checkbox" 
            id="popia"
            className="w-5 h-5 rounded mt-0.5 accent-[#013444]" 
            checked={formData.consent}
            onChange={e => setFormData({...formData, consent: e.target.checked})}
            disabled={submitting}
          />
          <label htmlFor="popia" className="text-[10px] leading-tight font-bold text-gray-800 select-none">
            I consent to mLab processing this data for support purposes according to POPIA regulations.
          </label>
        </div>

        <div className="flex gap-4 pt-4 pb-2">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-4 bg-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] text-gray-800 hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="flex-1 py-4 bg-[#013444] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending...' : 'Escalate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EscalationForm;