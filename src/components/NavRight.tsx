import styled from 'styled-components';
import LocaleToggle from './LocaleToggle';
import React, { useState } from "react";
import {
    TRADE,
    STAKE,
    EXERCISE_EXPIRE,
    GOVERNANCE,
    BUY_BIOP,
    BIOP_ROUTE
} from "../constants";
import { colors } from "../styles";
import { useHistory } from "react-router-dom";
import DarkModeToggle from './DarkModeToggle';

interface INavRightStyleProps {
    open: boolean
};

const Ul = styled.ul<INavRightStyleProps>`
  display: flex;
  width: 100%;
  height: 100px;
  z-index: 15;
  align-items: center;
  padding: 0 16px;
  flex-direction: row;
  justify-content: flex-end;

  @media (max-width: 968px) {
    flex-flow: column nowrap;
    background-color: #0D2538;
    position: fixed;
    transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(100%)'};
    top: 0;
    right: 0;
    height: 100vh;
    width: 150px;
    padding-top: 0.5rem;
    transition: transform 0.3s ease-in-out;
    justify-content: flex-start;
  }
`;
const STogglie = styled.li` 
  padding: 5px;
  border-radius: 0 0 10px 0;
`
const SNavLink = styled.div`
  cursor: pointer;
  color: ${colors.navFontColor};
  margin-left: 30px;
  margin-right: 30px;
  font-size: 1.10rem;
  font-weight: bold;

  @media (max-width: 968px) {
    display: block;
    cursor: pointer;
    color: ${colors.navFontColor};
    font-size: 1.10rem;
    padding:10px;
    top:0;
    font-weight: bold;
`

const pages = [
    BUY_BIOP,
    STAKE,
    TRADE,
    EXERCISE_EXPIRE,
    GOVERNANCE,
  ]


const RightNav = ( props: INavRightStyleProps ) => {
    const history = useHistory();
    const [currentPage, setCurrentPage] = useState(BUY_BIOP);

    function navLink(page: string, currentPage: string, index: number, length: number) {
        return (
          <SNavLink
            onClick={() => { setCurrentPage(page), history.push(BIOP_ROUTE[index]); }}
            style={page === currentPage ?
              {
                color: `${colors.navActiveFontColor}`,
                borderBottom: `3px solid ${colors.borderRed}`,
              }
              :
              {}
            }
            key={page}>
            {page}
          </SNavLink>
        );
      }

    const { open } = props;
  return (
    <Ul open={open}>
        {pages.map((page, i) => navLink(page, currentPage, i, pages.length))}
        <STogglie>
            <LocaleToggle />
        </STogglie>
        <div style={{ paddingLeft: "25px" }}><DarkModeToggle /></div>
    </Ul>
  )
}

export default RightNav
