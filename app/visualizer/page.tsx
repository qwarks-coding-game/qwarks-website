"use client"

import {useEffect, useRef, useState} from "react";
import VisualizerCanvas from "../components/VisualizerCanvas";
import {unzip} from "unzipit";

export default function Visualizer() {
  const [matchData, setMatchData] = useState({});
  const [file, setFile] = useState<File | null>(null);

  interface Entry {
    text: () => Promise<string>;
  }

  interface Entries {
    [key: string]: Entry;
  }

  const fileChanged = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const {entries}: {entries: Entries} = await unzip(file);

    // print all entries and their sizes
    for (const [name, entry] of Object.entries(entries)) {
      if (name === "match.json") {
        const match = JSON.parse(await entry.text());
        setMatchData(match);
      }
    }
  };

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "0", maxWidth: "100vw"}}>
      <input style={{maxWidth: "100vw"}} type="file" onChange={fileChanged}/>
      <VisualizerCanvas style={{width: "100vw", height: "calc(100vh - 70px)"}} width={"100vw"} height={"calc(100vh - 70px)"} match={matchData}/>
    </div>
  );
}
