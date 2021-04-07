var express = require("express");
var mysql = require('mysql');
var bodyParser = require("body-parser");
var flash = require("express-flash");
var session = require('express-session');
//Configure mysql connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "Group4_Assignment3",
    port: 3306
});

//Test connection
con.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected!");
});

// configure the port
var port = 8000

var app = express();
app.use(express.static("assets"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'crmorytp8vyp98p%&ADIB66^^&fjdfdfaklfdhf',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}));
app.use(flash());
// set up our templating engine

app.set("view_engine", "ejs");
app.set("views", "templates");

app.listen(port);
console.log("Server running on http://localhost:" + port); //this will display xxx


app.get("/", function (request, response) {
    con.query("SELECT * FROM events;", function (err, result,fields){
        if(err) throw err;
        response.render("index.ejs", {
            "events": result,
            "sessionUsername": request.session.username
        });
    });

});

app.get("/coffee", function (request, response) {
    response.render("coffee.ejs",{"sessionUsername":request.session.username});

});

app.get("/profile", function (request, response) {
    response.render("profile.ejs", {"sessionUsername": request.session.username});

});

app.get("/gym", function (request, response) {
    response.render("gym.ejs",{"sessionUsername":request.session.username});

});

app.get("/events", function (request, response) {
    con.query("SELECT * FROM events;", function (err, result,fields){
        if(err) throw err;
        response.render("events.ejs", {
            "date": date,
            "events": result,
            "sessionUsername": request.session.username
        });
    });
});

app.get("/contact", function (request, response) {
    response.render("contact.ejs",{"sessionUsername": request.session.username});
});

app.get("/login", function(request, response){
    response.render("login.ejs",{
        "sessionUsername": request.session.username,
    });
});

app.post("/signup", function (request, response) {

    //Retrieve data from signup form
    var username = request.body.username;
    var email = request.body.email;
    var password = request.body.password;
    var sessionUsername = null;	//Assign cookie data to new variable

    //Check whether the user already exists
    checkSignup(username, function (result) {
        if (result == false) {
            con.query("INSERT INTO users (username, password, email) VALUES ('" + username + "','" + password + "','" + email + "')", function (err, result, fields) {
                if (err)
                    throw err;
            });
            response.redirect('/');
        } else {
            request.flash('errorSignup','Username already exisit');
            response.redirect('/login');

        }
    });

});

app.post("/login", function (request, response) {

    //Retrieve data from signup form
    var username = request.body.username;
    var password = request.body.password;

    var err_message='';
    //Check whether the user already exists
    checkLogin(username, password, function (result) {
        if (result == false) {
            //Create session data
            request.session.username=username;	//Assign cookie data to new variable
            var sessionUsername=request.session.username;
            response.render("profile.ejs", {
                "username": username,
                "sessionUsername": sessionUsername
            });
        } else {
           request.flash('errorLogin','Please enter valid information');
           response.redirect('/login');
        }
    });

});

app.get("/logout", function(request, response){
	request.session.destroy(); //End the current session.
	response.redirect("/");	//Redirect to home page
});



const date = {
    day: "Today",
    date: "May 2nd 2021"
};


//This function will check to ensure of a valid signup
function checkSignup(user, callback) {

    //Get data from users table
    con.query("SELECT * FROM users where username = '" + user + "';", function (err, result, fields) {
        if (err)
            throw err;
        //If a match is found, return true
        if (result[0] != null) {
            return callback(true);
        } else {
            if (user.length > 0) {
                return callback(false);
            } else {
                return callback(true);
            }
        }
    });
}

function checkLogin(user, pass, callback) {
    //Get data from users table
    con.query("SELECT * FROM users where username = '" + user + "';", function (err, result, fields) {
        if (err)
            throw err;
        //If a match is found, return true
        if (result[0] == null) {
            return callback(true);
        } else {

            if (result[0].username == user && result[0].password == pass) {     //User found
                return callback(false);
            } else {
                return callback(true);
            }
        }
    });
}
