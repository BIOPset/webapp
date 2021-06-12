import React from 'react';
import styled from 'styled-components';

export default StakingDescriptionMobile;


function StakingDescriptionMobile(props) {
  const { sellOptions, text } = props;

  return (
    <SELLOPTIONS>
      <SellOptions>{sellOptions}</SellOptions>
      <Text1>{text}</Text1>
    </SELLOPTIONS>
  );
}

const SELLOPTIONS = styled.div`
  width: 287px;
  display: flex;
  flex-direction: column;
  padding: 7.7px 16.8px;
  align-items: flex-start;
  min-height: 85px;
  border-radius: 20px;
  box-shadow: 0px 11px 10px #00000029;
  background: linear-gradient(180deg, #f6f6f6 0%, #bebebe 478.63%);
`;

const SellOptions = styled.div`
  min-height: 22px;
  min-width: 86px;
  font-family: var(--font-family-poppins);
  font-weight: 700;
  color: var(--bright-gray);
  font-size: var(--font-size-l);
  text-align: center;
  letter-spacing: 0;
  line-height: 14px;
  white-space: nowrap;
`;

const Text1 = styled.p`
  min-height: 31px;
  margin-top: 15px;
  margin-left: 0;
  min-width: 218px;
  font-family: var(--font-family-poppins);
  font-weight: 500;
  color: var(--bright-gray);
  font-size: var(--font-size-xxs);
  text-align: center;
  letter-spacing: 0;
  line-height: 7px;
  white-space: nowrap;
`;

