import  React, { useEffect }  from 'react'
import styled from 'styled-components'
import * as PropTypes from 'prop-types'
import DarkModeToggle from './DarkModeToggle';
import LocaleToggle from './LocaleToggle';
import { transitions, colors } from "../styles";
import { GiHamburgerMenu } from 'react-icons/gi';
import { ellipseAddress } from '../helpers/utilities'
import {
  DEFAULT_LANG,
  FARM,
  TRADE,
  SETTLE
} from "../constants";
import Button from './Button';
import ConnectButton from './ConnectButton';
import { useActiveWeb3React } from '../hooks'
import Blockie from './Blockie'
import { getLocale } from "../i18n";

const SNav = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-direction: row;
`

const SMobileContainer = styled.div`
    background-color: rgb(${colors.white});
    z-index: 10;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    padding-top: 10%;
    margin-top: 0%;
    font-size: x-large;
    cursor: pointer;
`

const SMobileNavItem = styled.li`
    color: rgb(${colors.black});
    padding: 5px;
`

const STogglie = styled.li` 
    padding: 5px;
    border-radius: 0 0 10px 0;
`

const SNavLink = styled.div`
    cursor: pointer;
    color: black;
    padding: 6px;
    fontSize: 1.10rem;

`


const SActiveAccount = styled.div`
  background-color: rgb(${colors.connectButtonColor});
  width: 240px;
  height: 50px;
  border-radius: 23px
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 30px;
  margin-right: 30px;
  @media (max-width: 968px) {
    width: 150px;
    height: 40px;
    border-radius: 20px
    display: flex;
    font-weight: 400;
  }
`


const SBlockie = styled(Blockie)`
  margin-right: 10px;
  @media (max-width: 968px) {
    margin-right: 10px;
  }
`

interface IHeaderStyle {
  account: string | null | undefined
}

const SDisconnect = styled.div<IHeaderStyle>`
  color: ${colors.text6}
  transition: ${transitions.button};
  font-size: ${({ account }) => account ? '12px' : '15px'};
  font-weight: ${({ account }) => account ? 500 : 900};
  font-family: monospace;
  right: 0;
  top: 20px;
  opacity: 0.7;
  cursor: pointer;

  pointer-events: auto;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.5;
  }
`

interface INavProps {
  locale: string
  curPage: string
  setCurPage: any
  killSession: () => void
  onConnect: () => void
}

const Nav = (props: INavProps) => {
  const [showPanel, setShowPanel] = React.useState(false);
  const [locale, setLocale] = React.useState<string>(DEFAULT_LANG);


  useEffect(() => {
    const locale1 = getLocale();
    setLocale(locale1);

  }, [])


  function navLink(page: string, currentPage: string, index: number, length: number) {

    return (
      <SNavLink onClick={() => {
        setCurPage(page);
      }}
        key={page}   style={{ fontWeight: page === currentPage ? "bold" : "normal", borderBottom: page === currentPage ? "2px solid red" : "" }}
        >
        {page}
      </SNavLink>
    );

  }


  const { killSession, onConnect, curPage, setCurPage } = props

  const { account } = useActiveWeb3React();

  const width = window.innerWidth;
  const height = window.innerHeight;


  const pages = [
    TRADE,
    FARM,
    SETTLE
  ]
  if (width > height) {
    return (

      <SNav>
        {pages.map((page, i) => navLink(page, curPage, i, pages.length))}

        <STogglie><LocaleToggle /></STogglie>
        <div style={{ paddingLeft: "25px" }}><DarkModeToggle /></div>
        {
          account ?
            <SActiveAccount>
              <SBlockie address={account} />
              <SDisconnect
                account={account}
                onClick={() => killSession()}
              >
                {width > height ? ellipseAddress(account) : ""}
              </SDisconnect>
            </SActiveAccount>
            :
              <ConnectButton
                primary={true}
                locale={locale}
                onClick={() => onConnect()}
              />
        }
      </SNav>
    )
  } else {
    return (<div>

      {showPanel ?
        <SMobileContainer >
          <ul>
            <li>
            {
              account ?
                <SActiveAccount style={{marginLeft: "30%"}}>
                  <SBlockie address={account} />
                  <SDisconnect
                    account={account}
                    onClick={() => killSession()}
                  >
                    {width > height ? ellipseAddress(account) : ""}
                  </SDisconnect>
                </SActiveAccount>
                :
                <SActiveAccount style={{marginLeft: "30%"}}>
                  <SDisconnect
                    account={account}
                    onClick={() => onConnect()}
                  >
                    Connect Wallet
              </SDisconnect>
                </SActiveAccount>
            }</li>

            {pages.map(page => {

  // @ts-ignore
  console.log(`page is ${page} currentPage is ${curPage}`);
              return <SMobileNavItem
                key={page}
                onClick={() => {
                  setCurPage(page);
                  setShowPanel(false);
                }}
                style={{ fontWeight: page === curPage ? "bold" : "normal", borderBottom: page === curPage ? "2px solid red" : "" }}
              >
                {page}
              </SMobileNavItem>
            })}

            <LocaleToggle />
            <DarkModeToggle />

          </ul>


        </SMobileContainer>
        : <div style={{ marginRight: "10px" }} >
          <Button
            width={"40px"}
            onClick={() => setShowPanel(!showPanel)}
          >
            <GiHamburgerMenu style={{ color: `white` }} />
            </Button>

        </div>
      }
    </div >
    )
  }


}


Nav.propTypes = {
  locale: PropTypes.string.isRequired,
  killSession: PropTypes.func.isRequired,
}

export default Nav;