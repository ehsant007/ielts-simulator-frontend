'use client'

//import Image from "next/image";
//import styles from "./page.module.css";
import { VStack } from "@chakra-ui/react";
import OffersSection from "@/components/home/OffersSection";
//import TradingViewWidget from "@/components/util/tradingViewWidget";
import HeroSection from "@/components/home/HeroSection";
import OnboardingTimeline from "@/components/home/OnboardingTimeline";
import OfferSearch from "@/components/home/OfferSearch";

export default function Home() {

	return (
		<VStack gap={0} align="stretch">
			<HeroSection />
			{/* <TradingViewWidget /> */}
			<OfferSearch p="10" bg="bg.panel"/>
			<OffersSection />
			<OnboardingTimeline />
		</VStack>
	);
}
