
var Upload_image = document.getElementById("uploadimage")
var Upload_any_thing_table_image = document.getElementById("buttonimage")
var max_file_size_image = 500000*1024*1024
var progress_download = document.getElementById("progressdownload")

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
          console.log(calculate);
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
                console.log(xhr.responseText);
				document.getElementById("showimage").src = data_response
				document.getElementById("showimage").style.height = "500px"
				document.getElementById("showimage").style.width = "500px"
				
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