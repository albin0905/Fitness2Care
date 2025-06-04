import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { IGoal } from "../../_common/models/IGoal";
import { useMemberContext } from "../../_common/context/MemberContext";
import CalorieHistory from "./CalorieHistory";

export interface ICalorieHistoryItem {
    date: string;
    initialKcal: number;
    consumedKcal: number;
    remainingKcal: number;
}

interface ICalorieHistory {
    [goalId: number]: ICalorieHistoryItem[];
}

const getHistoryFromStorage = (goalId?: number): ICalorieHistory | ICalorieHistoryItem[] => {
    const history = localStorage.getItem('calorieHistory');
    const parsedHistory = history ? JSON.parse(history) : {};

    if (goalId !== undefined) {
        return parsedHistory[goalId] || [];
    }

    return parsedHistory;
};

const saveHistoryToStorage = (history: ICalorieHistory) => {
    localStorage.setItem('calorieHistory', JSON.stringify(history));
};

const addToHistory = (goal: IGoal, kcalConsumed: number) => {
    const history = getHistoryFromStorage() as ICalorieHistory;
    const goalHistory = history[goal.goalId] || [];

    if (goalHistory.length === 0) {
        goalHistory.push({
            date: new Date().toISOString(),
            initialKcal: goal.kcal + kcalConsumed,
            consumedKcal: 0,
            remainingKcal: goal.kcal + kcalConsumed
        });
    }

    const lastEntry = goalHistory[goalHistory.length - 1];
    const newEntry = {
        date: new Date().toISOString(),
        initialKcal: lastEntry.initialKcal,
        consumedKcal: lastEntry.consumedKcal + kcalConsumed,
        remainingKcal: lastEntry.remainingKcal - kcalConsumed
    };

    goalHistory.push(newEntry);
    history[goal.goalId] = goalHistory;
    saveHistoryToStorage(history);

    return newEntry;
};

const CalorieTracker = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [goal, setGoal] = useState<IGoal | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
    const [gramInputs, setGramInputs] = useState<{[barcode: string]: number}>({});
    const { member } = useMemberContext();

    const userId = member!.memberId;

    useEffect(() => {
        const fetchGoal = async () => {
            try {
                const today = new Date().toISOString().split("T")[0];
                const res = await axios.get<IGoal>(
                    `http://localhost:8080/goal/currentGoal/${userId}/${today}`
                );
                setGoal(res.data);
            } catch (err) {
                console.error("Ziel konnte nicht geladen werden", err);
                setGoal(null);
            }
        };

        fetchGoal();
    }, [userId]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/product/filterByName/${search}?page=${page}`);
            setProducts(response.data.content);
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

        const grams = gramInputs[product.barcode] || 100; // Default to 100g if no input
        const kcalToAdd = Math.round((product.kcal_100g * grams) / 100);

        try {
            const response = await axios.put(
                `http://localhost:8080/goal/${goal.goalId}`,
                { kcal: goal.kcal - kcalToAdd },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const updatedGoal = response.data;
            addToHistory(updatedGoal, kcalToAdd);
            alert(`✅ ${kcalToAdd} kcal (${grams}g) abgezogen`);
            setGoal(updatedGoal);

            window.dispatchEvent(new Event('storage'));
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
                    <p><strong>Noch zur Verfügung stehende Kalorien:</strong> <span style={{ fontWeight: "bold" }}>{goal.kcal} kcal</span></p>
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
                                <td style={{ padding: "10px" }}>
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            addCaloriesToGoal(product);
                                        }}
                                        style={{
                                            padding: "6px 12px",
                                            backgroundColor: "#3498db",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        ➕ Hinzufügen
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

            {goal && <CalorieHistory goalId={goal.goalId} />}
        </div>
    );
};

export default CalorieTracker;