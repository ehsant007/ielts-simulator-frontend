"use client"

import type { ListeningContent, ReadingContent } from "@/client";
import { useModuleStore } from "./ModuleProvider";
import { Wrap, Button, VStack, HStack, Icon, Collapsible, Group, SegmentGroup } from "@chakra-ui/react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { BiCollapse, BiExpand } from "react-icons/bi";
import { useState } from "react";



export function QuestionNav() {
	const moduleType = useModuleStore((state) => state.module.type)

	switch (moduleType) {
		case "listening":
		case "reading":
			return <ListeningReadingQuestionNav />
		case "writing":
			return <WritingTaskNav />
		case "speaking":
			return null
	}
}


export function WritingTaskNav() {
	const task_i = useModuleStore((state) => state.task)
	const setTask = useModuleStore((state) => state.setTask)

	return (
		<HStack>
			<SegmentGroup.Root
				mx="auto"
				value={`${task_i}`}
			>
				<SegmentGroup.Indicator />
				{
					[0, 1].map((task) =>
						<SegmentGroup.Item
							cursor="pointer"
							value={`${task}`}
							key={task}
							onClick={() => setTask(task)}
						>
							Task {task + 1}
						</SegmentGroup.Item>
					)
				}

			</SegmentGroup.Root>
		</HStack>
	)
}

export function ListeningReadingQuestionNav() {
	const module1 = useModuleStore((state) => state.module)
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const focusPrevQuestion = useModuleStore((state) => state.focusPrevQuestion)
	const focusNextQuestion = useModuleStore((state) => state.focusNextQuestion)
	const [navExpand, setNavExpand] = useState(false)
	const part_i = useModuleStore((state) => state.part)
	const result = useModuleStore((state) => state.result)
	const mode = useModuleStore((state) => state.mode)
	const content = module1.content as (ListeningContent | ReadingContent)

	return (
		<VStack width="full" >

			<Wrap width="full">

				<Group visibility="hidden">
					<Button
						variant="outline"
						size="sm">
						<HiArrowLeft />
					</Button>

					<Button
						variant="outline"
						size="sm">
						<HiArrowRight />
					</Button>
				</Group>

				<Button
					visibility="hidden"
					size="sm"
					variant="outline"
				>
					<Icon> <BiExpand /> </Icon>
				</Button>

				<SegmentGroup.Root
					ms="auto"
					value={`${part_i}`}
				>
					<SegmentGroup.Indicator />
					{
						content.parts.map((part, pi) =>
							<SegmentGroup.Item
								cursor="pointer"
								value={`${pi}`}
								key={pi}
								onClick={() => focusQuestion(part.test[0].questions[0].num)}
								fontWeight="semibold"
							>
								Part {pi + 1}
							</SegmentGroup.Item>
						)
					}
				</SegmentGroup.Root>

				<Group ms="auto" me="5" >
					<Button
						onClick={focusPrevQuestion}
						variant="outline"
						size="sm"
					>
						<HiArrowLeft />
					</Button>

					<Button
						onClick={focusNextQuestion}
						variant="outline"
						size="sm"
					>
						<HiArrowRight />
					</Button>
				</Group>

				<Button
					size="sm"
					variant="outline"
					onClick={() => setNavExpand(prev => !prev)}
				>
					<Icon>{navExpand ? <BiCollapse /> : <BiExpand />}</Icon>
				</Button>
			</Wrap>

			<Collapsible.Root open={navExpand}>
				<Collapsible.Content>
					<Wrap justify="center">
						{
							content.parts.map((part, part_i) => <Wrap gap="0.5" key={part_i}>
								<Button
									key={part_i}
									size="xs"
									variant="ghost"
									onPointerUp={() => focusQuestion(part.test[0].questions[0].num)}
								>
									Part {part_i + 1}
								</Button>
								{
									part.test.map((g) =>
										g.questions.map((q) => {

											let props = {}
											if (mode === "review") {
												if (result?.[q.num]?.includes(0)) {
													props = { colorPalette: "red" }
												}
											}

											return (
												<Button
													key={q.num}
													size="xs"
													variant="outline"
													onPointerUp={() => focusQuestion(q.num)}
													fontFamily="mono"
													fontWeight="semibold"
													{...props}
												>
													{q.to_num ? `${q.num} | ${q.to_num}` : q.num}
												</Button>
											)
										}
										)
									)
								}
							</Wrap>)
						}
					</Wrap>
				</Collapsible.Content>
			</Collapsible.Root>

		</VStack >
	)
}
