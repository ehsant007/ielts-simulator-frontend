'use client'

import { CurrencyRead, readCurrencies, ReadCurrenciesResponse } from "@/client"
import {
	HStack,
	Select,
	Text,
	Portal,
	createListCollection,
	Avatar,
	useSelectContext,
	Spinner,
	SelectRootProps,
} from "@chakra-ui/react"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { UseFormRegisterReturn } from "react-hook-form"

const SelectValue = () => {
	const select = useSelectContext()
	const items = select.selectedItems as Array<CurrencyRead>
	const { name, logo } = items[0]
	return (
		<Select.ValueText placeholder="Select currency">
			<HStack>
				<Avatar.Root size="2xs">
					<Avatar.Image src={logo || "#"} alt={name} />
					<Avatar.Fallback name={name} />
				</Avatar.Root>
				{name}
			</HStack>
		</Select.ValueText>
	)
}

type SelectCurrencyProps = Omit<SelectRootProps, "collection"> & {
	formReg?: UseFormRegisterReturn
}


export default function SelectCurrency({border, formReg , ...props}: SelectCurrencyProps) {

	const { data: currencies, isLoading, isError, error } = useQuery<ReadCurrenciesResponse, Error>({
		queryKey: ["currencies"],
		queryFn: async () => (await readCurrencies()).data,
	})

	const currencyList = useMemo(() => createListCollection({
		items: currencies ?? [],
		itemToString: (item) => item.name,
		itemToValue: (item) => item.symbol
	}), [currencies])

	// UI states
	if (isLoading) {
		return (
			<HStack justify="center" align="center" minW="180px">
				<Spinner size="lg" />
			</HStack>
		);
	}

	if (isError) {
		return <Text color="red.500">Error loading currencies: {(error as Error).message}</Text>
	}

	if(currencies?.length == 0){
		return <Text color="red.500">No currency!</Text>
	}

	return (
		<Select.Root
			collection={currencyList}
			{...props}
		>
			<Select.HiddenSelect {...formReg}/>
			<Select.Control>
				<Select.Trigger border={border}>
					<SelectValue />
				</Select.Trigger>
				<Select.IndicatorGroup>
					<Select.Indicator />
				</Select.IndicatorGroup>
			</Select.Control>

			<Portal>
				<Select.Positioner>
					<Select.Content>

						{currencyList.items.map((curr) => (
							<Select.Item item={curr} key={curr.symbol} justifyContent="flex-start">
								<Avatar.Root size="2xs">
									<Avatar.Image src={curr.logo || "#"} alt={curr.name} />
									<Avatar.Fallback name={curr.name} />
								</Avatar.Root>
								{curr.name}
								<Select.ItemIndicator />
							</Select.Item>
						))}

					</Select.Content>
				</Select.Positioner>
			</Portal>

		</Select.Root>
	)

}