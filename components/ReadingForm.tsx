
import React, { useState, useEffect } from 'react';
import { X, Calculator, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { WaterReading } from '../types';
import DatePicker from './DatePicker';

interface ReadingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<WaterReading, 'id' | 'consumption' | 'charge' | 'dateCreated'>) => void;
  onDelete?: () => void;
  lastReading: number;
  editingReading: WaterReading | null;
}

const ReadingForm: React.FC<ReadingFormProps> = ({ isOpen, onClose, onSubmit, onDelete, lastReading, editingReading }) => {
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
      alert("Current reading cannot be less than previous.");
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

  const consumption = Math.max(0, (parseFloat(current) || 0) - (parseFloat(previous) || 0));

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 p-0 sm:p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-500 ease-out"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
      >
        <div className="sm:hidden h-1.5 w-12 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />
        
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-900">
              {editingReading ? 'Update Entry' : 'Log Reading'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meter Records Management</p>
          </div>
          <div className="flex gap-2">
            {editingReading && onDelete && (
              <button 
                type="button"
                onClick={onDelete}
                className="p-2.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button type="button" onClick={onClose} className="p-2.5 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Recording Date</label>
            <DatePicker value={dateValue} onChange={setDateValue} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Previous Meter Value</label>
              <input 
                type="number" 
                inputMode="decimal"
                step="0.01"
                placeholder="0.00"
                value={previous}
                onChange={(e) => setPrevious(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Meter Value</label>
              <input 
                type="number" 
                inputMode="decimal"
                step="0.01"
                placeholder="0.00"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-base"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50/50 p-5 rounded-[2rem] flex items-center justify-between border border-blue-100/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                <Calculator size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Consumption</p>
                <p className="text-sm font-bold text-slate-600">Calculated Results</p>
              </div>
            </div>
            <span className="text-2xl font-black text-slate-900">{consumption.toFixed(2)} <span className="text-xs font-normal text-slate-500 uppercase tracking-tighter">Units</span></span>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white font-bold rounded-[1.5rem] shadow-xl shadow-slate-200 hover:bg-black active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
          >
            {editingReading ? 'Save Changes' : 'Confirm & Log'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReadingForm;
