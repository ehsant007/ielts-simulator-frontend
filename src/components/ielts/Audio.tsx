"use client"

import { useModuleStore } from "./ModuleProvider";
import { Box, Button, HStack, Slider, StackProps, Text } from "@chakra-ui/react";
import { useEffect, useRef, useMemo, useState } from "react";
import { getModuleFile } from "./utils";

import { MdGraphicEq } from "react-icons/md";
import { BiVolumeFull, BiVolumeLow, BiVolumeMute } from "react-icons/bi";
import { PiPause, PiPlay } from "react-icons/pi";


export function Audio(props: StackProps) {
	const mode = useModuleStore((state) => state.mode);
	return mode === "test" ? <AudioTest /> : <AudioReview {...props} />
}

export function AudioVolumeControl(props: StackProps) {
	const setAudioVolume = useModuleStore((state) => state.setAudioVolume)
	const audioVolume = useModuleStore((state) => state.audioVolume)
	return (
		<HStack {...props}>
			<Box
				color="purple.solid"
				fontSize="3xl"
				as={[BiVolumeMute, BiVolumeLow, BiVolumeFull][Math.min(Math.ceil(audioVolume / 30), 2)]}
			/>
			<Slider.Root
				value={[audioVolume]}
				onValueChange={(e) => setAudioVolume(e.value[0])}
				width="full"
				onDoubleClick={() => setAudioVolume(50)}
			>
				<Slider.Control>
					<Slider.Track bg="purple.muted">
						<Slider.Range bg="purple.solid" />
					</Slider.Track>
					<Slider.Thumb index={0} boxSize={6} borderColor="purple.solid">
						<Box color="purple.solid" as={MdGraphicEq} />
					</Slider.Thumb>
				</Slider.Control>
			</Slider.Root>
		</HStack>
	)
}

export function AudioTest() {
	const module1 = useModuleStore((state) => state.module);
	const audioRef = useRef<HTMLAudioElement>(null);

	const playlist = useMemo(
		() => [
			getModuleFile(module1.id, "part1.mp3"),
			getModuleFile(module1.id, "part2.mp3"),
			getModuleFile(module1.id, "part3.mp3"),
			getModuleFile(module1.id, "part4.mp3"),
		],
		[module1.id]
	);

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
		<audio ref={audioRef} />
	);
}

function Time({ value }: { value: number }) {
	const minutes = Math.floor(value / 60);
	const seconds = Math.floor(value % 60);

	return (
		<Text
			fontSize="1xl"
			fontFamily="mono"
		>
			{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
		</Text>
	);
}

export function AudioReview(props: StackProps) {
	const module1 = useModuleStore((state) => state.module)
	const pi = useModuleStore((state) => state.part)
	const setAudioPlay = useModuleStore((state) => state.setAudioPlay)
	const audioPlay = useModuleStore((state) => state.audioPlay)
	const audioVolume = useModuleStore((state) => state.audioVolume)
	const playerRef = useRef<HTMLAudioElement>(null)

	const [time, setTime] = useState(0)
	const [duration, setDuration] = useState(0)

	useEffect(() => {
		if (!playerRef.current)
			return
		const player = playerRef.current

		player.volume = audioVolume / 100.0
	
		if (audioPlay)
			player.play()
		else
			player.pause()

	}, [audioVolume, audioPlay])

	return (
		<>
			<audio
				ref={playerRef}
				src={getModuleFile(module1.id, `part${pi + 1}.mp3`)}
				controlsList="nodownload"
				autoPlay={audioPlay}
				onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
				onLoadedMetadata={(e)=>setDuration(e.currentTarget.duration)}
			/>

			<HStack {...props} >
				<Button
					colorPalette="purple"
					borderRadius="full"
					border="md"
					p="0"
					size="sm"
					variant="outline"
					onClick={() => setAudioPlay(!audioPlay)}
				>
					{audioPlay ? <PiPause /> : <PiPlay />}
				</Button>

				<Time value={time} />

				<Slider.Root
					min={0}
					max={duration}
					value={[time]}
					onValueChange={(e) => {
						if (!playerRef.current)
							return
						const player = playerRef.current
						player.currentTime = e.value[0]
					}}
					width="full"
				>
					<Slider.Control>
						<Slider.Track bg="purple.muted">
							<Slider.Range bg="purple.solid" />
						</Slider.Track>
						<Slider.Thumb index={0} boxSize={6} borderColor="purple.solid">
							<Box color="purple.solid" as={MdGraphicEq} />
						</Slider.Thumb>
					</Slider.Control>
				</Slider.Root>
			</HStack>
		</>

	);
}

