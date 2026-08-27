"use client"

import TanstackQueryProvider from "./tanstack-query-provider"
import ChakraProvider from "@/components/ui/chakra-provider"
import { Locale, NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from "@/auth/AuthProvider"
import { type User } from "@/auth";
import { LangToolsProvider } from "@/components/lang-tools";
import { PopoverMenu } from "@/components/lang-tools";
import { Browser } from "@/components/dictionary"

interface Props {
	children: React.ReactNode;
	user: User | undefined;
	locale: Locale;
	messages: Record<string, unknown>;
}

export default function ProvidersStack({ children, user, locale, messages }: Props) {

	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	return (
		<NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
			<ChakraProvider>
				<AuthProvider user={user}>
					<TanstackQueryProvider>

						<LangToolsProvider>
							{children}
							
							<Browser />
							<PopoverMenu />
						</LangToolsProvider>

					</TanstackQueryProvider>
				</AuthProvider>
			</ChakraProvider>
		</NextIntlClientProvider>
	)
}