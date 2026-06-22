import type { Passage } from "@/client";
import { Box, HStack, VStack, Text } from "@chakra-ui/react";
import { MD } from "./Content";
import { useModuleStore } from "./ModuleProvider";
import { AdvText } from "../lang-tools"

export function Passage({ title, subtitle, sections }: Passage) {
	const pi = useModuleStore((state) => state.part)

	return (
		<>
			<AdvText as={Box} mx="auto" maxW="3xl" id={`part${pi}_passage_title`}>
				<Text fontSize="xl" fontWeight="bold" textAlign="center">
					{title}
				</Text>
				<Text px="6" textAlign="center" fontStyle="italic">
					{subtitle}
				</Text>
			</AdvText>

			<Box>
				{sections.map((section, i) => (
					<VStack key={i} alignItems="start" mt="6">
						<HStack alignItems="start">
							{section.label &&
								<AdvText
									fontWeight="bold"
									me="2"
									id={`part${pi}_passage_section${section.label}`}
								>
									{section.label}
								</AdvText>
							}
							<MD id={`part${pi}_passage_section${i}`}>{section.text}</MD>
						</HStack>
					</VStack>
				))}
			</Box>
		</>
	)
}