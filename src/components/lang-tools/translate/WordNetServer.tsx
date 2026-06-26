import { Box } from "@chakra-ui/react";
import { getWordNetData } from "./actions";

export async function WordNetServer({ word }: { word: string }) {
	const data = await getWordNetData(word)

	return <Box>{word}</Box>
}