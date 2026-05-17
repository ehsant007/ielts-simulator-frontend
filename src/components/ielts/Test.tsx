import type { QuestionGroup as QuestionGroupType } from "@/client";
import { QuestionGroup } from "./QuestionGroup";
import { Box } from "@chakra-ui/react";

export function Test({ test }: { test: Array<QuestionGroupType> }) {
	return (
		<Box mx="1">
			{
				test.map((g) => (
					<Box key={g.question_range.join("-")} my="4" shadow="md" p="4">
						<QuestionGroup g={g} />
					</Box>
				))
			}
		</Box>
	)

}