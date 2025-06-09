import React from "react";
import { useMemberContext } from "../../_common/context/MemberContext";
import { IGoal } from "../../_common/models/IGoal";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartJSTooltip,
    Legend as ChartJSLegend,
} from 'chart.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { CalorieTrackerService } from "../../_components/services/CalorieTrackerService";
import {useLanguage} from "../../_common/context/LanguageContext";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ChartJSTooltip,
    ChartJSLegend
);

const Dashboard = () => {
    const { member } = useMemberContext();
    const [latestGoal, setLatestGoal] = React.useState<IGoal | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [goalStats, setGoalStats] = React.useState<any>(null);
    const [calorieStats, setCalorieStats] = React.useState<any>(null);

    const { language, setLanguage, texts } = useLanguage();

    React.useEffect(() => {
        const fetchData = async () => {
            if (member) {
                try {
                    const today = new Date().toISOString().split("T")[0];
                    const goal = await CalorieTrackerService.getCurrentGoal(member.memberId, today);
                    setLatestGoal(goal);

                    setGoalStats({
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Workout Minutes',
                            data: [265, 259, 280, 381, 156, 355],
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        }]
                    });

                    setCalorieStats([
                        { name: 'Day 1', date: '2025-06-05', consumed: 1400 },
                        { name: 'Day 2', date: '2025-06-06', consumed: 1300 },
                        { name: 'Day 3', date: '2025-06-07', consumed: 1600 },
                        { name: 'Day 4', date: '2025-06-08', consumed: 1200 },
                        { name: 'Day 5', date: '2025-06-09', consumed: 1500 },
                    ]);
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [member]);

    if (loading) {
        return <div className="container mt-4">Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    <h3>{texts.lastGoal}</h3>
                </div>
                <div className="card-body">
                    {latestGoal ? (
                        <div>
                            <h4 className="card-title">{latestGoal.goalName}</h4>
                            <p className="card-text">
                                <strong>Datum:</strong> {new Date(latestGoal.date).toLocaleDateString()}
                            </p>
                            <p className="card-text">
                                <strong>{texts.calGoal}:</strong> {latestGoal.kcal} kcal
                            </p>
                        </div>
                    ) : (
                        <p>Kein Ziel gefunden.</p>
                    )}
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-primary text-white">
                            <h3>{texts.goalStatistics}</h3>
                        </div>
                        <div className="card-body">
                            {goalStats ? (
                                <Bar
                                    data={goalStats}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'top' },
                                            title: { display: true, text: 'Workout Minuten' }
                                        }
                                    }}
                                />
                            ) : (
                                <p>Keine Daten verfügbar</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-primary text-white">
                            <h3>{texts.calorieTracker}</h3>
                        </div>
                        <div className="card-body">
                            {calorieStats ? (
                                <LineChart
                                    width={500}
                                    height={300}
                                    data={calorieStats}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="consumed"
                                        name="Konsumierte Kalorien"
                                        stroke="#8884d8"
                                    />
                                    {latestGoal && (
                                        <ReferenceLine
                                            y={latestGoal.kcal}
                                            label="Ziel"
                                            stroke="red"
                                            strokeDasharray="3 3"
                                        />
                                    )}
                                </LineChart>
                            ) : (
                                <p>Keine Daten verfügbar</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;