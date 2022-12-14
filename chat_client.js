const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const readline = require("readline");

const packageDefinition = protoLoader.loadSync("./proto/chat.proto", {});
const chatPackage = grpc.loadPackageDefinition(packageDefinition).chatPackage;

// Create a server
const client = new chatPackage.Chat(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);
client.waitForReady(deadline, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  onClientReady();
});

const onClientReady = () => {
  // readline package to work with input / output
  const io = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const username = process.argv[2];
  if (!username) console.error("No username, can't join chat"), process.exit();

  const metadata = new grpc.Metadata();
  metadata.set("username", username);
  const call = client.Chat(metadata);

  call.write({
    message: "register",
  });

  call.on("data", (chunk) => {
    console.log(`${chunk.username} ==> ${chunk.message}`);
  });

  rl.on("line", (line) => {
    if (line === "quit") {
      call.end();
    } else {
      call.write({
        message: line,
      });
    }
  });
};
