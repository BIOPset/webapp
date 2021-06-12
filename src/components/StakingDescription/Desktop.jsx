import React from 'react';
import styled from 'styled-components';


export default StakingDescriptionDesktop;


function StakingDescriptionDesktop(props) {
  const { sellOptions, text } = props;

  return (
    <SELLOPTIONS>
      <SellOptions>{sellOptions}</SellOptions>
      <Text1>{text}</Text1>
    </SELLOPTIONS>
  );
}

const SELLOPTIONS = styled.div`
  width: 482px;
  display: flex;
  flex-direction: column;
  padding: 0 20.7px;
  align-items: flex-start;
  min-height: 105px;
  border-radius: 25px;
  box-shadow: 0px 11px 10px #00000029;
  background: linear-gradient(180deg, #f6f6f6 0%, #bebebe 478.63%);
`;

const SellOptions = styled.div`
  min-height: 27px;
  min-width: 112px;
  font-family: var(--font-family-poppins);
  font-weight: 700;
  color: var(--bright-gray);
  font-size: var(--font-size-l);
  text-align: center;
  letter-spacing: 0;
  line-height: 18px;
  white-space: nowrap;
`;

const Text1 = styled.p`
color: var(--bright-gray);
font-family: var(--font-family-poppins);
font-size: var(--font-size-m);
font-weight: 500;
font-style: normal;
  min-height: 55px;
  margin-top: 22px;
  margin-left: 0;
  min-width: 372px;
  text-align: center;
  letter-spacing: 0;
  line-height: 12px;
  white-space: nowrap;
`;


