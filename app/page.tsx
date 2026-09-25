"use client";

import dynamic from "next/dynamic";
import { getAudio } from "@/lib/audio";
import { useState } from "react";
import EpilepticWarning from "@/components/EpilepticWarning";

const Terminal = dynamic(() => import("@/components/Terminal"), {ssr: false});

export default function Home() {
  const [warningDone, setWarningDone] = useState(false);

  const handleAccept = () => {
    const audio = getAudio();
    if (audio) {
      audio.volume = 0.6;
      if (audio.paused) audio.play().catch(() => {});
    }
    setWarningDone(true);
  }

  return (
    <div onClick={() => {
      const audio = getAudio();
      if (audio && audio.paused) audio.play().catch(() => {});
    }}>
      {!warningDone && <EpilepticWarning onAccept={handleAccept}/>}
      {warningDone && <Terminal/>}
    </div>
  );
}