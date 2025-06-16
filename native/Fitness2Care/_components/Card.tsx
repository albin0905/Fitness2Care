import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CardProps {
    title: string;
    children: React.ReactNode;
    style?: object;
    onPress?: () => void;
}

const Card = ({ title, children, style, onPress }: CardProps) => {
    const ContainerComponent = onPress ? TouchableOpacity : View;

    return (
        <ContainerComponent
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.headerText}>{title}</Text>
            </View>
            <View style={styles.body}>
                {children}
            </View>
        </ContainerComponent>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '100%',
    },
    header: {
        backgroundColor: '#007bff',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        padding: 12,
    },
    headerText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    body: {
        padding: 16,
    },
});

export default Card;