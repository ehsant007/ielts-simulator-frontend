//import Image from "next/image";
//import styles from "./page.module.css";
import { VStack, Text } from "@chakra-ui/react";
import HeroSection from "@/components/home/HeroSection";
import OnboardingTimeline from "@/components/home/OnboardingTimeline";
import { readIeltsExams } from "@/client";

export default async function Home() {

	const exams = (await readIeltsExams());

	return (
		<VStack gap={0} align="stretch">
			{exams.data.map((exam)=>(
				<Text>{exam.title}</Text>
			))

			}
		</VStack>
	);
}
