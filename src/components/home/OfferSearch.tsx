'use client'

import {
	Stack,
	HStack,
	VStack,
	Select,
	Text,
	Portal,
	createListCollection,
	Heading,
	NumberInput,
	Button,
	Separator,
	StackProps,
} from "@chakra-ui/react"

import SelectCurrency from "@/components/common/SelectCurrency"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

const tradeTypes = createListCollection({
	items: [
		{ label: "Buy", value: "buy" },
		{ label: "Sell", value: "sell" }
	]
})

type TradeType = "buy" | "sell"
type OfferSearchForm = {
  tradeType: TradeType
  targetCurrency: string
  amount: number
  baseCurrency: string
}


export default function OfferSearch(props: StackProps) {
	const router = useRouter()

	const { register, handleSubmit, formState: { errors } } = useForm<OfferSearchForm>()

	const searchHandle = (data: OfferSearchForm) => {
		router.push(`
			/offers?
			type=${data.tradeType}
			&target=${data.targetCurrency}
			&amount=${data.amount}
			&base=${data.baseCurrency}`)
	}

	return (
		<VStack {...props}>
			<Heading as="h1" fontSize="3xl">
				Trade instantly
			</Heading>
			<Text mt="1" mb="3" color="fg.muted">
				Find the best offer among {500} offers
			</Text>

			<Stack
				gap={{ base: "1", md: "4" }}
				direction={{ base: "column", md: "row" }}
				align={{ base: "stretch", md: "center" }}
			>
				<Text textAlign="center">I want to</Text>

				<HStack gap="0" borderWidth="1px" borderRadius="md">
					<Select.Root
						collection={tradeTypes}
						defaultValue={["buy"]}
						width="80px"
						size="sm"
						positioning={{ sameWidth: true }}
						borderRight="none"
					>
						<Select.HiddenSelect {...register('tradeType')} />
						<Select.Control>
							<Select.Trigger border="none">
								<Select.ValueText placeholder="Trade type" />
							</Select.Trigger>
							<Select.IndicatorGroup>
								<Select.Indicator />
							</Select.IndicatorGroup>
						</Select.Control>

						<Portal>
							<Select.Positioner>
								<Select.Content>
									{tradeTypes.items.map((type) => (
										<Select.Item item={type} key={type.value}>
											{type.label}
											<Select.ItemIndicator />
										</Select.Item>
									))}
								</Select.Content>
							</Select.Positioner>
						</Portal>

					</Select.Root>
					<Separator orientation="vertical" height="6" />
					<SelectCurrency
						formReg={register("targetCurrency")}
						defaultValue={["BTC"]}
						width="180px"
						size="sm"
						border="none" />
				</HStack>

				<Text mt={{ base: "3", md: "0" }} textAlign="center">for</Text>

				<HStack gap="0" borderWidth="1px" borderRadius="md">
					<NumberInput.Root w="100px" size="sm">
						<NumberInput.Input
							{...register('amount', { required: "Amount is required" })}
							placeholder="Amount"
							textAlign="center"
							border="none"
							bg={errors.amount ? "bg.error" : "initial"}
						/>
					</NumberInput.Root>
					<Separator orientation="vertical" height="6" />
					<SelectCurrency
						formReg={register("baseCurrency")}
						defaultValue={["USD"]}
						width="180px"
						size="sm"
						border="none" />
				</HStack>

				<Button
					onClick={handleSubmit(searchHandle)}
					mt={{ base: "3", md: "0" }}
					size="sm"
					colorPalette="green"
					variant="subtle"
				>
					Find offers
				</Button>
			</Stack>
		</VStack>
	)
}