// components/LocaleSwitcher.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button, Menu, Portal, Spinner } from "@chakra-ui/react";
import { MdOutlineLanguage } from "react-icons/md";

import { useLocale } from 'next-intl';
import { Locale, languages } from "@/i18n/config"
import { setUserLocale } from "@/i18n/cookie";
import { useTransition } from 'react';

/**
 * LocaleSwitcher: a small, accessible select that updates the NEXT_LOCALE cookie
 * by calling POST /api/locale and then refreshes the app to pick up server-side messages.
 */
export function LocaleSwitcher() {
	const locale = useLocale();
	const [selectedLocale, SetSelectedLocale] = useState(locale)
	const [isPending, startTransition] = useTransition();
	const [isMounted, setIsMounted] = useState(false)

	function onChange(value: string) {
		const locale = value as Locale;
		startTransition(() => {
			setUserLocale(locale);
		});
	}

	useEffect(() => {
		const onMount = () => {
			setIsMounted(true);
		}
		
		onMount();
	}, [])

	return (
		<Menu.Root onSelect={(e) => onChange(e.value)}>
			<Menu.Trigger asChild>
				{
					isMounted &&
					<Button p="0" variant="ghost" size="md">
						{!isPending && <MdOutlineLanguage />}
						{isPending && <Spinner />}
					</Button>
				}
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content minW="10rem">
						<Menu.RadioItemGroup
							value={selectedLocale}
							onValueChange={(e) => SetSelectedLocale(e.value)}
						>
							{languages.map((lang) => (
								<Menu.RadioItem key={lang.locale} value={lang.locale}>
									{lang.name}
									<Menu.ItemIndicator />
								</Menu.RadioItem>
							))}
						</Menu.RadioItemGroup>
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	);
}
