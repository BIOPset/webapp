import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { i18n, getLocale } from "../i18n";
import { callUNILPTokenReserves, callUnicryptPendingRewards, sendUNILPApprove, callUNILPTokenApproved, callUNILPBalance, callUniCryptDepositedBalance, callUNILPTotalSupply, sendUniCryptDeposit, sendUniCryptWithdraw } from "../helpers/web3";
import { UNICRYPTSTAKING_CONTRACT } from "../constants";
import { currentEthAndBiopPriceInUSD } from "../helpers/coingecko";
import ReactTooltip from 'react-tooltip';
import {  enabledPricePairs } from "../constants";
import Column from 'src/components/Column';
import Button from 'src/components/Button';
import Loading from 'src/components/Loading';
import { colors, fonts } from 'src/styles';
import { useActiveWeb3React } from '../hooks';
import { formatFixedDecimals, greaterThanOrEqual, divide, multiply, add } from 'src/helpers/bignumber';
import { initWeb3 } from '../utils';
import logoWhite from "../assets/logo-white.png";
import { BN } from "ethereumjs-util";

const darkMode = localStorage.getItem('darkMode');
const isDarkMode = darkMode === 'true' ? true : false;
const height = window.innerHeight;
const width = window.innerWidth;


const SBet = styled.div`
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



interface IUNILPProps {
  onConnect: () => void
}

const UNILP = (props:IUNILPProps) => {

  const { onConnect } = props;

  console.log('height         ', height);

  const vertical = width < height;
  const { account, chainId } = useActiveWeb3React();


  const [address, setAddress] = useState<string>("")
  const [networkId, setNetworkId] = useState<number>(42);
  const [web3, setWeb3] = useState<any>();
  // @ts-ignore
  const [pendingRequest, setPendingRequest] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  // @ts-ignore
  const [spendAmount, setSpendAmount] = useState<number>(0.0);
  // @ts-ignore
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  // @ts-ignore
  const [priceInterval, setPriceInterval] = useState<any>();
  const [lpTokenBalance, setLPTokenBalance] = useState<string>("0");
  const [pendingClaims, setPendingClaims] = useState<string>("0");
  // @ts-ignore
  const [depositedBalance, setDepositedBalance] = useState<string>("0");
  // @ts-ignore
  const [lpTokenApproved, setLPtokenApproved] = useState<number>(0);
  // @ts-ignore
  const [toDeposit, setToDeposit] = useState<string>(0);
  // @ts-ignore
  const [tvl, setTVL] = useState<string>("0.00");
  // @ts-ignore
  const [apy, setAPY] = useState<string>("0");
  // @ts-ignore
  const [needApproval, setNeedApproval] = useState<boolean>(false);

  // @ts-ignore
  const [loading, setLoading] = useState<boolean>(false);
  // @ts-ignore
  const [hasBet, setHasBet] = useState<boolean>(false);
  // @ts-ignore
  const [lastBetCall, setLastBetCall] = useState<boolean>(false);
  // @ts-ignore
  const [betDirection, setBetDirection] = useState<boolean>(true);

  const [toWithdraw, setToWithdraw] = useState<any>(0);
  // @ts-ignore
  const [userOptions, setUserOption] = useState<any>([]);
  // @ts-ignore
  const [optionsInterval, setOptionsInterval] = useState<any>();
  // @ts-ignore
  const [pair, setPair] = useState<any>(enabledPricePairs[0]);



  const locale = getLocale();

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

  useEffect(() => {
    if (!!address && !!web3) {
      getBalance();
      getTVL();
    } 
  }, [address, web3]);

  // @ts-ignore
  const getBalance = async () => {
    const lpba = await callUNILPBalance(address, networkId, web3);
    console.log(`lpba is ${lpba}`);
    const deba = await callUniCryptDepositedBalance(address, networkId, web3);
    const apprv = await callUNILPTokenApproved(address, networkId, web3);
    const pr = await callUnicryptPendingRewards(address, networkId, web3);
    console.log(`approved  is ${apprv}`);
    console.log(`deposited  is ${deba}`);
    setLPTokenBalance(String(lpba));
    setDepositedBalance(String(deba));
    setLPtokenApproved(Number(apprv));
    setPendingClaims(String(pr));

  }

  // @ts-ignore
  const getTVL = async () => {
    const data = await currentEthAndBiopPriceInUSD();
    console.log(`price data is ${data}`);
    console.log(data);
    const BIOPPrice = data.biopset.usd;
    const ETHPrice = data.ethereum.usd;
    const totalStaked = web3.utils.fromWei(await callUNILPBalance(UNICRYPTSTAKING_CONTRACT[networkId].address, networkId, web3));
    const totalSupply = web3.utils.fromWei(await callUNILPTotalSupply(networkId, web3));
    const reserves = Object(await callUNILPTokenReserves(networkId, web3));
    console.log(reserves);
    console.log(`reserves are ${reserves}`);
    const totalBIOPReserves = web3.utils.fromWei(reserves._reserve0);//  get reserve0 from UNILP, and apply fromWei
    const totalETHReserves = web3.utils.fromWei(reserves._reserve1);//  get reserve1 from UNILP, and apply fromWei
    
    console.log(`uni TVL is ${add(multiply(BIOPPrice, totalBIOPReserves), multiply(ETHPrice, totalETHReserves))}`);
    const resultTVL = multiply(divide(totalStaked, totalSupply), add(multiply(BIOPPrice, totalBIOPReserves), multiply(ETHPrice, totalETHReserves)));
    setTVL(formatFixedDecimals(resultTVL, 0));
    const resultAPY = multiply(divide(multiply(multiply(multiply(450000, 2), divide(365,37)),BIOPPrice), resultTVL), 100);
    console.log(`apy is ${resultAPY}`);
    setAPY(resultAPY);

  }

  // @ts-ignore
  const handleDepositInputChange = async (e: any) => {
    setToDeposit(e.target.value);
    if (!greaterThanOrEqual(lpTokenApproved, web3.utils.toWei(e.target.value.replace(",", "")))) {
      setNeedApproval(true);
    }
  }


  // @ts-ignore
  const handlespendAmountUpdate = async (e: any) => {
    const newBet = e.target.value.split(" ");
    await setSpendAmount(newBet);
  }

  // @ts-ignore
  const handleApprove = async () => {
    setPendingRequest(true);
    try {
      await sendUNILPApprove(web3.utils.toWei(lpTokenBalance), UNICRYPTSTAKING_CONTRACT[networkId].address, address, networkId, web3, async (p1: any, p2: any) => {
        console.log(p1, p2);
        setNeedApproval(false);
      });
    } catch (e) {
      console.log(e);
      setError("Approval Failed");
      setPendingRequest(false);
    }
  }

  // @ts-ignore
  const handleDeposit = async () => {
    setPendingRequest(true);
    try {

      console.log(`depositing ${toDeposit} ${new BN(toDeposit)}, ${web3.utils.toWei(toDeposit.replace(",", ""), "ether")}`);
      await sendUniCryptDeposit(web3.utils.toWei(toDeposit.replace(",", ""), "ether"), address, networkId, web3, (p1: any, p2: any) => {
        console.log(p1, p2);

        getBalance();
        setError("");
        setPendingRequest(false);
      });


    } catch (e) {
      console.log(e);
      setError("Deposit Failed");
      setPendingRequest(false);
    }
  }

  // @ts-ignore
  const handleWithdraw = async () => {
    setPendingRequest(true);
    try {

      if (greaterThanOrEqual(Number(depositedBalance), toWithdraw)) {

        console.log(`withdrawing ${new BN(toWithdraw)}`);
        await sendUniCryptWithdraw(web3.utils.toWei(toWithdraw.replace(",", "")), address, networkId, web3, (p1: any, p2: any) => {
          console.log(p1, p2);

          getBalance();
          setError("");
          setPendingRequest(false);
        });
      } else {

        setError("Withdraw Exceeds Balance");
        setPendingRequest(false);
      }

    } catch (e) {
      console.log(e);
      setError("Withdraw Failed");
      setPendingRequest(false);
    }
  }

  // @ts-ignore
  const handleClaim = async () => {
    setPendingRequest(true);
    try {


        console.log(`claim sending `);
        await sendUniCryptWithdraw(0, address, networkId, web3, (p1: any, p2: any) => {
          console.log(p1, p2);

          getBalance();
          setError("");
          setPendingRequest(false);
        });
      
    } catch (e) {
      console.log(e);
      setError("Claim Failed");
      setPendingRequest(false);
    }
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
                  <img src="https://raw.githubusercontent.com/BIOPset/brand-images/c308856ce6c5c761b34bf374764bf2e885fcb30e/logo.png" style={{ width: "60px", height: "60px", }} />
                </div>
              }

              <p style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "small" }}>FARM BIOP</p>
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
                }}>APY: {formatFixedDecimals(apy,2)}%</span>
              </Column>
            </SRow>
            <SHelper style={{ color: `rgb(${colors.red})` }}>{error}</SHelper>
            {vertical ? <div style={{padding: "15px"}}></div> : <></>}

            <SRow style={{ marginBottom: "0px", paddingLeft: "5%", width: "90%" }}>
              <span style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: "x-small" }}>
                {
                  // @ts-ignore
                  i18n[locale].BALANCE
                }: {formatFixedDecimals(web3.utils.fromWei(lpTokenBalance, "ether"), 4)}
              </span>
              {vertical ?
                <></> :
                <span style={{ color: `rgb(${isDarkMode ? colors.black : colors.white})`, fontSize: fonts.size.tiny, paddingTop: "5px", cursor: "pointer" }} >
                  {
                    // @ts-ignore
                    i18n[locale].STAKED}: {formatFixedDecimals(web3.utils.fromWei(`${depositedBalance}`, "ether"), 4)
                  }
                </span>
              }
            </SRow>
            <SRow>

              <SInputRow >
                <SInput
                  value={toDeposit}
                  onChange={(e) => { handleDepositInputChange(e) }}
                />
                <SMax onClick={() => { setToDeposit(formatFixedDecimals(web3.utils.fromWei(`${lpTokenBalance}`, "ether"), 0)) }}>MAX</SMax>
              </SInputRow>
              {vertical ?
                <></> :
                <SInputRow >
                  <SInput
                    value={toWithdraw}
                    onChange={(e) => { setToWithdraw(e.target.value) }}
                  />
                  <SMax onClick={() => { setToWithdraw(formatFixedDecimals(web3.utils.fromWei(`${depositedBalance}`, "ether"), 0)) }}>MAX</SMax>
                </SInputRow>}
            </SRow>



            <SRow style={{ justifyContent: "space-evenly" }}>
              <SButtonContainer >
                <Button
                  color={"mediumGrey"}
                  width={"100%"}
                  onClick={async () => {


                    setLoading(true);
                    if (needApproval) {
                      await handleApprove();
                    } else {
                      await handleDeposit();
                    }
                    await getBalance();
                    setLoading(false);
                  }}
                >
                  <div style={{ color: `white` }}>
                    {
                      // @ts-ignore
                      needApproval ? i18n[locale].APPROVE : i18n[locale].STAKE
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
                      await getBalance();
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
                  }: {formatFixedDecimals(web3.utils.fromWei(`${depositedBalance}`, "ether"), 4)}
                </span> </SRow> :
              <></>
            }

            {vertical ? <div style={{padding: "15px"}}></div> : <></>}
            {vertical ? <SRow>

              <SInputRow >
                <SInput
                  value={toWithdraw}
                  onChange={(e) => { setToWithdraw(e.target.value) }}
                />
                <SMax onClick={() => { setToWithdraw(formatFixedDecimals(web3.utils.fromWei(`${depositedBalance}`, "ether"), 0)) }}>MAX</SMax>
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
                    await getBalance();
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

            <SRow style={{ margin: "10px", justifyContent: "center" }}>
              <img src={logoWhite} style={{ width: "40px", height: "40px", }} />
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
            </Button>
          </SInputBbContainer>
          <ReactTooltip effect="solid" />
        </Column>
      </SInputContainer >
    )
  }

  // const width = window.innerWidth;
  // const height = window.innerHeight;

  return (
    <>
      <SBet>
       
        <div style={{padding: "30px"}}></div>
        {
          !web3 || !address ?
            <div onClick={()=>onConnect()}><Loading /></div>
          :
          (
          pendingRequest  ?
            <Loading />
            :
            <SInner>
              <SInterface>
                {renderInput()}
              </SInterface>
            </SInner>)
        }
      </SBet >
    </>
  )
}

export default UNILP
