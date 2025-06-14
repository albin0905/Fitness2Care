import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useMemberContext } from '../../../../frontend/src/_common/context/MemberContext';
import { IGoal } from '../../../../frontend/src/_common/models/IGoal';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { CalorieTrackerService } from '../../../../frontend/src/_components/services/CalorieTrackerService';
import { useLanguage } from '../../../../frontend/src/_common/context/LanguageContext';
import Card from '../../components/Card';

const Dashboard = () => {
    const { member } = useMemberContext();
    const [latestGoal, setLatestGoal] = useState<IGoal | null>(null);
    const [goalStats, setGoalStats] = useState<any>(null);
    const [calorieStats, setCalorieStats] = useState<any>(null);

    const { texts } = useLanguage();
    const screenWidth = Dimensions.get('window').width;

    const fetchData = async () => {
        if (member) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const goal = await CalorieTrackerService.getCurrentGoal(member.memberId, today);
                setLatestGoal(goal);

                setGoalStats({
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            data: [265, 259, 280, 381, 156, 355],
                        },
                    ],
                });

                setCalorieStats([
                    { date: '2025-06-05', consumed: 1400 },
                    { date: '2025-06-06', consumed: 1300 },
                    { date: '2025-06-07', consumed: 1600 },
                    { date: '2025-06-08', consumed: 1200 },
                    { date: '2025-06-09', consumed: 1500 },
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [member]);

    if (!member || !goalStats || !calorieStats) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Card title={texts.lastGoal}>
                {latestGoal ? (
                    <View>
                        <Text style={styles.title}>{latestGoal.goalName}</Text>
                        <Text style={styles.text}>
                            <Text style={styles.bold}>Datum:</Text> {new Date(latestGoal.date).toLocaleDateString()}
                        </Text>
                        <Text style={styles.text}>
                            <Text style={styles.bold}>{texts.calGoal}:</Text> {latestGoal.kcal} kcal
                        </Text>
                    </View>
                ) : (
                    <Text>Kein Ziel gefunden.</Text>
                )}
            </Card>

            <View style={styles.row}>
                <Card title={texts.goalStatistics} style={styles.halfWidth}>
                    <BarChart
                        data={{
                            labels: goalStats.labels,
                            datasets: goalStats.datasets,
                        }}
                        width={screenWidth * 0.9}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        xAxisLabel=""
                        yAxisInterval={1}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#ffa726"
                            }
                        }}
                        style={styles.chart}
                        verticalLabelRotation={30}
                    />
                </Card>

                <Card title={texts.calorieTracker} style={styles.halfWidth}>
                    <LineChart
                        data={{
                            labels: calorieStats.map((item: any) => item.date),
                            datasets: [
                                {
                                    data: calorieStats.map((item: any) => item.consumed),
                                    color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
                                    strokeWidth: 2,
                                },
                            ],
                        }}
                        width={screenWidth * 0.9}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=" kcal"
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#ffa726"
                            }
                        }}
                        style={styles.chart}
                        bezier
                        withDots={true}
                        withShadow={false}
                        withInnerLines={true}
                        withOuterLines={true}
                        withVerticalLines={true}
                        withHorizontalLines={true}
                    />
                    {latestGoal && (
                        <View style={styles.referenceLine}>
                            <Text style={styles.referenceText}>Ziel: {latestGoal.kcal} kcal</Text>
                        </View>
                    )}
                </Card>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '100%', // Auf kleinen Bildschirmen volle Breite
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
        marginBottom: 4,
    },
    bold: {
        fontWeight: 'bold',
    },
    referenceLine: {
        marginTop: 8,
        padding: 8,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 4,
    },
    referenceText: {
        color: 'red',
        fontWeight: 'bold',
    },
});

export default Dashboard;