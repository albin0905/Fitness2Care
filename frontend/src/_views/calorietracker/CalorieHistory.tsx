import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { ICalorieHistoryItem } from './CalorieTracker';

interface CalorieHistoryProps {
    goalId: number;
}

const CalorieHistory: React.FC<CalorieHistoryProps> = ({ goalId }) => {
    const [history, setHistory] = React.useState<ICalorieHistoryItem[]>([]);
    const [initialKcal, setInitialKcal] = React.useState<number>(0);

    React.useEffect(() => {
        const loadHistory = () => {
            const storedHistory = localStorage.getItem('calorieHistory');
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                const goalHistory = parsedHistory[goalId] || [];
                setHistory(goalHistory);

                if (goalHistory.length > 0) {
                    setInitialKcal(goalHistory[0].initialKcal);
                }
            }
        };

        loadHistory();

        const handleStorageChange = () => loadHistory();
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [goalId]);

    if (history.length === 0) {
        return <div style={{ marginTop: '20px', color: '#7f8c8d' }}>Noch keine Verlaufsdaten verfügbar.</div>;
    }

    const chartData = history.map((entry, index) => ({
        name: `Tag ${index + 1}`,
        date: new Date(entry.date).toLocaleDateString(),
        consumed: entry.consumedKcal,
    }));

    return (
        <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>📊 Kalorienverlauf</h3>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <LineChart
                    width={800}
                    height={400}
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        label={{ value: 'Datum', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis
                        label={{ value: 'Kalorien (kcal)', angle: -90, position: 'insideLeft' }}
                        domain={[0, initialKcal * 1.1]} // 10% über dem Limit für bessere Darstellung
                    />
                    <Tooltip
                        formatter={(value: number) => [`${value} kcal`, 'Konsumiert']}
                        labelFormatter={(label) => `Datum: ${label}`}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="consumed"
                        name="Konsumierte Kalorien"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <ReferenceLine
                        y={initialKcal}
                        label={{ value: 'Tageslimit', position: 'top' }}
                        stroke="red"
                        strokeDasharray="3 3"
                    />
                </LineChart>
            </div>
        </div>
    );
};

export default CalorieHistory;