import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { ICalorieHistoryItem } from '../../_common/models/ICalorieHistoryItem';
import axios from "axios";
import {IConsumedItem} from "../../_common/models/IConsumedItem";
import {ICalorieHistoryProps} from "../../_common/models/ICalorieHistoryProps";

const CalorieHistory: React.FC<ICalorieHistoryProps> = ({ goalId, currentGoal, setGoal }) => {
    const [history, setHistory] = React.useState<ICalorieHistoryItem[]>([]);
    const [consumedItems, setConsumedItems] = React.useState<IConsumedItem[]>([]);
    const [initialKcal, setInitialKcal] = React.useState<number>(0);

    React.useEffect(() => {
        const loadData = () => {
            const storedHistory = localStorage.getItem('calorieHistory');
            const storedConsumed = localStorage.getItem('consumedItems');

            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                const goalHistory = parsedHistory[goalId] || [];
                setHistory(goalHistory);

                const newInitialKcal = goalHistory.length > 0
                    ? goalHistory[0].initialKcal
                    : currentGoal?.kcal || 0;
                setInitialKcal(newInitialKcal);
            }

            if (storedConsumed) {
                const parsedConsumed = JSON.parse(storedConsumed);
                setConsumedItems(parsedConsumed[goalId] || []);
            }
        };

        loadData();
        const handleStorageChange = () => loadData();
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [goalId, currentGoal]);

    const removeConsumedItem = async (id: string) => {
        try {
            const removedItem = consumedItems.find(item => item.id === id);
            if (!removedItem || !currentGoal) return;

            const updatedItems = consumedItems.filter(item => item.id !== id);
            setConsumedItems(updatedItems);

            const allConsumed = JSON.parse(localStorage.getItem('consumedItems') || '{}');
            allConsumed[goalId] = updatedItems;
            localStorage.setItem('consumedItems', JSON.stringify(allConsumed));

            const storedHistory = JSON.parse(localStorage.getItem('calorieHistory') || '{}');
            const initialKcal = storedHistory[goalId]?.[0]?.initialKcal || currentGoal.kcal + removedItem.kcal;

            let runningTotal = 0;
            const newHistory = [{
                date: new Date().toISOString(),
                initialKcal: initialKcal,
                consumedKcal: 0,
                remainingKcal: initialKcal
            }];

            updatedItems
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .forEach(item => {
                    runningTotal += item.kcal;
                    newHistory.push({
                        date: item.date,
                        initialKcal,
                        consumedKcal: runningTotal,
                        remainingKcal: initialKcal - runningTotal
                    });
                });

            storedHistory[goalId] = newHistory;
            localStorage.setItem('calorieHistory', JSON.stringify(storedHistory));

            const newKcal = currentGoal.kcal + removedItem.kcal;
            const response = await axios.put(
                `http://localhost:8080/goal/${goalId}`,
                { kcal: newKcal },
                { headers: { 'Content-Type': 'application/json' } }
            );

            setGoal(response.data);

            window.dispatchEvent(new Event('storage'));
            alert(`✅ ${removedItem.kcal} kcal wieder hinzugefügt`);
        } catch (error) {
            console.error("Fehler beim Entfernen:", error);
            alert("❌ Fehler beim Entfernen des Eintrags");
        }
    };


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
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                <LineChart
                    width={800}
                    height={400}
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, (dataMax: number) => Math.max(dataMax, initialKcal) * 1.1 ]} />
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

            <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>🍽️ Gegessene Lebensmittel</h3>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {consumedItems.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Datum</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Produkt</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Gramm</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Kalorien</th>
                            <th style={{ padding: '10px', textAlign: 'center' }}>Aktion</th>
                        </tr>
                        </thead>
                        <tbody>
                        {consumedItems.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{new Date(item.date).toLocaleDateString()}</td>
                                <td style={{ padding: '10px' }}>{item.productName}</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>{item.grams}g</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>{item.kcal} kcal</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => removeConsumedItem(item.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ff4444',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            padding: '5px'
                                        }}
                                        title="Eintrag entfernen"
                                    >
                                        ❌
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: '#7f8c8d' }}>Noch keine Einträge vorhanden.</p>
                )}
            </div>
        </div>
    );
};

export default CalorieHistory;