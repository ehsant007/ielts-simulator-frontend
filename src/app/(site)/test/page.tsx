'use client'

import { Box, Button, VStack } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/react/sortable";


function Sortable({ id, index }: { id: number, index: number }) {
	const { ref } = useSortable({ id, index });

	return (
		<Button ref={ref}>Item {id}</Button>
	);
}

function List() {
	const items = [8, 9, 10, 11];

	return (
		<>
		<VStack>
			{items.map((value, index) =>
				<Sortable key={value} id={value} index={index} />
			)}
		</VStack>
		</>
	);
}

export default function Home() {


	return (
		<>
		<List/>
		</>
		
	);
}