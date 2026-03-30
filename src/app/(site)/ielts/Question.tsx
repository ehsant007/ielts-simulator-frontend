

type Question = {
	id: string,
	number: number,
}

type QuestionProps = {
	children: React.ReactNode,
	question: Question,
}

export default function Question({ children, question }: QuestionProps){
	return <div>Question Page</div>
}
