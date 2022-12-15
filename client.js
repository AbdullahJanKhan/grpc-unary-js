const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync("./proto/bookStore.proto", {});
const fs = require("fs");

const bookStorePackage =
  grpc.loadPackageDefinition(packageDefinition).bookStorePackage;

const credentials = grpc.credentials.createSsl(
  fs.readFileSync("./certs/ca.crt"),
  fs.readFileSync("./certs/client.key"),
  fs.readFileSync("./certs/client.crt")
);

const client = new bookStorePackage.Book("localhost:50051", credentials);

client.createBook(
  {
    author: "est qui aliqua consequat",
    description: "sit",
    name: "eiusmod laboris Lorem sint",
  },
  (err, response) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`From server`, JSON.stringify(response));
    }
  }
);

client.readBook({ id: 1 }, (err, response) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`From server`, JSON.stringify(response));
  }
});

client.readBooks(null, (err, response) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`From server`, JSON.stringify(response));
  }
});
