"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import EpilepticWarning from "@/components/EpilepticWarning";

const Terminal = dynamic(() => import("@/components/Terminal"), {ssr: false});

export default function Home() {
  const [warningDone, setWarningDone] = useState(false);

  return (
    <>
      {!warningDone && <EpilepticWarning onAccept={() => setWarningDone(true)}/>}
      {warningDone && <Terminal/>}
    </>
  );
}