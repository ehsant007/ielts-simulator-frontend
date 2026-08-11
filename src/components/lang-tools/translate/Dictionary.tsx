"use client"

import { VStack, Box, List, HStack, Text, Collapsible, Separator, CollapsibleRootProps, Tabs } from "@chakra-ui/react";
import { DictionaryCollocation, DictionaryEntry, DictionaryExample, DictionarySense, DictionaryVerbForm, lookup } from "@/client";
import { Text as AdvText } from "@chakra-ui/react";
import { TTSButton } from "../tts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LuChevronRight, LuMinus, LuPlus } from "react-icons/lu";
import { useState } from "react";


function groupBy<T, K>(
	array: T[],
	key: (item: T) => K
): Map<K, T[]> {
	return array.reduce((result, item) => {
		const groupName = key(item);
		const group = result.get(groupName) ?? [];

		group.push(item);
		result.set(groupName, group);

		return result;
	}, new Map<K, T[]>());
}


function sortSenses(senses: DictionarySense[]) {
	const sorted = senses.toSorted((a, b) => {
		const groupOrder =
			(a.sense_group?.sort_order ?? 0) -
			(b.sense_group?.sort_order ?? 0);

		if (groupOrder !== 0) {
			return groupOrder;
		}

		return a.sort_order - b.sort_order;
	});

	return groupBy(sorted, sense => sense.sense_group?.topic);
}

export function Dictionary({ headword }: { headword: string }) {

	const { data: entries } = useSuspenseQuery({
		queryFn: () => lookup({
			path: { headword: headword! },
		}).then((res) => res.data.entries)
		,
		queryKey: ["dictionary", headword],
	})


	return (
		<VStack alignItems="start">
			{entries.map((entry) => (
				<EntryCollapse
					key={entry.id}
					title={
						<Text>
							<Text as="span" fontWeight="bold" fontSize="lg">{entry.headword} </Text>
							<Text as="span" color="fg.subtle" fontWeight="semibold" fontStyle="italic">{entry.pos}</Text>
						</Text>
					}
				>
					<VStack alignItems="start">

						<Pronunciation entry={entry} />

						{/* <VerbForms values={entry.verb_forms} /> */}

						<Extras entry={entry} />

						<Senses senses={entry.senses} />

						{/* <Collocations values={entry.collocations} /> */}

					</VStack>
				</EntryCollapse>
			))}
		</VStack>
	)
}


function Pronunciation({ entry }: { entry: DictionaryEntry }) {

	if (entry.ipa_us === entry.ipa_gb)
		return (
			<HStack>
				<Text>{entry.ipa_us}</Text>
				<TTSButton text={entry.headword} colorPalette="blue" ipa="US" />
				<TTSButton text={entry.headword} colorPalette="red" ipa="UK" />
			</HStack>
		)


	return (
		<VStack>
			<HStack>
				<Text>{entry.ipa_us}</Text>
				<TTSButton text={entry.headword} colorPalette="blue" ipa="US" />
			</HStack>

			<HStack>
				<Text>{entry.ipa_gb}</Text>
				<TTSButton text={entry.headword} colorPalette="red" ipa="UK" />
			</HStack>
		</VStack>
	)
}


function Examples({ examples }: { examples: DictionaryExample[] }) {
	return (
		<List.Root mt="2" ms="4" listStyleType="disc">
			{examples.sort((a, b) => a.sort_order - b.sort_order).map((example, example_index) => (
				<List.Item mt="1" key={example_index} fontStyle="italic" as={AdvText} id={`$example${example.id}`}>
					{example.text}
				</List.Item>
			))}
		</List.Root>
	)
}

function CEFRLevel({ value }: { value?: string | null }) {

	if (value == null)
		return null

	return (
		<Text
			px="1.5"
			as="span"
			borderRadius="full"
			fontSize="small"
			fontFamily="mono"
			fontWeight="semibold"
			color="fg.info"
			border="sm"
			borderColor="blue.border"
			me="1ch"
		>
			{value.toUpperCase()}
		</Text>
	)
}


function Sense({ sense }: { sense: DictionarySense }) {
	const baseId = `dic-sense-${sense.id}`;

	return (
		<Box>
			<Text>
				<CEFRLevel value={sense.cefr_level} />
				{sense.grammar &&
					<AdvText as="span" color="fg.muted" id={`${baseId}-grammar`}>{sense.grammar} </AdvText>
				}
				<AdvText as="span" fontWeight="medium" id={`${baseId}-def`}>{sense.definition}</AdvText>
			</Text>
			<Examples examples={sense.examples} />
		</Box>
	)
}


function Senses({ senses }: { senses: DictionarySense[] }) {
	return (
		<List.Root as="ol">

			{Array.from(sortSenses(senses).entries()).map(([groupName, senses], group_index) => (
				<Box key={groupName ?? group_index} mt="4">
					{senses[0].sense_group &&
						<VStack alignItems="start" gap="0.5" mb="3">
							<AdvText fontWeight="medium">{groupName}</AdvText>
							<Separator width="full" />
						</VStack>

					}

					{senses.map((sense) => (
						<List.Item key={sense.id} my="2" ms="4">
							<Sense sense={sense} />
						</List.Item>
					))}
				</Box>
			))}

		</List.Root>
	)
}


