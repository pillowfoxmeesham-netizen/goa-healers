import React, { createContext, useContext, useState, useCallback } from 'react';

import en from './en.json';
import kok from './kok.json';
import mr from './mr.json';

const translations = { en, kok, mr };

export const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'kok', label: 'कोंकणी', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('goahealers-lang') || 'en';
    });

    const changeLang = useCallback((code) => {
        setLang(code);
        localStorage.setItem('goahealers-lang', code);
    }, []);

    const t = useCallback(
        (key) => {
            return translations[lang]?.[key] || translations.en[key] || key;
        },
        [lang]
    );

    return (
        <LanguageContext.Provider value={{ lang, changeLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
    return ctx;
}
