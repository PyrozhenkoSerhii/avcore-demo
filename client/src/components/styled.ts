import styled from "styled-components";

export const AppWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #191B1C;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
`;

export const Header = styled.div`
  width: 100%;
  height: 8%;
  background: #262A2B;
  padding: 20px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Content = styled.div`
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: row;
`;

export const ContentColumn = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`;

export const ColumnInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  color: #dbdee4;
  padding: 15px;
`;

export const ColumnController = styled.div`
  padding: 10px;
`;

export const Video = styled.video`
  width: 640px;
  height: 480px;
  border: 1px solid #262A2B;
  margin-top: 10px;
`;
