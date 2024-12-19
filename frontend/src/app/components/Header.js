import Image from "next/image";
import Link from "next/link";
import stoneLogo from "../../assets/stoneLogo.png";
import MobileMenu from "./MobileMenu";
import "../globals.css";
import "../../styles/MainMenu.css";
import "../../styles/Chat.css";
import CountUp from "react-countup";


export default function Header(props) {
  return (
    <div id="header">
      <MobileMenu
        attempts={props.attempts}
        price={props.price}
        prize={props.prize}
        hiddenItems={props.hiddenItems}
        challenge={props.challenge}
        usdPrice={props.usdPrice}
        usdPrize={props.usdPrize}
        activeChallenge={props.activeChallenge}
      />
      <div className="header-content">
        <nav className="header-nav left">
          <Link href="/" className="nav-link pointer">Home</Link>
          <Link href="/viral-token" className="nav-link pointer">Tokens</Link>
        </nav>
        
        <Image
          onClick={() => {
            window.location.href = "/";
          }}
          alt="logo"
          src={stoneLogo}
          width="70"
          style={{
            borderRadius: "0px 0px 50px 50px",
            margin: "0px 10px",
          }}
          className="pointer mainLogo"
        />

        <nav className="header-nav right">
          <Link href="/faq" className="nav-link pointer">FAQ</Link>
          <Link href={`/break/${props.activeChallenge?.name}`} className="nav-link pointer">
            Play {props.activeChallenge && (<span className="live-pool">🔴LIVE: <CountUp
                    start={0}
                    end={props.usdPrize || 0}
                    duration={2.75}
                    decimals={0}
                    decimal="."
                    prefix="$"
                    preserveValue={true}
                  /> POOL
                </span>)}
          </Link>
        </nav>
      </div>
    </div>
  );
}
