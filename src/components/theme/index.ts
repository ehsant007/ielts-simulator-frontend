import {
	createSystem,
	defaultConfig,
	defineConfig,
} from "@chakra-ui/react"

const config = defineConfig({
	theme: {
		tokens: {
			colors: {
				//primary: { value: "#352150ff" },
				//secondary: { value: "#EE0F0F" },
			},

			fonts: {
				// body: { value: "sans-serif" },
				// heading: {value: "var(--font-vazirmatn)"}
			},
		},
	},
})

export const system = createSystem(defaultConfig, config)
