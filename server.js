const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync("./proto/bookStore.proto", {});
const fs = require("fs");

const bookStorePackage =
  grpc.loadPackageDefinition(packageDefinition).bookStorePackage;

// Create a server
const server = new grpc.Server();

// Add the service
server.addService(bookStorePackage.Book.service, {
  createBook: createBook,
  readBook: readBook,
  readBooks: readBooks,
});

let credentials = grpc.ServerCredentials.createSsl(
  fs.readFileSync("./certs/ca.crt"),
  [
    {
      cert_chain: fs.readFileSync("./certs/server.crt"),
      private_key: fs.readFileSync("./certs/server.key"),
    },
  ],
  true
);

server.bindAsync("0.0.0.0:50051", credentials, () => {
  console.log("Server running at http://0.0.0.0:50051");
  server.start();
});

// Uhm, this is going to mirror our database, but we can change it to use an actual database.
const books = [];

function createBook(call, callback) {
  console.log(call.request);
  const book = call.request;
  const bookObject = {
    id: books.length + 1,
    ...book,
  };
  books.push(bookObject);
  callback(null, bookObject);
}

function readBook(call, callback) {
  console.log(call.request);
  const id = call.request.id;
  const book = books.find((book) => book.id === id);
  callback(null, book);
}

function readBooks(call, callback) {
  console.log(call.request);
  callback(null, { books: books });
}
