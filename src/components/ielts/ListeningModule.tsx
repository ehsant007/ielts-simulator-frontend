"use client"

import { ModuleRead, ListeningContent, createIeltsAttempt } from "@/client";
import { QuestionGroup } from "./QuestionGroup"
import { useModuleStore, useModuleStoreApi } from "./ModuleProvider";
import { Wrap, Text, Button, VStack, Box, Flex, HStack } from "@chakra-ui/react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { useEffect, useRef } from "react";
import { getModuleFile } from "./utils";
import { useAuth } from "@/auth";

export function ListeningModule({ module }: { module: ModuleRead }) {
	const part = useModuleStore((state) => state.part)
	const files = useModuleStore((state) => state.module.file_set)
	const content = module.content as ListeningContent

	const playlist = [
		getModuleFile(module.id, "part1.mp3"),
		getModuleFile(module.id, "part2.mp3"),
		getModuleFile(module.id, "part3.mp3"),
		getModuleFile(module.id, "part4.mp3"),
	]

	const audioRef = useRef<HTMLAudioElement>(null);
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio)
			return

		let index = 0;

		audio.src = playlist[index];


		function handleEnded() {
			index++;
			if (!audio)
				return
			if (index < playlist.length) {
				audio.src = playlist[index]
				audio.play()
			}
		}

		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("ended", handleEnded);
		};
	}, []);


	return (
		<Box h="100dvh" position="relative">
			<Button onClick={() => audioRef.current?.play()}>Start</Button>

			<audio controls ref={audioRef} />
			{/* Scrollable content area */}
			<Box
				h="100%"
			//overflowY="auto"
			//overscrollBehavior="contain"
			//pb="300px" // reserve space for the fixed bottom nav
			>
				<Box maxW="5xl" mx="auto" pb="40%">
					<Text fontSize="2xl" fontWeight="bold" mb="4">
						Part {part + 1}
					</Text>

					<Box
						borderWidth="1px"
						rounded="xl"
						p="6"
					//minH="1200px"
					>
						{/* {
							content.parts.map((_part, pi) => <Activity key={_part.question_range.join("-")} mode={part === pi ? "visible" : "hidden"}>
								{_part.test.map((g, gi) => <QuestionGroup key={g.question_range.join("-")} g={g} />)}
							</Activity>)
						} */}

						{content.parts[part].test.map((g, i) => <QuestionGroup g={g} key={g.question_range.join("-")} />)}
					</Box>
				</Box>
			</Box>

			{/* Fixed bottom question nav */}
			<Box
				position="fixed"
				left="0"
				right="0"
				bottom="0"
				zIndex="10"
				borderTopWidth="1px"
				shadow="sm"
				bg="bg"
			>
				<Flex maxW="6xl" mx="auto" px="4" py="3" align="center" gap="3">

					{/* <HStack wrap="wrap" gap="2" flex="1">
						{Array.from({ length: 40 }, (_, i) => (
							<Button key={i} size="sm" variant="outline">
								{i + 1}
							</Button>
						))}
					</HStack> */}

					<ListeningModuleNav />

					{/* <Button colorScheme="blue">Submit</Button> */}
				</Flex>
			</Box>
		</Box>
	)
}

export function ListeningModuleNav() {
	const module = useModuleStore((state) => state.module)
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const focusPrevQuestion = useModuleStore((state) => state.focusPrevQuestion)
	const focusNextQuestion = useModuleStore((state) => state.focusNextQuestion)

	const store = useModuleStoreApi()

	const submit = async () => {
		const state = store.getState()

		await createIeltsAttempt({
			body: {
				module_id: state.module.id,
				answers: state.answers,
				idempotency_key: state.key,
			}
		})

	}

	const content = module.content as ListeningContent

	return <VStack>
		<HStack>
			<Button
				onClick={focusPrevQuestion}
				variant="outline"
				size="sm">
				<HiArrowLeft />
			</Button>
			<Button
				onClick={focusNextQuestion}
				variant="outline"
				size="sm">
				<HiArrowRight />
			</Button>

			<Button onClick={submit}>Submit</Button>
		</HStack>
		<Wrap justify="center">
			{
				content.parts.map((part, part_i) => <Wrap gap="0.5" key={part_i}>
					<Button
						key={part_i}
						size="xs"
						variant="ghost"
						onPointerUp={() => focusQuestion(part.test[0].questions[0].num)}
					>
						Part {part_i + 1}
					</Button>
					{
						part.test.map((g, i) =>
							g.questions.map((q, i) =>
								<Button
									key={i}
									size="xs"
									variant="outline"
									onPointerUp={() => focusQuestion(q.num)}
								>
									{q.to_num ? `${q.num} | ${q.to_num}` : q.num}
								</Button>)

						)

					}
				</Wrap>)
			}
		</Wrap>
	</VStack>
}
