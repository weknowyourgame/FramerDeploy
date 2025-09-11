"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface CountdownProps {
	period: Date | string | number; // End date for countdown
	className?: string;
	label?: string; // Optional label text, defaults to "LEFT UNTIL FULL RELEASE"
}

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

export default function Countdown({
	period,
	className = "",
	label = "LEFT UNTIL FULL RELEASE",
}: CountdownProps) {
	const [timeLeft, setTimeLeft] = useState<TimeLeft>({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const prefersReducedMotion = useReducedMotion();

	const targetDate = useMemo(() => new Date(period).getTime(), [period]);

	const calculateTimeLeft = useCallback(() => {
		const now = new Date().getTime();
		const difference = targetDate - now;

		if (difference <= 0) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
			return;
		}

		setTimeLeft({
			days: Math.floor(difference / (1000 * 60 * 60 * 24)),
			hours: Math.floor(
				(difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
			),
			minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
			seconds: Math.floor((difference % (1000 * 60)) / 1000),
		});
	}, [targetDate]);

	useEffect(() => {
		calculateTimeLeft();

		intervalRef.current = setInterval(calculateTimeLeft, 1000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [calculateTimeLeft]);

	const formatNumber = useCallback((num: number) => {
		return num.toString().padStart(2, "0");
	}, []);

	const containerVariants = useMemo(
		() => ({
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: {
					when: "beforeChildren",
					staggerChildren: prefersReducedMotion ? 0 : 0.1,
				},
			},
		}),
		[prefersReducedMotion],
	);

	const itemVariants = useMemo(
		() => ({
			hidden: prefersReducedMotion ? { opacity: 0 } : { y: 20, opacity: 0 },
			visible: {
				y: 0,
				opacity: 1,
				transition: {
					type: prefersReducedMotion ? "tween" : "spring",
					stiffness: 300,
					damping: 24,
				},
			},
		}),
		[prefersReducedMotion],
	);

	const ariaLabel = useMemo(
		() =>
			`Countdown: ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, and ${timeLeft.seconds} seconds remaining`,
		[timeLeft],
	);

	return (
		<motion.div
			className={`flex flex-col items-center p-4 rounded ${className}`}
			aria-label={ariaLabel}
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			layout="position"
		>
			<motion.div
				className="flex items-center justify-center space-x-2 md:space-x-4"
				variants={containerVariants}
				style={{ willChange: "transform" }}
			>
				<motion.div
					className="flex flex-col items-center"
					variants={itemVariants}
				>
					<motion.span
						className="text-lg md:text-xl lg:text-2xl"
						key={`days-${timeLeft.days}`}
						initial={
							prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
						}
						animate={
							prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
						}
						transition={{
							type: prefersReducedMotion ? "tween" : "spring",
							stiffness: 200,
						}}
						style={{ willChange: "transform, opacity" }}
					>
						{timeLeft.days}
					</motion.span>
					<motion.span
						className="text-xs uppercase tracking-wider mt-1 text-muted-foreground"
						variants={itemVariants}
					>
						Days
					</motion.span>
				</motion.div>

				<motion.span
					className="text-lg md:text-xl lg:text-2xl pb-6 text-muted-foreground"
					variants={itemVariants}
				>
					:
				</motion.span>

				<motion.div
					className="flex flex-col items-center"
					variants={itemVariants}
				>
					<motion.span
						className="text-lg md:text-xl lg:text-2xl"
						key={`hours-${timeLeft.hours}`}
						initial={
							prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
						}
						animate={
							prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
						}
						transition={{
							type: prefersReducedMotion ? "tween" : "spring",
							stiffness: 200,
						}}
						style={{ willChange: "transform, opacity" }}
					>
						{formatNumber(timeLeft.hours)}
					</motion.span>
					<motion.span
						className="text-xs uppercase tracking-wider mt-1 text-muted-foreground"
						variants={itemVariants}
					>
						Hours
					</motion.span>
				</motion.div>

				<motion.span
					className="text-lg md:text-xl lg:text-2xl pb-6 text-muted-foreground"
					variants={itemVariants}
				>
					:
				</motion.span>

				<motion.div
					className="flex flex-col items-center"
					variants={itemVariants}
				>
					<motion.span
						className="text-lg md:text-xl lg:text-2xl"
						key={`minutes-${timeLeft.minutes}`}
						initial={
							prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
						}
						animate={
							prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
						}
						transition={{
							type: prefersReducedMotion ? "tween" : "spring",
							stiffness: 200,
						}}
						style={{ willChange: "transform, opacity" }}
					>
						{formatNumber(timeLeft.minutes)}
					</motion.span>
					<motion.span
						className="text-xs uppercase tracking-wider mt-1 text-muted-foreground"
						variants={itemVariants}
					>
						Minutes
					</motion.span>
				</motion.div>

				<motion.span
					className="text-lg md:text-xl lg:text-2xl pb-6 text-muted-foreground"
					variants={itemVariants}
				>
					:
				</motion.span>

				<motion.div
					className="flex flex-col items-center"
					variants={itemVariants}
				>
					<motion.span
						className="text-lg md:text-xl lg:text-2xl"
						key={`seconds-${timeLeft.seconds}`}
						initial={
							prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
						}
						animate={
							prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
						}
						transition={{
							type: prefersReducedMotion ? "tween" : "spring",
							stiffness: 200,
						}}
						style={{ willChange: "transform, opacity" }}
					>
						{formatNumber(timeLeft.seconds)}
					</motion.span>
					<motion.span
						className="text-xs uppercase tracking-wider mt-1 text-muted-foreground"
						variants={itemVariants}
					>
						Seconds
					</motion.span>
				</motion.div>
			</motion.div>

			<motion.div
				className="flex items-center justify-center mt-4 text-xs uppercase tracking-wider"
				initial={{ opacity: 0, y: 20 }}
				animate={{
					opacity: 1,
					y: 0,
					transition: {
						delay: prefersReducedMotion ? 0.2 : 0.5,
						duration: prefersReducedMotion ? 0.3 : 0.5,
					},
				}}
				style={{ willChange: "transform, opacity" }}
			>
				<svg
					className="w-4 h-4 mr-1"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					color="#7E7E7E"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<title>Calendar</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<motion.span
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: prefersReducedMotion ? 0.3 : 0.7 }}
				>
					{label}
				</motion.span>
			</motion.div>
		</motion.div>
	);
}
