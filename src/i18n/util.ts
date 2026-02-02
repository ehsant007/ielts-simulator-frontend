import { useLocale } from "next-intl";

const rtlLocales = ['fa', 'ar', 'he', 'ur'];
export function localeDir(locale: string): 'ltr' | 'rtl' {
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

export function useLocaleDir(): 'ltr' | 'rtl' {
	const locale = useLocale();
	return localeDir(locale);
}

