"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "motion/react";

interface PeopleProps {
	count?: number;
	initialCount?: number;
	className?: string;
}

export default function People({
	count = 12500,
	initialCount = 12000,
	className = "",
}: PeopleProps) {
	const [displayCount, setDisplayCount] = useState(initialCount);
	const controls = useAnimation();

	const avatars = [
		{ id: "avatar1", src: "/avatars/avatar1.avif" },
		{ id: "avatar2", src: "/avatars/avatar2.avif" },
		{ id: "avatar3", src: "/avatars/avatar3.avif" },
		{ id: "avatar4", src: "/avatars/avatar4.avif" },
	];

	// Animate count from initialCount to count when component mounts
	useEffect(() => {
		let startTime: number;
		let requestId: number;
		const duration = 2000; // Animation duration in ms

		const animateCount = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / duration, 1);

			// Easing function for a more natural count animation
			const easeOutQuart = 1 - (1 - progress) ** 4;

			const currentCount = Math.floor(
				initialCount + easeOutQuart * (count - initialCount),
			);

			setDisplayCount(currentCount);

			if (progress < 1) {
				requestId = requestAnimationFrame(animateCount);
			}
		};

		requestId = requestAnimationFrame(animateCount);
		controls.start({ opacity: 1, y: 0 });

		return () => {
			if (requestId) {
				cancelAnimationFrame(requestId);
			}
		};
	}, [count, initialCount, controls]);

	// Format the number with commas
	const formattedCount = displayCount.toLocaleString();

	return (
		<motion.div
			className={`flex items-center justify-center gap-2 py-2 px-4 ${className}`}
			animate={controls}
			transition={{ duration: 0.6 }}
		>
			<div className="flex -space-x-2 mr-3">
				{avatars.map((avatar, index) => (
					<div
						key={avatar.id}
						className="w-8 h-8 rounded-full border-2 border-border overflow-hidden"
					>
						<img
							src={avatar.src}
							alt={`Waitlist member ${index + 1}`}
							className="w-full h-full object-cover"
							onError={(e) => {
								// Fallback for missing images
								(e.target as HTMLImageElement).src =
									"https://via.placeholder.com/40";
							}}
						/>
					</div>
				))}
			</div>
			<motion.div className="text-sm md:text-base text-muted-foreground">
				Join{" "}
				<motion.span
					className="font-semibold text-foreground"
					key={displayCount}
					initial={{ opacity: 0.5, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }}
				>
					{formattedCount}+
				</motion.span>{" "}
				others on the waitlist
			</motion.div>
		</motion.div>
	);
}
