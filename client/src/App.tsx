import * as React from "react";
import * as io from "socket.io-client";

export const App = ():JSX.Element => {
  io("http://localhost:80");
  return <div>Avcore Demo</div>;
};
