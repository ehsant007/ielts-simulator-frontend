'use client'

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"



export default function Offers() {
	const sp = useSearchParams()

	useEffect(() => {
		console.log(sp.get('amount'))
	}, [sp])

	return (
		<p>{sp.get("base")}</p>
	)
}