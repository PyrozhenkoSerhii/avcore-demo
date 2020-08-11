import * as React from "react";
import { observer } from "mobx-react";

import { Button, Typography } from "@material-ui/core";
import { CloudDownload, CloudUpload } from "@material-ui/icons";

import { socketService } from "./services/socket";
import { AlertComponent } from "./components/Alert";

import {
  AppWrapper, Header, Content, ContentColumn, ColumnInfo, ColumnController, Video,
} from "./components/styled";

const { useContext, useEffect, useRef } = React;

export const App = observer(():JSX.Element => {
  const socketStore = useContext(socketService);

  const selfVideoPlayer = useRef<HTMLVideoElement>(null);
  const incommingVideoPlayer = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (incommingVideoPlayer.current && socketStore.incommingStream) {
      incommingVideoPlayer.current.srcObject = socketStore.incommingStream;
      incommingVideoPlayer.current.play();
    }
  }, [socketStore.incommingStream]);

  useEffect(() => {
    if (selfVideoPlayer.current && socketStore.mediaStream) {
      selfVideoPlayer.current.srcObject = socketStore.mediaStream;
      selfVideoPlayer.current.play();
    }
  }, [socketStore.mediaStream]);

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
                style={{ backgroundColor: socketStore.streamId ? "green" : "primary" }}
                variant="contained"
                color="primary"
                endIcon={<CloudUpload />}
                onClick={socketStore.publishStream}
              >
                {socketStore.streamId ? "Published" : "Publish"}
              </Button>
            </ColumnController>

            <Video ref={selfVideoPlayer} />
          </ContentColumn>

          <ContentColumn>
            <ColumnInfo>
              <Typography variant="h6">Subscribe to the stream you&apos;ve just published</Typography>
            </ColumnInfo>

            <ColumnController>
              <Button
                style={{ backgroundColor: socketStore.incommingStream ? "green" : "primary" }}
                variant="contained"
                color="primary"
                endIcon={<CloudDownload />}
                onClick={socketStore.listenStream}
                disabled={!socketStore.streamId}
              >
                {socketStore.incommingStream ? "Subscribed" : "Subscribe"}
              </Button>
            </ColumnController>

            <Video ref={incommingVideoPlayer} />
          </ContentColumn>
        </Content>

      </AppWrapper>
    </AlertComponent>
  );
});
