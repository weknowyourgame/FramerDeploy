"use client";

import { useRef } from "react";

import Demo from "~/components/demo";
import Faq from "~/components/faq";
import Footer from "~/components/footer";
import Hero from "~/components/hero";
import Features from "~/components/features";
import { Confetti, ConfettiRef } from "~/components/magicui/confetti";
import { Toaster } from "sonner";

export function LandingPage() {
  const confettiRef = useRef<ConfettiRef>(null);

  return (
    <>
      <Toaster position="top-center" />
      <main className="mx-auto max-w-screen-2xl w-full h-full flex-1 flex flex-col relative">
        <Confetti
          ref={confettiRef}
          className="fixed inset-0 z-50 pointer-events-none"
          manualstart={true}
        />
        <Hero />
        <Demo videoSrc="/demo.mp4" thumbnailSrc="/demo.png" />
        <Features />
        <Faq />
        <Footer />
      </main>
    </>
  );
}
