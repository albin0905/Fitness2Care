import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { IGoal } from "../../_common/models/IGoal";
import { useMemberContext } from "../../_common/context/MemberContext";
import CalorieHistory from "./CalorieHistory";
import { CalorieTrackerService } from '../../_components/services/CalorieTrackerService';
import { Modal, Button } from 'react-bootstrap';
import AddIcon from '@mui/icons-material/Add';

const CalorieTracker = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [goal, setGoal] = useState<IGoal | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
    const [gramInputs, setGramInputs] = useState<{[barcode: string]: number}>({});
    const [showExceedModal, setShowExceedModal] = useState(false);
    const { member } = useMemberContext();

    const userId = member!.memberId;

    const fetchCurrentGoal = async () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            const goalData = await CalorieTrackerService.getCurrentGoal(userId, today);
            setGoal(goalData);
        } catch (err) {
            console.error("Ziel konnte nicht geladen werden", err);
            setGoal(null);
        }
    };

    useEffect(() => {
        fetchCurrentGoal();

        const handleGoalChange = () => {
            fetchCurrentGoal();
        };

        window.addEventListener('goalChanged', handleGoalChange);

        return () => {
            window.removeEventListener('goalChanged', handleGoalChange);
        };
    }, [userId]);

    const fetchProducts = async () => {
        try {
            const productsData = await CalorieTrackerService.searchProductsByName(search, page);
            setProducts(productsData);
        } catch (error) {
            console.error("Fehler beim Laden der Produkte:", error);
            setProducts([]);
        }
    };

    useEffect(() => {
        if (search.length > 0) {
            fetchProducts();
        } else {
            setProducts([]);
        }
    }, [page, search]);

    const addCaloriesToGoal = async (product: IProduct) => {
        if (!goal || goal.goalId == null) {
            alert("❌ Kein gültiges Ziel zum Aktualisieren gefunden.");
            return;
        }

        const grams = gramInputs[product.barcode] || 100;
        const kcalToAdd = Math.round((product.kcal_100g * grams) / 100);

        try {
            const willExceed = (goal.kcal - kcalToAdd) < 0;

            const consumedItem = {
                id: `${Date.now()}-${product.barcode}`,
                date: new Date().toISOString(),
                productName: product.productName,
                kcal: kcalToAdd,
                grams: grams
            };

            const storedConsumed = JSON.parse(localStorage.getItem('consumedItems') || '{}');
            const currentItems = storedConsumed[goal.goalId] || [];
            storedConsumed[goal.goalId] = [...currentItems, consumedItem];
            localStorage.setItem('consumedItems', JSON.stringify(storedConsumed));

            const storedHistory = JSON.parse(localStorage.getItem('calorieHistory') || '{}');
            const goalHistory = storedHistory[goal.goalId] || [];

            let newHistory = [];
            if (goalHistory.length === 0) {
                newHistory = [
                    {
                        date: new Date().toISOString(),
                        initialKcal: goal.kcal,
                        consumedKcal: 0,
                        remainingKcal: goal.kcal
                    },
                    {
                        date: new Date().toISOString(),
                        initialKcal: goal.kcal,
                        consumedKcal: kcalToAdd,
                        remainingKcal: goal.kcal - kcalToAdd
                    }
                ];
            } else {
                const allItems = [...(storedConsumed[goal.goalId] || [])];
                const initialKcal = goalHistory[0].initialKcal;
                let runningTotal = 0;

                const sortedItems = [...allItems].sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                newHistory.push({
                    date: goalHistory[0].date,
                    initialKcal,
                    consumedKcal: 0,
                    remainingKcal: initialKcal
                });

                for (const item of sortedItems) {
                    runningTotal += item.kcal;
                    newHistory.push({
                        date: item.date,
                        initialKcal,
                        consumedKcal: runningTotal,
                        remainingKcal: initialKcal - runningTotal
                    });
                }
            }

            storedHistory[goal.goalId] = newHistory;
            localStorage.setItem('calorieHistory', JSON.stringify(storedHistory));

            const updatedGoal = await CalorieTrackerService.updateGoalKcal(
                goal.goalId,
                goal.kcal - kcalToAdd
            );

            setGoal(updatedGoal);
            window.dispatchEvent(new Event('storage'));

            if (willExceed) {
                setShowExceedModal(true);
            } else {
                alert(`✅ ${kcalToAdd} kcal (${grams}g) hinzugefügt`);
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error("Fehlerdaten:", err.response?.data);
            }
            alert("❌ Aktualisierung fehlgeschlagen");
        }
    };

    const handleGramInputChange = (barcode: string, value: string) => {
        const numValue = value === "" ? 0 : parseInt(value);
        if (!isNaN(numValue)) {
            setGramInputs(prev => ({
                ...prev,
                [barcode]: numValue
            }));
        }
    };

    const productsPerPage = 50;
    const startIndex = page * productsPerPage;
    const endIndex = startIndex + productsPerPage;

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>🎯 Aktuelles Ziel</h2>

            <Modal show={showExceedModal} onHide={() => setShowExceedModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>⚠️ Warnung</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Sie haben Ihr tägliches Kalorienziel überschritten!</p>
                    <p>Bitte passen Sie Ihre Ernährung an oder setzen Sie ein neues Ziel.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="warning" onClick={() => setShowExceedModal(false)}>
                        Verstanden
                    </Button>
                </Modal.Footer>
            </Modal>

            {goal ? (
                <div style={{
                    marginBottom: "20px",
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor: "#f8f9fa",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                    <p><strong>Name:</strong> {goal.goalName}</p>
                    <p><strong>Datum:</strong> {new Date(goal.date).toLocaleDateString()}</p>
                    <p><strong>Noch zur Verfügung stehende Kalorien:</strong>
                        <span style={{
                            fontWeight: "bold",
                            color: goal.kcal < 0 ? "red" : "inherit"
                        }}>
                            {goal.kcal} kcal
                        </span>
                    </p>
                </div>
            ) : (
                <p style={{ color: "#7f8c8d" }}>Kein Ziel gefunden.</p>
            )}

            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="🔍 Suche Produkt..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        fontSize: "16px"
                    }}
                />
            </div>

            {products.length > 0 && (
                <div style={{ overflowX: "auto", marginBottom: "20px" }}>
                    <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                        <thead>
                        <tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
                            <th style={{ padding: "12px", textAlign: "left" }}>Barcode</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>Produktname</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>kcal / 100g</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>Zutaten</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>Gramm</th>
                            <th style={{ padding: "12px", textAlign: "left" }}>Aktion</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.slice(startIndex, endIndex).map((product: IProduct) => (
                            <tr key={product.barcode} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px" }}>{product.barcode}</td>
                                <td style={{ padding: "10px" }}>{product.productName}</td>
                                <td style={{ padding: "10px" }}>{product.kcal_100g}</td>
                                <td style={{ padding: "10px" }}>{product.ingredients}</td>
                                <td style={{ padding: "10px" }}>
                                    <input
                                        type="number"
                                        value={gramInputs[product.barcode] || ""}
                                        onChange={(e) => handleGramInputChange(String(product.barcode), e.target.value)}
                                        placeholder="100"
                                        min="1"
                                        style={{
                                            width: "60px",
                                            padding: "5px",
                                            borderRadius: "4px",
                                            border: "1px solid #ddd"
                                        }}
                                    />
                                </td>
                                <td style={{
                                    padding: "10px",
                                    textAlign: "center",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: "100%"
                                }}>
                                    <button
                                        className="btn btn-sm btn-outline-success"
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: "8px",
                                            margin: "0 auto"
                                        }}
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            addCaloriesToGoal(product);
                                        }}
                                    >
                                        <AddIcon style={{ fontSize: "1.2rem" }} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {products.length > productsPerPage && (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "20px"
                }}>
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                        style={{
                            padding: "8px 16px",
                            margin: "0 5px",
                            backgroundColor: page === 0 ? "#bdc3c7" : "#3498db",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: page === 0 ? "not-allowed" : "pointer"
                        }}
                    >
                        ◀️ Zurück
                    </button>
                    <span style={{ margin: "0 10px" }}>
                        Seite {page + 1} von {Math.ceil(products.length / productsPerPage)}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, Math.ceil(products.length / productsPerPage) - 1))}
                        disabled={startIndex + productsPerPage >= products.length}
                        style={{
                            padding: "8px 16px",
                            margin: "0 5px",
                            backgroundColor: startIndex + productsPerPage >= products.length ? "#bdc3c7" : "#3498db",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: startIndex + productsPerPage >= products.length ? "not-allowed" : "pointer"
                        }}
                    >
                        Weiter ▶️
                    </button>
                </div>
            )}

            {goal && <CalorieHistory goalId={goal.goalId} currentGoal={goal} setGoal={setGoal} />}
        </div>
    );
};

export default CalorieTracker;