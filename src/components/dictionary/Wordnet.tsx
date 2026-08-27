"use client"

import { VStack, Box, List, HStack, Collapsible, Text } from "@chakra-ui/react";
import { readWordnet, WordnetSense, WordnetData } from "@/client";
import { AdvText } from "../lang-tools/AdvText";
import { TTSButton } from "../lang-tools/tts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LuChevronRight } from "react-icons/lu";


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


export function WordNet({ headword }: { headword: string }) {

	const { data } = useSuspenseQuery({
		queryFn: () => readWordnet({
			query: { q: headword! },
		}).then((res) => res.data)
		,
		queryKey: ["wordnet", headword],
	})

	const baseId = `wordnet-${headword}`

	const grouped_senses = groupBy(data.senses, (sense) => sense.pos)

	if (data.senses.length == 0)
		return <Text m="6" color="fg.warning" fontWeight="medium">No definitions found for this query!</Text>

	return (
		<VStack alignItems="start">


			{Array.from(grouped_senses.entries()).map(([pos, senses], sense_index) => (
				<Collapse
					key={sense_index}
					title={
						<Text>
							<Text as="span" fontWeight="bold" fontSize="lg">{headword} </Text>
							<Text as="span" color="fg.subtle" fontWeight="semibold" fontStyle="italic">{pos}</Text>
						</Text>
					}
				>
					<VStack alignItems="start">
						<Pronunciation entry={data} />

						<List.Root as="ol">

							{senses.map((sense, sense_index) => (
								<List.Item key={sense_index} my="2" ms="4">
									<Sense sense={sense} baseId={baseId} />
								</List.Item>
							))}

						</List.Root>

					</VStack>
				</Collapse>
			))}
		</VStack>
	)
}


function Pronunciation({ entry }: { entry: WordnetData }) {
	return (
		<HStack>
			<AdvText>{entry.lemma}</AdvText>
			<TTSButton text={entry.lemma} colorPalette="blue" />
			<TTSButton text={entry.lemma} colorPalette="red" />
		</HStack>

	)
}


function Sense({ sense, baseId }: { sense: WordnetSense, baseId: string }) {
	return (
		<Box>
			<AdvText as="span" fontWeight="medium" id={`${baseId}-def`}>{sense.definition}</AdvText>

			<List.Root ms="4" listStyleType="disc">
				{sense.examples.map((example, example_index) => (
					<List.Item key={example_index} fontStyle="italic" as={AdvText} id={`${baseId}-example${example_index}`}>
						{example}
					</List.Item>
				))}
			</List.Root>
		</Box>
	)
}


function Collapse({ children, title }: { children: React.ReactNode, title: React.ReactNode }) {
	return (
		<Collapsible.Root defaultOpen w="full" bg="bg.muted" p="3">
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
			<Collapsible.Content px="5" py="2">
				{children}
			</Collapsible.Content>
		</Collapsible.Root>
	)
}
