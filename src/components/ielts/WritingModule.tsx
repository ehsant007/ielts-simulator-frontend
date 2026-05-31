import { useModuleStore } from "./ModuleProvider";
import type { WritingContent } from "@/client";
import { VStack, Text, Box, Textarea } from "@chakra-ui/react";
import { MD } from "./Content";
import { Layout } from "./Layout";
import { Visual } from "./Visual";


export function WritingModule() {
	const module1 = useModuleStore((state) => state.module)
	const task_i = useModuleStore((state) => state.task)

	const content = module1.content as WritingContent
	const task = content.tasks[task_i]

	const answer = useModuleStore((state) => state.answers[task_i]) ?? ""
	const setAnswer = useModuleStore((state) => state.setAnswer)

	return (
		<Layout>
			<Layout.ViewPort
				key={`writing-questions-task${task_i}`}
			>
				<VStack mt="6" gap="6" alignItems="start" mx="6" mb="40%">
					<Box>
						<Text fontSize="lg" fontWeight="bold">WRITING TASK {task_i + 1}</Text>
						<Text fontStyle="italic">You should spend about {task_i === 0 ? 20 : 40} minutes on this task.</Text>
					</Box>

					<Box>
						{task_i === 1 &&
							<Text mb="2" fontStyle="italic">Write about the following topic:</Text>
						}
						<Box shadow="md" p="6" border="md" borderRadius="md" borderColor="fg.subtle">
							<MD>{task.question}</MD>
						</Box>
					</Box>

					<Box>
						{task_i === 1 &&
							<Text fontStyle="italic">Give reasons for your answer and include any relevant examples from you own knowledge or experience.</Text>
						}

						<Text fontStyle="italic">Write at least {task_i === 0 ? 150 : 250} words.</Text>
					</Box>

					<VStack width="full" gap="6">
						{
							task.visuals?.map((visual, i) => <Visual key={i} visual={visual} />)
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


