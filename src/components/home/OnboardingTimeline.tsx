"use client";

import React from "react";
import {
	Box,
	Heading,
	Text,
	VStack,
	HStack,
	Timeline,
} from "@chakra-ui/react";
import {
	FaUserPlus,
	FaUserEdit,
	FaFileUpload,
	FaCheckCircle,
	FaExchangeAlt,
} from "react-icons/fa";

export default function OnboardingTimeline() {
	return (
		<Box bg="green.subtle">
			<Box maxW="4xl" mx="auto" py={12} px={6}>
				<Heading size="lg" mb={6} textAlign="center">
					How to get started
				</Heading>

				<Timeline.Root>
					{/* 1 — Signup */}
					<Timeline.Item>
						<Timeline.Connector>
							<Timeline.Separator />
							<Timeline.Indicator aria-label="signup" bg="blue.500" color="white">
								<FaUserPlus />
							</Timeline.Indicator>
						</Timeline.Connector>

						<Timeline.Content>
							<Timeline.Title>1 — Sign up</Timeline.Title>
							<Timeline.Description>
								Create an account with email/password or OAuth (Google). Choose a
								unique alphanumeric username — you’ll be placed in the
								<Text as="span" ml={1} fontWeight="bold">
									Simple User
								</Text>{" "}
								group by default.
							</Timeline.Description>
						</Timeline.Content>
					</Timeline.Item>

					{/* 2 — Complete profile */}
					<Timeline.Item>
						<Timeline.Connector>
							<Timeline.Separator />
							<Timeline.Indicator
								aria-label="profile"
								bg="green.500"
								color="white"
							>
								<FaUserEdit />
							</Timeline.Indicator>
						</Timeline.Connector>

						<Timeline.Content>
							<Timeline.Title>2 — Complete your profile</Timeline.Title>
							<Timeline.Description>
								Fill in personal details, link verified payment accounts (bank,
								e-wallets), enable MFA, and add any optional info (bio, location)
								to make trading smoother.
							</Timeline.Description>
						</Timeline.Content>
					</Timeline.Item>

					{/* 3 — Upload documents */}
					<Timeline.Item>
						<Timeline.Connector>
							<Timeline.Separator />
							<Timeline.Indicator
								aria-label="upload-docs"
								bg="orange.400"
								color="white"
							>
								<FaFileUpload />
							</Timeline.Indicator>
						</Timeline.Connector>

						<Timeline.Content>
							<Timeline.Title>3 — Upload verification documents</Timeline.Title>
							<Timeline.Description>
								Upload government ID, proof of address, and bank statements as
								required. You can attach multiple documents and tag them (e.g.
								&quot;bank account #1&quot;).
							</Timeline.Description>
						</Timeline.Content>
					</Timeline.Item>

					{/* 4 — Verification */}
					<Timeline.Item>
						<Timeline.Connector>
							<Timeline.Separator />
							<Timeline.Indicator
								aria-label="verification"
								bg="teal.500"
								color="white"
							>
								<FaCheckCircle />
							</Timeline.Indicator>
						</Timeline.Connector>

						<Timeline.Content>
							<Timeline.Title>4 — Moderator review & verification</Timeline.Title>
							<Timeline.Description>
								Moderators review your uploads and either approve or request a
								resubmission (e.g., &quot;document blurry&quot;). Courier applicants get
								extra checks. You’ll receive real-time notifications on status
								changes.
							</Timeline.Description>
						</Timeline.Content>
					</Timeline.Item>

					{/* 5 — Start trading */}
					<Timeline.Item>
						<Timeline.Connector>
							<Timeline.Separator />
							<Timeline.Indicator
								aria-label="start-trading"
								bg="purple.500"
								color="white"
							>
								<FaExchangeAlt />
							</Timeline.Indicator>
						</Timeline.Connector>

						<Timeline.Content>
							<Timeline.Title>5 — Start trading</Timeline.Title>
							<Timeline.Description>
								Once verified, create offers, accept trades, or browse the
								marketplace. Trades use escrow-like protections, with moderators
								and couriers assigned when needed.
							</Timeline.Description>
						</Timeline.Content>
					</Timeline.Item>
				</Timeline.Root>

				{/* small summary / tips */}
				<VStack gap={3} mt={8} align="stretch">
					<HStack gap={3}>
						<Text fontWeight="semibold">Tip:</Text>
						<Text fontSize="sm" color="gray.200">
							Keep uploads clear (OCR works better). Enable MFA to speed up
							verification.
						</Text>
					</HStack>
				</VStack>
			</Box>
		</Box>
	);
}
