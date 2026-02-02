import { getLocale, getMessages } from "next-intl/server";
import ProvidersStack from "./ProvidersStack";
import { getUser } from "@/auth";


interface Props {
	children: React.ReactNode;
}

export default async function Providers({ children }: Props) {

	const user = await getUser();
	const locale = await getLocale();
	const messages = await getMessages({locale});

	return (
		<ProvidersStack
			user={user}
			locale={locale}
			messages={messages}
		>
			{children}
		</ProvidersStack>
	)
}