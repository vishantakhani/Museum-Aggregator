const express=require('express');
const morgan=require('morgan');

// const ProductRoutes = require('./api/routes/products');
// const OrderRoutes = require('./api/routes/orders');
// const UserRoutes = require('./api/routes/users');
const MuseumRoutes = require('./api/routes/museumroute');
const BodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Museum');
const db=mongoose.collection;
const app=express();
mongoose.Promise = global.Promise;	
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(BodyParser.urlencoded({extended : false}));
app.use(BodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS,PATCH');
  next();
});
//routes which should handle request
	
	app.use('/museum',MuseumRoutes);
	app.use((req,res,next)=>{
			const error = new Error('Not Found');
			error.status = 404 ;
			next(error);

	});

app.use('/',(error , req,res,next)=>{
			res.status(error.status || 500 );
			res.json({
				error:{
					message : error.message
				}
			});
	});


	module.exports=app;
