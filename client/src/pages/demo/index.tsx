import * as React from "react";
import { observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import { CloudDownload, CloudUpload } from "@material-ui/icons";

import { socketService } from "../../services/socket";
import { HLSPlayerVideoJSComponent } from "../../components/HLSPlayerVideoJS";
import { PlayerComponent } from "../../components/Player";

import {
  Content, ContentColumn, ColumnInfo,
  ColumnController, InfoHeader, InfoContent, ButtonWithStyles,
} from "../../components/styled";

const { useContext, useEffect } = React;

export const DemoPage = observer(():JSX.Element => {
  const socketStore = useContext(socketService);

  useEffect(() => {
    socketStore.init();

    return () => socketStore.close();
  }, []);

  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const serverUrl = params.get("server");

  useEffect(() => {
    if (serverUrl) {
      socketStore.changeServer(serverUrl);
    }
  }, [serverUrl]);

  return (
    <Content>
      <ContentColumn>
        <ColumnInfo>
          <InfoHeader>Publish your stream to the MeshStream server</InfoHeader>
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
  );
});