function EntryCollapse({ children, title }: { children: React.ReactNode, title: React.ReactNode }) {
	return (
		<Collapsible.Root defaultOpen w="full" bg="bg.muted">
			<Collapsible.Trigger
				alignItems="center"
				bg="bg.emphasized"
				cursor="pointer"
				display="flex"
				w="full"
				gap="2"
				py="3"
				px="2"
			>
				<Collapsible.Indicator
					transition="transform 0.2s"
					_open={{ transform: "rotate(90deg)" }}
				>
					<LuChevronRight />
				</Collapsible.Indicator>
				{title}
			</Collapsible.Trigger>
			<Collapsible.Content>
				<Box px="5" py="3">
					{children}
				</Box>
			</Collapsible.Content>
		</Collapsible.Root>
	)
}


function EntryContentCollapse({ children, title, ...props }: { children: React.ReactNode, title: React.ReactNode } & Omit<CollapsibleRootProps, "title">) {
	const [open, setOpen] = useState(false)

	return (
		<Collapsible.Root
			open={open}
			onOpenChange={(e) => setOpen(e.open)}
			w="full"
			bg="primary.subtle/30"
			borderStart="lg"
			borderColor="primary.solid/50"
			{...props}
		>
			<Collapsible.Trigger
				alignItems="center"
				bg="primary.emphasized/40"
				cursor="pointer"
				display="flex"
				w="full"
				gap="2"
				py="3"
				px="2"
			>
				<Collapsible.Indicator color="purple.border/80">
					{open ? <LuMinus strokeWidth="4" /> : <LuPlus strokeWidth="4" />}
				</Collapsible.Indicator>
				{title}
			</Collapsible.Trigger>
			<Collapsible.Content>
				<Box px="5" py="4">
					{children}
				</Box>
			</Collapsible.Content>
		</Collapsible.Root>
	)
}


function VerbFormsInner({ values }: { values: DictionaryVerbForm[] }) {
	return (
		<>
			{values.map((form) =>
				<AdvText id={`verb-form${form.id}`} key={form.id} mb="1">
					{form.tag}
					<Text as="span" fontWeight="medium" color="primary.fg" ms="1">
						{form.form_text}
					</Text>
				</AdvText>
			)}
		</>
	)
}


// function VerbForms({ values }: { values?: DictionaryVerbForm[] | null }) {
// 	if (values == null)
// 		return null

// 	if (values.length == 0)
// 		return null

// 	return (
// 		<EntryContentCollapse
// 			mt="2"
// 			mb="6"
// 			title={
// 				<Text fontWeight="medium">Verb Forms</Text>
// 			}
// 		>
// 			<VerbFormsInner values={values} />
// 		</EntryContentCollapse>
// 	)
// }

function CollocationsInner({ values }: { values: DictionaryCollocation[] }) {
	return (
		<>
			{values.map((value) =>
				<Box key={value.id} mb="4">
					<Text fontWeight="medium">
						{value.category}
					</Text>
					<Text fontWeight="medium" color="primary.fg" ms="1">
						{value.words}
					</Text>
				</Box>
			)}
		</>
	)
}


// function Collocations({ values }: { values?: DictionaryCollocation[] | null }) {
// 	if (values == null)
// 		return null

// 	if (values.length == 0)
// 		return null

// 	return (
// 		<EntryContentCollapse
// 			mt="2"
// 			mb="6"
// 			title={
// 				<Text fontWeight="medium">Collocations</Text>
// 			}
// 		>
// 			<CollocationsInner values={values} />
// 		</EntryContentCollapse>
// 	)
// }

function TabContent({ children, value }: { children: React.ReactNode, value: string }) {
	return (
		<Tabs.Content
			p="0"
			value={value}
			_open={{
				animationName: "fade-in, scale-in",
				animationDuration: "300ms",
			}}
			_closed={{
				animationName: "fade-out, scale-out",
				animationDuration: "120ms",
			}}
		>

			{children}

		</Tabs.Content>
	)
}

function Extras({ entry }: { entry: DictionaryEntry }) {

	const extras: { title: string, node: React.ReactNode }[] = []

	if (entry.verb_forms.length > 0)
		extras.push({
			title: "Verb Forms",
			node: <VerbFormsInner values={entry.verb_forms} />,
		})

	if (entry.collocations.length > 0)
		extras.push({
			title: "Collocations",
			node: <CollocationsInner values={entry.collocations} />,
		})


	if (extras.length == 0)
		return null

	return (
		<EntryContentCollapse
			mt="2"
			mb="6"
			title={
				<Text fontWeight="medium">
					{extras.map(({ title }, index) => (
						<Text as="span" key={title}>
							{title}
							{index < extras.length - 1 &&
								<Text as="span" color="primary.border" mx="2">|</Text>
							}
						</Text>
					))}
				</Text>
			}
		>
			{extras.length == 1
				? extras[0].node
				: <Tabs.Root
					w="full"
					defaultValue={extras[0].title}
					size="sm"
				>
					<Tabs.List>

						{extras.map(({ title }) => (
							<Tabs.Trigger key={title} value={title}>
								{title}
							</Tabs.Trigger>
						))}

					</Tabs.List>

					<Box p="3">

						{extras.map(({ title, node }) => (
							<TabContent key={title} value={title}>
								{node}
							</TabContent>
						))}

					</Box>
				</Tabs.Root>
			}

		</EntryContentCollapse>
	)
}
