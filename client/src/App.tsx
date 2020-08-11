/* eslint-disable jsx-a11y/media-has-caption */
import * as React from "react";
import { observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { Button, TextField } from "@material-ui/core";

import { socketService } from "./services/socket";
import { AlertComponent } from "./components/Alert";

const {
  useContext, useEffect, useState, useRef,
} = React;

export const App = observer(():JSX.Element => {
  const socketStore = useContext(socketService);
  const location = useLocation();
  const videoPlayer = useRef<HTMLVideoElement>(null);

  const [user, setUser] = useState("");

  useEffect(() => {
    socketStore.init();
  }, []);

  useEffect(() => {
    if (socketStore.mediaStream) {
      socketStore.publishStream(location.pathname.substring(1));
    }
  }, [socketStore.mediaStream]);

  const listen = () => {
    socketStore.listenStream(user);
  };

  useEffect(() => {
    if (videoPlayer.current && socketStore.incommingStream) {
      videoPlayer.current.srcObject = socketStore.incommingStream;
      videoPlayer.current.play();
    }
  }, [socketStore.incommingStream]);

  return (
    <AlertComponent message={socketStore.error} type="error">
      <>
        <TextField value={user} onChange={({ target }) => setUser(target.value)} />
        <Button variant="contained" color="primary" onClick={listen}>
          Subscribe
        </Button>
        <video ref={videoPlayer} />
      </>
    </AlertComponent>
  );
});
