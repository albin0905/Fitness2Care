import React from 'react';
import { View, StyleSheet } from 'react-native';
import MenuBar from '../layout/Menubar';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <View style={styles.container}>
            <MenuBar />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
    },
    content: {
        flex: 1,
        padding: 16,
        marginLeft: 250,
    },
});

export default Layout;