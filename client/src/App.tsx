import * as React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import { AppWrapper } from "./components/styled";

import { DemoPage } from "./pages/demo";
import { LatencyPage } from "./pages/latency";

import { NavigationComponent } from "./components/Navigation";

export const App = ():JSX.Element => (
  <AppWrapper>
    <NavigationComponent />
    <Switch>
      <Route exact path="/">
        <Redirect to="/demo" />
      </Route>
      <Route path="/demo" exact render={() => <DemoPage />} />
      <Route path="/latency" exact render={() => <LatencyPage />} />
    </Switch>
  </AppWrapper>

);
