"use client"

import { VStack, Box, List, HStack } from "@chakra-ui/react";
import { WordNetData } from "@/client";
import { ContextMenu } from "../ContextMenu";
import { AdvText } from "../AdvText";
import { TTSButton } from "../tts";

export function WordNetResult({ data }: { data: WordNetData }) {
	return (
		<ContextMenu>
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
		</ContextMenu>
	)
}