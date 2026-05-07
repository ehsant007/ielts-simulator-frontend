"use client"

import { ModuleRead, ListeningContent } from "@/client";
import { QuestionGroup } from "./QuestionGroup"
import { Dispatch, SetStateAction, useState } from "react";
import { useModule } from "./ModuleProvider";
import { Wrap, Text, Button, VStack, Box, ScrollArea, Grid, GridItem, Flex, HStack } from "@chakra-ui/react";

export function ListeningModule({ module }: { module: ModuleRead }) {

	const { section } = useModule()

	const content = module.content as ListeningContent

	// {content.parts[section].test.map((g, i) => <QuestionGroup g={g} key={i} />)}
	// <ListeningModuleNav />
	return (
		<Box h="100dvh" position="relative">
			{/* Scrollable content area */}
			<Box
				h="100%"
				//overflowY="auto"
				//overscrollBehavior="contain"
				//pb="300px" // reserve space for the fixed bottom nav
			>
				<Box maxW="5xl" mx="auto" pb="25%">
					<Text fontSize="2xl" fontWeight="bold" mb="4">
						Reading Passage
					</Text>

					<Box
						borderWidth="1px"
						rounded="xl"
						p="6"
						minH="1200px"
					>
						{content.parts[section].test.map((g, i) => <QuestionGroup g={g} key={i} />)}
					</Box>
				</Box>
			</Box>

			{/* Fixed bottom question nav */}
			<Box
				position="fixed"
				left="0"
				right="0"
				bottom="0"
				zIndex="10"
				borderTopWidth="1px"
				shadow="sm"
				bg="bg"
			>
				<Flex maxW="6xl" mx="auto" px="4" py="3" align="center" gap="3">

					{/* <HStack wrap="wrap" gap="2" flex="1">
						{Array.from({ length: 40 }, (_, i) => (
							<Button key={i} size="sm" variant="outline">
								{i + 1}
							</Button>
						))}
					</HStack> */}

					 <ListeningModuleNav />

					<Button colorScheme="blue">Submit</Button>
				</Flex>
			</Box>
		</Box>
	)
}

export function ListeningModuleNav() {
	const { module, setSection, setFocus, setFocusTick } = useModule()
	const content = module.content as ListeningContent


	return <Wrap>
		{
			content.parts.map((part, part_i) => <Wrap key={part_i}>
				{
					part.test.map((g, i) => <Wrap key={i}>
						{
							g.questions.map((q, i) =>
								<Button
									key={i}
									size="sm"
									variant="outline"
									onPointerUp={() => {
										setSection(part_i)
										setFocus(q.id)
										setFocusTick(prev => prev + 1)
									}}
								>
									{Array.isArray(q.num) ? `${q.num[0]}-${q.num[1]}` : q.num}
								</Button>)
						}
					</Wrap>)
				}
			</Wrap>)
		}
	</Wrap>
}
