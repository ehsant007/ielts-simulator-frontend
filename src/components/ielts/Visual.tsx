import type { Image as ImageVisual, Visual } from "@/client";
import { Image, VStack, Center } from "@chakra-ui/react"
import { getModuleFile } from "./utils";
import { useModuleStore } from "./ModuleProvider";
import { useColorMode } from "../ui/color-mode";
import { AdvText } from "./AdvText";

export function Visual({ visual, id }: { visual: Visual, id?: string }) {
	switch (visual.type) {
		case "image":
			return <ImageVisual visual={visual} id={id} />
		case "table":
			return null
	}
}

export function ImageVisual({ visual, id }: { visual: ImageVisual, id?: string }) {
	const module1 = useModuleStore((state) => state.module)
	const { colorMode } = useColorMode()

	return (
		<VStack alignItems="start">
			<Center mx="auto" fontSize="lg" textAlign="center" fontWeight="bold">
				<AdvText id={id}>{visual.title}</AdvText>
			</Center>
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
