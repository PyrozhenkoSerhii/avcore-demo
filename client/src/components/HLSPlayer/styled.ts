import styled from "styled-components";

export const WithLoaderWrapper = styled.div`
  display: block;
  width: 80%;
  max-width: 640px;
  max-height: 480px;
  position: relative;
`;

export const Loader = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  width: 100%;
  height: 100%;
  z-index: 99;
`;
