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
			{entries.map((entry, entry_index) => (
				<Collapse
					key={entry_index}
					title={
						<Text>
							<Text as="span" fontWeight="bold" fontSize="lg">{entry.headword} </Text>
							<Text as="span" color="fg.subtle" fontWeight="semibold" fontStyle="italic">{entry.pos}</Text>
						</Text>
					}
				>
					<VStack alignItems="start">


						<HStack>
							<Text>{entry.ipa_us}</Text>
							<TTSButton text={entry.headword} />
						</HStack>

						<HStack>
							<Text>{entry.ipa_gb}</Text>
							<TTSButton text={entry.headword} />
						</HStack>

						<VStack alignItems="start">
							{entry.senses.map((sense, sense_index) => (
								<HStack key={sense_index} alignItems="start">
									<Text fontWeight="medium">{sense_index + 1}</Text>
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
									<VStack alignItems="start">
										<Text fontWeight="medium">{sense.definition}</Text>
										<List.Root ms="4">
											{sense.examples.sort((a, b) => a.sort_order - b.sort_order).map((example, example_index) => (
												<List.Item key={example_index} fontStyle="italic">
													{example.text}
												</List.Item>
											))}
										</List.Root>
									</VStack>
								</HStack>
							))}
						</VStack>

					</VStack>
				</Collapse>
			))

			}
		</VStack>
	)
}


function Collapse({ children, title }: { children: React.ReactNode, title: React.ReactNode }) {
	return (
		<Collapsible.Root defaultOpen w="full" bg="bg.muted">
			<Collapsible.Trigger
				paddingY="3"
				display="flex"
				gap="2"
				alignItems="center"
				w="full"
				bg="bg.emphasized"
				px="2"
				cursor="pointer"
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