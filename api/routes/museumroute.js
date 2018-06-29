const express = require('express');

const router=express.Router();

const mongoose = require('mongoose');

const Museum = require('../models/museum');

const checkAuth = require('../middlewere/check-auth');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const storagePath = "D:/Museum Aggregators/Museumimages";


const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
const Transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
  host: 'smtp.gmail.com',
        auth: {
            user:process.env.user,
            pass:process.env.pass
    }
}));
var rand,mailOptions,host,link;
//////demo
// var uuid = require('uuid'); // https://github.com/defunctzombie/node-uuid
// var multiparty = require('multiparty'); // https://github.com/andrewrk/node-multiparty
// var s3 = require('s3'); // https://github.com/andrewrk/node-s3-client
// var s3Client = s3.createClient({
//     key: '<your_key>',
//     secret: '<your_secret>',
//     bucket: '<your_bucket>'
//   });
 



//////////////dem
// const SendOtp = require('sendotp');
const multer = require('multer');
const storage = multer.diskStorage({
    destination : function(req , file ,cb ){
     cb(null,storagePath);
    },
    filename : function(req , file , cb ){
    cb(null,file.originalname);
    }
    });

        
    const fileFilter =(req,file,cb) =>{
        //reject file
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image.jpg' || file.mimetype === 'image/png')
        {
            cb(null,true);
        }
        else{
        cb(new Error('File is not mime type'));	
        }
        
        
        };
    const upload = multer(
        { 
            storage:storage , 
            limits:{
                        fileSize:1024 * 1024 * 5
                    },
            fileFilter : fileFilter

    });


    const fs=require('fs');

    router.post('/image',upload.any(), function(req, res,next) {
        if(req.files){
           console.log("File Found"); 
           console.log(req.files[0].path);  
            return res.status(200).json({
                            path:req.files[0].path
                        }); 
                    }
                    else{
                        console.log("File Not Found");
                        return res.status(404).json({
                                message:"File Not Found"
                        });
                    }
                
                });

  


    router.patch("/updateImage/:userId",(req,res,next)=>{
        Museum.update({_id:req.params.userId},{
            "images":req.body.images
        })
        .exec()
        .then(data =>{
            return res.status(200).json({
                message:"Data Updated"
            });
        })
        .catch(err=>{
            return res.status(404).json({
                message:err
            });
        });
    });

    router.patch("/updateMuseumDetail/:userId",(req,res,next)=>{

        Museum.update({_id:req.params.userId},{
            "name":req.body.name,
            "mname":req.body.mname,
            "cno":req.body.cno,
            "website":req.body.website,
            "address":req.body.address,
            "pincode":req.body.pincode,
            "city":req.body.city,
            "lat":req.body.lat,
            "lng":req.body.lng,
            "facebook":req.body.facebook,
            "twitter":req.body.twitter,
            "youtube":req.body.youtube,
            "insta":req.body.insta,
            "timming":req.body.timming
        })
        .exec()
        .then(result=>{
            return res.status(200).json({
                message:"Data Updated"
            });
        })
        .catch(err =>{
            return res.status(404).json({
                    message:err
            });
        });

    });

    router.patch("/deleteImage/:userId",(req,res,next)=>{
        Museum.update({_id:req.params.userId},{"images":req.body.images})
        .exec()
        .then(result=>{
            return res.status(200).json({
                message:"Successful"
            });
        })
        .catch(err=>{
            return res.status(404).json({
                error:err
            });
        });
    });

    router.patch("/forgotPassword",(req,res,next)=>
    {
        Museum.find({email:req.body.email})
        .exec()
        .then(docs=>{
            if(docs.length < 1)
            {
                return res.status(404).json({
                    message:"User Does Not Exist"
                });
            }
            else
            {   
                rand=Math.floor((Math.random() * 1000000) + 1);
                bcrypt.hash(""+rand , 10 , (err , hash) =>
                {
                    if(err)
                    {
                        return res.status(500).json
                        ({
                            message:err
                        });
                    }
                    else
                    {
                        mailOptions=
                        {
                            to : req.body.email,
                            subject : "Forgot Museum Aggregator Password",
                            text : "Hello, New Password is "+rand+".Thank You" 
                        }
                        Transport.sendMail(mailOptions, (error, info) => 
                        {
                            if (error) 
                            {
                                return  res.status(404).json
                                    ({
                                        message:error
                                    });
                            }
                            else
                            {
                                Museum.update({email :req.body.email},{"password": hash})
                                .exec()
                                .then(result =>{
                                    return res.status(200).json({
                                        message:"Password Has been sent to mail"
                                });
                                })
                                .catch(err =>{
                                    return res.status(404).json({
                                        message:err
                                    });
                                });
                            }
                        });
                    }
                });
                            //////////////////
            }
        })
        .catch(err=>{
            return res.status(404).json({
                    message:err
            });
        });
    });

    router.patch("/changePass/:userId",(req,res,next)=>
    {

        Museum.findById(req.params.userId)
        .select('password')
        .exec()
        .then(docs => {
        console.log(docs);
        if(docs)
        {
            bcrypt.compare(req.body.oldPass , docs.password , (err , result)=>
            {
                console.log("bcrypted");
                if(err)
                {
                    return res.status(401).json
                    ({
                        message:err
                    });
                }
                if(result){
                    console.log("successful");
                    bcrypt.hash(req.body.newPass , 10 , (err , hash) =>
                    {
                        if(err)
                        {
                            return res.status(401).json({
                                    message:err
                            });
                        }
                        else{
                            Museum.update({_id :req.params.userId},{"password": hash})
                            .exec()
                            .then(result =>{
                                return res.status(200).json({
                                    message:"Password Changed"
                            });
                            })
                            .catch(err =>{
                                return res.status(404).json({
                                    message:err
                                });
                            });
                            
                        }

                    });
                }else{
                    return res.status(404).json({
                        message :"Wrong Password"
                });
                }
                
            });
        }
        else
        {
            res.status(404).json
            ({
                message :'Invaid id'
            });
        }
    })
    .catch(err => {

        res.status(500).json({error : err});
    });


    });

    router.patch("/imgpath",(req,res,next)=>{
        Museum.update({_id :"5b3378a9b1eb0f0b6897d1aa"},{"logo":"D:/Museum Aggregators/Museumimages/1.jpg" })
        .exec()
        .then(data=>{
            return res.status(200).json({
                message:"Success"
            });
        })
        .catch(err=>{
            return res.status(404).json({
                msg:"Error"
            });
        });

    });


