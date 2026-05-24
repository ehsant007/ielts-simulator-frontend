"use client"
import { Question as QuestionType } from "@/client"
import { Checkbox, CheckboxGroup, Fieldset, HStack, Input, NativeSelect, RadioGroup, Separator, VStack, Text, Box, Radiomark, Checkmark } from "@chakra-ui/react"
import { ChangeEventHandler, forwardRef, useEffect, useRef } from "react"
import { MD } from "./Content"
import { useModuleStore } from "./ModuleProvider"
import { useDroppable } from '@dnd-kit/react';

type QuestionProps = {
	question: QuestionType
	options?: Array<string> | undefined
	onChange?: ChangeEventHandler<HTMLSelectElement> | undefined
}


export function Question({ question, options, onChange }: QuestionProps) {
	const focused = useModuleStore((state) => { return state.questionsMeta[question.num].focused })
	const focusCount = useModuleStore((state) => state.questionsMeta[question.num].focusCount)
	const ref = useRef<any>(null)

	useEffect(() => {
		if (!focused)
			return

		const el = ref.current
		if (!el)
			return

		/*	To avoid infinite loop make sure the question is not already focused, because when a question is focused,
			it's onFocus event might refocus again to capture a focus that comes from user actions */
		if (document.activeElement === el) {
			return
		}

		el.scrollIntoView({
			behavior: "smooth",
			block: "center",
		})
		el.focus()
	}, [focused, focusCount])

	let ui = <></>
	switch (question.question_type) {
		case "completion": ui = <Completion ref={ref} question={question} />
			break
		case "single_choice": ui = <SingleChoice ref={ref} question={question} />
			break
		case "multiple_choice": ui = <MultipleChoice ref={ref} question={question} />
			break
		case "matching": ui = <Matching ref={ref} question={question} options={options} onChange={onChange} />
			break
		case "identify_info": ui = <Matching ref={ref} question={question} options={options} onChange={onChange} />
			break
		default:
			ui = <Text>question type `{question.question_type}` not implemented!</Text>
	}
	return ui
}

export const Completion = forwardRef<HTMLInputElement, { question: QuestionType }>(({ question }, ref) => {
	const answer = useModuleStore((state) => state.answers[question.num])?.[0] ?? ""
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const setAnswer = useModuleStore((state) => state.setAnswer)
	const mode = useModuleStore((state) => state.mode)
	const result = useModuleStore((state) => state.result[question.num])

	const correctAnswer = question.correct_answer[0];
	const isCorrect = result?.[0] > 0

	const { ref: dropRef } = useDroppable({ id: question.num });

	if (mode === "test") {
		return <Input
			value={answer}
			onChange={(e) => setAnswer(question.num, [e.currentTarget.value])}
			id={`q${question.num}`}
			textAlign="center"
			placeholder={question.num.toString()}	
			w={`${Math.max(answer.length, 17)}ch`}
			h="9"
			m="1"
			fontWeight="medium"
			fontSize="md"
			variant="subtle"
			color="purple.solid"
			onFocus={() => focusQuestion(question.num)}
			ref={(node) => {
				if (typeof ref === 'function') {
					ref(node);
				} else if (ref) {
					ref.current = node;
				}
				dropRef(node);
			}}
		/>
	}

	return (
		<HStack
			as="span"
			m="1"
			display="inline-flex"
			minH="8"
			minW="40"
			px="3"
			borderWidth="1px"
			borderRadius="md"
			alignItems="center"
			justifyContent="center"
			bg={isCorrect ? "bg.success" : answer ? "bg.error" : "bg.info"}
			borderColor={isCorrect ? "border.success" : answer ? "border.error" : "border.info"}
			fontWeight="medium"
			fontSize="md"
			gap={2}
			onFocus={() => focusQuestion(question.num)}
			ref={ref}
			tabIndex={0}
			focusRing="outside"
		>

			{answer &&
				<Box
					as="span"
					color={isCorrect ? "fg.success" : "fg.error"}
					textDecor={isCorrect ? "none" : "line-through"}
				>
					{answer}
				</Box>
			}

			{!isCorrect && (
				<Box
					as="span"
					color="fg.info">
					{correctAnswer}
				</Box>
			)}
		</HStack>
	)

})
Completion.displayName = "Completion"

export const SingleChoice = forwardRef<HTMLDivElement, { question: QuestionType }>(({ question }, ref) => {
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const answer = useModuleStore((state) => state.answers[question.num])?.[0]
	const setAnswer = useModuleStore((state) => state.setAnswer)
	const mode = useModuleStore((state) => state.mode)

	function toLetter(index: number) {
		return String.fromCharCode(65 + index);
	}

	return <>

		<HStack alignItems="start" p="3" onFocus={() => focusQuestion(question.num)} tabIndex={0} focusRing="outside" ref={ref}>

			<Text fontWeight="bold">{question.num}</Text>

			<VStack alignItems="start">
				<MD>{question.question}</MD>

				{mode === "test" &&
					<Fieldset.Root>
						<RadioGroup.Root value={answer ?? null}>
							<VStack gap="2" align="start" >
								{
									question.choices?.map((choice, i) => (
										<RadioGroup.Item
											key={choice}
											value={toLetter(i)}
											onPointerUp={() => {
												const item_value = toLetter(i)
												setAnswer(question.num, answer == item_value ? [] : [item_value])
											}}
										>
											<RadioGroup.ItemHiddenInput />
											<RadioGroup.ItemIndicator />
											<RadioGroup.ItemText>{choice}</RadioGroup.ItemText>
										</RadioGroup.Item>
									))
								}
							</VStack>
						</RadioGroup.Root>
					</Fieldset.Root>
				}

				{mode === "review" && (
					<VStack gap="2" align="start">
						{question.choices?.map((choice, i) => {
							const letter = toLetter(i)

							const isSelected = answer === letter
							const isCorrectChoice = question.correct_answer[0] === letter

							let markProps = {}

							if (isSelected) {
								markProps = isCorrectChoice
									? { borderColor: "border.success", bg: "bg.success", color: "fg.success", checked: true }
									: { borderColor: "border.error", bg: "bg.error", color: "fg.error", checked: true }
							}
							else if (isCorrectChoice) {
								markProps = { borderColor: "border.info", bg: "bg.info", color: "fg.info", checked: true }
							}

							return (
								<HStack key={letter}>
									<Radiomark {...markProps} />
									<Text ms="0.5" fontSize="sm" fontWeight="medium">
										{choice}
									</Text>
								</HStack>
							)
						})}
					</VStack>
				)}

			</VStack>
		</HStack>
	</>
})
SingleChoice.displayName = "SingleChoice"


