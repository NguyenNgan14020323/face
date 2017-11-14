var express 	= require('express');
var app 		= express();
var router 		= express.Router();
var multer 		= require('multer');
var fs 			= require('fs');
var cloudinary = require('cloudinary');
var path = require('path');
var multipart  = require('connect-multiparty'); //upload file dung connect-multiparty
var multipartMiddleware = multipart();
var Image = require('../models/image');
var Person = require('../models/person');
var utils = require('../utils/utils');
var config = require('../config.json');
var request = require('sync-request');

router.route('/')//dieu huong app
.get(function(req, res)
{
   res.status(200).render("index", {})
})

router.route('/uploadimage')
.post(multipartMiddleware, function(req, res){
	if(req.files){
		fs.readFile(req.files.imageupload.path, function (err, data)
      	{
      	var imageName = req.files.imageupload.name
    		if(!imageName)
        	{
      			console.log("There was an error.")
    		}else{
    			var dirname = path.resolve(__dirname, "..");
      	 		var newPath = dirname + "/public/image/"  + imageName;
      	 		var response_path = "/image/" + imageName
      	 		fs.writeFile(newPath, data, function (err) {
      				if(err){
          		   		return res.end("Error uploading file.");
        		  	}
      	 		});
      	 		cloudinary.uploader.upload("./public/image/"+ imageName, function(result) {
              utils.recognize(result.url, (data) => {
                console.log(JSON.stringify(data));
              });
      	 		});
      	 		res.send(JSON.stringify(response_path))
    		}

      	})
	}
})


router.route('/upload')//dieu huong app
.get(function(req, res)
{
   Image.find()
	.sort({'created_at':-1})
	.exec(function(err,data){
		if(err){
			res.json({message:err})
		}else{
			var end = JSON.stringify(data);
			res.render('upload',{images: JSON.parse(end)})
		}
	})
})


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/image')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})

var upload = multer({ storage: storage });

router.route('/upload')
.post(upload.array("file",12), function(req,res)
{
	var arr = req.files;
	var chk = true;
	var name = req.body.name;
	var id = 1;
	var count = 0;
  var url = config.baseUrl + 'persongroups/' + config.groupId + '/persons';

  // noinspection JSAnnotator
  Person.find()
    .sort({'id': -1})
    .exec(function (err, data) {
      if (err) {
        res.json({
          message: err
        });
      } else {
        if (data[0]) {
          id = data[0].id ? data[0].id + 1 : 1;
        } else {
          id = 1;
        }
        console.log(`Begin submit person: ${id} - ${name}`);
        var resAPI = request('POST', url, {
          headers: {
            'Ocp-Apim-Subscription-Key': config.key
          },
          json: {
            name,
            userData: id
          }
        });
        if (resAPI.statusCode == 200) {
          let person = JSON.parse(resAPI.getBody('utf8'));
          let personId = person.personId;

          for (var i = 0; i < arr.length; i++){
            cloudinary.uploader.upload("./public/image/"+ arr[i].originalname, function(result) {
              utils.sleep(4*1000);
              let url = config.baseUrl + 'persongroups/' + config.groupId + '/persons/' + personId + '/persistedFaces';
              resAPI = request('POST', url, {
                headers: {
                  'Ocp-Apim-Subscription-Key': config.key
                },
                json: {
                  url: result.url
                }
              });
              if (resAPI.statusCode == 200) {
                var newImage = new Image({
                  url : result.url,
                  name : req.body.name,
                  public_id : result.public_id
                });

                newImage.save(function(error){
                  if(error){
                    console.log(error);
                    chk = false;
                  }
                });
                ++count;
                if (count == arr.length) {
                  url = config.baseUrl + '/persongroups/' + config.groupId + '/train';
                  resAPI = request('POST', url, {
                    headers: {
                      'Ocp-Apim-Subscription-Key': config.key
                    }
                  });
                  if (resAPI.statusCode == 202) {
                    Person.create({
                      id,
                      personId,
                      name
                    });
                    console.log('training success');
                  } else {
                    console.log('Error: ');
                  }
                }
              }
            });
            fs.unlink("./public/image/"+ arr[i].originalname, function (err) {
              if (err) throw err;
              console.log('File deleted!');
            });
          }
          if(chk){
            res.redirect('/upload');
          }
        }
      }
    });
});

module.exports = router