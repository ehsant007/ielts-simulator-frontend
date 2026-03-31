import { readIeltsExamById, readIeltsModuleById } from "@/client";
import { HStack } from "@chakra-ui/react";
import Link from "next/link";
import { Module } from "@/components/ielts/Module"

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
	const moduleId = (await params).id;

	const module = (await readIeltsModuleById({
		path: { module_id: moduleId },
	})).data

	return (
		<Module module={module}></Module>
	)
}