export function getModuleFile(module_id: string, filename: string) {
	return `/api/v1/ielts/modules/${module_id}/${filename}`
}