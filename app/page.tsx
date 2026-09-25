"use client";

import dynamic from "next/dynamic";
import { getAudio } from "@/lib/audio";
import { useState } from "react";
import EpilepticWarning from "@/components/EpilepticWarning";
import EndScreen from "@/components/EndScreen";

const Terminal = dynamic(() => import("@/components/Terminal"), {ssr: false});

export default function Home() {
  const [warningDone, setWarningDone] = useState(false);
  const [endScreen, setEndScreen] = useState<"win" | "lose" | null>(null);
  const [termKey, setTermKey] = useState(0);

  const handleAccept = () => {
    const audio = getAudio();
    if (audio) {
      audio.volume = 0.6;
      if (audio.paused) audio.play().catch(() => {});
    }
    setWarningDone(true);
  }

  const handleRestart = () => {
    setEndScreen(null);
    setTermKey( k => k +1);
  }

  return (
    <div onClick={() => {
      const audio = getAudio();
      if (audio && audio.paused) audio.play().catch(() => {});
    }}>
      {!warningDone && <EpilepticWarning onAccept={handleAccept}/>}
      {warningDone && <Terminal key={termKey} onEnd={setEndScreen}/>}
      {endScreen && <EndScreen type={endScreen} onRestart={handleRestart}/>}
    </div>
  );
}