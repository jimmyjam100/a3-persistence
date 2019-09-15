const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library used in the following line of code
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const app = express();

//const bodyParser = require('body-parser');
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
passport.CreateSession =  function (req, res, next) {
  passport.authenticate('local', function(err, user, info){
    if(err || !user)
      return res.json({status: "Failure: "+err});
    req.logIn(user, function (err){
      if(err)
        return res.json({status: "Failure: "+err});
      return res.json({status: "Authenticated"});
    });
  })(req, res, next);
};

let Users = [{username: "test", password:"test2", id: 1} ];
passport.serializeUser(function (user, done) {

  done(null, user.id);
    console.log("user Serialized")
});

passport.deserializeUser(function(id, cb) {
  console.log("user Deserialized")
  let user = Users.find(function(element){return element.id == id});
  cb(null, user);
  /*Users.findById(id, function(err, user) {
    cb(err, user);
    console.log("user Deserialized")
  });*/
});
passport.use(new LocalStrategy(
  function(username, password, done) {
    let user = Users.find(function(element) {
  return element.username == username && element.password == password;
});
    if (!user){
      return done(null, false, {message: "username or password not found"});
    }
    return done(null, user);
  }
));

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/error'}),
  function(req, res) {
    console.log('POST /login');
    console.log('req.session', req.session);
    console.log('req.user', req.user);
    // res.cookie('sessionKey', req.session);
    res.redirect('/'); 
//    sessionStorage.setItem('user', req.session.user);
    //req.session.save()
    //sendFile( res, 'public/index.html' )
  });

app.get('/error', function(req, res){
  console.log('GET /error');
  res.send("username or password was incorrect")
})

app.get('/index.html', passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
  sendFile( res, 'public/index.html' )
    return
  });
app.get('/', require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
  console.log('GET /');
  console.log('req.user', req.user);
  sendFile( res, 'public/index.html' )
    return
  });
app.get('/login', function (req, res) {
  console.log('GET /login');
  sendFile(res, 'public/login.html')
});
app.get('/getAll.json', function(req, res){
  getData(req, res);
})
app.post('/submit', function(req, res){
  console.log(req.user)
  handlePost(req, res)
})
app.post('/edit', function(req, res){
  handleEdit(req, res)
})
app.post('/deleteALL', function(req, res){
  handleDeleteAll(req, res)
})
app.post('/deleteEntry', function(req, res){
  handleDelete(req, res)
})

const handleDeleteAll = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    console.log( JSON.parse( dataString ) )

    fs.readFile( "public/data.json", function( err, content ) {


     // if the error = null, then we've loaded the file successfully
     if( err === null ) {       
       const fs = require('fs') 
       fs.writeFile('public/data.json', "[]", (err) => { 
         if (err) throw err; 
       }) 
       
      
       
       response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
       response.end()

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })

    
  })
}
const handleDelete = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    console.log( JSON.parse( dataString ) )

    fs.readFile( "public/data.json", function( err, content ) {


     // if the error = null, then we've loaded the file successfully
     if( err === null ) {
       let index = JSON.parse(dataString).delete;
       console.log(dataString);
       let data = JSON.parse(content);
       data.splice(index, 1);
       

       
       
       const fs = require('fs') 
       fs.writeFile('public/data.json', JSON.stringify(data), (err) => { 
         if (err) throw err; 
       }) 
       
      
       
       response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
       response.end()

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })

    
  })
}

const handleEdit = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    console.log( JSON.parse( dataString ) )

    fs.readFile( "public/data.json", function( err, content ) {


     // if the error = null, then we've loaded the file successfully
     if( err === null ) {
       let age = calculateAge(new Date(JSON.parse(dataString).date));
       let newData = JSON.parse(dataString);
       newData.age = age;
       let newerData = {name: newData.name, date: newData.date, food: newData.food, age : newData.age};
       let data = JSON.parse(content);
       console.log(JSON.stringify(data));
       data[newData.index] = newerData;
       console.log(JSON.stringify(data));
       

       
       
       const fs = require('fs') 
       fs.writeFile('public/data.json', JSON.stringify(data), (err) => { 
         if (err) throw err; 
       }) 
       
      
       
       response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
       response.end()

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })

    
  })
}

const handlePost = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    console.log( JSON.parse( dataString ) )

    fs.readFile( "public/data.json", function( err, content ) {


     // if the error = null, then we've loaded the file successfully
     if( err === null ) {
       let age = calculateAge(new Date(JSON.parse(dataString).date));
       let newData = JSON.parse(dataString);
       newData.age = age;
       let data = JSON.parse(content);
       console.log(JSON.stringify(data));
       data.push(newData);
       console.log(JSON.stringify(data));
       

       
       
       const fs = require('fs') 
       fs.writeFile('public/data.json', JSON.stringify(data), (err) => { 
         if (err) throw err; 
       }) 
       
      
       
       response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
       response.end()

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })

    
  })
}
 function calculateAge(birthday) {
   var ageDifMs = Date.now() - birthday.getTime();
   var ageDate = new Date(ageDifMs); 
   return ageDate.getUTCFullYear() - 1970;
 }

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

const getData = function ( request, response ) {
   const type = mime.getType( "public/data.json" ) 

   fs.readFile( "public/data.json", function( err, content ) {
     let i = 0;


     // if the error = null, then we've loaded the file successfully
     if( err === null ) {
       let res = "<p>hello "+ (request.user && request.user.username ? request.user.username : "undefined") +"</p><table class='pure-table' id='table'><tr><th>name</th><th>birthday</th><th>favorite food</th><th>age</th><th>delete entry</th><th>edit</th></tr>";
       const data = JSON.parse(content);
      data.forEach(function(d) {
        res += "<tr><td class= 'name'>" + d.name + "</td><td class = 'date'>" + d.date + "</td><td class = 'food'>" + d.food + "</td><td class = 'age'>" + d.age + "</td> <td> <button  onclick='del(" + i + ")''>delete</button></td> <td> <button  onclick='edit(" + i + ")''>edit</button></td></tr>";
        i++;
      });
       res += "</table>";

       // status code: https://httpstatuses.com
       response.writeHead(200, {"Content-Type": "text/html"});
       response.end( res )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}


//server.listen( process.env.PORT || port )


app.listen(3000, function () {
  console.log('Ready')
})