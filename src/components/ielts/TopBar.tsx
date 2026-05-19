import { Box, Button, HStack } from "@chakra-ui/react";
import { ColorModeButton } from "../ui/color-mode";
import { UserMenu } from "../common/UserMenu";
import { ExamTimer } from "./ExamTimer";
import { useModuleStore, useModuleStoreApi } from "./ModuleProvider";
import { createIeltsAttempt } from "@/client";


export function TopBar() {
	const module = useModuleStore((state) => state.module)
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

	return (
		<HStack>
			<HStack gap="4">
				<ColorModeButton />
				<UserMenu />
			</HStack>

			<HStack ms="auto" me="5" gap="5">
				<ExamTimer
					durationMin={module.duration_minutes}
					onExpire={() => submit}
				/>
				<Button size="sm" variant="outline" onClick={submit}>Submit</Button>
			</HStack>

		</HStack>
	)
}