import { useModuleStore } from "./ModuleProvider";
import type { WritingContent } from "@/client";
import { VStack, Text, Box, Textarea } from "@chakra-ui/react";
import { MD } from "./Content";
import { Layout } from "./Layout";
import { Visual } from "./Visual";
import { AdvText } from "./AdvText";


export function WritingModule() {
	const module1 = useModuleStore((state) => state.module)
	const task_i = useModuleStore((state) => state.task)

	const content = module1.content as WritingContent
	const task = content.tasks[task_i]

	const answer = useModuleStore((state) => state.answers[task_i]) ?? ""
	const setAnswer = useModuleStore((state) => state.setAnswer)

	const baseId = `task${task_i}}`

	return (
		<Layout>
			<Layout.ViewPort
				key={`writing-questions-task${task_i}`}
			>
				<VStack mt="6" gap="6" alignItems="start" mx="6" mb="40%" bg="content.bg" p="6" shadow="md">
					<Box>
						<AdvText id={`${baseId}-title`} fontSize="lg" fontWeight="bold" color="primary">WRITING TASK {task_i + 1}</AdvText>
						<AdvText id={`${baseId}-prompt`} fontStyle="italic">You should spend about {task_i === 0 ? 20 : 40} minutes on this task.</AdvText>
					</Box>

					<Box>
						{task_i === 1 &&
							<AdvText id={`${baseId}-prompt2`} mb="2" fontStyle="italic">Write about the following topic:</AdvText>
						}
						<Box shadow="md" p="6" border="md" borderRadius="md" borderColor="fg.subtle" fontWeight="medium">
							<MD id={`${baseId}-question`}>{task.question}</MD>
						</Box>
					</Box>

					<Box>
						{task_i === 1 &&
							<AdvText id={`${baseId}-prompt3`} fontStyle="italic">Give reasons for your answer and include any relevant examples from you own knowledge or experience.</AdvText>
						}

						<AdvText id={`${baseId}-prompt4`} fontStyle="italic">Write at least {task_i === 0 ? 150 : 250} words.</AdvText>
					</Box>

					<VStack width="full" gap="6">
						{
							task.visuals?.map((visual, i) => (
								<Visual
									key={i}
									id={`${baseId}-visual${i}`}
									visual={visual}
								/>
							))
						}
					</VStack>

					<Textarea
						p="4"
						placeholder="Write here ..."
						value={answer}
						onChange={(e) => setAnswer(task_i, [e.currentTarget.value])}
						fontSize="md"
						h="500px"
						shadow="md"
						borderColor="fg.subtle"
					/>
				</VStack>
			</Layout.ViewPort>
		</Layout>
	)
}


