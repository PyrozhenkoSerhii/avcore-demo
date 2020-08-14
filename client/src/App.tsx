import * as React from "react";
import { observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { Typography } from "@material-ui/core";
import { CloudDownload, CloudUpload } from "@material-ui/icons";

import { socketService } from "./services/socket";
import { AlertComponent } from "./components/Alert";
import { HLSPlayerVideoJSComponent } from "./components/HLSPlayerVideoJS";
import { PlayerComponent } from "./components/Player";

import {
  AppWrapper, Header, Content, ContentColumn, ColumnInfo,
  ColumnController, InfoHeader, InfoContent, ButtonWithStyles,
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
              <InfoHeader>Publish your stream to the AVCore server</InfoHeader>
            </ColumnInfo>

            <ColumnController>
              <ButtonWithStyles
                dynamicColor={socketStore.streamId ? "#5f5e5e" : "primary"}
                variant="contained"
                color="primary"
                endIcon={<CloudUpload />}
                disabled={socketStore.publishDisabled}
                onClick={socketStore.streamId
                  ? socketStore.stopPublishing
                  : socketStore.publishStream}
              >
                {socketStore.streamId ? "Stop" : "Publish"}
              </ButtonWithStyles>
            </ColumnController>

            <PlayerComponent
              source={socketStore.mediaStream}
              self
            />
          </ContentColumn>

          <ContentColumn>
            <ColumnInfo>
              <InfoHeader>Subscribe to the stream you&apos;ve just published via WebRTC</InfoHeader>
              {!socketStore.streamId && (
                <InfoContent>
                  You will be able to subscribe as soon as you publish your stream
                </InfoContent>
              )}
            </ColumnInfo>

            <ColumnController>
              <ButtonWithStyles
                dynamicColor={socketStore.incommingStream ? "#5f5e5e" : "primary"}
                variant="contained"
                color="primary"
                endIcon={<CloudDownload />}
                onClick={socketStore.incommingStream
                  ? socketStore.stopListeningWebRTC
                  : socketStore.listenStreamWebRTC}
                disabled={socketStore.listenRTCDisabled}
              >
                {socketStore.incommingStream ? "Unsubscribe" : "Subscribe"}
              </ButtonWithStyles>
            </ColumnController>

            <PlayerComponent
              source={socketStore.incommingStream}
              playback={socketStore.playback}
            />

            <ColumnInfo>
              <InfoHeader>Subscribe to the stream you&apos;ve just published via HLS</InfoHeader>
              {!socketStore.streamId && (
                <InfoContent>
                  You will be able to subscribe as soon as you publish your stream
                </InfoContent>
              )}
            </ColumnInfo>

            <ColumnController>
              <ButtonWithStyles
                dynamicColor={socketStore.hlsUrl ? "#5f5e5e" : "primary"}
                variant="contained"
                color="primary"
                endIcon={<CloudDownload />}
                onClick={socketStore.hlsUrl
                  ? socketStore.stopListeningHLS
                  : socketStore.listenStreamHLS}
                disabled={socketStore.listenHLSDisabled}
              >
                {socketStore.hlsUrl ? "Unsubscribe" : "Subscribe"}
              </ButtonWithStyles>
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
