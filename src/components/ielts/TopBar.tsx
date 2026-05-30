import { Text, Button, HStack, Stack, VStack } from "@chakra-ui/react";
import { ColorModeButton } from "../ui/color-mode";
import { UserMenu } from "../common/UserMenu";
import { ExamTimer } from "./ExamTimer";
import { useModuleStore, useModuleStoreApi } from "./ModuleProvider";
import { createIeltsAttempt } from "@/client";
import { useAuth } from "@/auth";
import { AudioVolumeControl, Audio } from "./Audio";


export function TopBar() {
	const module1 = useModuleStore((state) => state.module)
	const mode = useModuleStore((state) => state.mode)
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
		<VStack px="6" py="2" w="full" maxW="8xl">
			<HStack w="full">
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


				<HStack w="full" justify="end" gap="6">
					{module1.type === "listening" && (
						<>
							<AudioVolumeControl width="10rem" />
						</>
					)
					}
					{mode === "test" && (
						<>
							<ExamTimer onExpire={() => submit} />
							<Button size="sm" variant="outline" onClick={submit}>Submit</Button>
						</>
					)}
				</HStack>
			</HStack>
			{module1.type === "listening" &&
				<Audio w="full"/>
			}
		</VStack>
	)
}