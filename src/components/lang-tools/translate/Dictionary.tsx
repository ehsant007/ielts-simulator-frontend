"use client"

import { VStack, Box, List, HStack, Text, Collapsible, Separator, CollapsibleRootProps } from "@chakra-ui/react";
import { DictionaryEntry, DictionarySense, lookup } from "@/client";
import { AdvText } from "../AdvText";
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

						<List.Root as="ol">

							{Array.from(sortSenses(entry.senses).entries()).map(([groupName, senses], group_index) => (
								<Box key={groupName ?? group_index} mb="4">
									{senses[0].sense_group &&
										<VStack alignItems="start" gap="0.5" mb="3">
											<AdvText fontWeight="medium">{groupName}</AdvText>
											<Separator width="full" />
										</VStack>

									}

									{entry.verb_forms.length > 0 &&
										<EntryContentCollapse
											mt="2"
											mb="6"
											title={
												<Text fontWeight="medium">Verb Forms</Text>
											}
										>
											{entry.verb_forms.map((form) =>
												<AdvText key={form.id} mb="1">
													{form.tag}
													<Text as="span" fontWeight="medium" color="primary.fg" ms="1">
														{form.form_text}
													</Text>
												</AdvText>
											)}
										</EntryContentCollapse>
									}

									{senses.map((sense) => (
										<List.Item key={sense.id} my="2" ms="4">
											<Sense sense={sense} />
										</List.Item>
									))}
								</Box>
							))}

						</List.Root>

					</VStack>
				</EntryCollapse>
			))}
		</VStack>
	)
}


function Pronunciation({ entry }: { entry: DictionaryEntry }) {
	return (
		<>
			{entry.ipa_us !== entry.ipa_gb &&
				<>
					<HStack>
						<Text>{entry.ipa_us}</Text>
						<TTSButton text={entry.headword} colorPalette="blue" />
					</HStack>

					<HStack>
						<Text>{entry.ipa_gb}</Text>
						<TTSButton text={entry.headword} colorPalette="red" />
					</HStack>
				</>
			}

			{entry.ipa_us === entry.ipa_gb &&
				<HStack>
					<Text>{entry.ipa_us}</Text>
					<TTSButton text={entry.headword} colorPalette="blue" />
					<TTSButton text={entry.headword} colorPalette="red" />
				</HStack>
			}
		</>
	)
}

function Sense({ sense }: { sense: DictionarySense }) {
	const baseId = `dic-sense-${sense.id}`;

	return (
		<Box>
			<Text>
				{sense.cefr_level &&
					<Text
						px="1.5"
						as="span"
						//bg="blue.subtle"
						borderRadius="full"
						fontSize="small"
						fontFamily="mono"
						fontWeight="semibold"
						color="fg.info"
						border="sm"
						borderColor="blue.border"
						me="1ch"
					>
						{sense.cefr_level.toUpperCase()}
					</Text>
				}
				{sense.grammar &&
					<AdvText as="span" color="fg.muted" id={`${baseId}-grammar`}>{sense.grammar} </AdvText>
				}
				<AdvText as="span" fontWeight="medium" id={`${baseId}-def`}>{sense.definition}</AdvText>
			</Text>
			<List.Root mt="2" ms="4" listStyleType="disc">
				{sense.examples.sort((a, b) => a.sort_order - b.sort_order).map((example, example_index) => (
					<List.Item mt="1" key={example_index} fontStyle="italic" as={AdvText} id={`${baseId}-example${example_index}`}>
						{example.text}
					</List.Item>
				))}
			</List.Root>
		</Box>
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

