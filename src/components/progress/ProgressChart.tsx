
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocalization } from "@/context/LocalizationContext";

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
  const { t } = useLocalization();
  
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{`Date: ${label}`}</p>
        {payload.map((entry: any) => (
          entry.value !== undefined && entry.value > 0 && (
            <p key={entry.name} style={{ color: entry.color }}>
              {`${entry.dataKey === "reading" ? t("reading") : 
                 entry.dataKey === "writing" ? t("writing") : 
                 entry.dataKey === "speaking" ? t("speaking") : 
                 entry.dataKey === "listening" ? t("listening") : entry.name}: ${entry.value}%`}
            </p>
          )
        ))}
      </div>
    );
  }
  return null;
};

const ProgressChart = ({ progressData }: ProgressChartProps) => {
  const { t, currentLanguage } = useLocalization();
  
  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={progressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => {
              switch(value) {
                case "reading": return t("reading");
                case "writing": return t("writing");
                case "speaking": return t("speaking");
                case "listening": return t("listening");
                default: return value;
              }
            }}
          />
          <Line 
            type="monotone" 
            dataKey="reading" 
            stroke="#2563eb" 
            name={t("reading")}
            connectNulls={true} 
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="writing" 
            stroke="#16a34a" 
            name={t("writing")}
            connectNulls={true} 
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="speaking" 
            stroke="#dc2626" 
            name={t("speaking")}
            connectNulls={true} 
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="listening" 
            stroke="#9333ea" 
            name={t("listening")}
            connectNulls={true} 
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
