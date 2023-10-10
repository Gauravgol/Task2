var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb+srv://Gaurav:SIw1X0RdfhZAhZS9@cluster0.epwf7bv.mongodb.net/mydb?retryWrites=true&w=majority&appName=AtlasApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));

app.post("/sign_up", (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var mobileNumber = req.body.mobileNumber;
    var emailId = req.body.emailId;
    var street = req.body.street;
    var city = req.body.city;
    var state = req.body.state;
    var country = req.body.country;
    var loginId = req.body.loginId;
    var password = req.body.password;
    var timeStamp = new Date;

    var data = {
        "firstName": firstName,
        "lastName": lastName,
        "mobileNumber": mobileNumber,
        "emailId": emailId,
        "street": street,
        "city": city,
        "state": state,
        "country": country,
        "loginId": loginId,
        "password": password,
        "timeStamp": timeStamp
    }

    db.collection('users').insertOne(data, { timeout: 5000 }, (err, collection) => {
        if (err) {
            throw err;
        }
        console.log("Record Inserted Successfully");
    });

    // Emit user data to the 'join' event
    io.sockets.emit('join', {
        emailId,
        firstName,
        socketId: req.body.socketId
    });

    return res.redirect('display.html');
});

// Serve socket.io events
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for disconnect event
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    return res.redirect('index.html');
}).listen(3000);

console.log("Listening on PORT 3000");
