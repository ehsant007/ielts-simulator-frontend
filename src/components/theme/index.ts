import {
	createSystem,
	defaultConfig,
	defineConfig,
} from "@chakra-ui/react"

const config = defineConfig({
	theme: {
		tokens: {
			colors: {
				primary: {
					DEFAULT: { value: "{colors.purple.600}" },
					50: { value: "{colors.purple.50}" },
					100: { value: "{colors.purple.100}" },
					200: { value: "{colors.purple.200}" },
					300: { value: "{colors.purple.300}" },
					400: { value: "{colors.purple.400}" },
					500: { value: "{colors.purple.500}" },
					600: { value: "{colors.purple.600}" },
					700: { value: "{colors.purple.700}" },
					800: { value: "{colors.purple.800}" },
					900: { value: "{colors.purple.900}" },
					950: { value: "{colors.purple.950}" },
				},

				answer: {
					DEFAULT: { value: "{colors.primary}" },
					50: { value: "{colors.primary.50}" },
					100: { value: "{colors.primary.100}" },
					200: { value: "{colors.primary.200}" },
					300: { value: "{colors.primary.300}" },
					400: { value: "{colors.primary.400}" },
					500: { value: "{colors.primary.500}" },
					600: { value: "{colors.primary.600}" },
					700: { value: "{colors.primary.700}" },
					800: { value: "{colors.primary.800}" },
					900: { value: "{colors.primary.900}" },
					950: { value: "{colors.primary.950}" },
				},
				// primary: {
				// 	DEFAULT: { value: "{colors.purple.600}" }
				// },
				//secondary: { value: "#EE0F0F" },

			},

			fonts: {
				// body: { value: "sans-serif" },
				// heading: {value: "var(--font-vazirmatn)"}
			},
		},

		semanticTokens: {
			colors: {
				answer: {
					solid: { value: "{colors.primary}" },
					contrast: { value: "{colors.white}" },
					fg: { value: { base: "{colors.primary.600}", _dark: "{colors.primary.300}" } },
					muted: { value: "{colors.primary.100}" },
					subtle: { value: "{colors.primary.900}" },
					emphasized: { value: "{colors.primary.300}" },
					focusRing: { value: "{colors.primary.500}" },
					border: { value: "colors.primary.400" }
				},

				primary: {
					solid: { value: "{colors.primary}" },
					contrast: { value: "{colors.white}" },
					fg: { value: { base: "{colors.primary.600}", _dark: "{colors.primary.300}" } },
					muted: { value: "{colors.primary.100}" },
					subtle: { value: "{colors.primary.900}" },
					emphasized: { value: "{colors.primary.300}" },
					focusRing: { value: "{colors.primary.500}" },
					border: { value: "colors.primary.400" }
				},

				appBg: {
					value: { base: "{colors.white}", _dark: "{colors.gray.900}" },
				},
				appFg: {
					value: { base: "{colors.gray.900}", _dark: "{colors.gray.300}" },
				},

				content: {
					bg: { value: { base: "{colors.white}", _dark: "{colors.gray.900}" } },
				},

				layout: {
					bg: { value: { base: "{colors.purple.50}", _dark: "{colors.blue.900}" } },
				},

				question: {
					focusRing: { value: { base: "{colors.primary.500}", _dark: "{colors.primary.700}" }, },
					strong: { value: "{colors.primary}" },
				},
			}
		}
	},

	globalCss: {
		html: {
			bg: "appBg",
			color: "appFg",
		},
		body: {
			bg: "appBg",
			color: "appFg",
			minH: "100dvh",
		},
		button: {
			colorPalette: "purple",
		}
	},
})

export const system = createSystem(defaultConfig, config)
