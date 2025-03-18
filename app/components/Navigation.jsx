import Image from 'next/image';
import logo from "../images/logo.png";
import NavigationElement from "./NavigationElement";

export default function Navigation() {
    return (
      <div style={{display:"flex", flexDirection: "row", alignItems: "center", justifyContent: "center", padding: "10px", position: "sticky", top: "0", backgroundColor: "black"}} className={"navbar"}>
        <NavigationElement to="/"><Image src={logo} alt="QWARKS logo" width="50" height="50"/></NavigationElement>
        <NavigationElement to="/">QWARKS</NavigationElement>
        <NavigationElement to="/about">About</NavigationElement>
        <NavigationElement to="/install">Install</NavigationElement>
      </div>
    );
}