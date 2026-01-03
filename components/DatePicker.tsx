
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format to YYYY-MM-DD local time
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const date = String(newDate.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${date}`);
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === viewDate.getMonth() &&
           selectedDate.getFullYear() === viewDate.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === viewDate.getMonth() &&
           today.getFullYear() === viewDate.getFullYear();
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    // Fill empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    // Fill days
    for (let d = 1; d <= totalDays; d++) {
      days.push(
        <button
          key={d}
          type="button"
          onClick={() => handleDateSelect(d)}
          className={`h-9 w-9 flex items-center justify-center rounded-lg text-xs font-medium transition-all
            ${isSelected(d) 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
              : 'hover:bg-slate-100 text-slate-600'
            }
            ${isToday(d) && !isSelected(d) ? 'text-blue-600 font-bold border border-blue-100' : ''}
          `}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  const formattedDisplay = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 hover:bg-white hover:border-blue-400 transition-all text-sm group"
      >
        <CalendarIcon size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        <span className="flex-1 text-left font-medium">
          {value ? formattedDisplay : 'Select a date'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-[280px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[60] p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-9 w-9 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                onChange(today);
                setIsOpen(false);
              }}
              className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
