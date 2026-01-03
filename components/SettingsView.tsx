
import React, { useState } from 'react';
import { Save, Info, CreditCard, Droplets, Banknote, Ruler, Bell, Calendar } from 'lucide-react';
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
  
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(settings.notificationsEnabled);
  const [notificationFrequency, setNotificationFrequency] = useState<AppSettings['notificationFrequency']>(settings.notificationFrequency);
  const [notificationDay, setNotificationDay] = useState<number>(settings.notificationDay);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      } else {
        alert('Notification permission was denied. Please enable it in your browser settings.');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fixedCharge: parseFloat(fixedCharge) || 0,
      ratePerUnit: parseFloat(ratePerUnit) || 0,
      currency,
      unit,
      notificationsEnabled,
      notificationFrequency,
      notificationDay
    });
    alert('Settings updated successfully!');
  };

  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Preferences</h2>
          <p className="text-sm text-slate-500">Configure your utility billing and app behavior</p>
        </div>
        <button 
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* Billing Group */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Utility & Rates</label>
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Banknote size={20} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fixed Monthly Charge ({currency})</p>
                <input 
                  type="number" 
                  inputMode="decimal"
                  value={fixedCharge}
                  onChange={(e) => setFixedCharge(e.target.value)}
                  className="w-full text-lg font-bold text-slate-900 bg-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><CreditCard size={20} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rate per Unit ({currency})</p>
                <input 
                  type="number" 
                  inputMode="decimal"
                  step="0.001"
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(e.target.value)}
                  className="w-full text-lg font-bold text-slate-900 bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Droplets size={20} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Currency Symbol</p>
                <input 
                  type="text" 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-lg font-bold text-slate-900 bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="p-6 flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Ruler size={20} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Measurement Unit</p>
                <input 
                  type="text" 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full text-lg font-bold text-slate-900 bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reminders Group */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Automations</label>
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-2xl text-red-500"><Bell size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Record Reminders</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Push Notification Alerts</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleToggleNotifications}
                className={`w-14 h-7 rounded-full transition-all relative ${notificationsEnabled ? 'bg-blue-600 shadow-inner' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 h-5 w-5 bg-white rounded-full shadow-sm transition-all ${notificationsEnabled ? 'left-8' : 'left-1'}`} />
              </button>
            </div>

            {notificationsEnabled && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <div className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-500"><Calendar size={20} /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Frequency</p>
                    <select 
                      value={notificationFrequency}
                      onChange={(e) => setNotificationFrequency(e.target.value as any)}
                      className="w-full text-sm font-bold text-slate-800 bg-transparent outline-none"
                    >
                      <option value="monthly">Every Month</option>
                      <option value="bi-monthly">Every 2nd Month</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-500"><Info size={20} /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Day of Month (1-28)</p>
                    <input 
                      type="number"
                      min="1"
                      max="28"
                      value={notificationDay}
                      onChange={(e) => setNotificationDay(parseInt(e.target.value) || 1)}
                      className="w-full text-sm font-bold text-slate-800 bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-500 shrink-0 self-start"><Info size={20} /></div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Your billing estimates are local only. <br/>Formula: <span className="text-slate-800 font-bold">Fixed + (Units × Rate)</span>.
              <br/><br/>
              Ensure browser notifications are enabled to receive recording alerts on your selected day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
