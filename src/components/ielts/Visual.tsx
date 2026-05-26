import type { Image as ImageVisual, Visual } from "@/client";
import { Image, VStack, Center } from "@chakra-ui/react"
import { getModuleFile } from "./utils";
import { useModuleStore } from "./ModuleProvider";
import { useColorMode } from "../ui/color-mode";

export function Visual({ visual }: { visual: Visual }) {
	switch (visual.type) {
		case "image":
			return <ImageVisual visual={visual} />
		case "table":
			return null
	}
}

export function ImageVisual({ visual }: { visual: ImageVisual }) {
	const module1 = useModuleStore((state) => state.module)
	const { colorMode } = useColorMode()

	return (
		<VStack alignItems="start">
			<Center mx="auto" fontSize="lg" textAlign="center" fontWeight="bold">{visual.title}</Center>
			<Image
				mt="1"
				mx="auto"
				src={getModuleFile(module1.id, visual.filename)}
				filter={`invert(${colorMode === "dark" ? 1 : 0})`}
				alt="ielts_img"
			/>
			<Center mx="auto" maxW={800} fontSize="md" textAlign="center">{visual.description}</Center>
		</VStack>
	)
}
