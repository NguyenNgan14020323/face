var config = require('../config.json');
var request = require('sync-request');
var Person = require('../models/person');

function sleep(time) {
  var stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {
    ;
  }
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

  if (!detectedFaces || detectedFaces.length == 0) {
     console.log("Can't detect any face");
     cb("");//tra ve du lieu
     return;
  }

  var identifiedResult = identify(detectedFaces.map(face => face.faceId));

  var allIdols = identifiedResult.map(result => {

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
        if (data[0]) {
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