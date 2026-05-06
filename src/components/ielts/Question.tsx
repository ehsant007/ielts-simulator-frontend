"use client"
import { Question as QuestionType } from "@/client"
import { Checkbox, CheckboxGroup, Fieldset, HStack, Input, RadioGroup, VStack } from "@chakra-ui/react"
import { Text } from "@chakra-ui/react"
import { useState } from "react"
import { MD } from "./Content"

export function Question({ question }: { question: QuestionType }) {
	switch (question.question_type) {
		case "completion": return <Completion question={question} />
		case "multiple_choice": return <MultipleChoice question={question} />
	}
	return <>
		{question.type}
	</>
}

export function Completion({ question }: { question: QuestionType }) {
	return <Input
		id={`q${question.num}`}
		w="auto"
		textAlign="center"
		placeholder={question.num.toString()}
		m="2"
	/>
}


export function MultipleChoice({ question }: { question: QuestionType }) {

	const [value, setValue] = useState<string | null>(null)
	const [values, setValues] = useState<string[]>([])

	function toLetter(index: number) {
		return String.fromCharCode(65 + index);
	}


	return <>

		<HStack alignItems="flex-start" pb="3">
			<Text fontWeight="bold">{question.num}</Text>
			<VStack>
				<MD>{question.question}</MD>

				{!Array.isArray(question.num) &&
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

				{Array.isArray(question.num) &&
					<Fieldset.Root>
						<CheckboxGroup name={question.id} value={values} onValueChange={setValues}>
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
}
