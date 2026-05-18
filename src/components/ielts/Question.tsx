"use client"
import { Question as QuestionType } from "@/client"
import { Checkbox, CheckboxGroup, Fieldset, HStack, Input, NativeSelect, RadioGroup, Separator, VStack, Text } from "@chakra-ui/react"
import { ChangeEventHandler, forwardRef, useEffect, useRef } from "react"
import { MD } from "./Content"
import { useModuleStore } from "./ModuleProvider"

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
	const answer = useModuleStore((state) => state.answers[question.num]) ?? ""
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const setAnswer = useModuleStore((state) => state.setAnswer)

	return <Input
		value={answer}
		onChange={(e) => setAnswer(question.num, [e.currentTarget.value])}
		id={`q${question.num}`}
		textAlign="center"
		placeholder={question.num.toString()}
		w="40"
		h="8"
		m="1"
		fontSize="md"
		variant="subtle"
		onFocus={() => focusQuestion(question.num)}
		ref={ref}
	/>
})

export const SingleChoice = forwardRef<HTMLDivElement, { question: QuestionType }>(({ question }, ref) => {
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const answer = useModuleStore((state) => state.answers[question.num])?.[0]
	const setAnswer = useModuleStore((state) => state.setAnswer)

	function toLetter(index: number) {
		return String.fromCharCode(65 + index);
	}

	return <>

		<HStack alignItems="start" p="3" onFocus={() => focusQuestion(question.num)} tabIndex={0} focusRing="outside" ref={ref}>

			<Text fontWeight="bold">{question.num}</Text>

			<VStack alignItems="start">
				<MD>{question.question}</MD>

				<Fieldset.Root>
					<RadioGroup.Root value={answer ?? null}>
						<VStack gap="2" align="start">
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

			</VStack>
		</HStack>
	</>
})


export const MultipleChoice = forwardRef<HTMLDivElement, { question: QuestionType }>(({ question }, ref) => {
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const answer = useModuleStore((state) => state.answers[question.num]) ?? []
	const setAnswer = useModuleStore((state) => state.setAnswer)

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

			</VStack>
		</HStack>
	</>
})


export const Matching = forwardRef<HTMLDivElement, QuestionProps>(({ question, options }, ref) => {
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const answer = useModuleStore((state) => state.answers[question.num])?.[0]
	const setAnswer = useModuleStore((state) => state.setAnswer)

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

			<Separator flex="1" ps="5" />
			<NativeSelect.Root size="sm" width="auto" minWidth="fit" fontWeight="bold">
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


		</HStack>
	)
})
