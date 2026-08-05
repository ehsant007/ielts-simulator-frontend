"use client"

import { VStack, Box, List, HStack, Button, Text, Collapsible } from "@chakra-ui/react";
import { lookup, readWordnet } from "@/client";
import { AdvText } from "../AdvText";
import { TTSButton } from "../tts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { GiUsaFlag } from "react-icons/gi";
import { LuChevronRight } from "react-icons/lu";


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
				<Collapse
					key={entry.id}
					title={
						<Text>
							<Text as="span" fontWeight="bold" fontSize="lg">{entry.headword} </Text>
							<Text as="span" color="fg.subtle" fontWeight="semibold" fontStyle="italic">{entry.pos}</Text>
						</Text>
					}
				>
					<VStack alignItems="start">

						{entry.ipa_us !== entry.ipa_gb &&
							<>
								<HStack>
									<Text>{entry.ipa_us}</Text>
									<TTSButton text={entry.headword} colorPalette="blue"/>
								</HStack>

								<HStack>
									<Text>{entry.ipa_gb}</Text>
									<TTSButton text={entry.headword} colorPalette="red"/>
								</HStack>
							</>
						}

						{entry.ipa_us === entry.ipa_gb &&
							<HStack>
								<Text>{entry.ipa_us}</Text>
								<TTSButton text={entry.headword} colorPalette="blue"/>
								<TTSButton text={entry.headword} colorPalette="red"/>
							</HStack>
						}

						<List.Root as="ol">
							{entry.senses.map((sense, sense_index) => (
								<List.Item key={sense_index} my="2">

									<VStack alignItems="start">
										<HStack alignItems="start">
											{sense.cefr_level &&
												<Box
													px="1.5"
													//bg="blue.subtle"
													borderRadius="full"
													fontSize="small"
													fontFamily="mono"
													fontWeight="semibold"
													color="fg.info"
													border="sm"
													borderColor="blue.border"
												>
													{sense.cefr_level.toUpperCase()}
												</Box>
											}
											<Text fontWeight="medium">{sense.definition}</Text>
										</HStack>
										<List.Root ms="4" listStyleType="disc">
											{sense.examples.sort((a, b) => a.sort_order - b.sort_order).map((example, example_index) => (
												<List.Item key={example_index} fontStyle="italic" as={AdvText}>
													{example.text}
												</List.Item>
											))}
										</List.Root>
									</VStack>
								</List.Item>
							))}
						</List.Root>

					</VStack>
				</Collapse>
			))

			}
		</VStack>
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