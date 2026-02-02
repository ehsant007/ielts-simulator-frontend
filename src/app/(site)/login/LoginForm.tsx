'use client'

import { Container, Image, Input, Text } from "@chakra-ui/react"
import Link from "next/link"

import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiMail } from "react-icons/fi"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"

import { emailPattern, passwordRules } from "@/utils"

import { useAuth } from "@/auth"
import type { Credential } from "@/auth/core"
import { toaster } from "@/components/ui/toaster"

import { useSearchParams } from "next/navigation";


export default function LoginForm() {
	const { login, error } = useAuth();
	const searchPrams = useSearchParams();

	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Credential>({
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const redirectTo = searchPrams.get("from") ?? "/";

	const onSubmit: SubmitHandler<Credential> = async (data) => {
		if (isSubmitting)
			return;

		try {
			
			await login(data, redirectTo);
		} catch (e) {
			toaster.create({
				title: "Something went wrong!",
				description: (e as Error).message,
				type: "error",
				closable: true,
			})
		}
	}

	return (
		<>
			<Container
				as="form"
				onSubmit={handleSubmit(onSubmit)}
				h="100vh"
				maxW="sm"
				alignItems="stretch"
				justifyContent="center"
				gap={4}
				centerContent
			>
				<Image
					src="/logo.svg"
					alt="FastAPI logo"
					height="auto"
					maxW="4xs"
					alignSelf="center"
					mb={4}
				/>
				<Field
					invalid={!!errors.username}
					errorText={errors.username?.message || !!error}
				>
					<InputGroup w="100%" startElement={<FiMail />}>
						<Input
							id="username"
							{...register("username", {
								required: "Username is required",
								pattern: emailPattern,
							})}
							placeholder="Email"
							type="email"
						/>
					</InputGroup>
				</Field>
				<PasswordInput
					type="password"
					startElement={<FiLock />}
					{...register("password", passwordRules())}
					placeholder="Password"
					errors={errors}
				/>
				<Link href="/recover-password" className="main-link">
					Forgot Password?
				</Link>
				<Button variant="solid" type="submit" loading={isSubmitting} size="md">
					Log In
				</Button>
				<Text>
					Don&apos;t have an account?{" "}
					<Link href="/signup" className="main-link">
						Sign Up
					</Link>
				</Text>
			</Container>
		</>
	)
}
