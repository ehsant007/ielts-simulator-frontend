'use client'

import { Container, Flex, Image, Input, Text } from "@chakra-ui/react"
import Link from "next/link"

import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiUser, FiMail } from "react-icons/fi"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import { useAuth } from "@/auth"
import { confirmPasswordRules, emailPattern, usernamePattern, passwordRules, UserRegisterForm } from "@/utils"
import { toaster } from "@/components/ui/toaster"

export default function SignUpForm() {
	const { signup, login } = useAuth()

	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors, isSubmitting },
	} = useForm<UserRegisterForm>({
		mode: "onBlur",
		criteriaMode: "all",
		defaultValues: {
			email: "",
			password: "",
			confirm_password: "",
		},
	})

	const onSubmit: SubmitHandler<UserRegisterForm> = async (data) => {
		if (isSubmitting) return;

		try {
			await signup(data);
			await login({ username: data.email, password: data.password }, "/");
		}
		catch (e) {
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
			<Flex flexDir={{ base: "column", md: "row" }} justify="center" h="100vh">
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

					<Field invalid={!!errors.email} errorText={errors.email?.message}>
						<InputGroup w="100%" startElement={<FiMail />}>
							<Input
								id="email"
								{...register("email", {
									required: "Email is required",
									pattern: emailPattern,
								})}
								placeholder="Email"
								type="email"
							/>
						</InputGroup>
					</Field>

					<Field invalid={!!errors.username} errorText={errors.username?.message}>
						<InputGroup w="100%" startElement={<FiUser />}>
							<Input
								id="username"
								{...register("username", {
									required: "Username is required",
									minLength: {
										value: 3,
										message: "Username must be at least 3 characters long",
									},
									maxLength: {
										value: 254,
										message: "Username must be less than 255 characters long",
									},
									pattern: usernamePattern,
								})}
								placeholder="Username"
								type="text"
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

					<PasswordInput
						type="confirm_password"
						startElement={<FiLock />}
						{...register("confirm_password", confirmPasswordRules(getValues))}
						placeholder="Confirm Password"
						errors={errors}
					/>

					<Button variant="solid" type="submit" loading={isSubmitting}>
						Sign Up
					</Button>

					<Text>
						Already have an account?{" "}
						<Link href="/login" className="main-link">
							Log In
						</Link>
					</Text>

				</Container>
			</Flex>
		</>
	)
}
