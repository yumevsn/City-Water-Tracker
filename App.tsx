
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplets, 
  History, 
  LineChart as ChartIcon, 
  Settings as SettingsIcon, 
  Plus, 
  FileDown, 
  Trash2, 
  Edit2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Calendar,
  Filter,
  FileText,
  Table as TableIcon
} from 'lucide-react';
import { WaterReading, AppSettings, TabType } from './types';
import HistoryTable from './components/HistoryTable';
import UsageChart from './components/UsageChart';
import ReadingForm from './components/ReadingForm';
import SettingsView from './components/SettingsView';

const STORAGE_KEY = 'water_tracker_readings';
const SETTINGS_KEY = 'water_tracker_settings';

const App: React.FC = () => {
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    fixedCharge: 50,
    ratePerUnit: 0.69,
    currency: '$',
    unit: 'Units'
  });
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<WaterReading | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const savedReadings = localStorage.getItem(STORAGE_KEY);
    if (savedReadings) setReadings(JSON.parse(savedReadings));

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  }, [readings]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const years = useMemo(() => {
    const yearsSet = new Set<string>();
    readings.forEach(r => {
      const parts = r.month.split(' ');
      if (parts[1]) yearsSet.add(parts[1]);
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [readings]);

  const filteredReadings = useMemo(() => {
    if (selectedYear === 'All') return readings;
    return readings.filter(r => r.month.includes(selectedYear));
  }, [readings, selectedYear]);

  const stats = useMemo(() => {
    if (filteredReadings.length === 0) return { totalConsumption: 0, lastBill: 0, avgConsumption: 0 };
    const totalConsumption = filteredReadings.reduce((acc, r) => acc + r.consumption, 0);
    const lastBill = filteredReadings[filteredReadings.length - 1].charge;
    const avgConsumption = totalConsumption / filteredReadings.length;
    return { totalConsumption, lastBill, avgConsumption };
  }, [filteredReadings]);

  const handleAddReading = (data: Omit<WaterReading, 'id' | 'consumption' | 'charge' | 'dateCreated'>) => {
    const consumption = data.currentValue - data.previousValue;
    const charge = settings.fixedCharge + (consumption * settings.ratePerUnit);
    
    if (editingReading) {
      setReadings(prev => prev.map(r => r.id === editingReading.id ? {
        ...r,
        ...data,
        consumption,
        charge
      } : r));
      setEditingReading(null);
    } else {
      const newReading: WaterReading = {
        id: crypto.randomUUID(),
        ...data,
        consumption,
        charge,
        dateCreated: Date.now()
      };
      setReadings(prev => [...prev, newReading].sort((a, b) => a.dateCreated - b.dateCreated));
    }
    setIsFormOpen(false);
  };

  // Fix: Added missing handleDeleteReading function
  const handleDeleteReading = (id: string) => {
    if (window.confirm('Are you sure you want to delete this reading?')) {
      setReadings(prev => prev.filter(r => r.id !== id));
    }
  };

  // Fix: Added missing handleEditReading function
  const handleEditReading = (reading: WaterReading) => {
    setEditingReading(reading);
    setIsFormOpen(true);
  };

  const exportCSV = () => {
    const headers = ['Month', 'Previous Reading', 'Current Reading', 'Consumption', 'Bill'];
    const rows = filteredReadings.map(r => [
      r.month,
      r.previousValue,
      r.currentValue,
      r.consumption,
      `${settings.currency}${r.charge.toFixed(2)}`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `water_readings_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-50 selection:text-blue-600">
      {/* Print only Header */}
      <div className="print-only p-8 text-center border-b mb-8">
        <h1 className="text-2xl font-bold">City Water Consumption Report</h1>
        <p className="text-slate-500">Year: {selectedYear} | Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 transition-all no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="bg-blue-600/10 p-2.5 rounded-2xl transition-transform group-hover:rotate-3">
              <Droplets className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">
                City <span className="text-blue-600 font-medium">Water</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden xs:block">Utility Dashboard</span>
            </div>
          </div>

          <button 
            onClick={() => { setEditingReading(null); setIsFormOpen(true); }}
            className="group flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Reading</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-10 no-print">
        <div className="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-100">
            <div className="flex items-center gap-2.5 mb-3 text-slate-400">
              <TrendingUp size={16} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Avg Usage</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {stats.avgConsumption.toFixed(1)} 
              <span className="ml-1 text-[10px] font-bold text-slate-400 uppercase">{settings.unit}</span>
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-emerald-100">
            <div className="flex items-center gap-2.5 mb-3 text-slate-400">
              <CreditCard size={16} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Latest Bill</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {settings.currency}{stats.lastBill.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-100">
            <div className="flex items-center gap-2.5 mb-3 text-slate-400">
              <Calendar size={16} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Logged Periods</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {filteredReadings.length} 
              <span className="ml-1 text-[10px] font-bold text-slate-400 uppercase">Months</span>
            </p>
          </div>
        </div>

        <div className="tabs-nav flex bg-slate-200/50 p-1 rounded-xl mb-8 w-full sm:w-fit overflow-x-auto scrollbar-hide border border-slate-200/30">
          <button onClick={() => setActiveTab('history')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <History size={16} /> History
          </button>
          <button onClick={() => setActiveTab('insights')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'insights' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <ChartIcon size={16} /> Insights
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <SettingsIcon size={16} /> Settings
          </button>
        </div>

        <div className="w-full">
          {activeTab === 'history' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-500 bg-white border px-3 py-1.5 rounded-lg text-xs font-medium">
                    <Filter size={14} />
                    <span>Filter Year</span>
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="bg-transparent font-bold text-slate-800 outline-none focus:ring-0"
                    >
                      <option value="All">All Years</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FileDown size={14} />
                    Export Data
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-2">
                      <button onClick={exportCSV} className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                        <TableIcon size={14} /> Export as CSV
                      </button>
                      <button onClick={exportPDF} className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                        <FileText size={14} /> Download PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col table-container">
                <HistoryTable readings={filteredReadings} currency={settings.currency} unit={settings.unit} onDelete={handleDeleteReading} onEdit={handleEditReading} />
                {filteredReadings.length === 0 && (
                  <div className="py-24 flex flex-col items-center justify-center text-slate-400 px-8 text-center">
                    <AlertCircle size={40} className="stroke-1 text-slate-200 mb-4" />
                    <h3 className="text-sm font-bold text-slate-800 mb-1">No Readings Found</h3>
                    <p className="text-xs text-slate-400 max-w-[240px]">We couldn't find any readings for the selected filter.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
              <div className="mb-8">
                <h2 className="font-bold text-slate-800 text-base mb-1">Usage Trends</h2>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Showing data for {selectedYear === 'All' ? 'All History' : selectedYear}</p>
              </div>
              <div className="w-full h-[400px]">
                <UsageChart readings={filteredReadings} currency={settings.currency} unit={settings.unit} />
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && <SettingsView settings={settings} onSave={setSettings} />}
        </div>
      </main>

      {/* Shared table for printing only */}
      <div className="print-only">
        <HistoryTable readings={filteredReadings} currency={settings.currency} unit={settings.unit} onDelete={() => {}} onEdit={() => {}} />
      </div>

      <footer className="py-12 px-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] no-print">
        &copy; {new Date().getFullYear()} City Council Water System &bull; Offline Storage Enabled
      </footer>

      {isFormOpen && (
        <ReadingForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleAddReading}
          lastReading={readings.length > 0 ? readings[readings.length - 1].currentValue : 0}
          editingReading={editingReading}
        />
      )}
    </div>
  );
};

export default App;
