import {createContext, useState, ReactNode, useContext} from 'react';

type Language = 'de' | 'en' | 'al';
interface LanguageContextType {
    language: Language;
    texts: typeof texts['de'];
    setLanguage: (lang: Language) => void;
}

const texts = {
    de: {
        settings: 'Einstellungen'
    },
    en: {
        settings:'Settings'
    }
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('de');

    // @ts-ignore
    return <LanguageContext.Provider value={{language, texts: texts[language], setLanguage}}>
        {children}
    </LanguageContext.Provider>;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};