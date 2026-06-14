import type { Passage } from "@/client";
import { Box, Center, HStack, VStack, Text } from "@chakra-ui/react";
import { MD } from "./Content";
import { useModuleStore } from "./ModuleProvider";

export function Passage({ title, subtitle, sections }: Passage) {
	const pi = useModuleStore((state) => state.part)

	return (
		<>
			<Box mx="auto" maxW="3xl">
				<Center fontSize="xl" fontWeight="bold" textAlign="center">
					{title}
				</Center>
				<Center px="6" textAlign="center" fontStyle="italic">
					{subtitle}
				</Center>
			</Box>

			<Box>
				{sections.map((section, i) => (
					<VStack key={i} alignItems="start" mt="6">
						<HStack alignItems="start">
							{section.label &&
								<Text
									fontWeight="bold"
									me="2"
									id={`part${pi}_passage_section${section.label}`}
								>
									{section.label}
								</Text>
							}
							<MD id={`part${pi}_passage_section${i}`}>{section.text}</MD>
						</HStack>
					</VStack>
				))}
			</Box>
		</>
	)
}