import * as React from "react";
import { observer } from "mobx-react";

import { Button, Typography } from "@material-ui/core";
import { CloudDownload, CloudUpload } from "@material-ui/icons";

import { socketService } from "./services/socket";
import { AlertComponent } from "./components/Alert";
import { HLSPlayerComponent } from "./components/HLSPlayer";
import { PlayerComponent } from "./components/Player";

import {
  AppWrapper, Header, Content, ContentColumn, ColumnInfo, ColumnController,
} from "./components/styled";

const { useContext } = React;

export const App = observer(():JSX.Element => {
  const socketStore = useContext(socketService);

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

            <PlayerComponent source={socketStore.mediaStream} />
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

            <PlayerComponent source={socketStore.incommingStream} />

            <ColumnInfo>
              <Typography variant="h6">HLS stream</Typography>
            </ColumnInfo>

            <ColumnController>
              <Button
                variant="contained"
                color="primary"
                onClick={socketStore.mixerStart}
              >
                Start mixers
              </Button>
            </ColumnController>

            <HLSPlayerComponent url={socketStore.hlsUrl} />

          </ContentColumn>
        </Content>

      </AppWrapper>
    </AlertComponent>
  );
});
