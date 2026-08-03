"use client"

import { VStack, Box, List, HStack } from "@chakra-ui/react";
import { readWordnet } from "@/client";
import { AdvText } from "../AdvText";
import { TTSButton } from "../tts";
import { useSuspenseQuery } from "@tanstack/react-query";


export function WordNet({ word }: { word: string }) {

	const { data } = useSuspenseQuery({
		queryFn: () => readWordnet({
			path: { word: word! },
		}).then((res) => res.data)
		,
		queryKey: ["wordnet", word],
	})


	return (
		<VStack alignItems="start">
			<HStack mb="3">
				<AdvText fontWeight="bold">{data.lemma}</AdvText>
				<TTSButton text={data.lemma} />
			</HStack>

			{data.senses.length === 0 &&
				<AdvText color="fg.warning" fontStyle="italic">No definition was found for this query!</AdvText>
			}

			{
				data.senses.map((sense, i) => (
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
				))
			}
		</VStack >
	)
}