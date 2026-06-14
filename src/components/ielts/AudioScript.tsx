import type { Utterance } from "@/client";
import { HStack, Text, ButtonGroup, Button, Box } from "@chakra-ui/react";
import { MD } from "./Content";
import { useModuleStore } from "./ModuleProvider";

export function AudioScript({ script }: { script: Array<Utterance> }) {
	const pi = useModuleStore((state) => state.part)
	const focusQuestion = useModuleStore((state) => state.focusQuestion)

	return (
		<>
			{
				script.map((utterance, i) =>
					<HStack
						key={i}
						shadow="md"
						p="5"
						alignItems="start"
						bg="content.bg"
					>
						{utterance.speaker &&
							<Text
								fontSize="sm"
								fontWeight="bold"
								me="3"
							>
								{utterance.speaker}
							</Text>
						}
						<Box>
							<MD id={`part${pi}-dialog${i}`}>{utterance.text}</MD>
						</Box>
						<ButtonGroup ms="auto" orientation="vertical">
							{
								utterance.questions?.map((questionNum, j) =>
									<Button
										key={j}
										variant="outline"
										size="xs"
										onClick={() => focusQuestion(questionNum)}
									>
										Q{questionNum}
									</Button>
								)
							}
						</ButtonGroup>
					</HStack>
				)
			}
		</>
	)
}