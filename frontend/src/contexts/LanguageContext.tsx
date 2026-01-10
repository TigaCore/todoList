import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import zhTranslations from '../i18n/zh.json';
import enTranslations from '../i18n/en.json';

export type Language = 'zh' | 'en';

type TranslationData = typeof zhTranslations;

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, TranslationData> = {
    zh: zhTranslations,
    en: enTranslations,
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'language';

function getNestedValue(obj: any, path: string): string {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return path; // Return key if translation not found
        }
    }
    return typeof result === 'string' ? result : path;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'zh' || stored === 'en') {
            return stored;
        }
        // Auto-detect from browser
        const browserLang = navigator.language.toLowerCase();
        return browserLang.startsWith('zh') ? 'zh' : 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    };

    const t = useCallback((key: string): string => {
        return getNestedValue(translations[language], key);
    }, [language]);

    // Update document lang attribute
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextValue => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
