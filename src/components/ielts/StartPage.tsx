import {
	Box,
	Heading,
	Text,
	List,
	Button,
	VStack,
	HStack,
} from '@chakra-ui/react';
import { MdOutlineInfo } from 'react-icons/md';

export function StartPageListening({ onStart }: { onStart: () => void }) {
	return (
		<Box minH="100dvh" display="flex" alignItems="center" justifyContent="center">
			<Box p={4} maxW="5xl">
				<Heading as="h1" size="xl" mb={4}>
					IELTS Listening
				</Heading>
				<Text fontSize="lg" mb={6}>
					Time: Approximately 30 minutes
				</Text>

				<VStack gap={6} align="stretch">
					<Box>
						<Text fontWeight="bold" fontSize="xl" mb={2}>
							INSTRUCTIONS TO CANDIDATES
						</Text>
						<List.Root>
							<List.Item>Answer all the questions.</List.Item>
							<List.Item>You can change your answers at any time during the test.</List.Item>
						</List.Root>
					</Box>

					<Box mb="6">
						<Text fontWeight="bold" fontSize="xl" mb={2}>
							INFORMATION FOR CANDIDATES
						</Text>
						<List.Root>
							<List.Item>There are 40 questions in this test.</List.Item>
							<List.Item>Each question carries one mark.</List.Item>
							<List.Item>There are four parts to the test.</List.Item>
							<List.Item>You will hear each part once.</List.Item>
							<List.Item>
								For each part of the test there will be time for you to look through the questions and time for you to check your answers.
							</List.Item>
						</List.Root>
					</Box>

					<Button mx="auto" width="50%" onClick={onStart}>
						Start test
					</Button>
				</VStack>
			</Box>
		</Box>
	);
}
