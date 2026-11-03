"use client"

import { Locale, NextIntlClientProvider } from 'next-intl';
import { type User } from "@/auth";
import { AuthProvider } from "@/auth/AuthProvider"
import { LangToolsProvider, PopoverMenu } from "@/components/lang-tools";
import { LookupFloating } from "@/components/lookup"
import ChakraProvider from "@/components/ui/chakra-provider"
import { BreakPointProvider } from "./BreakPointProvider";
import TanstackQueryProvider from "./tanstack-query-provider"

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
				<BreakPointProvider>
					<AuthProvider user={user}>
						<TanstackQueryProvider>
							<LangToolsProvider>
								{children}

								<LookupFloating />
								<PopoverMenu />
							</LangToolsProvider>
						</TanstackQueryProvider>
					</AuthProvider>
				</BreakPointProvider>
			</ChakraProvider>
		</NextIntlClientProvider>
	)
}