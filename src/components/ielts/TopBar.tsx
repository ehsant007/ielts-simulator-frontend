import { Text, Button, HStack, Stack } from "@chakra-ui/react";
import { ColorModeButton } from "../ui/color-mode";
import { UserMenu } from "../common/UserMenu";
import { ExamTimer } from "./ExamTimer";
import { useModuleStoreApi } from "./ModuleProvider";
import { createIeltsAttempt } from "@/client";
import { useAuth } from "@/auth";


export function TopBar() {
	const { user } = useAuth();
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
		<HStack px="6" py="2">
			<HStack gap="6" >
				<ColorModeButton />

				<HStack key={user?.email} gap="4">
					<UserMenu />
					<Stack gap="0">
						<Text fontWeight="medium">{user?.profile?.first_name} {user?.profile?.last_name}</Text>
						<Text color="fg.muted" textStyle="sm">
							{user?.email}
						</Text>
					</Stack>
				</HStack>

			</HStack>

			<HStack ms="auto" gap="6">
				<ExamTimer onExpire={() => submit}/>
				<Button size="sm" variant="outline" onClick={submit}>Submit</Button>
			</HStack>

		</HStack>
	)
}