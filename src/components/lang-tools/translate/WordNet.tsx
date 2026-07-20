"use client"

import { VStack, Box, List, HStack, AbsoluteCenter } from "@chakra-ui/react";
import { readWordnet } from "@/client";
import { AdvText } from "../AdvText";
import { TTSButton } from "../tts";
import { useSuspenseQuery } from "@tanstack/react-query";


export function WordNet({ word }: { word: string }) {

	const { data, error } = useSuspenseQuery({
		queryFn: () => readWordnet({
			path: { word: word! },
		}).then((res) => res.data)
		,
		queryKey: ["wordnet", word],
	})

	if (error)
		return (
			<AbsoluteCenter>
				<VStack>
					<AdvText>No definition was found for this query!</AdvText>
				</VStack>
			</AbsoluteCenter>
		)

	return (

		<VStack alignItems="start">
			<HStack>
				<AdvText fontWeight="bold">{data.word}</AdvText>
				<TTSButton text={data.word} />
			</HStack>
			{data.senses.map((sense, i) => (
				<Box key={`example-${i}`}>
					<AdvText>{sense.pos}</AdvText>
					<AdvText>{sense.definition}</AdvText>
					{sense.examples.length > 0 &&
						<Box>
							<AdvText fontWeight="bold">Examples</AdvText>
							<List.Root ms="6">
								{sense.examples.map((example, j) => (
									<List.Item key={`example-${j}`}>
										<AdvText>{example}</AdvText>
									</List.Item>
								))
								}
							</List.Root>
						</Box>
					}
					{sense.synonyms.length > 0 &&
						<Box>
							<AdvText fontWeight="bold">Synonyms</AdvText>
							<AdvText ms="6">{sense.synonyms.join(", ")}</AdvText>
						</Box>
					}
				</Box>
			))}
		</VStack>
	)
}