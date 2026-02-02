export const languages = [
	{locale: 'en', name:'English'},
	{locale: 'fa', name:'فارسی'},
	{locale: 'ar', name:'العربية'},
]as const

export type Locale = (typeof languages)[number]['locale'];
export const locales = languages.map(lang => lang.locale);
export const defaultLocale: Locale = 'en';
