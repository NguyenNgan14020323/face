var express 	= require('express');
var app 		= express();
var path 		= require('path');
var mongoose 	= require('mongoose');
var bodyParser 	= require('body-parser');
var session 	= require('express-session');
var morgan 		= require('morgan'); 
var cookieParser = require('cookie-parser');
var cloudinary = require('cloudinary')



var server = require('http').createServer(app);

var config = require('./models/database');
config.setConfig();
mongoose.connect(process.env.MONGOOSE_CONNECT);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
//config cloudary
cloudinary.config({ 
  cloud_name: 'uet', 
  api_key: '992147968271347', 
  api_secret: 'M9TfXOrwtKx0SklY5wOrxPJv-MU' 
});

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge:180*60*1000}
}))
app.use(function(req,res,next){
	res.locals.session = req.session;
	next();
});
app.use(cookieParser());

//Controller
var index = require('./controllers/index')

app.use('/', index);

var port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log("server is runing on localhost:3000");
});

