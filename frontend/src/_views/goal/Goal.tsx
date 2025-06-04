import React, { useEffect, useState } from "react";
import "./Goal.css";
import { useMemberContext } from "../../_common/context/MemberContext";
import { GoalService } from "../../_components/services/GoalService";
import {IGoal} from "../../_common/models/IGoal";

const Goal = () => {
    const { member } = useMemberContext();
    const [goals, setGoals] = useState<IGoal[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<IGoal | null>(null);
    const [workouts, setWorkouts] = useState<IWorkout[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showWorkoutSelection, setShowWorkoutSelection] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ goalName: "", kcal: 0, date: "" });
    const [editGoal, setEditGoal] = useState<IGoal | null>(null);

    const fetchData = async () => {
        if (member) {
            try {
                const [goalsRes, workoutsRes] = await Promise.all([
                    GoalService.getGoalsByMemberId(member.memberId),
                    GoalService.getAllWorkouts()
                ]);
                setGoals(goalsRes);
                setWorkouts(workoutsRes);
            } catch (err) {
                setError("Fehler beim Laden der Daten.");
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [member]);

    const handleSelectWorkout = async (workout: IWorkout) => {
        if (!selectedGoal || !member) return;

        try {
            const updatedGoal = await GoalService.addWorkoutToGoal(
                selectedGoal.goalId,
                workout.workoutId
            );

            setSelectedGoal(updatedGoal);
            fetchData();
            setSuccessMessage(true);
            setShowWorkoutSelection(false);
        } catch (err: any) {
            console.error(err);
            setError(`Fehler: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleRemoveWorkout = async (workoutId: number) => {
        if (!selectedGoal) return;

        try {
            const updatedGoal = await GoalService.removeWorkoutFromGoal(
                selectedGoal.goalId,
                workoutId
            );

            setSelectedGoal(updatedGoal);
            fetchData();
        } catch (err: any) {
            console.error("Detailed error:", err);
            if (err.response) {
                console.error("Response data:", err.response.data);
                console.error("Response status:", err.response.status);
                setError(`Fehler: ${err.response.data?.message || err.message}`);
            } else {
                setError(`Fehler: ${err.message}`);
            }
        }
    };

    const handleCreateNewGoal = async () => {
        if (!member) return;

        try {
            const createdGoal = await GoalService.createGoal(
                {
                    goalName: newGoal.goalName,
                    kcal: newGoal.kcal,
                    date: newGoal.date
                },
                member.memberId
            );

            setGoals((prev) => [...prev, createdGoal]);
            setShowModal(false);
            setNewGoal({ goalName: "", kcal: 0, date: "" });
        } catch (err) {
            console.error("Fehler beim Erstellen des Ziels:", err);
            setError("Ziel konnte nicht erstellt werden.");
        }
    };

    const handleEditGoal = async () => {
        if (!editGoal) return;

        try {
            const updatedGoal = await GoalService.updateGoal(editGoal);

            setGoals(goals.map(goal =>
                goal.goalId === editGoal.goalId ? updatedGoal : goal
            ));

            if (selectedGoal?.goalId === editGoal.goalId) {
                setSelectedGoal(updatedGoal);
            }

            setShowEditModal(false);
            setEditGoal(null);
        } catch (err) {
            console.error("Fehler beim Aktualisieren des Ziels:", err);
            setError("Ziel konnte nicht aktualisiert werden.");
        }
    };

    const handleDeleteGoal = async (goalId: number) => {
        if (!window.confirm("Möchten Sie dieses Ziel wirklich löschen?")) return;

        try {
            await GoalService.deleteGoal(goalId);

            setGoals(goals.filter(goal => goal.goalId !== goalId));

            if (selectedGoal?.goalId === goalId) {
                setSelectedGoal(null);
            }
        } catch (err) {
            console.error("Fehler beim Löschen des Ziels:", err);
            setError("Ziel konnte nicht gelöscht werden.");
        }
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
                {/* Ziele Liste */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <span>Meine Ziele</span>
                            <button
                                className="btn btn-success btn-sm rounded-circle"
                                style={{ width: "32px", height: "32px", padding: 0, fontSize: "20px" }}
                                title="Ziel hinzufügen"
                                onClick={() => setShowModal(true)}
                            >
                                +
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
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h5>{goal.goalName}</h5>
                                                    <p>Datum: {new Date(goal.date).toLocaleDateString()}</p>
                                                    <p>Kalorienziel: {goal.kcal} kcal</p>
                                                </div>
                                                <div>
                                                    <button
                                                        className="btn btn-sm btn-primary me-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditGoal(goal);
                                                            setShowEditModal(true);
                                                        }}
                                                    >
                                                        Bearbeiten
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteGoal(goal.goalId);
                                                        }}
                                                    >
                                                        Löschen
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ziel Details */}
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
                                    {selectedGoal.workouts?.length > 0 ? (
                                        <table className="table table-bordered">
                                            <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Dauer</th>
                                                <th>Kalorien</th>
                                                <th>Aktion</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {selectedGoal.workouts.map((workout) => (
                                                <tr key={workout.workoutId}>
                                                    <td>{workout.workoutName}</td>
                                                    <td>{workout.time}</td>
                                                    <td>{calculateTotalCalories(workout.exercises)} kcal</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleRemoveWorkout(workout.workoutId)}
                                                        >
                                                            Löschen
                                                        </button>
                                                    </td>
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
                                <p>Bitte ein Ziel auswählen.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL für neues Ziel */}
            {showModal && (
                <div className="modal d-block" tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Neues Ziel erstellen</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Zielname</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newGoal.goalName}
                                        onChange={(e) =>
                                            setNewGoal((prev) => ({ ...prev, goalName: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Kalorienziel</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={newGoal.kcal}
                                        onChange={(e) =>
                                            setNewGoal((prev) => ({ ...prev, kcal: parseInt(e.target.value) }))
                                        }
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Datum</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={newGoal.date}
                                        onChange={(e) =>
                                            setNewGoal((prev) => ({
                                                ...prev,
                                                date: e.target.value
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Abbrechen
                                </button>
                                <button className="btn btn-primary" onClick={handleCreateNewGoal}>
                                    Speichern
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL für Ziel bearbeiten */}
            {showEditModal && editGoal && (
                <div className="modal d-block" tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Ziel bearbeiten</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Zielname</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editGoal.goalName}
                                        onChange={(e) =>
                                            setEditGoal({...editGoal, goalName: e.target.value})
                                        }
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Kalorienziel</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={editGoal.kcal}
                                        onChange={(e) =>
                                            setEditGoal({...editGoal, kcal: parseInt(e.target.value)})
                                        }
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Datum</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={editGoal.date.toString()}
                                        onChange={(e) =>
                                            setEditGoal({...editGoal, date: e.target.value})
                                        }
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                    Abbrechen
                                </button>
                                <button className="btn btn-primary" onClick={handleEditGoal}>
                                    Speichern
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Goal;