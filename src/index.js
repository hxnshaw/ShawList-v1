const express = require("express");
require("./db/mongoose");

//Routers
const userRouter = require("./routers/user");
const productRouter = require("./routers/product");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(productRouter);

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
