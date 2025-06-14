import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemberContext } from '../../../../frontend/src/_common/context/MemberContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../../../frontend/src/_common/context/LanguageContext';

type RootStackParamList = {
    Dashboard: undefined;
    Workout: undefined;
    Progress: undefined;
    Goal: undefined;
    CalorieTracker: undefined;
    Account: undefined;
    Login: undefined;
};

const MenuBar = () => {
    const { member } = useMemberContext();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { language, setLanguage, texts } = useLanguage();

    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const languages = [
        { label: 'Deutsch', value: 'de' },
        { label: 'English', value: 'en' }
    ];

    const handleLogout = () => {
        navigation.navigate('Login');
    };

    const isActive = (routeName: keyof RootStackParamList) => {
        return route.name === routeName;
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                    <Image
                        source={require('../../assets/Fitness2Care_Logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.languageSelector}
                onPress={() => setShowLanguageModal(true)}
            >
                <Text style={styles.languageText}>
                    {language === 'de' ? 'Deutsch' : 'English'}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#000" />
            </TouchableOpacity>

            <Modal
                visible={showLanguageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowLanguageModal(false)}
                >
                    <View style={styles.modalContent}>
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.value}
                                style={[
                                    styles.languageOption,
                                    language === lang.value && styles.selectedLanguage
                                ]}
                                onPress={() => {
                                    setLanguage(lang.value as 'de' | 'en');
                                    setShowLanguageModal(false);
                                }}
                            >
                                <Text style={styles.languageOptionText}>{lang.label}</Text>
                                {language === lang.value && (
                                    <Icon name="check" size={20} color="#007AFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <ScrollView style={styles.menuItems}>
                {[
                    { route: 'Dashboard', text: texts.dashboard },
                    { route: 'Workout', text: texts.workout },
                    { route: 'Progress', text: texts.progress },
                    { route: 'Goal', text: texts.goal },
                    { route: 'CalorieTracker', text: texts.calorieTracker }
                ].map((item) => (
                    <TouchableOpacity
                        key={item.route}
                        style={[
                            styles.menuItem,
                            isActive(item.route as keyof RootStackParamList) && styles.activeMenuItem
                        ]}
                        onPress={() => navigation.navigate(item.route as keyof RootStackParamList)}
                    >
                        <Text style={styles.menuText}>{item.text}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.accountItem}
                onPress={() => navigation.navigate('Account')}
            >
                <Icon name="account-circle" size={24} color="#000" />
                <Text style={styles.accountText}>
                    {member?.firstName} {member?.lastName}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Icon name="logout" size={20} color="#dc3545" />
                <Text style={styles.logoutText}>{texts.logout}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 250,
        height: '100%',
        backgroundColor: 'white',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 190,
        height: undefined,
        aspectRatio: 1,
    },
    languageSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginBottom: 20,
    },
    languageText: {
        fontSize: 16,
    },
    menuItems: {
        flex: 1,
        width: '100%',
    },
    menuItem: {
        paddingVertical: 12,
        marginBottom: 8,
    },
    activeMenuItem: {
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        borderRadius: 4,
    },
    menuText: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
    },
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginBottom: 16,
    },
    accountText: {
        fontSize: 18,
        color: '#000',
        marginLeft: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#dc3545',
        borderRadius: 4,
    },
    logoutText: {
        color: '#dc3545',
        fontSize: 18,
        marginLeft: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
    },
    languageOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    selectedLanguage: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    languageOptionText: {
        fontSize: 18,
    },
});

export default MenuBar;