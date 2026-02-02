import { Link as CLink } from "@chakra-ui/react"
import NLink from "next/link"
import { ComponentProps } from "react"

type LinkProps = ComponentProps<typeof CLink>

export default function Link({children, href, ...props}: LinkProps) {
	return (
		<CLink asChild {...props}>
			<NLink href={href || ""}>{children}</NLink>
		</CLink>
	)
}