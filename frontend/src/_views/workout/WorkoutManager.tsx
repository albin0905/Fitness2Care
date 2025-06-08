import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const WorkoutManager = () => {
    const [workout, setWorkout] = useState({
        workoutName: "",
        time: 0,
        description: "",
    });

    const { workoutId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (workoutId) {
            axios.get(`http://localhost:8080/workout/workout/details/id/${workoutId}`)
                .then(res => {
                    const data = res.data;
                    setWorkout({
                        workoutName: data.workoutName,
                        time: data.time,
                        description: data.description,
                    });
                })
                .catch(err => console.error("Fehler beim Laden des Workouts:", err));
        }
    }, [workoutId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                workoutName: workout.workoutName,
                time: workout.time,
                description: workout.description,
            };

            if (workoutId) {
                await axios.put(`http://localhost:8080/workout/${workoutId}`, payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                alert("Workout aktualisiert!");
            } else {
                await axios.post("http://localhost:8080/workout/addWorkout", payload, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                alert("Workout hinzugefügt!");
            }
            navigate("/workout");
        } catch (error) {
            console.error("Fehler beim Speichern des Workouts:", error);
        }
    };

    return (
        <div className="container p-4">
            <h2>{workoutId ? "Workout bearbeiten" : "Workout hinzufügen"}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Name</label>
                    <input
                        className="form-control"
                        value={workout.workoutName}
                        onChange={(e) => setWorkout({ ...workout, workoutName: e.target.value })}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Dauer (Minuten)</label>
                    <input
                        className="form-control"
                        type="number"
                        value={workout.time}
                        onChange={(e) => setWorkout({ ...workout, time: Number(e.target.value) })}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label>Beschreibung</label>
                    <textarea
                        className="form-control"
                        value={workout.description}
                        onChange={(e) => setWorkout({ ...workout, description: e.target.value })}
                        required
                    />
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-primary" type="submit">
                        {workoutId ? "Aktualisieren" : "Erstellen"}
                    </button>
                    <button className="btn btn-secondary" type="button" onClick={() => navigate("/workout")}>
                        Abbrechen
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WorkoutManager;