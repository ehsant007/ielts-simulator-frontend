"use client"

import { VStack, Text, Box } from "@chakra-ui/react";
import { WordNetData } from "@/client";

export function WordNetResult({ data }: { data: WordNetData }) {
	return (
		<VStack alignItems="start">
			<Text fontWeight="bold">{data.word}</Text>
			{data.senses.map((sense, i) => (
				<Box key={`example-${i}`}>
					<Text>{sense.pos}</Text>
					<Text>{sense.definition}</Text>
					{sense.examples.length > 0 &&
						<Box>
							<Text fontWeight="bold">Examples</Text>
							{sense.examples.map((example, j) => (
								<Text key={`example-${j}`}>{example}</Text>
							))
							}
						</Box>
					}
					{sense.synonyms.length > 0 &&
						<Box>
							<Text fontWeight="bold">Synonyms</Text>
							<Text>{sense.synonyms.join(", ")}</Text>
						</Box>
					}
				</Box>
			))}
		</VStack>
	)
}