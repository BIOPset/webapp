import * as React from 'react'
import styled from 'styled-components'
import * as PropTypes from 'prop-types'
import Banner from './Banner'
import {  colors } from '../styles'
import Nav from './Nav'

const SHeader = styled.div`
  height: 70px;
  display: flex;
  align-items: center;
  opacity: 100%;
  background-color: ${colors.navBackground};
  justify-content: space-between;
  box-shadow: 0px 3px 6px #00000029;
`


const SActiveChain = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  font-weight: 500;
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
  & p {
    font-size: 0.8em;
    margin: 0;
    padding: 0;
  }
  & p:nth-child(2) {
    font-weight: bold;
  }
  @media (max-width: 968px) {
    width:100px;
    font-weight: 300;
    & p {
      font-size: 0.5em;
      margin: 0;
      padding: 0;
    }
    & p:nth-child(2) {
      font-weight: bold;
    }
`



interface IHeaderProps {
  killSession: () => void
  onConnect: () => void
  curPage: string
  setCurPage: any
  locale: string
}

const Header = (props: IHeaderProps) => {
  const { killSession, onConnect, locale, curPage, setCurPage } = props

  return (
    <>
      <SHeader {...props}>
        <SActiveChain>
          <Banner />
        </SActiveChain>
        <Nav locale={locale} killSession={killSession} onConnect={onConnect} curPage={curPage} setCurPage={setCurPage} />
       
      </SHeader>
    </>
  )
}

Header.propTypes = {
  killSession: PropTypes.func.isRequired,
  address: PropTypes.string
}

export default Header
