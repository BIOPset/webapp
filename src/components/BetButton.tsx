import * as React from 'react'

import Up from "../assets/up.png";
import Down from "../assets/down.png";
interface IBetButtonProps {
  up: boolean
  onClick: any
  active: boolean
}

const BetButton = (props: IBetButtonProps) => {
  const { up, onClick, active } = props;
  //const wide = window.innerWidth > window.innerHeight;

  function pickImage() {
    
      if (up) {
        return Up;
      } else {
        return Down;
      }
   
  }

  return (
    <div style={{
      width: "45px" ,
      height: "45px" ,
      background: `url(${pickImage()}) no-repeat`,
      backgroundSize: `cover`,
      backgroundPosition: 'center',
      margin: '3px',
      cursor: "pointer",
      color: "white",
      fontSize: '0.65rem',
      fontWeight: 'bold',
      verticalAlign: 'middle',
      opacity: active ? "100%" : "40%"
    }}
      onClick={() => onClick()}
    >
    </div>

  )
}
export default BetButton;