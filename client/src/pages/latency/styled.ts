import styled from "styled-components";

type TLatencyWrapperProps = {
  marginRight: string;
  marginTop: string;
}

export const LatencyWrapper = styled.div<TLatencyWrapperProps>`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  
  & * {
    margin-right: ${(props) => props.marginRight};
    margin-top: ${(props) => props.marginTop};
  }
`;
