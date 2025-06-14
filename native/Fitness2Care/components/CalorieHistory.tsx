import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { ICalorieHistoryItem } from '../../../frontend/src/_common/models/ICalorieHistoryItem';
import { IConsumedItem } from "../../../frontend/src/_common/models/IConsumedItem";
import { ICalorieHistoryProps } from "../../../frontend/src/_common/models/ICalorieHistoryProps";

const CalorieHistory: React.FC<ICalorieHistoryProps> = ({ goalId, currentGoal, setGoal }) => {
    const [history, setHistory] = useState<ICalorieHistoryItem[]>([]);
    const [consumedItems, setConsumedItems] = useState<IConsumedItem[]>([]);
    const [initialKcal, setInitialKcal] = useState<number>(0);

    const loadData = async () => {
        try {
            const storedHistory = await AsyncStorage.getItem('calorieHistory');
            const storedConsumed = await AsyncStorage.getItem('consumedItems');

            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                const goalHistory = parsedHistory[goalId] || [];
                setHistory(goalHistory);

                const newInitialKcal = goalHistory.length > 0 ? goalHistory[0].initialKcal : currentGoal?.kcal || 0;
                setInitialKcal(newInitialKcal);
            }

            if (storedConsumed) {
                const parsedConsumed = JSON.parse(storedConsumed);
                setConsumedItems(parsedConsumed[goalId] || []);
            }
        } catch (error) {
            console.error("Fehler beim Laden der Daten:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, [goalId, currentGoal]);

    const removeConsumedItem = async (id: string) => {
        try {
            const removedItem = consumedItems.find(item => item.id === id);
            if (!removedItem || !currentGoal) return;

            const updatedItems = consumedItems.filter(item => item.id !== id);
            setConsumedItems(updatedItems);

            const allConsumed = await AsyncStorage.getItem('consumedItems');
            const parsedConsumed = allConsumed ? JSON.parse(allConsumed) : {};
            parsedConsumed[goalId] = updatedItems;
            await AsyncStorage.setItem('consumedItems', JSON.stringify(parsedConsumed));

            const storedHistory = await AsyncStorage.getItem('calorieHistory');
            const parsedHistory = storedHistory ? JSON.parse(storedHistory) : {};
            const initialKcal = parsedHistory[goalId]?.[0]?.initialKcal || currentGoal.kcal;

            let runningTotal = 0;
            const newHistory = [{
                date: new Date().toISOString(),
                initialKcal: initialKcal,
                consumedKcal: 0,
                remainingKcal: initialKcal
            }];

            updatedItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .forEach(item => {
                    runningTotal += item.kcal;
                    newHistory.push({
                        date: item.date,
                        initialKcal,
                        consumedKcal: runningTotal,
                        remainingKcal: initialKcal - runningTotal
                    });
                });

            parsedHistory[goalId] = newHistory;
            await AsyncStorage.setItem('calorieHistory', JSON.stringify(parsedHistory));

            const newKcal = currentGoal.kcal + removedItem.kcal;
            const response = await axios.put(`http://localhost:8080/goal/${goalId}`,
                { kcal: newKcal },
                { headers: { 'Content-Type': 'application/json' } }
            );

            setGoal(response.data);
            Alert.alert("Erfolg", `${removedItem.kcal} kcal wieder entfernt`);
        } catch (error) {
            console.error("Fehler beim Entfernen:", error);
            Alert.alert("Fehler", "Fehler beim Entfernen des Eintrags");
        }
    };

    if (history.length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Noch keine Verlaufsdaten verfügbar.</Text>
            </View>
        );
    }

    return (
        <LineChart
            data={{
                labels: history.map(entry =>
                    new Date(entry.date).toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'short'
                    })
                ),
                datasets: [{
                    data: history.map(entry => entry.consumedKcal),
                    color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`
                }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
                backgroundColor: '#ffffff',
                decimalPlaces: 0,
                color: () => '#8884d8',
                propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#8884d8"
                }
            }}
            bezier
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff'
    },
    noDataContainer: {
        marginTop: 20,
        padding: 15
    },
    noDataText: {
        color: '#7f8c8d',
        textAlign: 'center'
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 15,
        marginTop: 10
    },
    chartContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    consumedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10
    },
    itemInfo: {
        flex: 2
    },
    itemDetails: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    itemDate: {
        fontSize: 12,
        color: '#7f8c8d'
    },
    itemName: {
        fontSize: 16,
        marginTop: 5
    },
    itemGram: {
        fontSize: 14,
        color: '#3498db'
    },
    itemKcal: {
        fontSize: 14,
        color: '#e74c3c'
    },
    removeButton: {
        padding: 5
    },
    removeButtonText: {
        fontSize: 16,
        color: '#ff4444'
    },
    noItemsText: {
        color: '#7f8c8d',
        textAlign: 'center',
        marginVertical: 20
    }
});

export default CalorieHistory;