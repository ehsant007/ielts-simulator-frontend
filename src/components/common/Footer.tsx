"use client";

import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Link,
  Input,
  Button,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { FaTwitter, FaGithub, FaLinkedin, FaDiscord, FaCoins } from "react-icons/fa";

export default function Footer() {
  return (
    <Box bgGradient="linear(to-b, purple.700, purple.900)" color="white">
      <Container maxW="7xl" py={12}>
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 5 }}
          gap={10}
          justifyItems="flex-start"
        >
          {/* LOGO / BRAND */}
          <Stack align="flex-start" gap={4}>
            <Box fontSize="5xl" color="orange.300">
              <FaCoins /> {/* logo placeholder */}
            </Box>
            <Text fontSize="xl" fontWeight="bold">
              P2P Exchange
            </Text>
            <Text fontSize="sm" color="gray.200">
              Secure peer-to-peer currency exchange platform.
            </Text>
          </Stack>

          {/* PRODUCT */}
          <Stack>
            <Text fontWeight="bold" mb={2}>
              PRODUCT
            </Text>
            <Link>How It Works</Link>
            <Link>Supported Currencies</Link>
            <Link>Pricing</Link>
            <Link>FAQ</Link>
            <Link>Roadmap</Link>
            <Link>Changelog</Link>
          </Stack>

          {/* ABOUT */}
          <Stack>
            <Text fontWeight="bold" mb={2}>
              ABOUT
            </Text>
            <Link>About Us</Link>
            <Link>Blog</Link>
            <Link>Security Practices</Link>
            <Link>Careers</Link>
            <Link>Contact</Link>
            <Link>Status</Link>
          </Stack>

          {/* RESOURCES */}
          <Stack>
            <Text fontWeight="bold" mb={2}>
              RESOURCES
            </Text>
            <Link>API Docs</Link>
            <Link>Developer Guides</Link>
            <Link>Currency Logos</Link>
            <Link>Country Flags</Link>
            <Link>Community Forum</Link>
          </Stack>

          {/* NEWSLETTER */}
          <Stack>
            <Text fontWeight="bold" mb={2}>
              STAY UPDATED
            </Text>
            <Text fontSize="sm">
              Get the latest P2P exchange updates and security news.
            </Text>
            <HStack as="form">
              <Input
                placeholder="Enter your email"
                bg="white"
                color="black"
                _placeholder={{ color: "gray.500" }}
              />
              <Button bg="orange.400" color="white" _hover={{ bg: "orange.500" }}>
                Subscribe
              </Button>
            </HStack>
          </Stack>
        </SimpleGrid>

        {/* Divider substitute */}
        <Box borderTop="1px solid" borderColor="purple.600" my={8} />

        {/* Bottom Row */}
        <Stack
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          gap={6}
        >
          {/* Socials */}
          <HStack gap={4}>
            <Link href="#" _hover={{ color: "orange.400" }}>
              <IconButton aria-label="Twitter" size="sm">
                <FaTwitter />
              </IconButton>
            </Link>
            <Link href="#" _hover={{ color: "orange.400" }}>
              <IconButton aria-label="GitHub" size="sm">
                <FaGithub />
              </IconButton>
            </Link>
            <Link href="#" _hover={{ color: "orange.400" }}>
              <IconButton aria-label="LinkedIn" size="sm">
                <FaLinkedin />
              </IconButton>
            </Link>
            <Link href="#" _hover={{ color: "orange.400" }}>
              <IconButton aria-label="Discord" size="sm">
                <FaDiscord />
              </IconButton>
            </Link>
          </HStack>

          <Text fontSize="sm" textAlign="center">
            © {new Date().getFullYear()} P2P Exchange. Built with ⚡ for secure trading.
          </Text>

          <HStack gap={4} fontSize="sm">
            <Link>Terms</Link>
            <Link>Privacy</Link>
            <Link>Security</Link>
            <Link>API Access</Link>
            <Link>English</Link>
          </HStack>
        </Stack>
      </Container>
    </Box>
  );
}
