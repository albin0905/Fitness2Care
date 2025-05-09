import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './exercise.css';

interface IExercise {
    exerciseId: number;
    exerciseName: string;
    exerciceLevel: string;
    bodyPart: string;
    imageURL: string;
}

const Exercise = () => {
    const [exercises, setExercises] = useState<IExercise[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newExercise, setNewExercise] = useState<Omit<IExercise, 'exerciseId'>>({
        exerciseName: '',
        exerciceLevel: '',
        bodyPart: '',
        imageURL: '',
    });
    const [editExercise, setEditExercise] = useState<IExercise | null>(null);

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = () => {
        axios.get<IExercise[]>('http://localhost:8080/exercise/exercices')
            .then(res => setExercises(res.data))
            .catch(err => console.error('Fehler beim Laden:', err));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewExercise({ ...newExercise, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (editExercise) {
            setEditExercise({ ...editExercise, [e.target.name]: e.target.value });
        }
    };

    const handleAddExercise = () => {
        if (!newExercise.exerciceLevel) {
            alert('Please select a valid exercise level');
            return;
        }

        axios.post('http://localhost:8080/exercise/addExercice', newExercise, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(() => {
                setNewExercise({ exerciseName: '', exerciceLevel: '', bodyPart: '', imageURL: '' });
                setShowModal(false);
                fetchExercises();
            })
            .catch(err => console.error('Fehler beim Hinzufügen:', err));
    };

    const handleUpdateExercise = () => {
        if (!editExercise || !editExercise.exerciseId) return;

        axios.put(`http://localhost:8080/exercise/${editExercise.exerciseId}`, editExercise, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(() => {
                setEditExercise(null);
                setShowModal(false);
                fetchExercises();
            })
            .catch(err => console.error('Fehler beim Aktualisieren:', err));
    };

    const handleDeleteExercise = (id: number) => {
        axios.delete(`http://localhost:8080/exercise/${id}`)
            .then(() => {
                fetchExercises();
            })
            .catch(err => console.error('Fehler beim Löschen:', err));
    };

    const handleEditExercise = (exercise: IExercise) => {
        setEditExercise(exercise);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditExercise(null);
        setNewExercise({ exerciseName: '', exerciceLevel: '', bodyPart: '', imageURL: '' });
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>All Exercises</h2>
                <button className="btn btn-success" onClick={() => setShowModal(true)}>
                    + Add Exercise
                </button>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="exercise-table w-100">
                    <thead>
                    <tr className="exercise-row header-row">
                        <th>Inserted</th>
                        <th>Exercise</th>
                        <th>Body-Part</th>
                        <th>Level</th>
                        <th>Bearbeiten</th>
                        <th>Löschen</th>
                    </tr>
                    </thead>
                    <tbody>
                    {exercises.map((exercise) => (
                        <tr key={exercise.exerciseId} className="exercise-row">
                            <td><input type="checkbox" className="form-check-input" /></td>
                            <td>{exercise.exerciseName}</td>
                            <td>{exercise.bodyPart}</td>
                            <td className="fw-bold text-uppercase">{exercise.exerciceLevel}</td>
                            <td>
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleEditExercise(exercise)}
                                >
                                    Edit
                                </button>
                            </td>
                            <td>
                                <button
                                    className="btn btn-danger btn-sm ms-2"
                                    onClick={() => handleDeleteExercise(exercise.exerciseId)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editExercise ? "Edit Exercise" : "Add New Exercise"}</h5>
                                <button type="button" className="btn-close" onClick={closeModal} />
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Exercise Name"
                                    name="exerciseName"
                                    value={editExercise ? editExercise.exerciseName : newExercise.exerciseName}
                                    onChange={editExercise ? handleEditChange : handleChange}
                                />

                                <select
                                    className="form-control mb-2"
                                    name="exerciceLevel"
                                    value={editExercise ? editExercise.exerciceLevel : newExercise.exerciceLevel}
                                    onChange={editExercise ? handleEditChange : handleChange}
                                    required
                                >
                                    <option value="">Select Level</option>
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>

                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Body Part"
                                    name="bodyPart"
                                    value={editExercise ? editExercise.bodyPart : newExercise.bodyPart}
                                    onChange={editExercise ? handleEditChange : handleChange}
                                />
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Image URL"
                                    name="imageURL"
                                    value={editExercise ? editExercise.imageURL : newExercise.imageURL}
                                    onChange={editExercise ? handleEditChange : handleChange}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={editExercise ? handleUpdateExercise : handleAddExercise}
                                >
                                    {editExercise ? "Update" : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Exercise;
