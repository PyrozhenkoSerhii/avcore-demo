import * as React from "react";
import { observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { socketService } from "./services/socket";
import { AlertComponent } from "./components/Alert";

const { useContext, useEffect } = React;

export const App = observer(():JSX.Element => {
  const socketStore = useContext(socketService);
  const location = useLocation();

  useEffect(() => {
    socketStore.init();
    socketStore.auth(location.pathname);
  }, []);

  return (
    <AlertComponent message={socketStore.error} type="error">
      Avcore Demo
    </AlertComponent>
  );
});
