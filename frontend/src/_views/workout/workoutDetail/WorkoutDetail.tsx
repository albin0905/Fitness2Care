import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExerciseService } from '../../../_components/services/ExerciseService';
import { WorkoutService } from '../../../_components/services/WorkoutService';

const WorkoutDetail = () => {
    const { workoutId } = useParams<{ workoutId: string }>();
    const [workout, setWorkout] = useState<IWorkout | null>(null);
    const [allExercises, setAllExercises] = useState<IExercise[]>([]);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
    const [showExerciseModal, setShowExerciseModal] = useState<boolean>(false);
    const [currentExercise, setCurrentExercise] = useState<IExercise | null>(null);
    const [newExercise, setNewExercise] = useState<Omit<IExercise, 'exerciseId'>>({
        description: "",
        kcal: 0,
        exerciseName: '',
        exerciseLevel: '',
        bodyPart: '',
        imageURL: ''
    });
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [detailExercise, setDetailExercise] = useState<IExercise | null>(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const workoutData = await WorkoutService.getWorkoutDetails(Number(workoutId));
            setWorkout(workoutData);

            if (workoutData?.exercises) {
                setSelectedExercises(workoutData.exercises.map((ex: IExercise) => ex.exerciseId));
            }

            const exercisesData = await ExerciseService.getAllExercises();
            setAllExercises(exercisesData);
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [workoutId]);

    const toggleEditMode = () => {
        setEditMode(!editMode);
        if (editMode && workout?.exercises) {
            setSelectedExercises(workout.exercises.map((ex: IExercise) => ex.exerciseId));
        }
    };

    const toggleExerciseSelection = (exerciseId: number) => {
        setSelectedExercises(prev =>
            prev.includes(exerciseId)
                ? prev.filter(id => id !== exerciseId)
                : [...prev, exerciseId]
        );
    };

    const saveChanges = async () => {
        if (!workout) return;

        try {
            const updatedExercises = allExercises.filter((ex: IExercise) =>
                selectedExercises.includes(ex.exerciseId)
            );

            const updatedWorkout = {
                ...workout,
                exercises: updatedExercises
            };

            await WorkoutService.updateWorkout(workout.workoutId, updatedWorkout);
            setWorkout(updatedWorkout);
            setEditMode(false);
        } catch (error) {
            console.error('Fehler beim Speichern der Änderungen:', error);
        }
    };

    const handleAddNewExercise = async () => {
        try {
            const createdExercise = await ExerciseService.createExercise(newExercise);

            setSelectedExercises([...selectedExercises, createdExercise.exerciseId]);
            const exercisesData = await ExerciseService.getAllExercises();
            setAllExercises(exercisesData);

            setNewExercise({description: "", kcal: 0, exerciseName: '', exerciseLevel: '', bodyPart: '', imageURL: '' });
            setShowExerciseModal(false);
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Übung:', error);
        }
    };

    const handleUpdateExercise = async () => {
        if (!currentExercise) return;

        try {
            await ExerciseService.updateExercise(currentExercise.exerciseId, currentExercise);
            const exercisesData = await ExerciseService.getAllExercises();
            setAllExercises(exercisesData);

            setCurrentExercise(null);
            setShowExerciseModal(false);
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Übung:', error);
        }
    };

    const handleDeleteExercise = async (exerciseId: number) => {
        try {
            await ExerciseService.deleteExercise(exerciseId);
            setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
            const exercisesData = await ExerciseService.getAllExercises();
            setAllExercises(exercisesData);
        } catch (error) {
            console.error('Fehler beim Löschen der Übung:', error);
        }
    };

    const isExerciseInWorkout = (exerciseId: number): boolean => {
        if (!workout) return false;
        return workout.exercises?.some((ex: IExercise) => ex.exerciseId === exerciseId) ?? false;
    };

    const isExerciseSelected = (exerciseId: number): boolean => {
        return selectedExercises.includes(exerciseId);
    };

    const handleShowExerciseDetail = (exercise: IExercise) => {
        setDetailExercise(exercise);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setDetailExercise(null);
    };

    return (
        <div className="container p-4">
            <h2 className="mb-4">{workout?.workoutName} – Details</h2>

            <div className="d-flex justify-content-between mb-4">
                <button className="btn btn-secondary" onClick={() => navigate('/workout')}>
                    Zurück zu allen Workouts
                </button>

                <div>
                    {!editMode ? (
                        <button className="btn btn-primary me-2" onClick={toggleEditMode}>
                            Workout bearbeiten
                        </button>
                    ) : (
                        <>
                            <button className="btn btn-success me-2" onClick={saveChanges}>
                                Änderungen speichern
                            </button>
                            <button className="btn btn-danger me-2" onClick={toggleEditMode}>
                                Abbrechen
                            </button>
                        </>
                    )}
                    <button
                        className="btn btn-info"
                        onClick={() => {
                            setCurrentExercise(null);
                            setShowExerciseModal(true);
                        }}
                    >
                        + Neue Übung
                    </button>
                </div>
            </div>

            <table className="table table-hover">
                <thead>
                <tr>
                    <th>Enthalten</th>
                    <th>Übung</th>
                    <th>Muskelgruppe</th>
                    <th>Level</th>
                    <th>Bearbeiten</th>
                    <th>Löschen</th>
                </tr>
                </thead>
                <tbody>
                {allExercises.map((ex: IExercise) => (
                    <tr
                        key={ex.exerciseId}
                        className={!editMode && isExerciseInWorkout(ex.exerciseId) ? 'table-active' : ''}
                        onClick={() => !editMode && handleShowExerciseDetail(ex)}
                        style={!editMode ? { cursor: 'pointer' } : {}}
                    >
                        <td>
                            {editMode ? (
                                <input
                                    type="checkbox"
                                    checked={isExerciseSelected(ex.exerciseId)}
                                    onChange={() => toggleExerciseSelection(ex.exerciseId)}
                                    className="form-check-input"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <input
                                    type="checkbox"
                                    checked={isExerciseInWorkout(ex.exerciseId)}
                                    readOnly
                                    className="form-check-input"
                                    style={{
                                        accentColor: isExerciseInWorkout(ex.exerciseId) ? 'blue' : undefined,
                                    }}
                                />
                            )}
                        </td>
                        <td>{ex.exerciseName}</td>
                        <td>{ex.bodyPart}</td>
                        <td>{ex.exerciseLevel}</td>
                        <>
                            <td>
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentExercise(ex);
                                        setShowExerciseModal(true);
                                    }}
                                >
                                    Bearbeiten
                                </button>
                            </td>
                            <td>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteExercise(ex.exerciseId);
                                    }}
                                >
                                    Löschen
                                </button>
                            </td>
                        </>
                    </tr>
                ))}
                </tbody>
            </table>

            {showExerciseModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {currentExercise ? "Übung bearbeiten" : "Neue Übung erstellen"}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowExerciseModal(false)} />
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Übungsname"
                                    name="exerciseName"
                                    value={currentExercise ? currentExercise.exerciseName : newExercise.exerciseName}
                                    onChange={(e) => {
                                        if (currentExercise) {
                                            setCurrentExercise({
                                                ...currentExercise,
                                                exerciseName: e.target.value
                                            });
                                        } else {
                                            setNewExercise({
                                                ...newExercise,
                                                exerciseName: e.target.value
                                            });
                                        }
                                    }}
                                />
                                <select
                                    className="form-control mb-2"
                                    name="exerciceLevel"
                                    value={currentExercise ? currentExercise.exerciseLevel : newExercise.exerciseLevel}
                                    onChange={(e) => {
                                        if (currentExercise) {
                                            setCurrentExercise({
                                                ...currentExercise,
                                                exerciseLevel: e.target.value
                                            });
                                        } else {
                                            setNewExercise({
                                                ...newExercise,
                                                exerciseLevel: e.target.value
                                            });
                                        }
                                    }}
                                >
                                    <option value="">Schwierigkeitsgrad wählen</option>
                                    <option value="EASY">Einfach</option>
                                    <option value="MEDIUM">Mittel</option>
                                    <option value="HARD">Schwer</option>
                                </select>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Muskelgruppe"
                                    name="bodyPart"
                                    value={currentExercise ? currentExercise.bodyPart : newExercise.bodyPart}
                                    onChange={(e) => {
                                        if (currentExercise) {
                                            setCurrentExercise({
                                                ...currentExercise,
                                                bodyPart: e.target.value
                                            });
                                        } else {
                                            setNewExercise({
                                                ...newExercise,
                                                bodyPart: e.target.value
                                            });
                                        }
                                    }}
                                />
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Bild-URL"
                                    name="imageURL"
                                    value={currentExercise ? currentExercise.imageURL : newExercise.imageURL}
                                    onChange={(e) => {
                                        if (currentExercise) {
                                            setCurrentExercise({
                                                ...currentExercise,
                                                imageURL: e.target.value
                                            });
                                        } else {
                                            setNewExercise({
                                                ...newExercise,
                                                imageURL: e.target.value
                                            });
                                        }
                                    }}
                                />
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Beschreibung"
                                    name="description"
                                    value={currentExercise ? currentExercise.description : newExercise.description}
                                    onChange={(e) => {
                                        if (currentExercise) {
                                            setCurrentExercise({
                                                ...currentExercise,
                                                description: e.target.value
                                            });
                                        } else {
                                            setNewExercise({
                                                ...newExercise,
                                                description: e.target.value
                                            });
                                        }
                                    }}
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowExerciseModal(false);
                                        setCurrentExercise(null);
                                        setNewExercise({exerciseName: '', exerciseLevel: '', bodyPart: '',
                                            imageURL: '',description: "", kcal: 0 });
                                    }}
                                >
                                    Abbrechen
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={currentExercise ? handleUpdateExercise : handleAddNewExercise}
                                >
                                    {currentExercise ? "Aktualisieren" : "Erstellen"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && detailExercise && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Übungsdetails</h5>
                                <button type="button" className="btn-close" onClick={closeDetailModal} />
                            </div>
                            <div className="modal-body">
                                <h3>{detailExercise.exerciseName}</h3>
                                <p><strong>Level:</strong> {detailExercise.exerciseLevel}</p>
                                <p><strong>Muskelgruppe:</strong> {detailExercise.bodyPart}</p>
                                {detailExercise.imageURL && (
                                    <img
                                        src={detailExercise.imageURL}
                                        alt={detailExercise.exerciseName}
                                        className="img-fluid rounded"
                                    />
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={closeDetailModal}>Schließen</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutDetail;