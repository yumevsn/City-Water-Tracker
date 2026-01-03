
import React from 'react';
import { Trash2, Edit2, ChevronRight } from 'lucide-react';
import { WaterReading } from '../types';

interface HistoryTableProps {
  readings: WaterReading[];
  currency: string;
  unit: string;
  onDelete: (id: string) => void;
  onEdit: (reading: WaterReading) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ readings, currency, unit, onDelete, onEdit }) => {
  if (readings.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-400 font-medium">No records found. Start by adding a new meter reading.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
            <th className="px-8 py-5">Month / Period</th>
            <th className="px-8 py-5">Previous</th>
            <th className="px-8 py-5">Current</th>
            <th className="px-8 py-5">Consumption</th>
            <th className="px-8 py-5">Bill ({currency})</th>
            <th className="px-8 py-5 text-right no-print">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {readings.map((reading) => (
            <tr key={reading.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-8 py-6">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm">{reading.month}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Record Entry</span>
                </div>
              </td>
              <td className="px-8 py-6 text-slate-500 text-sm font-medium">
                {reading.previousValue.toLocaleString()}
              </td>
              <td className="px-8 py-6 font-bold text-slate-700 text-sm">
                {reading.currentValue.toLocaleString()}
              </td>
              <td className="px-8 py-6">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-xs">
                  +{reading.consumption.toLocaleString()} {unit}
                </span>
              </td>
              <td className="px-8 py-6 font-black text-slate-900 text-sm">
                {currency}{reading.charge.toFixed(2)}
              </td>
              <td className="px-8 py-6 text-right no-print">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(reading)}
                    className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                    title="Edit Record"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(reading.id)}
                    className="p-2 bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                    title="Delete Record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
