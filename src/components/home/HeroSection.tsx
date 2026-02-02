"use client";

import {
	Box,
	Button,
	Container,
	Flex,
	Heading,
	Icon,
	Stack,
	Text,
} from "@chakra-ui/react";

import { FaPlus } from "react-icons/fa";
import NImage from "next/image"
import { useTranslations } from "next-intl";

export default function HeroSection() {
	const t = useTranslations("HeroSection")

	return (
		<Box
			as="section"
			bg="blue.subtle"
		>
			<Container maxW="7xl" insetStart="0">
				<Flex
					direction={{ base: "column", lg: "row" }}
					align="center"
					justify="space-between"
					gap={{ base: 12, lg: 16 }}
				>
					{/* Left Side */}
					<Stack gap={6} maxW="lg">
						<Heading
							as="h1"
							size={{ base: "2xl", md: "3xl" }}
							lineHeight="short"
						>
							{t('heading.line1')}
							<br />
							<Text as="span" color="purple.fg">
								{t('heading.line2')}
							</Text>
						</Heading>

						<Text fontSize="lg" color="fg.muted">
							{t('description')}
						</Text>

						<Flex gap={4} wrap="wrap">
							<Button colorPalette={"green"} variant={"subtle"}>
								<Icon as={FaPlus} mr="2" />
								{t('buttons.createOffer')}
							</Button>

							<Button
								variant="outline"
								colorPalette="white"
							>
								{t('buttons.searchOffers')}
							</Button>
						</Flex>
					</Stack>

					{/* Right Side - Placeholder for illustration */}

					{/* <Image maxW="650px" src="/concept.png" blendMode="exclusion"/> */}
					<NImage
						alt="Concept image"
						src="/concept.png"
						priority
						width={956} // Intrinsic width of the image file
						height={801} // Intrinsic height of the image file
						style={{ width: '650px', height: 'auto' }} // CSS to render it at 650x650
					/>
				</Flex>
			</Container>
		</Box>
	);
}
