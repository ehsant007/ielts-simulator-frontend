import { readIeltsModuleById } from "@/client";
import { Module } from "@/components/ielts/Module"

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
	const moduleId = (await params).id;

	const module1 = (await readIeltsModuleById({
		path: { module_id: moduleId },
	})).data

	return (
		<Module module={module1}></Module>
	)
}