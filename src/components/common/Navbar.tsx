'use client';

import {
	HStack,
	Link as CLink,
	Spacer,
	Container,
	Box
} from "@chakra-ui/react"

import { ColorModeButton } from "@/components/ui/color-mode";
import Link from "next/link";
import { LocaleSwitcher } from "@/i18n";
import { UserMenu } from "./UserMenu";

export default function Navbar() {
	return (
		<Box
			bg="purple.emphasized"
		>
			<Container
				as="nav"
				maxW="7xl"
				px="6"
				py="3"
				display="flex"
			>
				<HStack
					gap="3"
					pl="6"
					display={{ base: "none", md: "flex" }}
				>
					<CLink fontSize="lg" fontWeight="bold" asChild>
						<Link href="/">
							Exchange
						</Link>
					</CLink>

					<Link href="/">Home</Link>
					<Link href="/dashboard">Dashboard</Link>
					<Link href="/about">About</Link>
					<Link href="/contact">Contact</Link>
				</HStack>

				<Spacer />

				<HStack gap="4">
					<LocaleSwitcher />
					<ColorModeButton />
					<UserMenu />
				</HStack>
			</Container>
		</Box>
	)
}