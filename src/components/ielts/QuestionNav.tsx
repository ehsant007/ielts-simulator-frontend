"use client"

import type { ListeningContent } from "@/client";
import { useModuleStore } from "./ModuleProvider";
import { Wrap, Button, VStack, HStack, Icon, Collapsible } from "@chakra-ui/react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { BiCollapse, BiExpand } from "react-icons/bi";
import { useState } from "react";

export function QuestionNav() {
	const module = useModuleStore((state) => state.module)
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const focusPrevQuestion = useModuleStore((state) => state.focusPrevQuestion)
	const focusNextQuestion = useModuleStore((state) => state.focusNextQuestion)
	const [navExpand, setNavExpand] = useState(false)

	const content = module.content as ListeningContent

	return (
		<VStack width="full" >
			<HStack width="full" >
				<Button
					ms="auto"
					onClick={focusPrevQuestion}
					variant="outline"
					size="sm">
					<HiArrowLeft />
				</Button>

				<Button
					onClick={focusNextQuestion}
					variant="outline"
					size="sm">
					<HiArrowRight />
				</Button>

				{
					content.parts.map((part, part_i) => <Wrap gap="0.5" key={part_i}>
						<Button
							key={part_i}
							size="sm"
							variant="outline"
							onPointerUp={() => focusQuestion(part.test[0].questions[0].num)}
						>
							Part {part_i + 1}
						</Button>
					</Wrap>)
				}

				<Button
					ms="auto"
					size="sm"
					variant="outline"
					onClick={() => setNavExpand(prev => !prev)}
				>
					<Icon>{navExpand ? <BiCollapse /> : <BiExpand />}</Icon>
				</Button>
			</HStack>

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
