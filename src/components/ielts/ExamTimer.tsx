import { useEffect, useRef, useState } from "react";
import { Text } from "@chakra-ui/react";
import { useModuleStore } from "./ModuleProvider";

export function ExamTimer({
	onExpire,
}: {
	onExpire: () => void;
}) {
	const durationMs = useModuleStore((state) => state.module.duration_minutes) * 60 * 1000;
	const startTime = useModuleStore((state) => state.startTime);

	const getRemaining = () => Math.max(0, startTime + durationMs - Date.now())

	const [remainingMs, setRemainingMs] = useState(getRemaining);
	const expired = useRef(false)

	useEffect(() => {
		if (getRemaining() <= 0)
			return;

		const tick = () => {
			const left = getRemaining();
			setRemainingMs(left);

			if (left <= 0 && !expired.current) {
				expired.current = true;
				onExpire();
			}
		};

		tick();
		const id = setInterval(tick, 1000);

		return () => clearInterval(id);
	}, [startTime, durationMs, onExpire]);

	const minutes = Math.floor(remainingMs / 60000);
	const seconds = Math.floor((remainingMs % 60000) / 1000);

	return (
		<Text
			color={minutes < 2 ? "red" : "fg"}
			fontSize="3xl"
			fontWeight="bold"
			fontFamily="mono"
		>
			{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
		</Text>
	);
}