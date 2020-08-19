import styled from "styled-components";
import { Link as RouterLink } from "react-router-dom";

type TLinkTextProps = {
  bold?: boolean;
}

export const NavigationWrapper = styled.div`
  width: 100%;
  height: 8%;
  background: #262A2B;
  padding: 0 20px;
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Text = styled.p<TLinkTextProps>`
  font-weight: ${(props) => (props.bold ? "bold" : "normal")};
  font-size: 25px;
  line-height: 19px;
  color: #fff;
  &:hover {
    color: #EAEAEA
  }
`;

export const Link = styled(RouterLink)`
  padding: 0 19px;
  text-decoration: none;
`;
