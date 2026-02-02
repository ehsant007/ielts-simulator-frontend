"use client"

import {
	Button,
	Image,
	Separator,
	Spacer,
	VStack,
} from "@chakra-ui/react"

import { ComponentProps } from "react"

import {
	MdLogout,
	MdOutlineLocalOffer,
	MdOutlineVerifiedUser,
	MdHome,
	MdPayment,
	MdAccountBalance,
} from "react-icons/md"

import { BiChat } from "react-icons/bi"
import { AiOutlineUser } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";

import Link from "next/link"
import { useTranslations } from "next-intl"
import { logout } from "@/auth"

type NavButtonProps = ComponentProps<typeof Link>

function NavButton({ children, ...props }: NavButtonProps) {
	return (

		<Button
			variant="ghost"
			size="lg"
			rounded="none"
			justifyContent="start"
			asChild
		>
			<Link {...props}>
				{children}
			</Link>
		</Button>

	)
}

export default function Sidebar() {
	const t = useTranslations("dashboard.layout.SidebarBody")

	return (
		<VStack p="0" h="100vh" gap="4" align="stretch">
			<Image src="/logo.svg" px="8" pt="2" alt="logo"></Image>

			<VStack mt="2" h="100vh" align="stretch">
				<NavButton href="/dashboard"><MdHome />{t("home")}</NavButton>
				<NavButton href="/dashboard/offers"><MdOutlineLocalOffer />{t("offers")}</NavButton>
				<NavButton href="/dashboard/tickets"><BiChat />{t("tickets")}</NavButton>
				<NavButton href="/dashboard/accounts"><MdAccountBalance />{t("accounts")}</NavButton>
				<NavButton href="/dashboard/payments"><MdPayment />{t("payments")}</NavButton>
				<NavButton href="/dashboard/profile"><AiOutlineUser /> {t("profile")}</NavButton>
				<NavButton href="/dashboard/verify"><MdOutlineVerifiedUser />{t("verification")}</NavButton>
				<Spacer />
				<Separator />
				<NavButton href="#"><IoSettingsOutline /> {t("settings")}</NavButton>
				<NavButton href="#" onClick={()=>logout("/login")}><MdLogout /> {t("logout")}</NavButton>
			</VStack>
		</VStack>
	)
}