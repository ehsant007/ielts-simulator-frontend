import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

import {defaultLocale, locales, Locale} from "@/i18n/config"

export default getRequestConfig(async () => {
	const store = await cookies();
	let locale = store.get('NEXT_LOCALE')?.value || defaultLocale

	if (!locales.includes(locale as Locale)) {
		locale = defaultLocale;
	}

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default
	};
});
