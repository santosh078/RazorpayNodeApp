const express = require("express");
var cors = require('cors');
const app = express();
var bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// middlewares
// for parsing application/json
app.use(bodyParser.json()); 
app.use(express.json({ extended: false }));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname+'/public'));
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 

//form-urlencoded
// route included
// app.use(require("./routes/payment"));
app.use(require("./routes/payment"));

app.listen(port, () => console.log(`server started on port ${port}`));