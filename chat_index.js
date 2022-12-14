const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync("./proto/chat.proto", {});
const chatPackage = grpc.loadPackageDefinition(packageDefinition).chatPackage;

// Create a server
const server = new grpc.Server();

const callObjByUsername = new Map();

const Chat = (call) => {
  call.on("data", (req) => {
    const username = call.metadata.get("username")[0];
    const msg = req.message;
    console.log(username, req.message);

    for (let [user, usersCall] of callObjByUsername) {
      if (username !== user) {
        usersCall.write({
          username: username,
          message: msg,
        });
      }
    }

    if (callObjByUsername.get(username) === undefined) {
      callObjByUsername.set(username, call);
    }
  });

  call.on("end", () => {
    const username = call.metadata.get("username")[0];
    callObjByUsername.delete(username);
    for (let [user, usersCall] of callObjByUsername) {
      usersCall.write({
        username: username,
        message: "Has Left the Chat!",
      });
    }
    console.log(`${username} is ending their chat session`);

    call.write({
      username: "Server",
      message: `See you later ${username}`,
    });

    call.end();
  });
};

// Add the service
server.addService(chatPackage.Chat.service, {
  chat: Chat,
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Server running at http://0.0.0.0:50051");
    server.start();
  }
); // our sever is insecure, no ssl configuration
