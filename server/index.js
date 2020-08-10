"use strict";
exports.__esModule = true;
/* eslint-disable @typescript-eslint/no-var-requires */
var http_1 = require("http");
var path_1 = require("path");
var express_1 = require("express");
var jsonwebtoken_1 = require("jsonwebtoken");
var token_1 = require("./utils/token");
var app = express_1["default"]();
var PORT = process.env.PORT;
var SECRET = process.env.SECRET;
app.use(express_1["default"].static(path_1["default"].join(__dirname, "../client/dist")));
var httpServer = http_1.createServer(app);
httpServer.listen(PORT, function () {
    console.log("Server is listening on port " + PORT);
});
var io = require("socket.io")(httpServer);
io.on("connection", function (socket) {
    console.log("a user connected");
    socket.on("auth", function (_a, callback) {
        var stream = _a.stream, operation = _a.operation;
        var token = jsonwebtoken_1["default"].sign({ stream: stream, operation: operation }, SECRET, { expiresIn: token_1.getExpiration(), algorithm: "HS512" });
        console.log("token created");
        callback({ token: token });
    });
});
