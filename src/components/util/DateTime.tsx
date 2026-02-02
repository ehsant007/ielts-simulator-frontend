import { DateTimeFormatOptions, useFormatter } from "next-intl";
import { useEffect, useState } from "react";

export function DateTime({ dt, options }: { dt: string, options?: DateTimeFormatOptions }) {
	const f = useFormatter();
	const dtObj = new Date(dt);
	return (
		<>
			{f.dateTime(dtObj, options)}
		</>
	)
}

export function DateTimeRelative({ dt }: { dt: string }) {
	const [now] = useState(() => Date.now());
	const [mounted, setMounted] = useState(false);
	const f = useFormatter();

	useEffect(() => {
		const onMount = () => {
			setMounted(true);
		}

		onMount();
	}, [])

	if (!mounted) {
		return <>...</>
	}

	return (
		<>
			{f.relativeTime(new Date(dt), now)}
		</>
	)
}