import Link from "next/link"

export default function Home() {
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <h1>Strategize. Code. Win.</h1>
      <div style={{width: "50vw"}}>
        <p>Code your AI bot in Python to control your army of QWARKS to take over energy sources and eliminate your enemies!</p>
        <br/>
        <Link href="/about">
          <button>Learn More</button>
        </Link>
      </div>
    </div>
  );
}
