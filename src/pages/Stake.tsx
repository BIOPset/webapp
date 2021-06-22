import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { callPoolTotalSupply, callPoolStakedBalance, callPoolNextWithdraw, sendDeposit, sendWithdrawGuarded, getPoolLockedAmount, getETHBalance } from "../helpers/web3";
import { BO_CONTRACT } from "../constants/contracts";
import Button from 'src/components/Button';
import Loading from 'src/components/Loading';
import { colors, fonts } from 'src/styles';
import ETHLOGO from '../assets/images/eth.svg';
import ETHLOGOWHITE from '../assets/images/eth-white.svg';
import ERC20COIN from '../assets/images/coin.png';

// @ts-ignore
import { convertAmountFromRawNumber, convertToDecimals, divide, formatFixedDecimals, multiply } from 'src/helpers/bignumber';
import { useActiveWeb3React } from '../hooks';
import { initWeb3 } from '../utils';
import Footer from '../components/Footer';
import Column from 'src/components/Column';
// @ts-ignore
import UNILP from "./UNILP";
import { i18n, getLocale } from "../i18n";
import { currentEthPriceInUSD } from "src/helpers/coingecko";

const height = window.innerHeight;
const width = window.innerWidth;
const vertical = width < height;
const darkMode = localStorage.getItem('darkMode');
const isDarkMode = darkMode === 'true' ? true : false;


const SWrapper = styled.div`
  width: 100%;
  height: ${height - 200}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: ${height > width ? "40%" : "10%"};
  margin-bottom: 60%%;
`

const SHelper = styled.div`
  font-size: x-small;
`

const SInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: stretch;
`

const SInputBbContainer = styled.div`
  flex: 1;
  height: 100px;
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  font-weight: bold;
  font-size: 1.05rem;
  border-radius: 40px;
`

const SInput = styled.input`
  background: transparent;
  border: none;
  border-width: 0px;
  color: rgb(${isDarkMode ? colors.white : colors.white});
  font-weight: bold;
`

const SRow = styled.div`
    display: flex;
    justify-content: space-between;
    item-aligns: 'center';
`;
const SInner = styled.div`
  justify-content: center;
  item-aligns: center;
  display: flex;
  @media (max-width: 968px) {
    display: block;
    width:90%;
    justify-content: space-between;
    item-aligns: 'center';
  }
`
const SInputRow = styled.div` 
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 0px;
  margin: 10px; 
  background-color: rgb(${isDarkMode ? "103, 105, 153" : ""});
  border: 3px solid rgb(${isDarkMode ? "138,142,163" : "255, 255, 255, 0.3"});
  border-radius: 20px;
  padding: 10px;
`

const STVL = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 10px; 
  background-color: rgb(${isDarkMode ? colors.darkerGrey : colors.white});
  border-radius: 20px;
  padding: 10px;
  text-align: center;
  box-shadow: 2px 2px 8px;
`

const SInterface = styled.div`

background-color: rgb(${isDarkMode ? colors.darkGrey : "255, 255, 255, 0.05"});
  box-shadow: 0px 11px 10px #00000029;
  padding: 20px;
  border-radius: 35px;
`

const SMax = styled.div`
  font-size: x-small;
  color: rgb(${isDarkMode ? "103, 105, 153" : ""});
  background-color: white;
  padding: 5px;
  border-radius: 35px;
  cursor: pointer;
`

const SButtonContainer = styled.div`
  width: 100%;
  padding:  10px;    
`




const SStake = styled.div`
  width:100%;
  display: flex;
  justify-content: center;
  align-items:center;
  flex-direction: column;
`

// @ts-ignore
const SPanel = styled.div`
  background-color: #F6F6F6;
  box-shadow: 0px 5px 6px #00000029;
  border-radius: 20px;
  padding: 20px;
  color: #3F3F4F;
  width: 60%;
  min-width: 480;
  @media (max-width: 968px) {
    min-width: 280;
  }
`
// @ts-ignore
const STitle = styled.div`
  font-size: 36px;
  @media (max-width: 968px) {
    font-size: 25px;
  }
`
// @ts-ignore
const SText = styled.div`
  font-size: 22px;
  margin-top: 10px;
  @media (max-width: 968px) {
    font-size: 15px;
  }
`

interface IStakeProps {
  onConnect: () => void
}

