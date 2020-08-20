import styled from "styled-components";

type TPlayerWrapperProps = {
  width: string;
  height: string;
  marginRight: string;
}

export const PlayerWrapper = styled.div<TPlayerWrapperProps>`
  position: relative;
  margin-right: ${(props) => props.marginRight};
  width: ${(props) => props.width};
  height: ${(props) => props.height};

`;

export const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
`;
