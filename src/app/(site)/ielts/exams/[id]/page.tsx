import { readIeltsExamById } from "@/client";
import {Exam} from "@/components/ielts/Exam"

export default async function ExamId({ params }: { params: Promise<{ id: string }> }) {
	const examId = (await params).id;

	const exam = (await readIeltsExamById({
		path: { exam_id: examId },
	})).data

	return <Exam exam={exam}/>
}