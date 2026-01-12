import { Language, Translations } from './types';
import az from './translations/az.json';
import ru from './translations/ru.json';
import en from './translations/en.json';

export const translations: Record<Language, Translations> = {
    az: az as Translations,
    ru: ru as Translations,
    en: en as Translations,
};

export const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
];

export const defaultLanguage: Language = 'az';

export type { Language, Translations };
export { type Translations as TranslationKeys } from './types';
