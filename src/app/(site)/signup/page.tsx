import { isLoggedIn } from "@/auth/core";
import { redirect, RedirectType } from "next/navigation";
import SignUpForm from "./SignUpForm";


export default async function SignUp() {
	if (await isLoggedIn())
		redirect("/", RedirectType.replace)

	return <SignUpForm />
}