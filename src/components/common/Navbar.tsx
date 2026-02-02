'use client';

import {
	HStack,
	Button,
	Link as CLink,
	Spacer,
	Container,
	Avatar,
	Menu,
	Portal,
	Box
} from "@chakra-ui/react"

import { ColorModeButton } from "@/components/ui/color-mode";
import { useAuth } from "@/auth";
import Link from "next/link";
import { LocaleSwitcher } from "@/i18n";

export default function Navbar() {
	const { user, logout } = useAuth();

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

					{
						user &&
						<Menu.Root positioning={{ placement: "right-end" }}>
							<Menu.Trigger rounded="full" focusRing="outside">
								<Avatar.Root size="sm">
									<Avatar.Fallback name={user?.username} />
									<Avatar.Image src={user?.profile?.avatar || "#"} />
								</Avatar.Root>
							</Menu.Trigger>
							<Portal>
								<Menu.Positioner>
									<Menu.Content>
										<Menu.Item value="dashboard" asChild>
											<Link href="/dashboard">Dashboard</Link>
										</Menu.Item>
										<Menu.Item value="settings">Settings</Menu.Item>
										<Menu.Item value="logout" onClick={() => logout()}>Logout</Menu.Item>
									</Menu.Content>
								</Menu.Positioner>
							</Portal>
						</Menu.Root>
					}


					{
						!user &&
						<Button variant="ghost" size="sm" asChild>
							<Link href="/login">
								Log In
							</Link>
						</Button>
					}

				</HStack>
			</Container>
		</Box>
	)
}