
import React, { useState } from 'react';
import { Save, Info } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [fixedCharge, setFixedCharge] = useState<string>(settings.fixedCharge.toString());
  const [ratePerUnit, setRatePerUnit] = useState<string>(settings.ratePerUnit.toString());
  const [currency, setCurrency] = useState<string>(settings.currency);
  const [unit, setUnit] = useState<string>(settings.unit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fixedCharge: parseFloat(fixedCharge) || 0,
      ratePerUnit: parseFloat(ratePerUnit) || 0,
      currency,
      unit
    });
    alert('Preferences updated successfully.');
  };

  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm max-w-full">
      <div className="mb-8">
        <h2 className="text-base font-bold text-slate-800">Billing Configuration</h2>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Adjust how monthly charges are calculated</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fixed Charge</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold group-focus-within:text-blue-500 transition-colors">{currency}</span>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={fixedCharge}
                onChange={(e) => setFixedCharge(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rate per Unit</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold group-focus-within:text-blue-500 transition-colors">{currency}</span>
              <input 
                type="number" 
                step="0.0001"
                placeholder="0.00"
                value={ratePerUnit}
                onChange={(e) => setRatePerUnit(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Currency Symbol</label>
            <input 
              type="text" 
              placeholder="$"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Type</label>
            <input 
              type="text" 
              placeholder="Units"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl flex gap-4 border border-slate-100">
          <Info className="text-slate-400 w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Charges are calculated as <span className="text-slate-800 font-bold">Fixed Charge + (Usage × Rate)</span>. Changes will apply to all future records and when editing existing ones.
          </p>
        </div>

        <button 
          type="submit"
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-widest active:scale-[0.98]"
        >
          <Save size={16} /> Update Settings
        </button>
      </form>
    </div>
  );
};

export default SettingsView;
