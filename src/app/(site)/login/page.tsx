import { getUser } from "@/auth";
import { redirect, RedirectType } from "next/navigation";
import LoginForm from "./LoginForm";


export default async function Login() {
	if (await getUser())
		redirect("/", RedirectType.replace)

	return <LoginForm />
}
