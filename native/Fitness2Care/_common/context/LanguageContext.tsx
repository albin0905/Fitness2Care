import { createContext, useState, ReactNode, useContext } from 'react';

type Language = 'de' | 'en';
interface LanguageContextType {
    language: Language;
    texts: typeof texts['de'];
    setLanguage: (lang: Language) => void;
}

const texts = {
    de: {
        settings: 'Einstellungen',
        dashboard: 'Startseite',
        workout: 'Workout',
        progress: 'Fortschritt',
        goal: 'Ziel',
        calorieTracker: 'Kalorientracker',
        account: 'Konto',
        logout: 'Abmelden',
        german: 'Deutsch',
        english: 'Englisch',
        lastGoal: 'Letztes Ziel',
        goalStatistics: 'Zielstatistik',
        calGoal: 'Kalorienziel',
    },
    en: {
        settings: 'Settings',
        dashboard: 'Dashboard',
        workout: 'Workout',
        progress: 'Progress',
        goal: 'Goal',
        calorieTracker: 'Calorie Tracker',
        account: 'Account',
        logout: 'Logout',
        german: 'German',
        english: 'English',
        lastGoal: 'Last Goal',
        goalStatistics: 'Goal Statistics',
        calGoal: 'Calorie Goal',
    }
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('de');

    return (
        <LanguageContext.Provider value={{ language, texts: texts[language], setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
