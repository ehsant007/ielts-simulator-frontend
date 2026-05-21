import {
	Box,
	Heading,
	Text,
	List,
	Button,
	VStack,
	Group,
	Icon,
} from '@chakra-ui/react';
import { IeltsModuleType } from '@/client';
import { MdFactCheck, MdReviews, MdStart } from 'react-icons/md';
import { PiExam } from 'react-icons/pi';
import { FcStart } from 'react-icons/fc';
import { FiPlay } from 'react-icons/fi';

type StartPageProps = {
	onStart: () => void,
	onReview?: (() => void) | undefined
}


export function StartPage({ moduleType, ...props }: StartPageProps & { moduleType: IeltsModuleType }) {
	switch (moduleType) {
		case "listening":
			return <StartPageListening {...props} />
		case "reading":
			return <StartPageReading {...props} />
		case "writing":
			return <StartPageWriting {...props} />
		case "speaking":
			return <StartPageSpeaking {...props} />
	}
}



function Buttons({ onStart, onReview }: StartPageProps) {
	return (
		<Group mx="auto">
			<Button width="10rem" onClick={onStart} colorPalette="purple">
				<Icon><FiPlay /></Icon>Start test
			</Button>
			<Button width="10rem" onClick={onReview} colorPalette="pink">
				<Icon><MdFactCheck /></Icon>Review test
			</Button>
		</Group>
	)
}

export function StartPageListening(props: StartPageProps) {
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

					<Buttons {...props} />

				</VStack>
			</Box>
		</Box>
	);
}


export function StartPageReading(props: StartPageProps) {
	return (
		<Box minH="100dvh" display="flex" alignItems="center" justifyContent="center">
			<Box p={4} maxW="5xl">
				<Heading as="h1" size="xl" mb={4}>
					IELTS Reading
				</Heading>
				<Text fontSize="lg" mb={6}>
					Time: 60 minutes
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
							<List.Item>
								Read all three passages carefully and manage your time well.
							</List.Item>
						</List.Root>
					</Box>

					<Buttons {...props} />
				</VStack>
			</Box>
		</Box>
	);
}


export function StartPageWriting(props: StartPageProps) {
	return (
		<Box minH="100dvh" display="flex" alignItems="center" justifyContent="center">
			<Box p={4} maxW="5xl">
				<Heading as="h1" size="xl" mb={4}>
					IELTS Writing
				</Heading>
				<Text fontSize="lg" mb={6}>
					Time: 60 minutes
				</Text>

				<VStack gap={6} align="stretch">
					{/* <Box>
						<Text fontWeight="bold" fontSize="xl" mb={2}>
							INSTRUCTIONS TO CANDIDATES
						</Text>
						<List.Root>
							<List.Item>Answer both tasks.</List.Item>
							<List.Item>
								Write your answers in the answer booklet or on the answer sheet provided.
							</List.Item>
						</List.Root>
					</Box> */}

					<Box mb="6">
						<Text fontWeight="bold" fontSize="xl" mb={2}>
							INFORMATION FOR CANDIDATES
						</Text>
						<List.Root>
							<List.Item>There are 2 tasks in this test.</List.Item>
							<List.Item>
								Task 2 contributes more to your final writing score than Task 1.
							</List.Item>
							<List.Item>Plan your time carefully.</List.Item>
						</List.Root>
					</Box>

					<Buttons {...props} />
				</VStack>
			</Box>
		</Box>
	);
}


export function StartPageSpeaking(props: StartPageProps) {
	return (
		<Box minH="100dvh" display="flex" alignItems="center" justifyContent="center">
			<Box p={4} maxW="5xl">
				<Heading as="h1" size="xl" mb={4}>
					IELTS Speaking
				</Heading>
				<Text fontSize="lg" mb={6}>
					Time: 11–14 minutes
				</Text>

				<VStack gap={6} align="stretch">
					<Box>
						<Text fontWeight="bold" fontSize="xl" mb={2}>
							INSTRUCTIONS TO CANDIDATES
						</Text>
						<List.Root>
							<List.Item>Answer all questions.</List.Item>
							<List.Item>Speak clearly and give full answers.</List.Item>
						</List.Root>
					</Box>

					<Box mb="6">
						<Text fontWeight="bold" fontSize="xl" mb={2}>
							INFORMATION FOR CANDIDATES
						</Text>
						<List.Root>
							<List.Item>The test is recorded.</List.Item>
							<List.Item>There are 3 parts to the speaking test.</List.Item>
							<List.Item>You will be asked to speak about familiar topics and give longer responses.</List.Item>
						</List.Root>
					</Box>

					<Buttons {...props} />
				</VStack>
			</Box>
		</Box>
	);
}