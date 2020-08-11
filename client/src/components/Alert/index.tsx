import * as React from "react";
import { Alert } from "@material-ui/lab";

import { AlertWrapper } from "./styles";

type TProps = {
  type: "error" | "warning" | "info" | "success",
  message: string,
  children: React.ReactNode,
}

export const AlertComponent = ({ type, message, children }: TProps): JSX.Element => (
  <AlertWrapper>
    {message && <Alert severity={type}>{message}</Alert>}
    {children}
  </AlertWrapper>
);
