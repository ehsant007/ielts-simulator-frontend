"use client"

import { ModuleRead, ListeningContent } from "@/client";
import { QuestionGroup } from "./QuestionGroup"
import { useModuleStore } from "./ModuleProvider";
import { Text, Button, Box, Flex, VStack, HStack, ButtonGroup } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { getModuleFile } from "./utils";
import { QuestionNav } from "./QuestionNav";
import { Layout } from "./Layout";
import { Test } from "./Test";
import { MD } from "./Content";
import { AudioScript } from "./AudioScript";

export function ListeningModule({ module }: { module: ModuleRead }) {
	const mode = useModuleStore((state) => state.mode)
	const pi = useModuleStore((state) => state.part)
	const content = module.content as ListeningContent
	const part = content.parts[pi]
	const audioScript = content.parts[pi].audio_script

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

	<audio controls ref={audioRef} />

	return (
		<Layout sectionTitles={["Passage", "Both", "Questions"]}>

			{mode == "review" &&
				<Layout.ViewPort>
					<VStack alignItems="stretch" gap="6" mx="3" mt="3" mb="40">
						<AudioScript script={audioScript} />
					</VStack>
				</Layout.ViewPort>
			}

			<Layout.ViewPort>
				<Button onClick={() => audioRef.current?.play()}>Start</Button>
				<audio controls ref={audioRef} />


				<VStack
					alignItems="stretch"
					gap="6"
					mx="auto"
					mt="3"
					mb="40"
					maxW="5xl"
					border="md"
				>
					<Test test={part.test} />
				</VStack>


			</Layout.ViewPort>
		</Layout >
	)
}

