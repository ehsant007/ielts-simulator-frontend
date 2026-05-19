'use client'

import { useAuth } from "@/auth";
import { Avatar, Button, Link, Menu, Portal } from "@chakra-ui/react"

export function UserMenu() {
	const { user, logout } = useAuth();

	if (user) {
		return (
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
		)
	} else {
		return (
			<Button variant="ghost" size="sm" asChild>
				<Link href="/login">
					Log In
				</Link>
			</Button>
		)
	}
}