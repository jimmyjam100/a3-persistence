const http = require( 'http' ),
      fs   = require( 'fs' ),
      mime = require( 'mime' ),
      dir  = 'public/',
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      express = require('express'),
      app = express(),
      responseTime = require('response-time')

app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(require('express-uncapitalize')());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {

  done(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  fs.readFile( "public/loginDetails.json", function( err, content ) {
     if( err === null ) {
       let Users = JSON.parse(content);
         let user = Users.find(function(element){return element.id == id});
         cb(null, user);
     }
  })
});
passport.use(new LocalStrategy(
  function(username, password, done) {
    fs.readFile( "public/loginDetails.json", function( err, content ) {
     if( err === null ) {
       let data = JSON.parse(content);
       let user= data.find(function(element) {
         return element.username == username;
       });
       if (!user){
         let randID = Math.floor((Math.random() * 999) + 1);
         while(data.find(function(element) {
           return element.id == randID;
         })){
           randID = Math.floor((Math.random() * 999) + 1);
         }
         let user = {username: username, password: password, id: randID}
         data.push(user);
         fs.writeFile('public/loginDetails.json', JSON.stringify(data), (err) => { 
           if (err) throw err; 
         })
         return done(null, user);
         
       }
       else{
         if(user.password == password){
           return done(null, user);
         }
         else{
          return done(null, false, {message: "username or password not found"});
         }
       }

     }
   })
  }
));

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/error'}),
  function(req, res) {
    res.redirect('/'); 
  });

app.get('/error', function(req, res){
  res.send("username or password was incorrect")
})

app.get('/', require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
  sendFile( res, 'public/index.html' )
    return
  });
app.get('/login', function (req, res) {
  sendFile(res, 'public/login.html')
});
app.get('/getfoods', function(req, res){
  getFood(req, res);
})
app.post('/submit', function(req, res){
  console.log("hello")
  handlePost(req, res)
})
app.post('/edit', function(req, res){
  handleEdit(req, res)
})
app.post('/deleteall', function(req, res){
  handleDeleteAll(req, res)
})
app.post('/deletefood', function(req, res){
  handleDelete(req, res)
})

const handleDeleteAll = function( request, response ) {
  let dataString = ''
  request.on( 'data', function( data ) {
      dataString += data 
  })
  request.on( 'end', function() {
    fs.readFile( "public/data.json", function( err, content ) {
     if( err === null ) {
       let data = JSON.parse(content);
       console.log(content);
       data[request.user.username] = [];
       const fs = require('fs') 
       fs.writeFile('public/data.json', JSON.stringify(data), (err) => { 
         if (err) throw err; 
       }) 
       response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
       response.end()
     }else{
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
    fs.readFile( "public/data.json", function( err, content ) {
     if( err === null ) {
       let index = JSON.parse(dataString).delete;
       let data = JSON.parse(content);
       data[request.user.username].splice(index, 1);
       const fs = require('fs') 
       console.log("Wow you called delete");
       fs.writeFile('public/data.json', JSON.stringify(data), (err) => { 
         if (err) throw err; 
       }) 
       response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
       response.end()
     }else{
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

    fs.readFile( "public/data.json", function( err, content ) {
     if( err === null ) {
       let newData = JSON.parse(dataString);
       newData.CalPerWeek = newData.ammount*newData.cal
       let newerData = {food: newData.food, ammount: newData.ammount, cal: newData.cal, CalPerWeek : newData.CalPerWeek, bad: newData.bad};
       let data = JSON.parse(content);
       data[request.user.username][newData.index] = newerData;
       const fs = require('fs') 
       fs.writeFile('public/data.json', JSON.stringify(data), (err) => { 
         if (err) throw err; 
       }) 
       response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
       response.end()

     }else{
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
    fs.readFile( "public/data.json", function( err, content ) {
     if( err === null ) {
       let newData = JSON.parse(dataString);
       newData.CalPerWeek = newData.ammount*newData.cal
       let data = JSON.parse(content);
       data[request.user.username].push(newData);
       const fs = require('fs') 
       fs.writeFile('public/data.json', JSON.stringify(data), (err) => { 
         if (err) throw err; 
       }) 
       response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
       response.end()
     }else{
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })

    
  })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 
   fs.readFile( filename, function( err, content ) {
     if( err === null ) {
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )
     }
   })
}

const getFood = function ( request, response ) {
   const type = mime.getType( "public/data.json" ) 
   console.log("hello");

   fs.readFile( "public/data.json", function( err, content ) {
     let i = 0;
     if( err === null ) {
       let res = "<center><p>hello "+ (request.user && request.user.username ? request.user.username : "undefined") +"</p>";
       const data = JSON.parse(content);
       if (!data.hasOwnProperty(request.user.username)){
         data[request.user.username] = [];
         res += "<p>This is the first time you are using this account so a new table has been created :)</p>"
         const fs = require('fs') 
       fs.writeFile('public/data.json', JSON.stringify(data), (err) => { 
         if (err) throw err; 
       }) 
       }
       console.log(data);
       
       res += "<table class='pure-table' id='table'><tr><th>Food</th><th>Calories</th><th>Amout Eaten Per Week</th><th>Calories Per Week</th><th>Is Bad For You</th><th>Delete Food</th><th>Edit Food</th></tr>";
       let userData = data[request.user.username];
       userData.forEach(function(d) {
        res += "<tr><td>" + d.food + "</td><td>" + d.cal + "</td><td>" + d.ammount + "</td><td>" + d.CalPerWeek + "</td><td>" + d.bad + "</td><td><button class='pure-button' onclick='del(" + i + ")''>Delete Food</button></td><td><button class='pure-button' onclick='editFood(" + i + ")''>Edit Food</button></td></tr>";
        i++;
      });
       res += "</table></center>";

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

app.listen(3000, function () {
  console.log('Ready')
})