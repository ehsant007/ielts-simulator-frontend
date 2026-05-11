"use client"
import { Question as QuestionType } from "@/client"
import { Checkbox, CheckboxGroup, Fieldset, HStack, Input, NativeSelect, RadioGroup, Separator, VStack } from "@chakra-ui/react"
import { Text, Box } from "@chakra-ui/react"
import { ChangeEventHandler, forwardRef, useEffect, useRef, useState } from "react"
import { MD } from "./Content"
import { useModule } from "./ModuleProvider"


type QuestionProps = {
	question: QuestionType
	options?: Array<string> | undefined
	onChange?: ChangeEventHandler<HTMLSelectElement> | undefined
}


export function Question({ question, options, onChange }: QuestionProps) {

	// 	const { setQuestionRef } = useModule()
	// const ref = useRef<(any | null)>(null)

	// useEffect(() => {
	// 	setQuestionRef(question, ref)
	// }, [ref])

	const { focusedQuestion, tick } = useModule()
	const ref = useRef<(any | null)>(null)
	useEffect(() => {
		if (focusedQuestion.num === question.num) {
			ref.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			})
			
			ref.current?.focus()
		}
	}, [focusedQuestion, tick])
	//console.log(focusedQuestion.num)
	console.log(`Question ${question.num}`)

	let ui = <></>
	switch (question.question_type) {
		case "completion": ui = <Completion ref={ref} question={question} />
			break
		case "multiple_choice": ui = <MultipleChoice ref={ref} question={question} />
			break
		case "matching": ui = <Matching ref={ref} question={question} options={options} onChange={onChange} />
			break
		default:
			ui = <Text>question type `{question.type}` not implemented!</Text>
	}
	return ui
}

export const Completion = forwardRef<HTMLInputElement, { question: QuestionType }>(({ question }, ref) => {
	const [value, setValue] = useState("")

	return <Input
		value={value}
		onChange={(e)=>setValue(e.currentTarget.value)}
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

export const MultipleChoice = forwardRef<HTMLDivElement, { question: QuestionType }>(({ question }, ref) => {
	const [value, setValue] = useState<string | null>(null)
	const [values, setValues] = useState<string[]>([])

	function toLetter(index: number) {
		return String.fromCharCode(65 + index);
	}


	return <>

		<HStack alignItems="start" p="3" tabIndex={0} focusRing="outside" ref={ref}>
			{/* question.to_num &&
				<Text fontWeight="bold">{question.num}-{question.to_num}</Text>
			} */}
			{!question.to_num &&
				<Text fontWeight="bold">{question.num}</Text>
			}

			<VStack>
				<MD>{question.question}</MD>

				{!question.to_num &&
					<Fieldset.Root>
						<RadioGroup.Root value={value}>
							<VStack gap="2" align="start">
								{
									question.choices?.map((choice, i) => (
										<RadioGroup.Item key={i} value={toLetter(i)} onPointerUp={() => {
											const item_value = toLetter(i)
											setValue(prev => (prev === item_value ? null : item_value))
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

				{question.to_num &&
					<Fieldset.Root>
						<CheckboxGroup value={values} onValueChange={setValues}>
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
				}
			</VStack>
		</HStack>
	</>
})


export const Matching = forwardRef<HTMLSelectElement, QuestionProps>(({ question, options, onChange }, ref) => {
	return <HStack>
		<Text fontWeight="bold">{question.num}</Text>
		<Text>{question.question}</Text>
		<Separator flex="1" ps="10" />
		<NativeSelect.Root size="sm" width="auto">
			<NativeSelect.Field ref={ref} placeholder="----" onChange={onChange}>
				{
					options?.map((apt, i) => <option key={i} value={apt}>{apt}</option>)
				}
			</NativeSelect.Field>
			<NativeSelect.Indicator />
		</NativeSelect.Root>

	</HStack>
})
