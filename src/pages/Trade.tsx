import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { RiWallet3Line } from 'react-icons/ri';
import {
  callCurrentRoundID,
  callBetFee,
  sendComplete,
  callPoolTotalSupply,
  getLatestPrice,
  callPoolStakedBalance,
  callPoolMaxAvailable,
  getDirectRate,
  getOptionCreation,
  getOptionCloses,
  getTotalInterchange,
  callOpenCalls,
  callOpenPuts,
  getBlockNumber
} from "../helpers/web3";
import PriceChart from "../components/PriceChart";
import { makeBet } from "../helpers/web3";
import { DEFAULT_LANG, enabledPricePairs } from "../constants";
// import OptionTable from 'src/components/OptionTable';
import BetButton from 'src/components/BetButton';
import Button from 'src/components/Button';
// @ts-ignore
import Column from 'src/components/Column';
// @ts-ignore
import Row from 'src/components/Row';
import Loading from 'src/components/Loading';
import { colors } from 'src/styles';
import {
  subtract,
  convertAmountFromRawNumber,
  formatFixedDecimals,
  divide,
  greaterThan,
  convertToDecimals
} from 'src/helpers/bignumber';
import { useActiveWeb3React } from '../hooks';
import { initWeb3 } from '../utils';
import {i18n, getLocale} from "../i18n";
import Footer from "src/components/Footer";

const height = window.innerHeight;
const width = window.innerWidth;
const vertical = width < height;
// @ts-ignore
const darkMode = localStorage.getItem('darkMode');
// @ts-ignore
const isDarkMode = darkMode === 'true' ? true : false;

const SBet = styled.div`
  width:100%;
  height: ${height - 70}px;
`
const SBetPanel = styled.div`
  color: #707070;
  text-align: left;
  margin: 50px;
  @media (max-width: 968px) {
    margin-top: 10px;
    margin-left:0px;
    width: 100%;
    text-align:center;
  }
`
const SHelper = styled.div`
  font-size:< x-small;
  color: rgb(${colors.black});>
`

const SBetter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (max-width: 968px) {
    margin-top: 10px;
  }
`
const SInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: stretch;
  padding-left: 20px;
  padding-top: 10px;
`

// const SInputBbContainer = styled.div`
//   flex: 1;
//   height: 100px;
//   text-transform: uppercase;
//   box-sizing: border-box;
//   -moz-box-sizing: border-box;
//   font-weight: bold;
//   font-size: 1.05rem;
//   margin-top: 10px;
//   border-radius: 8px;
// `
const SInputBb = styled.input`
  background-color: transparent;
  text-align: center;
  border: none;
  margin-left: 10%;
  margin-right: 10%;
  height: 30px;
  font-weight: bold;
  font-size: 1.3rem;
  width: 80%;
  display: block;
  margin-bottom:1px;
`

const SInputBox = styled.div`
position: relative;
`

// const SOutlined = styled.span`
//   -webkit-text-stroke-width: 0.5px;
//   -webkit-text-stroke-color: white;
// `

const SBetButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 80px;
  justify-content: space-between;
  @media (max-width: 968px) {
    margin-top: 40px;
    margin-left:10%;
    justify-content: space-between;
    flex-direction: column;
  }
`;

// const SRow = styled.div`
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;
// `;

// const SColumn = styled.div`
//   display: flex;
//   flex-direction: column;
//   justify-content: space-around;
//   height: 100%;
// `;

const SSelect = styled.select`
  background-color: #F6F6F6;
  height: 41px;
  width: 140px;
  margin-right: 40px;
  box-shadow: 0px 3px 6 px #00000029;
  border-radius: 5px;
  padding: 5px;
  user-select: none;
`;

const SInterface = styled.div`
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  @media (max-width: 968px) {
    flex-direction: column;
  }
`
const STotal = styled.div`
  margin-top: 50px;
  @media (max-width: 968px) {
    margin-top: 10px;
  }
`
const SBuyButton = styled.div`
  margin-top: 80px;
  display: 'flex';
  justify-content: 'center';
  alignItems: 'center';
  @media (max-width: 968px) {
    margin-top: 10px;
  }
`

