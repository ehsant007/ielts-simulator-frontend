import { useEffect, useRef, useState } from "react";
import { Text } from "@chakra-ui/react";

export function ExamTimer({
	durationMin,
	onExpire,
}: {
	durationMin: number;
	onExpire: () => void;
}) {
	const durationMs = durationMin * 60 * 1000;
	const [remainingMs, setRemainingMs] = useState(durationMs);
	const expiredRef = useRef(false);
	const endTimeRef = useRef<number | null>(null);

	useEffect(() => {
		endTimeRef.current = Date.now() + durationMs;

		const tick = () => {
			if (!endTimeRef.current) return;

			const left = Math.max(0, endTimeRef.current - Date.now());
			setRemainingMs(left);

			if (left === 0 && !expiredRef.current) {
				expiredRef.current = true;
				onExpire();
			}
		};

		tick();
		const id = window.setInterval(tick, 1000);

		return () => window.clearInterval(id);
	}, [durationMs, onExpire]);

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