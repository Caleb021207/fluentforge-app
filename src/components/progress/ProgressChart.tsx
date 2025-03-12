
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressData {
  date: string;
  reading?: number;
  writing?: number;
  speaking?: number;
  listening?: number;
}

interface ProgressChartProps {
  progressData: ProgressData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{`Date: ${label}`}</p>
        {payload.map((entry: any) => (
          entry.value !== undefined && entry.value > 0 && (
            <p key={entry.name} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}%`}
            </p>
          )
        ))}
      </div>
    );
  }
  return null;
};

const ProgressChart = ({ progressData }: ProgressChartProps) => {
  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={progressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="reading" 
            stroke="#2563eb" 
            name="Reading" 
            connectNulls={true} 
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="writing" 
            stroke="#16a34a" 
            name="Writing" 
            connectNulls={true} 
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="speaking" 
            stroke="#dc2626" 
            name="Speaking" 
            connectNulls={true} 
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="listening" 
            stroke="#9333ea" 
            name="Listening" 
            connectNulls={true} 
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
