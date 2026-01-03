
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell,
  Line,
  ComposedChart
} from 'recharts';
import { WaterReading } from '../types';

interface UsageChartProps {
  readings: WaterReading[];
  currency: string;
  unit: string;
}

const UsageChart: React.FC<UsageChartProps> = ({ readings, currency, unit }) => {
  if (readings.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 italic">
        Not enough data to display insights.
      </div>
    );
  }

  // Formatting data for chart
  const data = readings.slice(-12); // Show last 12 months max

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              padding: '12px'
            }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <Bar 
            yAxisId="left"
            dataKey="consumption" 
            name={`Usage (${unit})`} 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
            barSize={32}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="charge" 
            name={`Cost (${currency})`} 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;
