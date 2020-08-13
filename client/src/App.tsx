import * as React from "react";
import { observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { Button, Typography } from "@material-ui/core";
import { CloudDownload, CloudUpload } from "@material-ui/icons";

import { socketService } from "./services/socket";
import { AlertComponent } from "./components/Alert";
import { HLSPlayerVideoJSComponent } from "./components/HLSPlayerVideoJS";
import { PlayerComponent } from "./components/Player";

import {
  AppWrapper, Header, Content, ContentColumn, ColumnInfo, ColumnController,
} from "./components/styled";

const { useContext, useEffect } = React;

export const App = observer(():JSX.Element => {
  const socketStore = useContext(socketService);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const serverUrl = params.get("server");

  useEffect(() => {
    if (serverUrl) {
      socketStore.changeServer(serverUrl);
    }
  }, [serverUrl]);

  return (
    <AlertComponent message={socketStore.error} type="error">
      <AppWrapper>
        <Header>
          <Typography variant="h4" align="center">AVCore Demo</Typography>
        </Header>

        <Content>
          <ContentColumn>
            <ColumnInfo>
              <Typography variant="h6">Publish your stream to the AVCore server</Typography>
            </ColumnInfo>

            <ColumnController>
              <Button
                style={{ backgroundColor: socketStore.streamId ? "#5f5e5e" : "primary" }}
                variant="contained"
                color="primary"
                endIcon={<CloudUpload />}
                onClick={socketStore.streamId
                  ? socketStore.stopPublishing
                  : socketStore.publishStream}
              >
                {socketStore.streamId ? "Stop" : "Publish"}
              </Button>
            </ColumnController>

            <PlayerComponent source={socketStore.mediaStream} self />
          </ContentColumn>

          <ContentColumn>
            <ColumnInfo>
              <Typography variant="h6">Subscribe to the stream you&apos;ve just published via WebRTC</Typography>
              <Typography variant="body2">You will be able to subscribe as soon as you publish your stream</Typography>
            </ColumnInfo>

            <ColumnController>
              <Button
                style={{ backgroundColor: socketStore.incommingStream ? "#5f5e5e" : "primary" }}
                variant="contained"
                color="primary"
                endIcon={<CloudDownload />}
                onClick={socketStore.incommingStream
                  ? socketStore.stopListening
                  : socketStore.listenStream}
                disabled={!socketStore.streamId}
              >
                {socketStore.incommingStream ? "Unsubscribe" : "Subscribe"}
              </Button>
            </ColumnController>

            <PlayerComponent source={socketStore.incommingStream} />

            <ColumnInfo>
              <Typography variant="h6">Subscribe to the stream you&apos;ve just published via HLS</Typography>
              <Typography variant="body2">You will be able to subscribe as soon as you publish your stream</Typography>
            </ColumnInfo>

            <ColumnController>
              <Button
                style={{ backgroundColor: socketStore.hlsUrl ? "#5f5e5e" : "primary" }}
                variant="contained"
                color="primary"
                onClick={socketStore.mixerStart}
                disabled={!socketStore.streamId || !!socketStore.hlsUrl}
                endIcon={<CloudDownload />}
              >
                {socketStore.hlsUrl ? "Subscribed" : "Subscribe"}
              </Button>
            </ColumnController>

            <HLSPlayerVideoJSComponent
              url={socketStore.hlsUrl}
              available={socketStore.hlsAvailable}
            />

          </ContentColumn>
        </Content>

      </AppWrapper>
    </AlertComponent>
  );
});
