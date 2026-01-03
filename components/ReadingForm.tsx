
import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import { WaterReading } from '../types';
import DatePicker from './DatePicker';

interface ReadingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<WaterReading, 'id' | 'consumption' | 'charge' | 'dateCreated'>) => void;
  lastReading: number;
  editingReading: WaterReading | null;
}

const ReadingForm: React.FC<ReadingFormProps> = ({ isOpen, onClose, onSubmit, lastReading, editingReading }) => {
  const [dateValue, setDateValue] = useState('');
  const [previous, setPrevious] = useState<string>('');
  const [current, setCurrent] = useState<string>('');

  useEffect(() => {
    if (editingReading) {
      const [mon, year] = editingReading.month.split(' ');
      const monthMap: { [key: string]: string } = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
      };
      const monthNum = monthMap[mon] || '01';
      setDateValue(`${year}-${monthNum}-01`);
      setPrevious(editingReading.previousValue.toString());
      setCurrent(editingReading.currentValue.toString());
    } else {
      const now = new Date();
      setDateValue(now.toISOString().split('T')[0]);
      setPrevious(lastReading > 0 ? lastReading.toString() : '');
      setCurrent('');
    }
  }, [editingReading, lastReading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prevNum = parseFloat(previous) || 0;
    const currNum = parseFloat(current) || 0;

    if (currNum < prevNum) {
      alert("Note: The current reading must be equal to or higher than the previous reading.");
      return;
    }

    const dateObj = new Date(dateValue);
    const formattedMonth = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });

    onSubmit({
      month: formattedMonth,
      previousValue: prevNum,
      currentValue: currNum,
    });
  };

  const consumption = (parseFloat(current) || 0) - (parseFloat(previous) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/30 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in slide-in-from-bottom-6 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/20">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-slate-800 leading-none mb-1">
              {editingReading ? 'Update Entry' : 'Log New Reading'}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Meter Records System</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-visible">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Billing Date</label>
            <DatePicker value={dateValue} onChange={setDateValue} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Previous Value</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={previous}
                onChange={(e) => setPrevious(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/30 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm placeholder:text-slate-300"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Value</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/30 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm placeholder:text-slate-300"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 border border-slate-50">
              <Calculator size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Consumption Result</span>
              <span className="text-base font-bold text-slate-800">
                {consumption.toFixed(2)} <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Units</span>
              </span>
            </div>
          </div>

          <div className="pt-4 flex gap-3 pb-4 sm:pb-0">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3.5 border border-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black shadow-md transition-all active:scale-[0.98] text-xs uppercase tracking-widest"
            >
              {editingReading ? 'Save Changes' : 'Confirm Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReadingForm;
