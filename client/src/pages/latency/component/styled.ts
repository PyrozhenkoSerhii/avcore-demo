import styled from "styled-components";

type TLatencyWrapperProps = {
  width: number;
}

export const LatencyWrapper = styled.div<TLatencyWrapperProps>`
  display: flex;
  flex-direction: row;
  width: ${(props) => `${props.width}px`};
  height: 100%;
  margin: 30px;
  padding-bottom: 20px;
`;
