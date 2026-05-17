import { ExamRead, ModuleInfo } from "@/client";
import { Button, Link, Text, VStack, Wrap } from "@chakra-ui/react";
import { BsEar, BsQuestion } from "react-icons/bs";
import { FcReading, FcSpeaker } from "react-icons/fc";
import { GoRead } from "react-icons/go";
import { PiPen } from "react-icons/pi";


export function ModuleCard({ module }: { module: ModuleInfo | null }) {
	const iconSize = "100"
	const icon = {
		listening: <FcSpeaker size={iconSize} />,
		reading: <FcReading size={iconSize} />,
		writing: <PiPen size={iconSize} />,
		speaking: <FcSpeaker size={iconSize} />,
		default: <BsQuestion size={iconSize} />
	}

	return <Link href={`/ielts/modules/${module?.id}`}>
		<VStack border="md" borderRadius="md" p="3">
			{icon[module?.type ?? "default"]}
			<Text>{module?.type ?? "Module type"}</Text>
			<Text>{module?.tag}</Text>
		</VStack>
	</Link>
}

export function Exam({ exam }: { exam: ExamRead }) {
	return <Wrap>
		<ModuleCard module={exam.listening} />
		<ModuleCard module={exam.reading} />
		<ModuleCard module={exam.writing} />
		<ModuleCard module={exam.speaking} />
	</Wrap>
}