var config = require('../config.json');
var request = require('sync-request');
var Person = require('../models/person');

function sleep(time) {
  console.log('Begin Sleep');
  var stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {
    ;
  }
  console.log('End Sleep');
}

function detect(imageUrl) {
  console.log(`Begin to detect face from image: ${imageUrl}`);
  let url = config.baseUrl + 'detect';
  var res = request('POST', url, {
    headers: {
      'Ocp-Apim-Subscription-Key': config.key
    },
    json: {
      url: imageUrl
    }
  });

  if (res.statusCode == 200) {
    var result = JSON.parse(res.getBody('utf8'));
    console.log(`Found ${result.length} faces.`);
    return result;
  }
}

function identify(faceIds) {
  console.log(`Begin to identity face.`);
  let url = config.baseUrl +  'identify';
  var res = request('POST', url, {
    headers: {
      'Ocp-Apim-Subscription-Key': config.key
    },
    json: {
      "personGroupId": config.groupId,
      "faceIds": faceIds,
      "maxNumOfCandidatesReturned": 1,
    }
  });

  if (res.statusCode == 200) {
    console.log(`Finish identity face.`);
    return JSON.parse(res.getBody('utf8'));
  } else {
    console.log('Error');
    console.log(res.getBody('utf8'));
  }
}

function recognize(imageUrl, cb) {
  console.log(`Begin to recognize image: ${imageUrl}`);
  var detectedFaces = detect(imageUrl);

  if (detectedFaces.length == 0) {
    console.log("Can't detect any face");
    return;
  }

  // Sau khi đã phát hiện các khuôn mặt,
  // So sánh chúng với mặt đã có trong person group
  var identifiedResult = identify(detectedFaces.map(face => face.faceId));

  var allIdols = identifiedResult.map(result => {

    // Lấy vị trí khuôn mặt trong ảnh để hiển thị
    result.face = detectedFaces.filter(face => face.faceId == result.faceId)[0].faceRectangle;

    return result;
  });
  var count = 0;
  var dataResult = [];
  allIdols.map(item => {
    if (item.candidates[0]) {
      Person.find({personId: item.candidates[0].personId}, (err, data) => {
        if (err) throw console.error(err);
        ++count;
        if (data) {
          dataResult.push({
            face: item.face,
            name: data[0].name
          });
        } else {
          dataResult.push({
            face: item.face,
            name: "Unknown"
          });
        }

        if (allIdols.length === count) {
          cb(dataResult);
        }
      });
    } else {
      dataResult.push({
        face: item.face,
        name: "Unknown"
      });
      ++count;
      if (allIdols.length === count) {
        cb(dataResult);
      }
    }
  });

  console.log(`Finish recognize image: ${imageUrl}`);
  return allIdols;
}

module.exports = {
  sleep,
  recognize,
};