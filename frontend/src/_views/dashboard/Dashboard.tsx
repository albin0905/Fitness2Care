import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
    year: string;
    value: number;
}

interface ChartCardProps {
    title: string;
    data: ChartData[];
}

const data: ChartData[] = [
    { year: "2020", value: 40 },
    { year: "2021", value: 35 },
    { year: "2022", value: 20 },
    { year: "2023", value: 15 },
    { year: "2024", value: 12 },
    { year: "2025", value: 10 },
    { year: "2026", value: 8 },
    { year: "2027", value: 5 },
];

const Dashboard = () => {
    return (
        <div className="container mt-4">
            <h1 className="fw-bold text-dark">Dashboard</h1>
            <div className="row mt-4">
                <ChartCard title="Gewichtsverlust" data={data} />
                <ChartCard title="Absolvierte Workouts" data={data} />
                <ChartCard title="Wasserzufuhr" data={data} />
                <ChartCard title="Verbrannte Kalorien" data={data} />
            </div>
        </div>
    );
};

const ChartCard: React.FC<ChartCardProps> = ({ title, data }) => {
    return (
        <div className="col-md-6 mb-4">
            <div className="card shadow p-3 bg-white">
                <div className="card-header text-center fw-bold" style={{ backgroundColor: "#dfcfcf" }}>
                    {title}
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#17a2b8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
