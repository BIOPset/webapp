import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import styled from 'styled-components';
import DarkModeToggle from './DarkModeToggle';
import LocaleToggle from './LocaleToggle';
import { colors } from "../styles";
import Burger from "./NavBurger";
import {
  BUY_BIOP,
  TRADE,
  STAKE,
  EXERCISE_EXPIRE,
  GOVERNANCE,
} from "../constants";
import Button from './Button';
import i18n from "../i18n";

const SNav = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-direction: row;
  justify-content: flex-end;
`

const SMobileContainer = styled.div`
  background-color: rgb(${colors.white});
  z-index: 10;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  padding-top: 50%;
  margin-top: 0%;
  font-size: x-large;
  cursor: pointer;
`

const SMobileNavItem = styled.li`
  color: rgb(${colors.black});
  padding: 5px;
`


interface INavProps {
  locale: string
}

const Nav = (props: INavProps) => {
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(BUY_BIOP);

  const width = window.innerWidth;
  const height = window.innerHeight;

  const pages = [
    BUY_BIOP,
    STAKE,
    TRADE,
    EXERCISE_EXPIRE,
    GOVERNANCE,
  ]
  if (width > height) {
    return (
      <SNav>
        <Burger/>
      </SNav>
    )
  } else {
    return (
      <div>
        <SMobileContainer >
          <ul>
            {pages.map(page => {
              return (
                <SMobileNavItem
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    history.push('/stak')
                  }}
                  style={{ fontWeight: page === currentPage ? "bold" : "normal" }}
                >
                  {page}
                </SMobileNavItem>
              )
            })}
            <LocaleToggle />
            <DarkModeToggle />
          </ul>
        </SMobileContainer>
        :
        <Button
        >
          <span style={{ color: `white` }}>
            {
              // @ts-ignore
              i18n[locale].MENU
            }
          </span>
        </Button>
      </div>
    )
  }
}


Nav.propTypes = {}

export default Nav;