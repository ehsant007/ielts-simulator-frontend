import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T, saveValue: boolean = true) {
	const [value, setValue] = useState<T | undefined>(saveValue ? undefined : initialValue);

	// Read storage on mount or when key changes (client-only)
	useEffect(() => {
		if (!saveValue) return;

		const init = () => {
			const item = localStorage.getItem(key);
			if (item)
				setValue(JSON.parse(item) as T);
			else
				setValue(initialValue);
		}

		if (value === undefined)
			init();
		else
			localStorage.setItem(key, JSON.stringify(value));

	}, [key, value, initialValue, saveValue]);


	return [value === undefined ? initialValue : value, setValue] as const;
}


// The same code but not SSR safe
// export function useLocalStorage<T>(key: string, initialValue: T, saveValue: boolean = true) {
// 	const [value, setValue] = useState<T>(() => {
// 		if(!saveValue) return initialValue;
// 		const item = localStorage.getItem(key);
// 		if (item)
// 			return JSON.parse(item) as T;
// 		else
// 			return initialValue;
// 	});

// 	useEffect(() => {
// 		if (!saveValue) return;
// 		localStorage.setItem(key, JSON.stringify(value));
// 	}, [key, value, initialValue, saveValue]);

// 	return [value === undefined ? initialValue : value, setValue] as const;
// }