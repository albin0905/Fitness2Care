import React, { useEffect, useState } from "react";
import "./Goal.css";
import { useMemberContext } from "../../_common/context/MemberContext";
import { IGoal } from "../../_common/models/IGoal";
import axios from "axios";

const Goal = () => {
    const { member } = useMemberContext();
    const [goals, setGoals] = useState<IGoal[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<IGoal | null>(null);
    const [workouts, setWorkouts] = useState<IWorkout[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showWorkoutSelection, setShowWorkoutSelection] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const fetchData = async () => {
        if (member) {
            try {
                const [goalsRes, workoutsRes] = await Promise.all([
                    axios.get(`http://localhost:8080/goal/goals/${member.memberId}`),
                    axios.get("http://localhost:8080/workout/workouts")
                ]);

                setGoals(goalsRes.data);
                setWorkouts(workoutsRes.data);
            } catch (err) {
                setError("Failed to load data. Please try again later.");
                console.error("Data load error:", err);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [member]);

    const handleSelectWorkout = async (workout: IWorkout) => {
        if (!selectedGoal || !member) return;

        try {
            const [goalResponse, goalsResponse] = await Promise.all([
                axios.get(`http://localhost:8080/goal/goal/id/${selectedGoal.goalId}`),
                axios.get(`http://localhost:8080/goal/goals/${member.memberId}`)
            ]);

            setSelectedGoal(goalResponse.data);
            setGoals(goalsResponse.data);
            setSuccessMessage(true);
            setShowWorkoutSelection(false);
            setError(null);
        } catch (err: any) {
            console.error("Error details:", err);
            setError(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleCreateNewGoal = () => {
        console.log("Neues Ziel erstellen");
    };

    const calculateTotalCalories = (exercises: IExercise[] = []) =>
        exercises.reduce((sum, ex) => sum + (ex.kcal || 0), 0);

    if (!member) {
        return <div>Bitte zuerst einloggen.</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Meine Ziele</h2>
            {error && <p className="text-danger">{error}</p>}

            <div className="row">
                {/* Ziel-Liste */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <span>Meine Ziele</span>
                            <button className="btn btn-primary btn-sm" onClick={handleCreateNewGoal}>
                                Neues Ziel
                            </button>
                        </div>
                        <div className="card-body">
                            {goals.length === 0 ? (
                                <p>Keine Ziele gefunden.</p>
                            ) : (
                                <ul className="list-group">
                                    {goals.map((goal) => (
                                        <li
                                            key={goal.goalId}
                                            className={`list-group-item ${selectedGoal?.goalId === goal.goalId ? "active" : ""}`}
                                            onClick={() => {
                                                setSelectedGoal(goal);
                                                setShowWorkoutSelection(false);
                                                setSuccessMessage(false);
                                            }}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <h5>{goal.goalName}</h5>
                                            <p>Datum: {new Date(goal.date).toLocaleDateString()}</p>
                                            <p>Kalorienziel: {goal.kcal} kcal</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ziel-Details */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header">
                            {selectedGoal
                                ? `Workouts für ${selectedGoal.goalName}`
                                : "Workouts auswählen"}
                        </div>
                        <div className="card-body">
                            {successMessage ? (
                                <div className="text-center">
                                    <p className="text-success">Erfolgreich eingefügt!</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setSuccessMessage(false)}
                                    >
                                        OK
                                    </button>
                                </div>
                            ) : selectedGoal ? (
                                <>
                                    <h5>Zugeordnete Workouts:</h5>
                                    {selectedGoal.workouts && selectedGoal.workouts.length > 0 ? (
                                        <table className="table table-bordered table-striped">
                                            <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Dauer (Minuten)</th>
                                                <th>Kalorien</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {selectedGoal.workouts.map((workout) => (
                                                <tr key={workout.workoutId}>
                                                    <td>{workout.workoutName}</td>
                                                    <td>{workout.time}</td>
                                                    <td>{calculateTotalCalories(workout.exercises)} kcal</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p>Keine Workouts zugeordnet.</p>
                                    )}

                                    <button
                                        className="btn btn-secondary mt-3"
                                        onClick={() => setShowWorkoutSelection(true)}
                                    >
                                        Workout auswählen
                                    </button>

                                    {showWorkoutSelection && (
                                        <>
                                            <h5 className="mt-4">Verfügbare Workouts:</h5>
                                            <table className="table table-hover">
                                                <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Dauer (Minuten)</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {workouts.map((workout) => (
                                                    <tr
                                                        key={workout.workoutId}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => handleSelectWorkout(workout)}
                                                    >
                                                        <td>{workout.workoutName}</td>
                                                        <td>{workout.time}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="text-center">
                                    <p>Bitte wählen Sie ein Ziel aus oder erstellen Sie ein neues.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Goal;