export const MultipleChoice = forwardRef<HTMLDivElement, { question: QuestionType }>(({ question }, ref) => {
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const answer = useModuleStore((state) => state.answers[question.num]) ?? []
	const setAnswer = useModuleStore((state) => state.setAnswer)
	const mode = useModuleStore((state) => state.mode)

	function toLetter(index: number) {
		return String.fromCharCode(65 + index);
	}

	return <>

		<HStack
			alignItems="start"
			p="3"
			onFocus={() => focusQuestion(question.num)}
			tabIndex={0}
			focusRing="outside"
			ref={ref}
		>
			<VStack>

				<MD>{question.question}</MD>

				{mode === "test" &&
					<Fieldset.Root mt="2">
						<CheckboxGroup
							value={answer}
							onValueChange={(answer) => setAnswer(question.num, answer)}>
							<Fieldset.Content>

								{question.choices?.map((choice, i) => (
									<Checkbox.Root key={i} value={toLetter(i)}>
										<Checkbox.HiddenInput disabled={answer.length >= 2 && !answer.includes(toLetter(i))} />
										<Checkbox.Control />
										<Checkbox.Label>{choice}</Checkbox.Label>
									</Checkbox.Root>
								))}

							</Fieldset.Content>
						</CheckboxGroup>
					</Fieldset.Root>
				}


				{mode === "review" && (
					<VStack gap="2" align="start">
						{question.choices?.map((choice, i) => {
							const letter = toLetter(i)

							const isSelected = answer.includes(letter)
							const isCorrectChoice = question.correct_answer.includes(letter)

							let markProps = {}

							if (isSelected) {
								markProps = isCorrectChoice
									? { borderColor: "border.success", bg: "bg.success", color: "fg.success", checked: true }
									: { borderColor: "border.error", bg: "bg.error", color: "fg.error", checked: true }
							}
							else if (isCorrectChoice) {
								markProps = { borderColor: "border.info", bg: "bg.info", color: "fg.info", checked: true }
							}

							return (
								<HStack key={letter}>
									<Checkmark {...markProps} />
									<Text ms="0.5" fontSize="sm" fontWeight="medium">
										{choice}
									</Text>
								</HStack>
							)
						})}
					</VStack>
				)}

			</VStack>
		</HStack>
	</>
})
MultipleChoice.displayName = "MultipleChoice"

export const Matching = forwardRef<HTMLDivElement, QuestionProps>(({ question, options }, ref) => {
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const answer = useModuleStore((state) => state.answers[question.num])?.[0]
	const setAnswer = useModuleStore((state) => state.setAnswer)
	const mode = useModuleStore((state) => state.mode)
	const result = useModuleStore((state) => state.result[question.num])

	const correctAnswer = question.correct_answer[0];
	const isCorrect = result?.[0] > 0

	return (
		<HStack
			onFocus={() => focusQuestion(question.num)}
			tabIndex={0}
			focusRing="outside"
			ref={ref}
			px="3"
			py="1"
		>
			<HStack alignItems="start">
				<Text fontWeight="bold">{question.num}</Text>
				<Text>{question.question}</Text>
			</HStack>

			{mode === "test" && (
				<>
					<Separator flex="1" ps="5" />

					<NativeSelect.Root
						size="sm"
						width="auto"
						minWidth="fit"
						fontWeight="medium"
					>
						<NativeSelect.Field
							value={answer}
							placeholder="----"
							onChange={(e) => setAnswer(question.num, [e.currentTarget.value])}
						>
							{
								options?.map((apt, i) => <option key={i} value={apt}>{apt}</option>)
							}
						</NativeSelect.Field>
						<NativeSelect.Indicator />
					</NativeSelect.Root>
				</>
			)
			}

			{mode === "review" && (
				<>
					<Separator flex="1" ps="5" borderColor={isCorrect ? "border.success" : answer ? "border.error" : "border.info"} />
					<HStack
						as="span"
						m="1"
						display="inline-flex"
						minH="8"
						minW="40"
						px="3"
						borderWidth="1px"
						borderRadius="md"
						alignItems="center"
						justifyContent="center"
						bg={isCorrect ? "bg.success" : answer ? "bg.error" : "bg.info"}
						borderColor={isCorrect ? "border.success" : answer ? "border.error" : "border.info"}
						fontWeight="medium"
						fontSize="sm"
						gap={2}
					>

						{answer &&
							<Box
								as="span"
								color={isCorrect ? "fg.success" : "fg.error"}
								textDecor={isCorrect ? "none" : "line-through"}
							>
								{answer}
							</Box>
						}

						{!isCorrect && (
							<Box
								as="span"
								color="fg.info">
								{correctAnswer}
							</Box>
						)}
					</HStack>
				</>
			)
			}


		</HStack>
	)
})
Matching.displayName = "Matching"
