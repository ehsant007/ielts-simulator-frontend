"use client"

import { useModuleStore } from "./ModuleProvider";
import { Box, Button, Center, HStack, Popover, Portal, Progress, Slider, Spinner, StackProps, Text, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useMemo, useState } from "react";
import { getModuleFile } from "./utils";

import { MdGraphicEq } from "react-icons/md";
import { BiVolumeFull, BiVolumeLow, BiVolumeMute } from "react-icons/bi";
import { PiPause, PiPlay } from "react-icons/pi";
import WaveSurfer from "wavesurfer.js"




export function Audio(props: StackProps) {
	const mode = useModuleStore((state) => state.mode);
	return mode === "test" ? <AudioTest /> : <AudioReview {...props} />
}

export function AudioVolumeControl(props: StackProps) {
	const audioVolume = useModuleStore((state) => state.audioVolume)
	const setAudioVolume = useModuleStore((state) => state.setAudioVolume)
	const audioMute = useModuleStore((state) => state.audioMute)
	const setAudioMute = useModuleStore((state) => state.setAudioMute)

	return (
		<HStack {...props}>

			<Box
				color="purple.solid"
				cursor="pointer"
				fontSize="3xl"
				as={[BiVolumeMute, BiVolumeLow, BiVolumeFull][audioMute ? 0 : Math.min(Math.ceil(audioVolume / 30), 2)]}
				onClick={() => setAudioMute(!audioMute)}
			/>

			<Slider.Root
				value={[audioVolume]}
				onValueChange={(e) => setAudioVolume(e.value[0])}
				width="full"
				onDoubleClick={() => setAudioVolume(50)}
			>
				<Slider.Control cursor="pointer">
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
	const playerRef = useRef<HTMLAudioElement>(null);
	const audioVolume = useModuleStore((state) => state.audioVolume)
	const audioMute = useModuleStore((state) => state.audioMute)

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
		if (!playerRef.current)
			return

		playerRef.current.volume = audioVolume / 100.0
		playerRef.current.muted = audioMute

	}, [audioVolume, audioMute])

	useEffect(() => {
		const player = playerRef.current;
		if (!player) return;

		let index = 0;
		let cancelled = false;

		const playTrack = (i: number) => {
			if (cancelled || i >= playlist.length) return;

			player.src = playlist[i];
			player.load();

			const start = async () => {
				try {
					await player.play();
				} catch (err) {
					if (!cancelled) console.error("Audio play failed:", err);
				}
			};

			player.addEventListener("canplaythrough", start, { once: true });
		};

		const handleEnded = () => {
			index += 1;
			playTrack(index);
		};

		player.addEventListener("ended", handleEnded);
		playTrack(0);

		return () => {
			cancelled = true;
			player.pause();
			player.removeEventListener("ended", handleEnded);
			player.removeAttribute("src");
			player.load();
		};
	}, [playlist]);

	return (
		<audio ref={playerRef} />
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


export function PlaybackRateControl({ value, onChange }: { value: number, onChange: (value: number) => void }) {
	const [open, setOpen] = useState(false)

	return (
		<Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
			<Popover.Trigger asChild>
				<Button
					size="sm"
					variant="outline"
					borderRadius="full"
					colorPalette="purple"
					p="1.5"
					fontFamily="mono"
					fontWeight="bold"
					border="md"
				>
					{value}x
				</Button>
			</Popover.Trigger>
			<Portal>
				<Popover.Positioner>
					<Popover.Content w="fit-content">
						<Popover.Arrow />
						<Popover.Body>
							<Popover.Title fontWeight="medium">Playback Rate</Popover.Title>
							<VStack alignItems="stretch" mt="2">
								{
									[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
										<Button
											key={rate}
											size="sm"
											variant={value === rate ? "outline" : "ghost"}
											colorPalette={value === rate ? "purple" : "fg"}
											fontFamily="mono"
											fontWeight="bold"
											onClick={() => {
												onChange(rate)
												setOpen(false)
											}}
										>
											{rate}x
										</Button>
									))
								}
							</VStack>
						</Popover.Body>
					</Popover.Content>
				</Popover.Positioner>
			</Portal>
		</Popover.Root>
	)
}


export function AudioReview(props: StackProps) {
	const module1 = useModuleStore((state) => state.module)
	const pi = useModuleStore((state) => state.part)
	const setAudioPlay = useModuleStore((state) => state.setAudioPlay)
	const audioPlay = useModuleStore((state) => state.audioPlay)
	const audioVolume = useModuleStore((state) => state.audioVolume)
	const audioMute = useModuleStore((state) => state.audioMute)

	const waveformRef = useRef<HTMLDivElement>(null)
	const playerRef = useRef<WaveSurfer | null>(null)

	const [time, setTime] = useState(0)
	const [playbackRate, setPlaybackRate] = useState(1)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!playerRef.current)
			return
		const player = playerRef.current

		player.setVolume(audioVolume / 100.0)
		player.setMuted(audioMute)
		player.setPlaybackRate(playbackRate, true)

		if (audioPlay)
			player.play()
		else
			player.pause()
	}, [audioVolume, audioMute, audioPlay, playbackRate])

	useEffect(() => {
		if (!waveformRef.current) return

		setIsLoading(true)

		const ws = WaveSurfer.create({
			container: waveformRef.current,
			url: getModuleFile(module1.id, `part${pi + 1}.mp3`),
			height: "auto",
			waveColor: "#6400a7",
			progressColor: "#c9006e",
			cursorWidth: 1,
			interact: true,
			autoplay: audioPlay,
			normalize: true,
		})

		ws.on("loading", () => {
			setIsLoading(true)
		})

		ws.on("ready", () => {
			setIsLoading(false)
		})

		ws.on("timeupdate", (value) => {
			setTime(value)
		})

		playerRef.current = ws

		return () => ws.destroy()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pi, module1.id])

	return (
		<HStack {...props}>
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

			<Box position="relative" width="full" h="12">
				{isLoading && (
					<Center position="absolute" inset="0">
						<Progress.Root w="full" my="auto" value={null} colorPalette="purple">
							<Progress.Track h="1">
								<Progress.Range />
							</Progress.Track>
						</Progress.Root>
					</Center>
				)}
				<Box
					ref={waveformRef}
					cursor="pointer"
					width="full"
					h="full"
					opacity={isLoading ? 0 : 1}
				/>
			</Box>

			<PlaybackRateControl value={playbackRate} onChange={(value) => setPlaybackRate(value)} />
		</HStack>
	)
}

