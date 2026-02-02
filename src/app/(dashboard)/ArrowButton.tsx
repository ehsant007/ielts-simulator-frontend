"use client"

import { Button } from "@chakra-ui/react"
import { FaArrowRightLong, FaArrowLeftLong } from "react-icons/fa6";
import { ComponentProps } from "react";
import { useLocaleDir } from "@/i18n/util";

type ArrowButtonProps = ComponentProps<typeof Button> & {
	arrowDir?: boolean,
}

export default function ArrowButton({arrowDir, ...props}: ArrowButtonProps) {
	const localeDir = useLocaleDir() == "ltr";
	
	return (
		<Button {...props}>
			{arrowDir !== localeDir ? <FaArrowRightLong /> : <FaArrowLeftLong />}
		</Button>
	)
}

