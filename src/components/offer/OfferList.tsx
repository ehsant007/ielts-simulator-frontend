"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { readOffers, OfferPublic } from "@/client";
import {
	Box,
	Button,
	Flex,
	Grid,
	Spinner,
	Text,
} from "@chakra-ui/react";
import OfferCard from "@/components/offer/OfferCard";

const PAGE_SIZE = 2; // how many offers per page

export default function OffersList() {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
		error,
	} = useInfiniteQuery({
		queryKey: ["offers"],
		queryFn: async ({ pageParam = 0 }) => {
			return (await readOffers({
				query: {
					skip: pageParam,
					limit: PAGE_SIZE,
				}
			})).data;
		},
		getNextPageParam: (lastPage, allPages) => {
			const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
			return loaded < lastPage.count ? loaded : undefined;
		},
		initialPageParam: 0,
	});

	if (status === "pending") {
		return (
			<Flex justify="center" align="center" minH="200px">
				<Spinner size="lg" />
			</Flex>
		);
	}

	if (status === "error") {
		return (
			<Box color="red.500">
				<Text>Error loading offers: {(error as Error).message}</Text>
			</Box>
		);
	}

	return (
		<Box>
			{/* Grid of offers */}
			<Grid
				templateColumns={{
					base: "1fr",
					sm: "repeat(2, 1fr)",
					md: "repeat(3, 1fr)",
					lg: "repeat(4, 1fr)",
				}}
				gap={6}
			>
				{data?.pages.flatMap((page) =>
					page.data.map((offer: OfferPublic) => (
						<OfferCard key={offer.id} offer={offer} />
					))
				)}
			</Grid>

			{/* Load more */}
			<Flex justify="center" py={6}>
				{hasNextPage && (
					<Button
						onClick={() => fetchNextPage()}
						loading={isFetchingNextPage}
						loadingText="Loading..."
					>
						Load More
					</Button>
				)}
			</Flex>
		</Box>
	);
}
