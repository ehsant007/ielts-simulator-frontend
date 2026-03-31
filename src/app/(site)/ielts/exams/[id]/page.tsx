import { readIeltsExamById } from "@/client";
import { HStack } from "@chakra-ui/react";
import Link from "next/link";

export default async function Exam({ params }: { params: Promise<{ id: string }> }) {
	const examId = (await params).id;



	const exam = (await readIeltsExamById({
		path: { exam_id: examId },
	})).data


	return (
		<>
			<h1>
				{ exam.title }
			</h1>
			<HStack p="10" gap="5">
				<Link href={`/ielts/modules/${exam.listening_id}`}>Listening</Link>
				<Link href={`/ielts/modules/${exam.reading_id}`}>Reading</Link>
				<Link href={`/ielts/modules/${exam.writing_id}`}>Writing</Link>
				<Link href={`/ielts/modules/${exam.speaking_id}`}>Speaking</Link>
			</HStack>
		</>
	)
}