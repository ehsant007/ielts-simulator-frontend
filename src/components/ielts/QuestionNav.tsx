"use client"

import type { ListeningContent } from "@/client";
import { useModuleStore } from "./ModuleProvider";
import { Wrap, Button, VStack, HStack, Icon, Collapsible, Group, SegmentGroup } from "@chakra-ui/react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { BiCollapse, BiExpand } from "react-icons/bi";
import { useMemo, useState } from "react";

export function QuestionNav() {
	const module = useModuleStore((state) => state.module)
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const focusPrevQuestion = useModuleStore((state) => state.focusPrevQuestion)
	const focusNextQuestion = useModuleStore((state) => state.focusNextQuestion)
	const [navExpand, setNavExpand] = useState(false)
	const part_i = useModuleStore((state) => state.part)

	const content = module.content as ListeningContent

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
					onValueChange={(e) => focusQuestion(content.parts[(e.value ?? 0) as number].test[0].questions[0].num)}
				>
					<SegmentGroup.Indicator />
					{
						content.parts.map((part, pi) =>
							<SegmentGroup.Item
								cursor="pointer"
								value={`${pi}`}
								key={pi}
								onPointerUp={() => focusQuestion(part.test[0].questions[0].num)}
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
									part.test.map((g, i) =>
										g.questions.map((q, i) =>
											<Button
												key={i}
												size="xs"
												variant="outline"
												onPointerUp={() => focusQuestion(q.num)}
											>
												{q.to_num ? `${q.num} | ${q.to_num}` : q.num}
											</Button>)
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
