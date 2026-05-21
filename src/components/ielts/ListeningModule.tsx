"use client"

import { ListeningContent } from "@/client";
import { useModuleStore } from "./ModuleProvider";
import { VStack } from "@chakra-ui/react";
import { useEffect, useRef, useMemo } from "react";
import { getModuleFile } from "./utils";
import { Layout } from "./Layout";
import { Test } from "./Test";
import { AudioScript } from "./AudioScript";

export function ListeningModule() {
	const module1 = useModuleStore((state) => state.module);
	const mode = useModuleStore((state) => state.mode);
	const pi = useModuleStore((state) => state.part);
	const content = module1.content as ListeningContent;
	const part = content.parts[pi];
	const audioScript = part.audio_script;

	const playlist = useMemo(
		() => [
			getModuleFile(module1.id, "part1.mp3"),
			getModuleFile(module1.id, "part2.mp3"),
			getModuleFile(module1.id, "part3.mp3"),
			getModuleFile(module1.id, "part4.mp3"),
		],
		[module1.id]
	);

	const audioRef = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		let index = 0;
		let cancelled = false;

		const playTrack = (i: number) => {
			if (cancelled || i >= playlist.length) return;

			audio.src = playlist[i];
			audio.load();

			const start = async () => {
				try {
					await audio.play();
				} catch (err) {
					if (!cancelled) console.error("Audio play failed:", err);
				}
			};

			audio.addEventListener("canplaythrough", start, { once: true });
		};

		const handleEnded = () => {
			index += 1;
			playTrack(index);
		};

		audio.addEventListener("ended", handleEnded);
		playTrack(0);

		return () => {
			cancelled = true;
			audio.pause();
			audio.removeEventListener("ended", handleEnded);
			audio.removeAttribute("src");
			audio.load();
		};
	}, [playlist]);

	return (
		<Layout>
			<Layout.ViewPort>
				<audio ref={audioRef} />

				<VStack
					alignItems="stretch"
					gap="6"
					mx="auto"
					mt="3"
					mb="40"
					maxW="5xl"
				>
					<Test test={part.test} />
				</VStack>
			</Layout.ViewPort>

			{mode === "review" && (
				<Layout.ViewPort>
					<VStack alignItems="stretch" gap="6" mx="3" mt="3" mb="40">
						<AudioScript script={audioScript} />
					</VStack>
				</Layout.ViewPort>
			)}

		</Layout>
	);
}