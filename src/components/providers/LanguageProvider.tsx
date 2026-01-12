"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, Translations, translations, defaultLanguage } from '@/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'maliyo-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(defaultLanguage);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load saved language on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null;
            if (savedLanguage && translations[savedLanguage]) {
                setLanguageState(savedLanguage);
            }
            setIsInitialized(true);
        }
    }, []);

    // Update document language attribute
    useEffect(() => {
        if (typeof document !== 'undefined' && isInitialized) {
            document.documentElement.lang = language;
        }
    }, [language, isInitialized]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, lang);
        }
    }, []);

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

// Export translations getter for non-component contexts (SSR fallback)
export function getTranslations(lang: Language = defaultLanguage): Translations {
    return translations[lang];
}
