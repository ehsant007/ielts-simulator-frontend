"use client"
import { Question as QuestionType } from "@/client"
import { Checkbox, CheckboxGroup, Fieldset, HStack, Input, NativeSelect, RadioGroup, Separator, VStack } from "@chakra-ui/react"
import { Text, Box } from "@chakra-ui/react"
import { ChangeEvent, ChangeEventHandler, forwardRef, RefObject, useCallback, useEffect, useRef, useState } from "react"
import { MD } from "./Content"
import { useAnswers, useModule, useQuestionFucus } from "./ModuleProvider"


type QuestionProps = {
	question: QuestionType
	options?: Array<string> | undefined
	onChange?: ChangeEventHandler<HTMLSelectElement> | undefined
}


export function Question({ question, options, onChange }: QuestionProps) {

	const { registerQuestionRef } = useModule()
	const setRef = useCallback(
		(el: any) => {
			registerQuestionRef(question.num, el)
		}, [registerQuestionRef, question.num])

	console.log(`Question ${question.num}`)

	let ui = <></>
	switch (question.question_type) {
		case "completion": ui = <Completion ref={setRef} question={question} />
			break
		case "single_choice": ui = <SingleChoice ref={setRef} question={question} />
			break
		case "multiple_choice": ui = <MultipleChoice ref={setRef} question={question} />
			break
		case "matching": ui = <Matching ref={setRef} question={question} options={options} onChange={onChange} />
			break
		default:
			ui = <Text>question type `{question.type}` not implemented!</Text>
	}
	return ui
}

export const Completion = forwardRef<HTMLInputElement, { question: QuestionType }>(({ question }, ref) => {
	const answers = useAnswers()

	return <Input
		defaultValue={answers.get(question.num)?.[0]}
		onChange={(e) => answers.set(question.num, [e.currentTarget.value])}
		id={`q${question.num}`}
		textAlign="center"
		placeholder={question.num.toString()}
		w="40"
		h="8"
		m="1"
		fontSize="md"
		variant="subtle"
		ref={ref}
	/>
})

export const SingleChoice = forwardRef<HTMLDivElement, { question: QuestionType }>(({ question }, ref) => {
	const answers = useAnswers()

	function toLetter(index: number) {
		return String.fromCharCode(65 + index);
	}

	return <>

		<HStack alignItems="start" p="3" tabIndex={0} focusRing="outside" ref={ref}>

			<Text fontWeight="bold">{question.num}</Text>

			<VStack>
				<MD>{question.question}</MD>

				<Fieldset.Root>
					<RadioGroup.Root defaultValue={answers.get(question.num)?.[0]}>
						<VStack gap="2" align="start">
							{
								question.choices?.map((choice, i) => (
									<RadioGroup.Item
										key={choice}
										value={toLetter(i)}
										onPointerUp={() => {
											const item_value = toLetter(i)
											const prev = answers.get(question.num)?.[0]
											if (prev === item_value) {
												answers.delete(question.num)
											} else {
												answers.set(question.num, [item_value])
											}
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
	const answers = useAnswers()
	const [values, setValues] = useState<string[]>(answers.get(question.num) ?? [])

	function toLetter(index: number) {
		return String.fromCharCode(65 + index);
	}

	const setAnswer = (answer: string[]) => {
		setValues(answer)
		answers.set(question.num, answer)
	}


	return <>

		<HStack alignItems="start" p="3" tabIndex={0} focusRing="outside" ref={ref}>

			<Text fontWeight="bold">{question.num}</Text>

			<VStack>
				<MD>{question.question}</MD>

				<Fieldset.Root>
					<CheckboxGroup value={values} onValueChange={setAnswer}>
						<Fieldset.Content>

							{question.choices?.map((choice, i) => (
								<Checkbox.Root key={i} value={toLetter(i)} pb="0">
									<Checkbox.HiddenInput disabled={values.length >= 2 && !values.includes(toLetter(i))} />
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


export const Matching = forwardRef<HTMLSelectElement, QuestionProps>(({ question, options, onChange }, ref) => {
	const answers = useAnswers()

	const setAnswer = (e: ChangeEvent<HTMLSelectElement>) => {
		answers.set(question.num, [e.currentTarget.value])
		onChange?.(e)
	}

	return <HStack>
		<Text fontWeight="bold">{question.num}</Text>
		<Text>{question.question}</Text>
		<Separator flex="1" ps="10" />
		<NativeSelect.Root size="sm" width="auto">
			<NativeSelect.Field ref={ref} defaultValue={answers.get(question.num)?.[0]} placeholder="----" onChange={setAnswer}>
				{
					options?.map((apt, i) => <option key={i} value={apt}>{apt}</option>)
				}
			</NativeSelect.Field>
			<NativeSelect.Indicator />
		</NativeSelect.Root>

	</HStack>
})
