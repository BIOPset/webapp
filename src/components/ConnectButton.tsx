import * as React from 'react'
import styled from 'styled-components'
import { RiWallet3Line } from 'react-icons/ri';
import {colors} from "../styles";

const SConnectButtonContainer = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  max-width: 224px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`

interface IConnectButtonStyleProps {
  disabled: boolean
  icon?: any
  primary: boolean,
  locale: string
}

interface IConnectButtonProps extends IConnectButtonStyleProps {
  onClick?: any
}

const SHoverLayer = styled.div`
  transition: all 0.15s ease-in-out;
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: rgb(${colors.orange});
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
`

const SIcon = styled.div`
  position: absolute;
  height: 28px;
  width: 28px;
  margin-left: 13.1%;
  top: calc((100% - 28px) / 2);
`

const SConnectButton = styled.button<IConnectButtonStyleProps>`
  transition: all 0.15s ease-in-out;
  position: relative;
  line-height: 1em;
  background-image: none;
  outline: none;
  overflow: hidden;
  box-shadow: none;
  border-style: none;
  box-sizing: border-box;
  background-color: rgb(${({ primary }) => (primary ? colors.orange : colors.white )});
  border: ${({ primary }) => (primary ? 'none' : `1px solid rgb(${colors.orange})`)};
  color: rgb(${({ primary }) => (primary ?  colors.white : colors.orange)});
  box-shadow: 0 4px 6px 0 rgba(50, 50, 93, 0.11),
    0 1px 3px 0 rgba(0, 0, 0, 0.08), inset 0 0 1px 0 rgba(0, 0, 0, 0.06);
  border-radius: 32px;
  font-size: 16px;
  font-weight: 600;
  height: 48px;
  width: 100%;
  margin: 0 auto;
  padding: ${({ icon }) => (icon ? '8px 5% 7px 17.2%' : '8px 12px')};
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};
  will-change: transform;

  display: flex;
  flex-direction: row;


  &:disabled {
    opacity: 0.7;
    box-shadow: 0 4px 6px 0 rgba(50, 50, 93, 0.11),
      0 1px 3px 0 rgba(0, 0, 0, 0.08), inset 0 0 1px 0 rgba(0, 0, 0, 0.06);
  }

  @media (hover: hover) {
    &:hover {
      transform: ${({ disabled }) => (!disabled ? 'translateY(-1px)' : 'none')};
      box-shadow: ${({ disabled }) =>
        !disabled
          ? `0 7px 14px 0 rgba(50, 50, 93, 0.1), 0 3px 6px 0 rgba(0, 0, 0, 0.08), inset 0 0 1px 0 rgba(0, 0, 0, 0.06)`
          : `0 4px 6px 0 rgba(50, 50, 93, 0.11), 0 1px 3px 0 rgba(0, 0, 0, 0.08), inset 0 0 1px 0 rgba(0, 0, 0, 0.06)`};
    }

    &:hover ${SHoverLayer} {
      opacity: 1;
      visibility: visible;
    }
  }

  &:active {
    transform: ${({ disabled }) => (!disabled ? 'translateY(1px)' : 'none')};
    box-shadow: 0 4px 6px 0 rgba(50, 50, 93, 0.11),
      0 1px 3px 0 rgba(0, 0, 0, 0.08), inset 0 0 1px 0 rgba(0, 0, 0, 0.06);
    color: rgba(255, 255, 255, 0.7);

    & ${SIcon} {
      opacity: 0.7;
    }
  }

  & ${SIcon} {
    right: auto;
    left: 0;
    display: ${({ icon }) => (icon ? 'block' : 'none')};
    mask: ${({ icon }) => (icon ? `url(${icon}) center no-repeat` : 'none')};
    mask-size: 100%;
    background-color: rgb(255, 255, 255);
    transition: 0.15s ease;
  }
`

const ConnectButton = (props: IConnectButtonProps) => (
  <SConnectButtonContainer>
    <SConnectButton
      type="button"
      {...props}
    >
      
      <RiWallet3Line size={"100%"}/>
    </SConnectButton>
  </SConnectButtonContainer>
)

ConnectButton.defaultProps = {
  disabled: false,
  icon: null
}

export default ConnectButton
