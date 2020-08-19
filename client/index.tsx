import * as React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

import { App } from "./src/App";

const GlobalStyle = createGlobalStyle`
  html, body, #app {
    margin: 0;
    min-height: 100%;
  }
  * {
    box-sizing: border-box;
    font-family: "Roboto";
  }
`;

render(
  <BrowserRouter>
    <GlobalStyle />
    <App />
  </BrowserRouter>,
  document.getElementById("app"),
);
