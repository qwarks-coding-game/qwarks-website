import Link from "next/link";
import Image from 'next/image';
import background from "./images/background.gif";

export default function Home() {
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <div style={{ position: 'fixed', width: '100vw', height: '100vh', overflow: 'hidden', top: 0, zIndex: -1}}>
        <Image src={background} alt={"An example QWARKS game"}
        layout="fill"
        objectFit="cover"/>
      </div>
      <h1>Strategize. Code. Win.</h1>
      <div style={{width: "50vw"}}>
        <p>Code your AI bot in Python to control your army of QWARKS to take over energy sources and eliminate your enemies!</p>
        <Link href="/about">
          <button>Learn More</button>
        </Link>
      </div>
    </div>
  );
}