const Stake = (props: IStakeProps) => {
  // @ts-ignore
  const { onConnect } = props;

  const { account, chainId } = useActiveWeb3React();
  // @ts-ignore
  const locale = getLocale();

  const [address, setAddress] = useState<string>('');
  const [web3, setWeb3] = useState<any>('');
  const [networkId, setNetworkId] = useState<number>(1);
  const [error, setError] = useState<string>('');
  // @ts-ignore
  const [staked, setStaked] = useState<string>('0');
  // @ts-ignore
  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [nextWithdraw, setNextWithdraw] = useState<number>(0);
  // @ts-ignore
  const [locktotalLocked, setLocktotalLocked] = useState<string>('0');
  // @ts-ignore
  const [poolBalance, setPoolBalance] = useState<string>('0');
  // @ts-ignore
  const [tvl, setTVL] = useState<string>('0.00');
  const [userETHBalance, setUserETHBalance] = useState<string>('0');
  const [changeAmount, setChangeAmount] = useState<number>(0);


  // @ts-ignore
  const [toDeposit, setToDeposit] = useState<string>(0);
  // @ts-ignore
  const [toWithdraw, setToWithdraw] = useState<string>(0);
  // @ts-ignore
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!!account) {
      setAddress(account);
    }
  }, [account]);

  useEffect(() => {
    if (!!chainId) {
      setNetworkId(chainId)
      setWeb3(initWeb3(chainId));
    }
  }, [chainId]);

  // @ts-ignore
  useEffect(() => {
    if (web3 && address) {
      getStaked();
    }
  }, [address, web3]);

  const getStaked = async () => {
    const _staked = await callPoolStakedBalance(address, networkId, web3);
    const _nextWithdraw = await callPoolNextWithdraw(address, networkId, web3);
    const _totalStaked = await callPoolTotalSupply(networkId, web3);
    const _locktotalLocked = await getPoolLockedAmount(networkId, web3);
    const _poolBalance = await getETHBalance(BO_CONTRACT[networkId].address, web3);
    const _userETHBalance = await getETHBalance(address, web3);

    // @ts-ignore
    console.log(`pool balance os ${_poolBalance} totalStaked ${_totalStaked} `);
    await setStaked(String(_staked));
    await setNextWithdraw(Number(_nextWithdraw));
    await setTotalStaked(String(_totalStaked));
    await setLocktotalLocked(String(_locktotalLocked));
    await setPoolBalance(String(_poolBalance));
    await setUserETHBalance(String(_userETHBalance));
    // @ts-ignore
    console.log(`pool balance 2 is ${poolBalance}`);


    getTVL();
  }


  // @ts-ignore
  const getTVL = async () => {
    const price = await currentEthPriceInUSD();
    const _poolBalance = await getETHBalance(BO_CONTRACT[networkId].address, web3);
    
    const totalStake = web3.utils.fromWei(_poolBalance, "ether");
    console.log(`settings tvl to ${price} * ${totalStake}(${_poolBalance}) = ${multiply(price, totalStake)}`);
    setTVL(formatFixedDecimals(multiply(price, totalStake), 2));


  }

  const handleWithdraw = async () => {
    if (changeAmount > 0) {
      await sendWithdrawGuarded(address, web3.utils.toWei(changeAmount, "ether"), networkId, web3, (param1: any, param2: any) => {
        getStaked();
        setLoading(false);
        setError("");
        setChangeAmount(0);
      });
    } else {
      setLoading(false);
      setError("Can't withdraw 0");
    }

  }

  const handleDeposit = async () => {
    setLoading(true);

    // tslint:disable-next-line
    alert("Your deposit amount will be (soft) locked for 14 days.");
    await sendDeposit(address, web3.utils.toWei(changeAmount, "ether"), networkId, web3, (param1: any, param2: any) => {
      getStaked();
      setLoading(false);
      setError("");
      setChangeAmount(0);
    });
  }


  // @ts-ignore
  const renderWithdrawAvailable = () => {
    if (nextWithdraw !== 0) {
      const unlock = new Date(nextWithdraw * 1000);// add 1 days
      const now = new Date();
      const lockInPlace = unlock.getTime() > now.getTime();
      return (
        <div>
          <SHelper style={{ color: `rgb(${colors.red})` }}>
            {lockInPlace ? `Early Withdraw incure a 1%  penalty. Next fee free withdraw is ${unlock.toLocaleString()}` : ""}
          </SHelper>
          <br />
          <Button onClick={() => handleWithdraw()}>
            Withdraw
          </Button>
        </div>
      )
    } else {
      return null;
    }

  }



  const renderERC20Input = () => {
    console.log(`VERTICAL = ${vertical}. ${width} ${height}`);
    return (
     
      <SInputContainer style={{position: "relative", overflow: "hidden"}}>
        <Column>
          <SInputBbContainer style={{ height: "100%" }}>

            <SRow style={{ margin: "10px", justifyContent: vertical ? "center" : "space-between" }}>
              {vertical ?
                <></>
                :
                <div style={{ backgroundColor: `rgb(${isDarkMode ? colors.darkerGrey : colors.white})`, width: "60px", height: "60px", borderRadius: "20px", boxShadow: "2px 2px 8px" }}>
                  <img src={ERC20COIN} style={{ width: "60px", height: "60px", }} />
                </div>
              }

              <p style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "small" }}>FARM ERC20s</p>
              {vertical ?
                <></>
                : <div style={{ width: "60px", }}></div>
              }
            </SRow>

            <SRow style={{ margin: "10px", justifyContent: "center" }}>
              <Column>
                <STVL>
                  <span style={{
                    color: `rgb(${colors.black})`,
                    fontSize: "x-large"
                  }}>${tvl} TVL</span>
                </STVL>
                <span style={{
                  color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "small"
                }}>APY: {formatFixedDecimals('0', 2)}%</span>
              </Column>
            </SRow>
            <SHelper style={{ color: `rgb(${colors.red})` }}>{error}</SHelper>
            {vertical ? <div style={{ padding: "15px" }}></div> : <></>}

            <SRow style={{ marginBottom: "0px", paddingLeft: "5%", width: "90%" }}>
              <span style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "x-small" }}>
                {
                  // @ts-ignore
                  i18n[locale].BALANCE
                }: {formatFixedDecimals(web3 ? web3.utils.fromWei(userETHBalance, "ether") : "0", 4)}
              </span>
              {vertical ?
                <></> :
                <span style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: fonts.size.tiny, paddingTop: "5px", cursor: "pointer" }} >
                  {
                    // @ts-ignore
                    i18n[locale].STAKED}: {formatFixedDecimals(web3 ? web3.utils.fromWei(`${staked}`, "ether") : "0", 4)
                  }
                </span>
              }
            </SRow>
            <SRow>

              <SInputRow >
                <SInput
                  value={toDeposit}
                  onChange={(e) => { setToDeposit(e.target.value) }}
                />
                <SMax style={{ opacity: "0%" }}>MAX</SMax>
              </SInputRow>
              {vertical ?
                <></> :
                <SInputRow >
                  <SInput
                    value={toWithdraw}
                    onChange={(e) => { setToWithdraw(e.target.value) }}
                  />
                  <SMax onClick={() => { setToWithdraw(formatFixedDecimals(web3.utils.fromWei(`${staked}`, "ether"), 0)) }}>MAX</SMax>
                </SInputRow>}
            </SRow>



            <SRow style={{ justifyContent: "space-evenly" }}>
              <SButtonContainer >
                <Button
                  color={"mediumGrey"}
                  width={"100%"}
                  onClick={async () => {


                    setLoading(true);
                    await handleDeposit();
                    await getStaked();
                    setLoading(false);
                  }}
                >
                  <div style={{ color: `white` }}>
                    {
                      // @ts-ignore
                      i18n[locale].STAKE
                    }
                  </div>
                </Button>
              </SButtonContainer>

              {vertical ?
                <></> :
                <SButtonContainer >
                  <Button
                    color={"mediumGrey"}
                    width={"100%"}
                    onClick={async () => {
                      setLoading(true);
                      await handleWithdraw();
                      await getStaked();
                      setLoading(false);
                    }}
                  >
                    <div style={{ color: `white` }}>
                      {
                        // @ts-ignore

                        i18n[locale].UNSTAKE
                      }
                    </div>
                  </Button>
                </SButtonContainer>
              }
            </SRow>
            {vertical ?
              <SRow style={{ marginBottom: "0px", paddingLeft: "5%", width: "90%" }}>
                <span style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "x-small" }}>
                  {
                    // @ts-ignore
                    i18n[locale].STAKED
                  }: {formatFixedDecimals(web3 ? web3.utils.fromWei(`${staked}`, "ether") : "0", 4)}
                </span> </SRow> :
              <></>
            }

            {vertical ? <div style={{ padding: "15px" }}></div> : <></>}
            {vertical ? <SRow>

              <SInputRow >
                <SInput
                  value={toWithdraw}
                  onChange={(e) => { setToWithdraw(e.target.value) }}
                />
                <SMax onClick={() => { setToWithdraw(formatFixedDecimals(web3.utils.fromWei(`${staked}`, "ether"), 0)) }}>MAX</SMax>
              </SInputRow>
            </SRow> : <></>}

            {vertical ? <SRow style={{ justifyContent: "space-evenly" }}>
              <SButtonContainer >
                <Button
                  color={"mediumGrey"}
                  width={"100%"}
                  onClick={async () => {
                    setLoading(true);
                    await handleWithdraw();
                    await getStaked();
                    setLoading(false);
                  }}
                >
                  <div style={{ color: `white` }}>
                    {
                      // @ts-ignore

                      i18n[locale].UNSTAKE
                    }
                  </div>
                </Button>
              </SButtonContainer>
            </SRow>
              : <></>}

            {/*  <SRow style={{ margin: "10px", justifyContent: "center" }}>
              <img src={logoW} style={{ width: "40px", height: "40px", }} />
              <span style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "x-large" }} >{formatFixedDecimals(web3.utils.fromWei(`${pendingClaims}`, "ether"), 3)}</span>
            </SRow>
            <div style={{ height: 15 }} />
            <Button
              color={"mediumGrey"}

              onClick={async () => {
                setLoading(true);
                await handleClaim();
                await getBalance();
                setLoading(false);
              }}
            >
              <div style={{ color: `white` }}>
                {
                  // @ts-ignore
                  i18n[locale].CLAIM
                }
              </div>
            </Button> */}
          </SInputBbContainer>
        </Column>
        
        <div style={{opacity: "0.7", backgroundColor: "black", width: "100%", position: "absolute", height: "100%"}}>
          <h3 style={{color: "white"}}>ERC20 Pools Will Open Soon. For Onboarding Help For Your Token Contact Us On <a href="https://discord.gg/4SRYBNdE3r" style={{textDecoration: "underline"}}>Discord</a></h3>
        </div>
      </SInputContainer > 
    )
  }



  const renderInput = () => {
    console.log(`VERTICAL = ${vertical}. ${width} ${height}`);
    return (
      <SInputContainer>

        <Column>
          <SInputBbContainer style={{ height: "100%" }}>

            <SRow style={{ margin: "10px", justifyContent: vertical ? "center" : "space-between" }}>
              {vertical ?
                <></>
                :
                <div style={{ backgroundColor: `rgb(${isDarkMode ? colors.darkerGrey : colors.white})`, width: "60px", height: "60px", borderRadius: "20px", boxShadow: "2px 2px 8px" }}>
                  <img src={isDarkMode ? ETHLOGOWHITE : ETHLOGO} style={{ width: "60px", height: "60px", }} />
                </div>
              }

              <p style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "small" }}>FARM ETH</p>
              {vertical ?
                <></>
                : <div style={{ width: "60px", }}></div>
              }
            </SRow>

            <SRow style={{ margin: "10px", justifyContent: "center" }}>
              <Column>
                <STVL>
                  <span style={{
                    color: `rgb(${colors.black})`,
                    fontSize: "x-large"
                  }}>${tvl} TVL</span>
                </STVL>
                <span style={{
                  color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "small"
                }}>APY: {formatFixedDecimals('0', 2)}%</span>
              </Column>
            </SRow>
            <SHelper style={{ color: `rgb(${colors.red})` }}>{error}</SHelper>
            {vertical ? <div style={{ padding: "15px" }}></div> : <></>}

            <SRow style={{ marginBottom: "0px", paddingLeft: "5%", width: "90%" }}>
              <span style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "x-small" }}>
                {
                  // @ts-ignore
                  i18n[locale].BALANCE
                }: {formatFixedDecimals(web3 ? web3.utils.fromWei(userETHBalance, "ether") : "0", 4)}
              </span>
              {vertical ?
                <></> :
                <span style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: fonts.size.tiny, paddingTop: "5px", cursor: "pointer" }} >
                  {
                    // @ts-ignore
                    i18n[locale].STAKED}: {formatFixedDecimals(web3 ? web3.utils.fromWei(`${staked}`, "ether") : "0", 4)
                  }
                </span>
              }
            </SRow>
            <SRow>

              <SInputRow >
                <SInput
                  value={toDeposit}
                  onChange={(e) => { setToDeposit(e.target.value) }}
                />
                <SMax style={{ opacity: "0%" }}>MAX</SMax>
              </SInputRow>
              {vertical ?
                <></> :
                <SInputRow >
                  <SInput
                    value={toWithdraw}
                    onChange={(e) => { setToWithdraw(e.target.value) }}
                  />
                  <SMax onClick={() => { setToWithdraw(formatFixedDecimals(web3.utils.fromWei(`${staked}`, "ether"), 0)) }}>MAX</SMax>
                </SInputRow>}
            </SRow>



            <SRow style={{ justifyContent: "space-evenly" }}>
              <SButtonContainer >
                <Button
                  color={"mediumGrey"}
                  width={"100%"}
                  onClick={async () => {


                    setLoading(true);
                    await handleDeposit();
                    await getStaked();
                    setLoading(false);
                  }}
                >
                  <div style={{ color: `white` }}>
                    {
                      // @ts-ignore
                      i18n[locale].STAKE
                    }
                  </div>
                </Button>
              </SButtonContainer>

              {vertical ?
                <></> :
                <SButtonContainer >
                  <Button
                    color={"mediumGrey"}
                    width={"100%"}
                    onClick={async () => {
                      setLoading(true);
                      await handleWithdraw();
                      await getStaked();
                      setLoading(false);
                    }}
                  >
                    <div style={{ color: `white` }}>
                      {
                        // @ts-ignore

                        i18n[locale].UNSTAKE
                      }
                    </div>
                  </Button>
                </SButtonContainer>
              }
            </SRow>
            {vertical ?
              <SRow style={{ marginBottom: "0px", paddingLeft: "5%", width: "90%" }}>
                <span style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "x-small" }}>
                  {
                    // @ts-ignore
                    i18n[locale].STAKED
                  }: {formatFixedDecimals(web3 ? web3.utils.fromWei(`${staked}`, "ether") : "0", 4)}
                </span> </SRow> :
              <></>
            }

            {vertical ? <div style={{ padding: "15px" }}></div> : <></>}
            {vertical ? <SRow>

              <SInputRow >
                <SInput
                  value={toWithdraw}
                  onChange={(e) => { setToWithdraw(e.target.value) }}
                />
                <SMax onClick={() => { setToWithdraw(formatFixedDecimals(web3.utils.fromWei(`${staked}`, "ether"), 0)) }}>MAX</SMax>
              </SInputRow>
            </SRow> : <></>}

            {vertical ? <SRow style={{ justifyContent: "space-evenly" }}>
              <SButtonContainer >
                <Button
                  color={"mediumGrey"}
                  width={"100%"}
                  onClick={async () => {
                    setLoading(true);
                    await handleWithdraw();
                    await getStaked();
                    setLoading(false);
                  }}
                >
                  <div style={{ color: `white` }}>
                    {
                      // @ts-ignore

                      i18n[locale].UNSTAKE
                    }
                  </div>
                </Button>
              </SButtonContainer>
            </SRow>
              : <></>}

            {/*  <SRow style={{ margin: "10px", justifyContent: "center" }}>
              <img src={logoW} style={{ width: "40px", height: "40px", }} />
              <span style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "x-large" }} >{formatFixedDecimals(web3.utils.fromWei(`${pendingClaims}`, "ether"), 3)}</span>
            </SRow>
            <div style={{ height: 15 }} />
            <Button
              color={"mediumGrey"}

              onClick={async () => {
                setLoading(true);
                await handleClaim();
                await getBalance();
                setLoading(false);
              }}
            >
              <div style={{ color: `white` }}>
                {
                  // @ts-ignore
                  i18n[locale].CLAIM
                }
              </div>
            </Button> */}
          </SInputBbContainer>
        </Column>
      </SInputContainer >
    )
  }

  return (
    <>
      {loading ?
        <Loading />
        :
        <div style={{ display: "flex", flexDirection: vertical ? "column" : "row" }}>
         
          <SWrapper>

            <div style={{ padding: "30px" }}></div>
            <SInner>
              <SInterface>
                {renderInput()}
                <SStake>
                  {/*  <SPanel>
            <STitle>
              <b>Sell Options</b>
            </STitle>
            <SText>
              Contribute to the liquidity pool and passively earn premiums.
            </SText>
          </SPanel>
         */}</SStake >
              </SInterface>
            </SInner>
          </SWrapper>{/* 
          <UNILP onConnect={onConnect} /> */}

          <SWrapper>

<div style={{ padding: "30px" }}></div>
<SInner>
  <SInterface>
    {renderERC20Input()}
    <SStake>
      {/*  <SPanel>
<STitle>
  <b>Sell Options</b>
</STitle>
<SText>
  Contribute to the liquidity pool and passively earn premiums.
</SText>
</SPanel>
*/}</SStake >
  </SInterface>
</SInner>
</SWrapper>

        </div>
      }

      <Footer
        locale={locale}
      />
    </>
  )
}

export default Stake
