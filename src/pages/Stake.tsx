import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { callPoolTotalSupply, callPoolStakedBalance, callPoolNextWithdraw, sendDeposit, sendWithdrawGuarded, getPoolLockedAmount, getETHBalance } from "../helpers/web3";
import { BO_CONTRACT } from "../constants/contracts";
import Input from 'src/components/Input';
import Button from 'src/components/Button';
import Loading from 'src/components/Loading';
import { colors } from 'src/styles';
import { convertAmountFromRawNumber, convertToDecimals, formatFixedDecimals, subtract } from 'src/helpers/bignumber';
import { useActiveWeb3React } from '../hooks';
import { initWeb3 } from '../utils';
import Footer from '../components/Footer';
import { DEFAULT_LANG } from "../constants";

const height = window.innerHeight;

const Select = styled.select`
  height: 47px;
  width: 100%;
  max-width: 183px;
  background: white;
  color: black;
  padding-left: 5px;
  font-size: 17px;
  font-weight:600;
  border: 2px solid black;
  border-radius:5px;
  padding:2px;

  option {
    color: black;
    background: white;
    display: flex;
    white-space: pre;
    min-height: 47px;
    font-size: 17px;
    font-weight:600;
    padding: 0px 2px 1px;
  }
`;

const SStake = styled.div`
  width:100%;
  height: ${height - 200}px;
  display: flex;
  justify-content: center;
  align-items:center;
  flex-direction: column;
`
const SPanelOne = styled.div`
  background-color: #F6F6F6;
  box-shadow: 0px 5px 6px #00000029;
  border-radius: 20px;
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 150px;
  color: #3F3F4F;
  font-size: 22px;
  width: 60%;
  min-width: 480;
  @media (max-width: 968px) {
    min-width: 280;
    font-size:15px;
  }
`
const SPanel = styled.div`
  background-color: #F6F6F6;
  box-shadow: 0px 5px 6px #00000029;
  border-radius: 20px;
  padding: 20px;
  margin-top:150px;
  color: #3F3F4F;
  width: 60%;
  min-width: 480;
  @media (max-width: 968px) {
    min-width: 280;
  }
`
const SHelper = styled.div`
  font-size: x-small;
`
const STitle = styled.div`
  font-size: 36px;
  @media (max-width: 968px) {
    font-size: 25px;
  }
`
const SText = styled.div`
  font-size: 22px;
  margin-top: 10px;
  @media (max-width: 968px) {
    font-size: 15px;
  }
`


const Stake = () => {
  const { account, chainId } = useActiveWeb3React();
  const locale = localStorage.getItem('locale') ? localStorage.getItem('locale') : DEFAULT_LANG;

  const [address, setAddress] = useState<string>('');
  const [web3, setWeb3] = useState<any>('');
  const [networkId, setNetworkId] = useState<number>(1);
  const [pendingRequest, setPendingRequest] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  // @ts-ignore
  const [staked, setStaked] = useState<number>(0);
  const [totalStaked, setTotalStaked] = useState<number>(0);
  const [staking, setStaking] = useState<boolean>(false);
  const [nextWithdraw, setNextWithdraw] = useState<number>(0);
  const [locktotalLocked, setLocktotalLocked] = useState<number>(0);
  const [poolBalance, setPoolBalance] = useState<number>(0);
  const [changeAmount, setChangeAmount] = useState<number>(0);

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

    setTotalStaked(Number(_staked));
    setNextWithdraw(Number(_nextWithdraw));
    setTotalStaked(Number(_totalStaked));
    setLocktotalLocked(Number(_locktotalLocked));
    setPoolBalance(Number(_poolBalance));
  }

  const handleWithdraw = async () => {
    if (changeAmount > 0) {
      await sendWithdrawGuarded(address, web3.utils.toWei(changeAmount, "ether"), networkId, web3, (param1: any, param2: any) => {
        getStaked();
        setPendingRequest(false);
        setError("");
        setChangeAmount(0);
      });
    } else {
      setPendingRequest(false);
      setError("Can't withdraw 0");
    }

  }

  const handleDeposit = async () => {
    setPendingRequest(true);

    // tslint:disable-next-line
    alert("Your deposit amount will be (soft) locked for 14 days.");
    await sendDeposit(address, web3.utils.toWei(changeAmount, "ether"), networkId, web3, (param1: any, param2: any) => {
      getStaked();
      setPendingRequest(false);
      setError("");
      setChangeAmount(0);
    });
  }

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


  const renderStake = () => {
    if (changeAmount > 0) {
      return (
        <div>
          <Button onClick={() => handleDeposit()}>
            Stake
          </Button>
        </div>
      )
    } else {
      return null;
    }
  }

  const changeBet =(event: any) =>{
    console.log("Onchange value  ", event);
    if( event == "1" ) {
      setStaking(true);
      setChangeAmount(0);
      setError("");
    } else {
      setStaking(false);
      setChangeAmount(0);
      setError("");
    }
  }
  return (
    <>
    <SStake>
      <SPanel>
        <STitle>
          <b>Sell Options</b>
        </STitle>
        <SText>
          Contribute to the liquidity pool and passively earn premiums.
        </SText>
      </SPanel>
      <SPanelOne>
        <div style={{ color: `rgb(${colors.black})` }}>
          <b>{web3 ? convertToDecimals(`${formatFixedDecimals(`${web3.utils.fromWei(`${poolBalance}`, "ether")}`, 5)}`, 2) : '0.00'} ETH</b> Total Staked
            (<b>{web3 ? formatFixedDecimals(`${web3.utils.fromWei(`${subtract(poolBalance, locktotalLocked)}`, "ether")}`, 5) : '0.00'}</b> Available)
          </div>
        <div style={{ color: `rgb(${colors.black})` }}>
          Your contribution: <b>{convertAmountFromRawNumber(staked, 18)} ETH</b>
        </div>
        <div style={{ color: `rgb(${colors.black})` }}>
          <b>{convertToDecimals(`${((staked / totalStaked)) * 100}`, 2)}%</b> of total staked.
          </div>

        <SHelper style={{ color: `rgb(${colors.red})` }}>{error}</SHelper>
        {
          pendingRequest ?
            <Loading />
            :
            <>
              <Select onChange={(e: any)=>{changeBet(e.target.value)}}>
                <option  value="2">Withdraw</option>
                <option  value="1">Stake</option>
              </Select>
              <Input value={changeAmount} placeholder={`Amount To ${staking ? "Stake" : "Withdraw"}`}
                onChange={(e: any) => {
                  setChangeAmount(e.target.value);
                }}
                id="amountStake" />
              <SHelper style={{ color: `rgb(${colors.black})` }}>
                Amount In ETH
                </SHelper>
              {staking ?
                renderStake()
                :
                renderWithdrawAvailable()
              }
            </>
        }
      </SPanelOne>
    </SStake >
    <Footer
      locale={locale}
    />
    </>
  )
}

export default Stake
