import React from "react";
import {
	Card,
	Box,
	Text,
	Stack,
	HStack,
	Button,
	Separator,
	Avatar,
} from "@chakra-ui/react";

import { OfferPublic } from "@/client"
import { FaExchangeAlt } from "react-icons/fa";
import { LuLock } from "react-icons/lu"
import { MdVerified, } from "react-icons/md"
import { Price } from "@/components/util/price";

export default function OfferCard({ offer }: { offer: OfferPublic }) {
	return (
		<Card.Root maxW="lg" w="320px" variant="elevated">
			<Card.Header p="4" h="65px">
				<HStack gap="3" maxW="full" maxH="full">
					<Avatar.Root>
						<Avatar.Image src={offer.maker.profile.avatar || "#"} />
						<Avatar.Fallback name={offer.maker.profile?.full_name || ""} />
					</Avatar.Root>
					<Stack gap="0">
						<Text fontWeight="semibold" textStyle="sm">
							{offer.maker.profile?.full_name}
						</Text>
						<Text color="fg.muted" textStyle="sm">
							@{offer.maker.username}
						</Text>
					</Stack>

					<MdVerified color="#38A169" size={20} title="Verified" />

				</HStack>
			</Card.Header>

			<Separator />

			<Card.Body >
				<Card.Title>
					<HStack justify="space-between" align="center" w="full">

						<Avatar.Root size="lg" >
							<Avatar.Image src={offer.sell.logo || "#"} />
							<Avatar.Fallback name={offer.sell.name} />
						</Avatar.Root>

						<HStack gap={3}>
							<Text fontSize="lg" fontWeight="bold">
								{offer.sell.symbol}
							</Text>
							<FaExchangeAlt size={20} />
							<Text fontSize="lg" fontWeight="bold">
								{offer.buy.symbol}
							</Text>
						</HStack>

						<Avatar.Root size="lg" >
							<Avatar.Image src={offer.buy.logo || "#"} />
							<Avatar.Fallback name={offer.buy.name} />
						</Avatar.Root>

					</HStack>
				</Card.Title>

				<Card.Description as="div" pt="4">
					<Stack gap="2" textAlign="center">

						<Text fontSize="lg" fontWeight="semibold">
							{/* 1 {offer.sell.currency.symbol} = {offer.price} {offer.buy.currency.symbol} */}
							1 {offer.sell.symbol} = <Price amount={offer.price} currency={offer.buy} />
						</Text>


						<Text fontSize="lg" fontWeight="semibold">
							Supplied = <Price amount={offer.total_amount} currency={offer.sell} />
						</Text>



						<Text fontSize="lg" fontWeight="semibold">
							Available = <Price amount={offer.available_amount} currency={offer.sell} />
						</Text>

						<Box />
					</Stack>
				</Card.Description>


			</Card.Body>

			<Separator />

			<Card.Footer px="6" py="4" justifyContent="flex-end">

				<Button variant="subtle" colorPalette="green" flex="1">
					<LuLock />
					Lock
				</Button>

			</Card.Footer>
		</Card.Root>
	);
}