const SInputTitleText = styled.div`
  font-size: 20px;
  font-weight: 700; 
  text-align: left;
  color: rgb(${colors.black});
`

const SMobileInputContainr = styled.div`
  display: flex; 
  flex-direction: row; 
  justify-content: space-around;
`

const Times = {
  "1 Round": 1,
  "3 Rounds": 3,/*
    "15 MIN": 60*15, */
};

interface ITradeProps {
  onConnect: () => void
}

const Trade = (props: ITradeProps) => {


  const { onConnect } = props;

  // @ts-ignore
  const [connected, setConnected] = useState<boolean>(false);

  const [locale, setLocale] = useState<string>(DEFAULT_LANG);
  const { account, chainId } = useActiveWeb3React();
  // @ts-ignore
  const [address, setAddress] = useState<string>('');
  // @ts-ignore
  const [web3, setWeb3] = useState<any>();
  // @ts-ignore
  const [networkId, setNetworkId] = useState<number>(1);
  const [pendingRequest, setPendingRequest] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0.1);
  const [maxBet, setMaxBet] = useState<number>(1);
  const [amountToWin, setAmountToWin] = useState<any>(0);
  // @ts-ignore
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [pair, setPair] = useState<any>(enabledPricePairs[0]);
  const [rounds, setRounds] = useState<number>(1);
  // @ts-ignore
  const [userOptions, setUserOptions] = useState<any>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  // @ts-ignore
  const [priceInterval, setPriceInterval] = useState<any>();
  // @ts-ignore
  const [optionsInterval, setOptionsInterval] = useState<any>();
  // @ts-ignore
  const [lastBetCall, setLastBetCall] = useState<boolean>(false);
  // @ts-ignore
  const [totalInterchange, setTotalInterchange] = useState<number>(0);
  const [betDirection, setBetDirection] = useState<boolean>(true);
  const [openOptions, setOpenOptions] = useState<number>(2);
  const [betFee, setBetFee] = useState<number>(0);
  // @ts-ignore
  const [currentRound, setCurrentRound] = useState<number>(0);
  // @ts-ignore
  const [staked, setStaked] = useState<number>(0);
  // @ts-ignore
  const [maxTotalStaked, setMaxTotalStaked] = useState<number>(0);


  useEffect(() => {
    const locale1 = getLocale();
    setLocale(locale1);

    // @ts-ignore
    console.log(`web3 is ${web3}`);
  }, [])

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
    async function fetchData() {
      await updateBetDirection(betDirection);
      await getStaked();

      updateRate();
      loadUserOptions();
      getTI();
      loadBetFee();
      loadCurrentPrice();

      setPriceInterval(
        setInterval(() => {
          loadCurrentPrice()
        }, 10000)
      );
      setOptionsInterval(
        setInterval(() => {
          loadUserOptions()
        }, 30000)
      );
    }
    if (address && web3) {
      fetchData();
      setConnected(true);
    } 
  }, [address, web3]);

  const getTI = async () => {
    const ti = await getTotalInterchange(web3, networkId);
    setTotalInterchange(Number(ti));
  }

  const loadBetFee = async () => {
    const fee = await callBetFee(networkId, web3);
    setBetFee(Number(fee));
  }

  const loadCurrentPrice = async () => {
    const latestPrice = await getLatestPrice(networkId, web3);
    setCurrentPrice(Number(latestPrice));
  }

  const loadUserOptions = async () => {
    let blockNum: any = await getBlockNumber(web3);
    blockNum = subtract(blockNum, 25000);

    const options: any = await getOptionCreation(networkId, web3, blockNum);
    // TODO replace with dynamic price provider
    const cr: any = await callCurrentRoundID(networkId, web3, enabledPricePairs[0].address);
    const massagedOptions = {};
    for (let i = 0; i < options.length; i++) {
      console.log(`loaded event ${options[i].returnValues.account} purchase round:${options[i].pR} ${address}`);
      console.log(options[i]);

      if (options[i].returnValues) {
        if (options[i].returnValues.account === address) {
          massagedOptions[options[i].returnValues.id] = {
            blockNumber: options[i].blockNumber,
            purchaseRound: options[i].returnValues.pR,
            exp: options[i].returnValues.exp,
            id: options[i].returnValues.id,
            creator: options[i].returnValues.account,
            strikePrice: options[i].returnValues.sP,
            lockedValue: options[i].returnValues.lV,
            type: options[i].returnValues.dir,
            complete: false
          }
        }
      }
    }

    console.log("massaged options");
    console.log(massagedOptions);

    // load exercise/expire events
    const completeEvents: any = await getOptionCloses(networkId, web3, blockNum);
    for (let i = 0; i < completeEvents.length; i++) {
      console.log(`found option #1 ${completeEvents[i].returnValues}`);
      console.log(completeEvents[i]);

      if (completeEvents[i].returnValues) {
        if (massagedOptions[completeEvents[i].returnValues.id] !== undefined) {
          massagedOptions[completeEvents[i].returnValues.id].complete = true;
          if (completeEvents[i].event === "Expire") {
            massagedOptions[completeEvents[i].returnValues.id].expired = true;
          }
          if (completeEvents[i].event === "Exercise") {
            massagedOptions[completeEvents[i].returnValues.id].exercised = true;
          }
        }
      }
    }

    const sorted = Object.keys(massagedOptions).sort((a: any, b: any) => b - a);

    console.log(`sorted $`);
    console.log(sorted);
    const sortedOptions: any = [];
    sorted.forEach((id: any) => {
      if (massagedOptions[id].exp) {
        sortedOptions.push(massagedOptions[parseInt(id, 10)]);
      }
    });

    setUserOptions(sortedOptions);
    setCurrentRound(cr);
  }

  const getStaked = async () => {
    const staked = await callPoolStakedBalance(address, networkId, web3);
    const totalStaked = await callPoolTotalSupply(networkId, web3);
    let _maxBet: string = await callPoolMaxAvailable(networkId, web3);
    _maxBet = divide(_maxBet, 10);
    _maxBet = divide(_maxBet, openOptions);
    setMaxTotalStaked(Number(totalStaked));
    setStaked(Number(staked));
    setMaxBet(Number(_maxBet));
  }

  const updateBetDirection = async (dir: boolean) => {
    setBetDirection(dir);
    let open: any;
    if (dir) {
      open = await callOpenCalls(networkId, web3);
    } else {
      open = await callOpenPuts(networkId, web3);
    }

    if (open > 2) {
      setOpenOptions(open);
    } else {
      setOpenOptions(2);
    }
  }

  const handleBetAmountUpdate = async (e: any) => {
    const newBet = e.target.value.split(" ");
    await setBetAmount(newBet)
    await updateRate();
  }

  const updateRate = async () => {
    if (greaterThan(betAmount, convertAmountFromRawNumber(maxBet, 18))) {
      setAmountToWin("invalid");
    } else {
      console.log(`getting amount for ${betAmount} ${web3.utils.toWei(`${betAmount}`, "ether")}`);
      const amountToWin = await getDirectRate(currentPrice, pair.address, betDirection, rounds, openOptions, web3.utils.toWei(`${betAmount}`, "ether"), networkId, web3);
      console.log(`new amountToWin ${amountToWin}.`);
      // this.setState({ amountToWin: formatFixedDecimals(`${web3.utils.fromWei(`${amountToWin}`, "ether")}`, 5) });
      setAmountToWin(formatFixedDecimals(`${web3.utils.fromWei(`${amountToWin}`, "ether")}`, 5))
      loadBetFee();
    }
  }

  const handleMakeBet = async (direction: boolean) => {
    setPendingRequest(true);
    setLastBetCall(direction);
    try {
      await makeBet(address, web3.utils.toWei(`${betAmount}`, "ether"), direction, rounds, pair.address, networkId, web3, (param1: any, param2: any) => {
        console.log(`makeBet ${param1} maxBet`);
        console.log(param1, param2);
        getStaked();
        setError("");
        setPendingRequest(false);
        setHasBet(true);
      });

    } catch (e) {
      console.log(e);
      setError("Betting Failed");
      setPendingRequest(false);
    }
  }

  // @ts-ignore
  const handleComplete = async (optionId: any) => {
    setPendingRequest(true);
    try {
      console.log(`sending exercise for opton ${optionId}`);
      await sendComplete(address, optionId, networkId, web3, (p1: any, p2: any) => {
        console.log(p1, p2);
        loadUserOptions();
        setError("");
        setPendingRequest(false);
      });
    } catch (e) {
      setError("Exercise Failed");
      setPendingRequest(false);
    }
  }

  // @ts-ignore
  const renderMaxBet = () => {
    if (maxBet === 0) {
      return <SHelper style={{ paddingTop: "0px", marginTop: "0px" }}>Pool Maxed Out</SHelper>
    } else {
      return <SHelper style={{ paddingTop: "0px", marginTop: "0px" }}>Max Trade Size: {convertToDecimals(`${convertAmountFromRawNumber(maxBet, 18)}`, 6)} ETH</SHelper>
    }
  }

  // @ts-ignore
  const renderRoundsSelect = () => {
    return (
      <SSelect onChange={async (e: any) => {
        await setRounds(Times[e.target.value]);
        await updateRate()
      }}>
        {Object.keys(Times).map((key: any, i: number) => {
          return (
            <option
              key={i}
              value={key}>
              {key}
            </option>
          )
        })}
      </SSelect>
    )
  };

  const renderPairSelect = () => {
    return (
      <SSelect onChange={(e) => {
        setPair(JSON.parse(e.target.value));
      }}>
        {enabledPricePairs.map((nPair: any) => {
          return <option
            key={nPair.pair}
            selected={pair === nPair}
            value={JSON.stringify(nPair)}>
            {nPair.display}
          </option>
        })}
        <option disabled value="MORE SOON">MORE SOON</option>
      </SSelect>
    )
  };

  const openBettingAlert = () => {
    alert("You are taking a risk!\nBy using BIOPset to make any trade you are risking 100% of the capital you deposit.\nThe rate shown in the win total is the maximum potential value you can win. It is also shown as a percentage in 'Potential Yield'. This is the amount you can win. If it's not enough for you, don't make the trade.");
  }

 // @ts-ignore
  const renderMobileInput = () => {
    return <SMobileInputContainr  >
      <SBetButtonContainer style={{justifyContent: "center"}}>
      <div>
      <SInputTitleText >
      <span style={{ color: `rgb(${colors.black})` }}>  Spend:</span>
          </SInputTitleText>
          <div style={{  backgroundColor: `rgb(${colors.darkerGrey})` , height: 50, borderRadius: 5, display: 'flex', alignItems: 'center' }} >
            <SInputBox>
              <SInputBb style={{ color: `rgb(${colors.black})`}} value={betAmount} placeholder={`Amount To Bet`} onChange={(e) => handleBetAmountUpdate(e)} id="amountStake" />
              {/* {renderMaxBet()} */}
            </SInputBox>
          </div>
          <div style={{ fontSize: 14, color: `rgb(${colors.black})` }}>Trading Fee: <span> {divide(betFee, 1000)}%</span></div>
          
      </div>
      <STotal>
            <SInputTitleText>
            <span style={{ color: `rgb(${colors.black})` }}>  TOTAL Win </span> <span style={{ cursor: "pointer", color: '#FF7700' }} onClick={() => openBettingAlert()}>ⓘ</span> :
            </SInputTitleText>
            <div style={{ backgroundColor: `rgb(${colors.darkerGrey})`, color: `rgb(${colors.black})`, height: 50, borderRadius: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
              {amountToWin}
            </div>
          </STotal>
      
      </SBetButtonContainer>
      <SBetButtonContainer >
            <div  onClick={() => { updateBetDirection(true) }}  style={{ backgroundColor: betDirection ? '#e5fafa': '#F6F6F6', boxShadow: '0px 3px 6px #0000005F', borderRadius: 5, padding: 20, margin: 20 }}>
              <BetButton up={true} onClick={() => { }} active={betDirection} />
            </div>
            <div onClick={() => { updateBetDirection(false) }} style={{ backgroundColor: betDirection ?'#F6F6F6'  : '#F2D8D8', boxShadow: '0px 3px 6px #0000005F', borderRadius: 5, padding: 20 , margin: 20 }}>
              <BetButton up={false} onClick={() => { }} active={!betDirection} />
            </div>
          </SBetButtonContainer>
  
    </SMobileInputContainr>
  }

  const renderInput = () => {
     if (vertical) {
      return renderMobileInput();
    } else {
      return (
        <SBetPanel>
          {/* <div style={{ color: '#707070', textAlign: 'left', margin: 50 }}> */}
          {/* <SInputContainer style={{ flexDirection: "row" }}>
            <ReactTooltip effect="solid" />
            <SInputBbContainer style={{ backgroundColor: `rgb(${colors.fadedBlue})`, color: `rgb(${colors.white})` }}>
              <SRow>
                <SColumn style={{ textAlign: "left" }}>
                  <span style={{ marginLeft: "20px", color: `white` }}>Maximium Yield:</span>
                  <span style={{ marginLeft: "20px", color: `white` }}>Minimum Yield:</span>
                </SColumn>
                <SColumn style={{ textAlign: "right" }}>
                  {
                    greaterThan(divide(multiply(divide(amountToWin, betAmount), 100), 2), 5) ?
                      <span style={{ marginRight: "20px", color: `rgb(${colors.white})` }}>{greaterThan(multiply(divide(amountToWin, 2), 100), 0) ? divide(multiply(divide(amountToWin, betAmount), 100), 2) : "100"}%</span>
                      :
                      <SOutlined style={{ marginRight: "20px", color: greaterThan(divide(multiply(divide(amountToWin, betAmount), 100), 2), 5) ? `rgb(${colors.white})` : `rgb(${colors.red})` }}>{greaterThan(multiply(divide(amountToWin, 2), 100), 0) ? divide(multiply(divide(amountToWin, betAmount), 100), 2) : "100"}%</SOutlined>
                  }
                  <span style={{ marginRight: "20px", color: `white` }}>-100%</span>
                </SColumn>
              </SRow>
            </SInputBbContainer>
          </SInputContainer> */}
  
          {/* <div style={{ width: 300 }}> */}
  
          <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'left' }}>
            <span style={{color: `rgb(${colors.black})`}}> Price:</span>
          </div>
          <div style={{  backgroundColor: `rgb(${colors.darkerGrey})` , height: 50, borderRadius: 5, display: 'flex', alignItems: 'center' }} >
            <SInputBox>
              <SInputBb style={{ color: `rgb(${colors.black})`}} value={betAmount} placeholder={`Amount To Bet`} onChange={(e) => handleBetAmountUpdate(e)} id="amountStake" />
              {/* {renderMaxBet()} */}
            </SInputBox>
          </div>
          <div style={{ fontSize: 14, color: `rgb(${colors.black})` }}>Trading Fee: <span> {divide(betFee, 1000)}%</span></div>
          {/* </div> */}
  
          <STotal>
            <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'left' }}>
            <span style={{color: `rgb(${colors.black})`}}>  TOTAL Win </span> <span style={{ cursor: "pointer", color: '#FF7700' }} onClick={() => openBettingAlert()}>ⓘ</span> :
            </div>
            <div style={{ backgroundColor: `rgb(${colors.darkerGrey})`, color: `rgb(${colors.black})`, height: 50, borderRadius: 5, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
              {amountToWin}
            </div>
          </STotal>
  
          <SBetButtonContainer>
            <div style={{ backgroundColor: betDirection ? '#e5fafa': '#F6F6F6', boxShadow: '0px 3px 6px #0000005F', borderRadius: 5, padding: 20 }}>
              <BetButton up={true} onClick={() => { if(connected) { updateBetDirection(true); }}} active={betDirection} />
            </div>
            <div style={{ backgroundColor: betDirection ?'#F6F6F6'  : '#F2D8D8', boxShadow: '0px 3px 6px #0000005F', borderRadius: 5, padding: 20 }}>
              <BetButton up={false} onClick={() => { updateBetDirection(false) }} active={!betDirection} />
            </div>
          </SBetButtonContainer>
  
          <SBuyButton>
            {web3 ?
  
              <Button color={betDirection ? `blue` : `red`}
                width={"100%"}
                borderRadius={5}
                onClick={() => { handleMakeBet(betDirection) }}
              >
                <span style={{ color: `white` }}>
                {i18n[locale].BUY} {betDirection ? i18n[locale].CALL : i18n[locale].PUT}
                </span>
              </Button>
  
  
              :
              <Button
                color={"orange"}
                width={"100%"}
                onClick={() => {
                  onConnect();
                }}
              >
  <RiWallet3Line size={"100%"}/>
              </Button>
            }
  
          </SBuyButton>
          {/* </div> */}
        </SBetPanel>
      )
    }
    
  }

  const renderPriceChart = () => {
    console.log(`rerender chart with pair ${pair} currentPrice ${currentPrice}`);

    return (
      <SBetter>
        <PriceChart pair={pair.pair} currentPrice={currentPrice} />
      </SBetter>
    )
  }

  return (
    <SBet>
      <SHelper style={{ color: `rgb(${colors.red})` }}>{error}</SHelper>
      {
        pendingRequest ?
          <Loading />
          :
          <div style={{ width: '100%', height: '100%' }}>
            <SInputContainer>
              {renderPairSelect()}
              {renderRoundsSelect()}
            </SInputContainer>
            <SInterface style={vertical ? {flexDirection: "column"} : {}}>
              {renderPriceChart()}
              {renderInput()}
            </SInterface>
          </div>
      }
      <Footer locale={locale}/>
      {/* <SHelper >Trading Volume: {formatFixedDecimals(web3.utils.fromWei(`${totalInterchange}`, "ether"), 8)} ETH</SHelper>
        {
          hasBet ?
            <SHelper>Share your price prediction with the world:
                <a
                href={`https://twitter.com/share?ref_src=twsrc%5Etfw&text=I%20bought%20a%20binary%20${lastBetCall ? "Call📈" : "Put📉"}%20option%20on%20%40biopset!%20%0A%0AThink%20you%20can%20pick%20the%20price%20direction%3F%0Abiopset.com%20%0A%0AWanna%20make%20money%3F%20%0AHit%20the%20exercise%20tab%20and%20score%20some%20risk%20free%20%23ETH%0A%0A%23binaryoptions%20%23defi%20%23ethereum%20`}
                className="twitter-share-button" target="_" >
                <b>TWEET IT!</b>
              </a>
            </SHelper>
            :
            null
        }
        <br />
        {userOptions.length > 0 ?
          <>
            <h4 style={{ color: `rgb(${colors.black})` }}>Options Purchased</h4>
            <br />
            <OptionTable
              showFee={false}
              web3={web3}
              options={userOptions}
              handleComplete={(optionId: any) => handleComplete(optionId)}
              currentPrice={currentPrice}
              currentRound={currentRound}
            />
          </>
          :
          <></>
        } */}
    </SBet>
  )
}

export default Trade
