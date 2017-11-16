
var Upload_image = document.getElementById("uploadimage")
var Upload_any_thing_table_image = document.getElementById("buttonimage")
var max_file_size_image = 500000*1024*1024
var progress_download = document.getElementById("progressdownload")
const const_width = 500;

function TypeofFile(val)
{
      //lay kieu file vi du helo.jpg se lay duoi file la jpg hoac neu file la abc.adf.acc lay duoc duoi file la acc
      var type = val.slice((Math.max(0, val.lastIndexOf(".")) || Infinity) + 1);//cach 1
      //   var extension_file = val.split('.').pop();//duoi file cach 2
      switch(type.toString().toLowerCase())
      {
           case "jpg":
           case "gif": 
           case "bmp": 
           case "png": 
           case "jpeg":
           case "gif":
           case "bpg": 
           case "bat":
		   case "iso":
           return true;
       }
                      
       return false;
 }
 
 //link tham khao tien trinh download: http://christopher5106.github.io/web/2015/12/13/HTML5-file-image-upload-and-resizing-javascript-with-progress-bar.html
 //                                                   https://www.sitepoint.com/html5-javascript-file-upload-progress-bar/

//su dung ajax voi XMLHttpRequest, upload len server, not refresh page
document.getElementById("uploadFormimage").onsubmit = function(event)
{
	var imfomation = Upload_image.files[0]
	var name = imfomation.name
   	event.preventDefault();
    // Create a new FormData object.
    var formData = new FormData();
    // Add the file to the request.
    formData.append('imageupload', imfomation, name);
    // Set up the AJAX request.
    var xhr = new XMLHttpRequest();
    // Open the connection.
    xhr.open('POST', '/uploadimage', true);
    xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
   // xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // Set up a handler for when the request finishes.
    xhr.onload = function () {
        if (xhr.status === 200)
            console.log("da chay thanh cong")
        else
           	console.log("xay ra loi khong xac dinh. Sorry!!!")
		 $('#myModal').modal('hide');
    };
	//phuong thuc post
	
	xhr.upload.addEventListener("progress", function(evt){
      if (evt.lengthComputable) {
		  var calculate = parseInt(evt.loaded*100 / evt.total).toString()
		  $('#progressdownload').attr('aria-valuenow', calculate).css('width',calculate);
	//	    setTimeout(function(){
			   progress_download.innerHTML = parseInt(calculate) + "%"
		//  }, 150)
		  progress_download.style.width = calculate +"%"
        if(calculate == 100){
         setTimeout(function(){
            $('#myModal').modal('hide');
         }, 1000)

         setTimeout(function(){
            $('#myModal123').modal('show');
         }, 1500)
            
        }
      }
    }, false);
	
	//phuong thuc get
	/* 
	xhr.onprogress = function (e) {
		if (e.lengthComputable) {
			console.log(e.loaded+  " / " + e.total)
		}
	} */
	xhr.onloadstart = function (e) {
		console.log("start")
	}
	xhr.onloadend = function (e) {
		$('#myModal').modal('hide');
		// console.log("end")
	} 

    // Send the Data to server
    xhr.send(formData);

    //take data from server responsible
    xhr.onreadystatechange = function(){
    	//State = 4 is request finished and response is ready, xhr.status == 200 is 200: "OK"
        if(xhr.readyState == 4 && xhr.status == 200){
        	var data_response = JSON.parse(xhr.responseText);

         //phat hien dk mat mguoi
         if(data_response.info != ""){

		      document.getElementById("showimage").src = data_response.url;
            var origin_width = data_response.image_width, 
               origin_heigh = data_response.image_height;

         /*  img1.onload = function(){
               origin_width = img1.width;//nham no viet hoa 
               origin_heigh = img1.height;
               // code here to use the dimensions
            }
            img1.src = data_response.url; */

            setTimeout(function(){
               $('#myModal123').modal('hide');
               var c = document.getElementById("myCanvas");
               c.style.display = "block";
               var ctx = c.getContext("2d");
               var img = document.getElementById("showimage");
               ctx.drawImage(img, data_response.info[0].face.left, data_response.info[0].face.top, data_response.info[0].face.width, data_response.info[0].face.height, 0, 0, 150, 150);
               document.getElementById('noidung').innerHTML = data_response.info[0].name;
               document.getElementById("showimage").style.height = "auto"
            
               document.getElementById("showimage").style.width = "500px"
               var frame_face = document.getElementById("frame-face")
               frame_face.style.position = 'absolute';
               frame_face.style.left = (data_response.info[0].face.left*const_width )/origin_width + "px"
               frame_face.style.top = (data_response.info[0].face.top*const_width )/origin_width + "px"
               frame_face.style.height = data_response.info[0].face.height*const_width /origin_width+ "px"
               frame_face.style.width = (data_response.info[0].face.width*const_width )/origin_width + "px"
               $(document).ready(function(){
                  $('#frame-face').tooltip({title: data_response.info[0].name}); 
               });
            
            }, 2000)
         
          }else{
            $('#myModal123').modal('hide');
            setTimeout(function(){
               alert("Can not detect any face.")
            }, 500) 
          }
       }
    }
}


