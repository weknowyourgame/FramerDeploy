import type { SVGProps } from "react";

export default function Vercel(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			aria-label="Vercel logomark"
			height="22"
			role="img"
			style={{ width: "auto", overflow: "visible" }}
			viewBox="0 0 74 64"
			{...props}
		>
			<path
				d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z"
				fill="currentColor"
			/>
		</svg>
	);
}
