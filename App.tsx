
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplets, 
  History, 
  LineChart as ChartIcon, 
  Settings as SettingsIcon, 
  Plus, 
  Filter,
  TrendingUp,
  CreditCard,
  ChevronRight,
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  FileDown,
  FileText,
  Download,
  CalendarDays
} from 'lucide-react';
import { WaterReading, AppSettings, TabType } from './types';
import UsageChart from './components/UsageChart';
import ReadingForm from './components/ReadingForm';
import SettingsView from './components/SettingsView';
import HistoryTable from './components/HistoryTable';

const STORAGE_KEY = 'water_tracker_readings_v2';
const SETTINGS_KEY = 'water_tracker_settings_v3';

const App: React.FC = () => {
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    fixedCharge: 50,
    ratePerUnit: 0.69,
    currency: '$',
    unit: 'Units',
    notificationsEnabled: false,
    notificationFrequency: 'monthly',
    notificationDay: 1
  });
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<WaterReading | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  useEffect(() => {
    if (settings.notificationsEnabled && readings.length > 0) {
      const checkReminders = async () => {
        const lastReading = readings[0];
        const lastDate = new Date(lastReading.dateCreated);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        const threshold = settings.notificationFrequency === 'bi-monthly' ? 56 : 28;

        if (diffDays >= threshold && today.getDate() >= settings.notificationDay) {
          if (Notification.permission === 'granted') {
            new Notification('Water Meter Reminder', {
              body: `It's time to record your water reading!`,
              icon: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png'
            });
          }
        }
      };
      checkReminders();
    }
  }, [settings, readings]);

  const years = useMemo(() => {
    const yearsSet = new Set<string>();
    readings.forEach(r => {
      const parts = r.month.split(' ');
      if (parts[1]) yearsSet.add(parts[1]);
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [readings]);

  const sortedReadings = useMemo(() => {
    return [...readings].sort((a, b) => b.dateCreated - a.dateCreated);
  }, [readings]);

  const filteredReadings = useMemo(() => {
    return selectedYear === 'All' ? sortedReadings : sortedReadings.filter(r => r.month.includes(selectedYear));
  }, [sortedReadings, selectedYear]);

  const stats = useMemo(() => {
    if (filteredReadings.length === 0) return { avgConsumption: 0, lastBill: 0, totalReadings: 0, totalCost: 0, totalConsumption: 0 };
    const totalConsumption = filteredReadings.reduce((acc, r) => acc + r.consumption, 0);
    const totalCost = filteredReadings.reduce((acc, r) => acc + r.charge, 0);
    const lastBill = filteredReadings[0]?.charge || 0;
    const avgConsumption = totalConsumption / filteredReadings.length;
    return { avgConsumption, lastBill, totalReadings: filteredReadings.length, totalCost, totalConsumption };
  }, [filteredReadings]);

  const handleAddReading = (data: Omit<WaterReading, 'id' | 'consumption' | 'charge' | 'dateCreated'>) => {
    const consumption = data.currentValue - data.previousValue;
    const charge = settings.fixedCharge + (consumption * settings.ratePerUnit);
    
    if (editingReading) {
      setReadings(prev => prev.map(r => r.id === editingReading.id ? {
        ...r, ...data, consumption, charge
      } : r));
      setEditingReading(null);
    } else {
      const newReading: WaterReading = {
        id: crypto.randomUUID(), ...data, consumption, charge, dateCreated: Date.now()
      };
      setReadings(prev => [...prev, newReading]);
    }
    setIsFormOpen(false);
  };

  const handleDeleteReading = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setReadings(prev => prev.filter(r => r.id !== id));
      setIsFormOpen(false);
      setEditingReading(null);
    }
  };

  const handleEditReading = (reading: WaterReading) => {
    setEditingReading(reading);
    setIsFormOpen(true);
  };

  const handleExportCSV = () => {
    if (filteredReadings.length === 0) return alert("No data to export.");
    const headers = ['Month', 'Previous Reading', 'Current Reading', 'Consumption', 'Charge'];
    const rows = filteredReadings.map(r => [
      r.month,
      r.previousValue,
      r.currentValue,
      r.consumption,
      r.charge.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `water_readings_${selectedYear.toLowerCase().replace(' ', '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const navItems = [
    { id: 'history', label: 'History', icon: History },
    { id: 'insights', label: 'Trends', icon: ChartIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar - Tablet & Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 lg:static lg:block no-print
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <Droplets size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Water<span className="text-blue-600">Meter</span></span>
            <button className="lg:hidden ml-auto p-2" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-semibold transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-100">
             <button onClick={() => setIsFormOpen(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg shadow-slate-200">
               <Plus size={18} /> New Entry
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Print Header */}
        <div className="print-only p-10 bg-white border-b-2 border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Droplets size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold">Water Consumption Report</h1>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Report Date</p>
              <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Period Filter</p>
              <p className="text-lg font-bold text-slate-800">{selectedYear}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Consumption</p>
              <p className="text-lg font-bold text-blue-600">{stats.totalConsumption.toLocaleString()} {settings.unit}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Estimated Bill</p>
              <p className="text-lg font-bold text-slate-800">{settings.currency}{stats.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Top Header - UI Only */}
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between border-b border-slate-100 no-print">
          <button className="lg:hidden p-2 -ml-2 text-slate-600" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <h2 className="hidden lg:block text-lg font-bold text-slate-800 capitalize">{activeTab}</h2>
          <div className="lg:hidden flex items-center gap-2">
             <Droplets size={20} className="text-blue-600" />
             <span className="font-bold text-slate-900">WaterMeter</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 relative">
              <Bell size={18} />
              {settings.notificationsEnabled && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar pb-32 lg:pb-8">
          {activeTab === 'history' && (
            <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500">
              
              {/* Toolbar Area */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 no-print">
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 px-1">
                    <CalendarDays size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter By Year</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <button 
                      onClick={() => setSelectedYear('All')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border
                        ${selectedYear === 'All' 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-blue-100' 
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                      All Data
                    </button>
                    {years.map(y => (
                      <button 
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border
                          ${selectedYear === y 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-blue-100' 
                            : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                          }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end">
                  <button 
                    onClick={handleExportCSV}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Download size={14} /> CSV
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <FileText size={14} /> PDF
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 no-print">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <TrendingUp size={20} className="text-blue-500 mb-4" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Consumption</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.avgConsumption.toFixed(1)} <span className="text-xs font-normal text-slate-400">{settings.unit}</span></p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <CreditCard size={20} className="text-emerald-500 mb-4" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Latest Bill</p>
                    <p className="text-2xl font-bold text-slate-900">{settings.currency}{stats.lastBill.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <History size={20} className="text-indigo-500 mb-4" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Logs</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalReadings}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <CreditCard size={20} className="text-amber-500 mb-4" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-slate-900">{settings.currency}{stats.totalCost.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              {/* Data Display - Desktop: Table, Mobile: Cards */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="hidden sm:block">
                  <HistoryTable 
                    readings={filteredReadings} 
                    currency={settings.currency} 
                    unit={settings.unit} 
                    onDelete={handleDeleteReading}
                    onEdit={handleEditReading}
                  />
                </div>
                <div className="sm:hidden divide-y divide-slate-50 no-print">
                   {filteredReadings.length > 0 ? filteredReadings.map(reading => (
                     <div key={reading.id} onClick={() => handleEditReading(reading)} className="p-5 active:bg-slate-50 transition-colors flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">{reading.month}</p>
                          <p className="text-xs text-slate-500 font-medium">Reading: {reading.currentValue}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">+{reading.consumption} {settings.unit}</p>
                          <p className="text-xs font-bold text-slate-400">{settings.currency}{reading.charge.toFixed(2)}</p>
                        </div>
                     </div>
                   )) : (
                     <div className="p-10 text-center text-slate-400 text-sm">No records found.</div>
                   )}
                </div>
                {/* Print Only Table for Mobile when printing */}
                <div className="hidden print:block">
                  <HistoryTable 
                    readings={filteredReadings} 
                    currency={settings.currency} 
                    unit={settings.unit} 
                    onDelete={handleDeleteReading}
                    onEdit={handleEditReading}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500 no-print">
               <div className="bg-white p-6 lg:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                   <div>
                     <h2 className="text-xl font-bold text-slate-900">Consumption Trends</h2>
                     <p className="text-sm text-slate-500">Visualizing your water usage over time</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-xs font-semibold text-slate-500">Usage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-slate-500">Cost</span>
                      </div>
                   </div>
                 </div>
                 <UsageChart readings={readings} currency={settings.currency} unit={settings.unit} />
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto animate-in fade-in duration-500 no-print">
              <SettingsView settings={settings} onSave={setSettings} />
            </div>
          )}
        </div>

        {/* Floating Action Button - Mobile Only */}
        <div className="lg:hidden fixed bottom-24 right-6 z-50 no-print">
          <button 
            onClick={() => { setEditingReading(null); setIsFormOpen(true); }}
            className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 h-20 px-8 flex items-center justify-between z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] no-print">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'stroke-[2.5]' : ''} />
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* Global Form Modal */}
      {isFormOpen && (
        <ReadingForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleAddReading}
          onDelete={editingReading ? () => handleDeleteReading(editingReading.id) : undefined}
          lastReading={readings.length > 0 ? readings[0].currentValue : 0}
          editingReading={editingReading}
        />
      )}
    </div>
  );
};

export default App;
