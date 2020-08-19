import * as React from "react";
import { useLocation } from "react-router-dom";

import { NavigationWrapper, Text, Link } from "./styled";

export const NavigationComponent = (): JSX.Element => {
  const { pathname } = useLocation();

  return (
    <NavigationWrapper>
      <Link to="/demo">
        <Text bold={pathname.includes("demo")}>AVCore Demo</Text>
      </Link>
      <Link to="/latency">
        <Text bold={pathname.includes("latency")}>Latency test</Text>
      </Link>
    </NavigationWrapper>
  );
};