router.patch("/saveHistory/:userId",(req,res,next)=>{
    Museum.update({_id:req.params.userId},{"history":req.body.history})
    .exec()
    .then()
    .catch(err=>{
        return res.status(404).json({
            error:err
        });
    });
});


router.patch("/saveDescription/:userId",(req,res,next)=>{
    Museum.update({_id:req.params.userId},{"description":req.body.description})
    .exec()
    .then()
    .catch(err=>{
        return res.status(404).json({
            error:err
        });
    });
});


    router.post("/login" , (req,res,next)=>{
    Museum.find({email:req.body.email})
    .exec()
    .then(usr =>{
    if(usr.length < 1 ){
        //401 is for unauthorised
       return res.status(401).json({
            message:'401 error'
        });
    } 
    else
    {
    bcrypt.compare(req.body.password , usr[0].password , (err , result)=>{
        if(err){
            return res.status(401).json({
                   message:err
                    });
                }
        if(result){ 
                return res.status(200).json({
                        userId:usr[0]._id,
                        message:"Logged in Successfully"
                        });
            }
                    return res.status(401).json({
                       
                        message:'401 error'
                        });	
                
                });
                
        }
        })
    .catch(err =>{
                     return res.status(500).json({
                          message:err
                      });
         });
    
    });
    
    router.delete("/:userId",(req , res , next) =>{
        User.remove({_id:req.params.userId})
        .exec()
        .then(result =>{
            res.status(200).json({
                message:'success'
            });
        })
         .catch(err =>{
                      console.log(err);
                      res.status(500).json({
                          message:'fail'
                      });
                  });
    });

    // router.post("/varify",(req,res,next)=>{
    //     const sendOtp = new SendOtp('220690AMRBJ7pjequX5b237f4b', 'Otp for Museum Aggregator is {{otp}}, Valid for 10 min  , please do not share it with anybody');
    // sendOtp.setOtpExpiry('10');
    //     sendOtp.send("917600134341", "Museum", function (error, data, response) {
    //         if(error){
    //             return res.status(404).json({
    //             error:error
    //             });
    //         }
    //         else{
    //             console.log(data);
    //             return res.status(200).json({
    //                     data:data
    //             });
    //         }
    //     });
    //     sendOtp.retry("+919265633048", false, function (error, data, response) {
    //         console.log(data);
    //     });
    // });

    router.patch("/addImage/:userId",(req,res,next)=>{
        var obj = new Object({
            path:storagePath+"/"+req.body.path,
            desc:req.body.desc
        });
        console.log(obj);
        console.log(req.body);
        console.log(obj);
        Museum.update({_id:req.params.userId},{ $push : { "images":obj } } )
        .exec()
        .then(result=>{
            return res.status(200).json({
                message:"Uploaded"
            });
        })
        .catch(err=>{
            console.log(err);
            return res.status(404).json({
                error:err
            });
        });
    });

    router.post("/signup",(req,res,next)=>
    {
        console.log("Signup Node called");
        console.log(req.body);
        Museum.find({email : req.body.email })
        .exec()
        .then(usr =>
            {
                if(usr.length > 0 )
                    {
                        console.log("User Exists");
                        return res.status(409).json
                        ({
        		            message:'User Already Exist'
	                    });
                    }
                else
                    {
                        rand=Math.floor((Math.random() * 1000000) + 1);
                        console.log(rand);
                        bcrypt.hash(""+rand , 10 , (err , hash) =>
                        {
                        if(err)
                        {
                            console.log("bcrypt Error"+err);
                            return res.status(500).json
                            ({
                                message:err
                            });
                        }
                        else
                        {
                            mailOptions=
                            {
                                 to : req.body.email,
                                 subject : "Please confirm your Email account",
                                 text : "Hello, Your Temprory Password is "+rand+".Thank You" 
                            }
                            Transport.sendMail(mailOptions, (error, info) => 
                            {
                                if (error) 
                                {
                                    console.log(error+" Send Mail Error");
                                  return  res.status(404).json
                                        ({
                                            
                                            message:error
                                        });
                                }
                                else
                                {
                                    console.log("Data going to save");
                                const museum = new Museum
                                            ({
                                            _id : new mongoose.Types.ObjectId(),
                                            name:req.body.name,
                                            mname:req.body.mname,
                                            email:req.body.email,
                                            password:hash,
                                            cno:req.body.cno,
                                            address:req.body.address,
                                            pincode:req.body.pincode,
                                            city:req.body.city,
                                            lat:req.body.lat,
                                            lng:req.body.lng,
                                            logo:storagePath+"/"+req.body.logo,
                                            website:req.body.website,
                                            facebook:req.body.facebook,
                                            twitter:req.body.twitter,
                                            insta:req.body.insta,
                                            youtube:req.body.youtube,
                                            description:"",
                                            history:"",
                                            timming:req.body.timming
                                            
                                        });
                                        museum
                                        .save()
                                        .then(result =>
                                        {
                                            console.log("Saved");
                                            console.log(result);
                                           res.status(200).json
                                            ({
                                            message : 'Added Museum Successfully'
                                            });
                                        })
                                        .catch(err =>
                                        {
                                            console.log(err+" Error");
                                            return  res.status(500).json
                                                ({
                                                    message:err
                                                });
                                        });
                                }
                            });          
                        }
                    });
                }
            })
        .catch();
    });


    router.get("/index",(req,res,next)=>{
        Museum.find()
        .select("mname lat lng _id")
        .exec()
        .then(docs => 
            {
            return res.status(200).json(docs);
            })
        .catch(err =>
            {
                return res.status(500).json
                     ({
                        message :err
                      });
           });
    });


    router.get("/museumDetail/:userId",(req,res,next)=>{
        console.log("Node Called");
        Museum.findById(req.params.userId)
        .select('name mname cno website logo address pincode city lat lng timming facebook twitter insta youtube')
        .exec()
    	.then(docs => {
		console.log(docs);
		if(docs){
		return	res.status(200).json(docs);
		}
		else{
		return	res.status(404).json({
					message :'Invaid id'
			});
		}
	})
	.catch(err => {
		console.log(err)
	return	res.status(500).json({message : err});
	});


    });

    router.get("/getUserData/:userId",(req,res,next)=>{
        Museum.findById(req.params.userId)
        .select("name mname address cno email images history description logo pincode city")
        .exec()
        .then(docs=>{
            if(docs)
            {
                return res.status(200).json({
                    data:docs
                });
            }
            else{
                return res.status(404).json({
                    message:"Error"
                });
            }
        })
        .catch(err=>{
            return res.status(404).json({
                error:err
            });
        });
    });

    router.get("/getInfo/:museumId",(req,res,next)=>{
        Museum.findById(req.params.museumId)
        .select()
        .exec()
    	.then(docs => {
		console.log(docs);
		if(docs){
		return	res.status(200).json(docs);
		}
		else{
		return	res.status(404).json({
					message :'Invaid id'
			});
		}
	})
	.catch(err => {
		console.log(err)
	return	res.status(500).json({message : err});
	});
    });



    module.exports = router;