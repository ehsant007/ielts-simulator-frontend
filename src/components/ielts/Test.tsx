import type { QuestionGroup as QuestionGroupType } from "@/client";
import { QuestionGroup } from "./QuestionGroup";
import { Box } from "@chakra-ui/react";

export function Test({ test }: { test: Array<QuestionGroupType> }) {
	return (
		<>
			{
				test.map((g) => (
					<Box key={g.question_range.join("-")} shadow="md" p="5">
						<QuestionGroup g={g} />
					</Box>
				))
			}
		</>
	)

}