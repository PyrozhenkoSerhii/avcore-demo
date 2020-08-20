/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import styled from "styled-components";
import { Button } from "@material-ui/core";

export const AppWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #191B1C;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
`;

export const Content = styled.div`
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: row;

  @media (max-width: 1240px) {
    flex-direction: column;
  }
`;

export const ContentColumn = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  @media (max-width: 1240px) {
    width: 100%;
  }
`;

export const ColumnInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #dbdee4;
  height: 120px;
`;

export const ColumnController = styled.div`
  padding: 10px;
`;

type TVideoElementProps = {
  fullSize?: boolean;
  maxWidth?: string;
  height?: string;
  withBorder?: boolean;
}

export const Video = styled.video<TVideoElementProps>`
  width: ${(props) => (props.fullSize ? "100%" : "80%")};
  max-width: ${(props) => (props.maxWidth || "640px")};
  height: ${(props) => (props.height || "480px")};
  border: ${(props) => (props.withBorder ? "1px dashed #494545" : "none")};
  margin-top: 10px;
`;

const Text = styled.p`
  font-family: Roboto;
  margin: 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 5px;
`;

export const InfoHeader = styled(Text)`
  font-size: 1.3vw;

  @media (max-width: 1650px){
    font-size: 1.5vw;
  }

  @media (max-width: 1240px) {
    font-size: 22px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const InfoContent = styled(Text)`
  font-size: 1vw;

  @media (max-width: 1650px){
    font-size: 1.3vw;
  }

  @media (max-width: 1240px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

type TStyledButtonProps = {
  dynamicColor: string;
}

export const ButtonWithStyles = styled(({ dynamicColor, ...otherProps }) => <Button {...otherProps} />)<TStyledButtonProps>`
  && {
    background-color: ${(props) => props.dynamicColor};

    &:hover {
      background-color: ${(props) => props.dynamicColor};
    }
  }
`;
