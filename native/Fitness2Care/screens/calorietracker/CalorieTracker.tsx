import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Modal,
    FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AxiosError } from 'axios';
import { IGoal } from "../../../../frontend/src/_common/models/IGoal";
import { useMemberContext } from "../../../../frontend/src/_common/context/MemberContext";
import CalorieHistory from "../../components/CalorieHistory";
import { CalorieTrackerService } from '../../../../frontend/src/_components/services/CalorieTrackerService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IProduct {
    barcode: string;
    productName: string;
    kcal_100g: number;
    ingredients: string;
}

const CalorieTracker = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [goal, setGoal] = useState<IGoal | null>(null);
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
            Alert.alert("Fehler", "Kein gültiges Ziel zum Aktualisieren gefunden.");
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

            const storedConsumed = await AsyncStorage.getItem('consumedItems');
            const parsedConsumed = storedConsumed ? JSON.parse(storedConsumed) : {};
            const currentItems = parsedConsumed[goal.goalId] || [];
            parsedConsumed[goal.goalId] = [...currentItems, consumedItem];
            await AsyncStorage.setItem('consumedItems', JSON.stringify(parsedConsumed));

            const storedHistory = await AsyncStorage.getItem('calorieHistory');
            const parsedHistory = storedHistory ? JSON.parse(storedHistory) : {};
            const goalHistory = parsedHistory[goal.goalId] || [];

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
                const allItems = [...(parsedConsumed[goal.goalId] || [])];
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

            parsedHistory[goal.goalId] = newHistory;
            await AsyncStorage.setItem('calorieHistory', JSON.stringify(parsedHistory));

            const updatedGoal = await CalorieTrackerService.updateGoalKcal(
                goal.goalId,
                goal.kcal - kcalToAdd
            );

            setGoal(updatedGoal);

            if (willExceed) {
                setShowExceedModal(true);
            } else {
                Alert.alert("Erfolg", `${kcalToAdd} kcal (${grams}g) hinzugefügt`);
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error("Fehlerdaten:", err.response?.data);
            }
            Alert.alert("Fehler", "Aktualisierung fehlgeschlagen");
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

    const productsPerPage = 10;
    const startIndex = page * productsPerPage;
    const endIndex = startIndex + productsPerPage;

    const renderProductItem = ({ item }: { item: IProduct }) => (
        <View style={styles.productItem}>
            <View style={styles.productInfo}>
                <Text style={styles.barcode}>{item.barcode}</Text>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.kcal}>{item.kcal_100g} kcal/100g</Text>
                <Text style={styles.ingredients}>{item.ingredients}</Text>
            </View>
            <View style={styles.productActions}>
                <TextInput
                    style={styles.gramInput}
                    value={gramInputs[item.barcode]?.toString() || ""}
                    onChangeText={(text) => handleGramInputChange(item.barcode, text)}
                    placeholder="100"
                    keyboardType="numeric"
                />
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addCaloriesToGoal(item)}
                >
                    <MaterialIcons name="add" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>🎯 Aktuelles Ziel</Text>

            <Modal
                visible={showExceedModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowExceedModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>⚠️ Warnung</Text>
                        <Text style={styles.modalText}>Sie haben Ihr tägliches Kalorienziel überschritten!</Text>
                        <Text style={styles.modalText}>Bitte passen Sie Ihre Ernährung an oder setzen Sie ein neues Ziel.</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowExceedModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Verstanden</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {goal ? (
                <View style={styles.goalContainer}>
                    <Text style={styles.goalText}><Text style={styles.bold}>Name:</Text> {goal.goalName}</Text>
                    <Text style={styles.goalText}><Text style={styles.bold}>Datum:</Text> {new Date(goal.date).toLocaleDateString()}</Text>
                    <Text style={styles.goalText}>
                        <Text style={styles.bold}>Noch zur Verfügung stehende Kalorien:</Text>
                        <Text style={[styles.kcalText, goal.kcal < 0 && styles.negativeKcal]}>
                            {goal.kcal} kcal
                        </Text>
                    </Text>
                </View>
            ) : (
                <Text style={styles.noGoalText}>Kein Ziel gefunden.</Text>
            )}

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Suche Produkt..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <FlatList
                data={products.slice(startIndex, endIndex)}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.barcode}
                scrollEnabled={false}
            />

            {products.length > productsPerPage && (
                <View style={styles.pagination}>
                    <TouchableOpacity
                        style={[styles.paginationButton, page === 0 && styles.disabledButton]}
                        onPress={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                    >
                        <Text style={styles.paginationButtonText}>◀️ Zurück</Text>
                    </TouchableOpacity>
                    <Text style={styles.pageText}>
                        Seite {page + 1} von {Math.ceil(products.length / productsPerPage)}
                    </Text>
                    <TouchableOpacity
                        style={[styles.paginationButton, startIndex + productsPerPage >= products.length && styles.disabledButton]}
                        onPress={() => setPage((p) => Math.min(p + 1, Math.ceil(products.length / productsPerPage) - 1))}
                        disabled={startIndex + productsPerPage >= products.length}
                    >
                        <Text style={styles.paginationButtonText}>Weiter ▶️</Text>
                    </TouchableOpacity>
                </View>
            )}

            {goal && <CalorieHistory goalId={goal.goalId} currentGoal={goal} setGoal={setGoal} />}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    modalText: {
        marginBottom: 10
    },
    modalButton: {
        backgroundColor: '#ffc107',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'flex-end'
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    goalContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    goalText: {
        marginBottom: 5
    },
    bold: {
        fontWeight: 'bold'
    },
    kcalText: {
        fontWeight: 'bold'
    },
    negativeKcal: {
        color: 'red'
    },
    noGoalText: {
        color: '#7f8c8d',
        marginBottom: 20
    },
    searchContainer: {
        marginBottom: 20
    },
    searchInput: {
        width: '100%',
        padding: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 10
    },
    productInfo: {
        flex: 3
    },
    productActions: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    barcode: {
        fontSize: 12,
        color: '#7f8c8d'
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 5
    },
    kcal: {
        fontSize: 14,
        color: '#3498db'
    },
    ingredients: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 5
    },
    gramInput: {
        width: 60,
        padding: 5,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10
    },
    addButton: {
        backgroundColor: '#28a745',
        padding: 8,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    paginationButton: {
        padding: 8,
        marginHorizontal: 5,
        backgroundColor: '#3498db',
        borderRadius: 4
    },
    disabledButton: {
        backgroundColor: '#bdc3c7'
    },
    paginationButtonText: {
        color: 'white'
    },
    pageText: {
        marginHorizontal: 10
    }
});

export default CalorieTracker;