import React, { useState } from 'react';
import { firebaseService } from '../../services/firebaseService';

const POPIA_COPY = 'I consent to mLab processing my personal information according to the POPIA Act for the sole purpose of resolving this query.';

interface Props {
  onSubmit: () => void;
  onCancel: () => void;
  initialName?: string;
  initialEmail?: string;
}

const EscalationForm: React.FC<Props> = ({ onSubmit, onCancel, initialName = '', initialEmail = '' }) => {
  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    phone: '',
    message: '',
    consent: false
  });
  const [submitting, setSubmitting] = useState(false);

  const requiredFilled = formData.name.trim() !== '' && formData.email.trim() !== '' && formData.message.trim() !== '';
  const canSubmit = requiredFilled && formData.consent && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await firebaseService.createEscalation({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        message: formData.message.trim(),
        category: 'Chatbot escalation',
        popiaConsent: formData.consent
      });
      onSubmit();
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex flex-col w-full rounded-2xl shadow-xl"
      style={{
        backgroundColor: '#A2C945',
        fontFamily: 'Inter, Roboto, sans-serif',
        width: '280px',
        maxWidth: 'min(320px, 90vw)',
        padding: '20px 18px'
      }}
    >
      <h2 className="text-lg font-bold mb-3" style={{ color: '#000000' }}>
        Speak to an Agent
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <label className="text-[13px] font-extrabold" style={{ color: '#000000' }}>
            Full Name: *
          </label>
          <input
            required
            type="text"
            placeholder="e.g. John Doe"
            className="w-full px-3 py-2 rounded-lg border-0 outline-none text-[13px]"
            style={{ backgroundColor: '#D9D9D9', color: '#000000' }}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[13px] font-extrabold" style={{ color: '#000000' }}>
            Email: *
          </label>
          <input
            required
            type="email"
            placeholder="john@example.com"
            className="w-full px-3 py-2 rounded-lg border-0 outline-none text-[13px]"
            style={{ backgroundColor: '#D9D9D9', color: '#000000' }}
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[13px] font-extrabold" style={{ color: '#000000' }}>
            Phone: <span className="font-normal opacity-80">(opt)</span>
          </label>
          <input
            type="tel"
            placeholder="+27 72 123 4567"
            className="w-full px-3 py-2 rounded-lg border-0 outline-none text-[13px]"
            style={{ backgroundColor: '#D9D9D9', color: '#000000' }}
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[13px] font-extrabold" style={{ color: '#000000' }}>
            Message: *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe your query..."
            className="w-full px-3 py-2 rounded-lg border-0 outline-none text-[13px] resize-y min-h-[64px]"
            style={{ backgroundColor: '#D9D9D9', color: '#000000' }}
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
          />
        </div>

        <div
          className="rounded-lg p-2.5 flex gap-2 items-start"
          style={{ backgroundColor: '#D9D9D9' }}
        >
          <input
            type="checkbox"
            id="popia"
            className="w-4 h-4 rounded mt-0.5 flex-shrink-0 accent-[#073B4C]"
            checked={formData.consent}
            onChange={e => setFormData({ ...formData, consent: e.target.checked })}
          />
          <label htmlFor="popia" className="text-[11px] leading-snug select-none" style={{ color: '#000000' }}>
            {POPIA_COPY}
          </label>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg font-bold text-[12px] transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#E0E0E0', color: '#000000' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 py-2 rounded-lg font-bold text-[12px] text-white transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: '#073B4C' }}
          >
            {submitting ? 'Sending...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EscalationForm;
