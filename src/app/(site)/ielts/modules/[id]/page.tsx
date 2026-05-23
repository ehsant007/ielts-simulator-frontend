import { getAccessToken } from "@/auth/cookie";
import { readIeltsModuleById, readLastAttempt } from "@/client";
import { Module } from "@/components/ielts/Module"

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
	const token = await getAccessToken()

	const moduleId = (await params).id;

	const module1 = (await readIeltsModuleById({
		path: { module_id: moduleId },
	})).data

	const lastAttempt = (await readLastAttempt({
		path: {
			module_id: module1.id,
		},
		throwOnError: false,
		auth: token,
	})).data

	return (
		<Module module={module1} lastAttempt={lastAttempt}></Module>
	)
}