//chon file de upload, neu co chon file thi ham nay se chay
Upload_image.addEventListener("change", function(){
	var imfomation = Upload_image.files[0]
	if(imfomation){
   	 	var size = imfomation.size;//dung de han che viec upload file qua nang
		var name = imfomation.name;
		
		if(!TypeofFile(name))//ham nay o file Xulihomepage.js
			alert("Please choose an image file [jpg, gif, bmp, png, jpeg, gif, bgp, bat].")
		else if(size > max_file_size_image)
			alert("Image too big size. Please small than 5MB.")
		else
			$('#myModal').modal('show');
			document.getElementById("submitbuttonimage").click()//goi den ham submit trong form
	}
})

//get event from image awesome
Upload_any_thing_table_image.addEventListener("click", function(){
	Upload_image.click();
})

function Upload_data_camera_img(img_base_64, callback)
{
    $.ajax({
        type: "POST",
        url: "/upload/camera",
        data:{upload_camera_image: img_base_64},
        success: function(data)//hien thi message
        {
            if(typeof callback == "function")
                callback(data);//tra ve du lieu
        }
    })
}

var Upload_any_thing_table_camera = document.getElementById("buttonimage1")

//chụp ảnh bằng camera
// Elements for taking the snapshot
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var video = document.getElementById('video');
var localstream;//dung de tắt camera
var take_image = false;

var count_num_click = 0;
Upload_any_thing_table_camera.addEventListener("click", function(){
  $('#myModal50600').modal('show');
  count_num_click++;

  if(count_num_click > 1){
    video.style.display = "block"
     canvas.style.display = "none"
  }

    // Trigger photo take
  document.getElementById("snap").addEventListener("click", function() {
    video.style.display = "none"
    context.drawImage(video, 0, 0, 640, 640);
    canvas.style.display = "block"
    video.pause()
    take_image = true;
  });
  
  //Restart take photo
  document.getElementById("restart").addEventListener("click", function() {
    video.style.display = "block"
    canvas.style.display = "none"
    video.play()
    take_image = false;
  });

  // Get access to the camera!
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
       video.src = window.URL.createObjectURL(stream);
        localstream = stream
        video.play();
    });
  }
})

//click nut x hoac button close tren modal chup camrera
$('#myModal50600').on('hidden.bs.modal', function () {
    console.log(" you turned off camera")
    localstream.getTracks()[0].stop();//tat camera
    take_image = false;
})

//bat su kien nguoi dung chup xong va gui anh len server
document.getElementById("photographdone").addEventListener("click", function() {
 if(take_image){
   var dataURL = canvas.toDataURL("image/png");//danh dinh dang png
   video.src = ""
   localstream.getTracks()[0].stop()
   //an modal
   $('#myModal50600').modal('hide');

   setTimeout(function(){
      $('#myModal123').modal('show');
    }, 1000)

  //ajax upload data img
    Upload_data_camera_img(dataURL, function(data){
      var data_response = JSON.parse(data)

     if(data_response.info != ""){
         document.getElementById("showimage").src = data_response.url;
         var origin_width = data_response.image_width, origin_heigh = data_response.image_height;

         setTimeout(function(){
            $('#myModal123').modal('hide');
            var c = document.getElementById("myCanvas");
            c.style.display = "block";
            var ctx = c.getContext("2d");
            var img = document.getElementById("showimage");
            ctx.drawImage(img, data_response.info[0].face.left, data_response.info[0].face.top, data_response.info[0].face.width, data_response.info[0].face.height, 0, 0, 150, 150);
            document.getElementById('noidung').innerHTML = data_response.info[0].name;
            document.getElementById("showimage").style.height = "auto"
            
            document.getElementById("showimage").style.width = "500px"
            var frame_face = document.getElementById("frame-face")
            frame_face.style.position = 'absolute';
            frame_face.style.left = (data_response.info[0].face.left*const_width )/origin_width + "px"
            frame_face.style.top = (data_response.info[0].face.top*const_width )/origin_width + "px"
            frame_face.style.height = data_response.info[0].face.height*const_width /origin_width+ "px"
            frame_face.style.width = (data_response.info[0].face.width*const_width )/origin_width + "px"
            $(document).ready(function(){
               $('#frame-face').tooltip({title: data_response.info[0].name}); 
            });  
          }, 2000)
       }else{
         $('#myModal123').modal('hide');
         setTimeout(function(){
            alert("Can not detect any face.")
         }, 500) 
       }     
     })
     take_image = false;
   }else
      alert("Please catch your image.")
});