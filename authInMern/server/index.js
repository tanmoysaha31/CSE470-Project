require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { copyFileSync } = require("fs");


//middleware
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`)); 
