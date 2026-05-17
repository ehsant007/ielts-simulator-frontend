"use client"

import { createIeltsAttempt } from "@/client";
import type { ListeningContent } from "@/client";
import { useModuleStore, useModuleStoreApi } from "./ModuleProvider";
import { Wrap, Button, VStack, HStack, Box, Icon, Collapsible, useCollapsible } from "@chakra-ui/react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { BiCollapse, BiExpand } from "react-icons/bi";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { MdMinimize } from "react-icons/md";
import { CiLollipop } from "react-icons/ci";
import { useState } from "react";

export function QuestionNav() {
	const module = useModuleStore((state) => state.module)
	const focusQuestion = useModuleStore((state) => state.focusQuestion)
	const focusPrevQuestion = useModuleStore((state) => state.focusPrevQuestion)
	const focusNextQuestion = useModuleStore((state) => state.focusNextQuestion)
	const [open, setOpen] = useState(false)

	const store = useModuleStoreApi()

	const submit = async () => {
		const state = store.getState()

		await createIeltsAttempt({
			body: {
				module_id: state.module.id,
				answers: state.answers,
				idempotency_key: state.key,
			}
		})

	}

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

				<Button size="sm" variant="outline" onClick={submit}>Submit</Button>
				<Button
					ms="auto"
					size="sm"
					variant="outline"
					onClick={() => setOpen(prev => !prev)}
				>
					<Icon>{open ? <BiCollapse /> : <BiExpand />}</Icon>
				</Button>
			</HStack>

			<Collapsible.Root open={open}>
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
