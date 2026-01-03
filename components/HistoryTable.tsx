
import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { WaterReading } from '../types';

interface HistoryTableProps {
  readings: WaterReading[];
  currency: string;
  unit: string;
  onDelete: (id: string) => void;
  onEdit: (reading: WaterReading) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ readings, currency, unit, onDelete, onEdit }) => {
  if (readings.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
            <th className="px-6 py-4">Month</th>
            <th className="px-6 py-4">Prev Reading</th>
            <th className="px-6 py-4">New Reading</th>
            <th className="px-6 py-4">Usage</th>
            <th className="px-6 py-4">Est. Charge</th>
            <th className="px-6 py-4 text-right no-print">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {[...readings].reverse().map((reading) => (
            <tr key={reading.id} className="hover:bg-slate-50/30 transition-colors group">
              <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
                {reading.month}
              </td>
              <td className="px-6 py-4 text-slate-500 text-sm">
                {reading.previousValue.toLocaleString()}
              </td>
              <td className="px-6 py-4 font-medium text-slate-700 text-sm">
                {reading.currentValue.toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <span className="text-blue-600 font-semibold text-sm">
                  {reading.consumption.toLocaleString()} {unit}
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                {currency}{reading.charge.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right no-print">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(reading)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(reading.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
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
