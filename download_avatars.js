var request = require("request");
var fs = require("fs");
var secrets = require("./secrets");

//Get parameters entered by the user
var owner = process.argv[2];
var repo = process.argv[3];

console.log("Welcome to the GitHub Avatar Downloader!");

//Return usage instructions if a parameter is missing. Start downloader if both arguments are present
if (!owner || !repo) {
  console.log("Error! You must specify an owner and a repo. Command usage: download_avatars <owner> <repo_name>");
  return;
}
else if (owner && repo)
  getRepoContributors(owner, repo, callbackDownloader);

//Callback function - Invokes downloadImageByURL to download each contributor's avatar image
function callbackDownloader(err, contributors) {
  if (err) {
    console.log("Error detected: " + err);
    return;
  }
  for (cont of contributors) {
    var sysPath = process.cwd().toString() + "/avatars/" + cont.login + ".jpg";
    downloadImageByURL(cont.avatar_url, sysPath);
  }
}

//Connect to github API and send requested data to callbackDownloader for downloads
function getRepoContributors(repoOwner, repoName) {
  var options = {
    url:
      "https://api.github.com/repos/" +
      repoOwner +
      "/" +
      repoName +
      "/contributors",
    headers: {
      "User-Agent": "ferrazf",
      Authorization: secrets.Authorization
    }
  };

  request(options, function (err, res, body) {
    if (res.statusCode == 200) {
      var jsonBody = JSON.parse(body);
      return callbackDownloader(err, jsonBody);
    }
  });
}

//Performs the download for each requested image
function downloadImageByURL(imgUrl, sysPath) {
  request.get(imgUrl).on("error", function (err) {
    console.log("There was an error: " + err);
    return;
  }).on("response", function (response) {
    if (response.statusCode != 200) {
      console.log("Error fetching image!");
      console.log("Response Status Code: ", response.statusCode);
      console.log("Response Status Message: ", response.statusMessage);
    }
    console.log("Image download complete!");
  }).pipe(fs.createWriteStream(sysPath));
}

//getRepoContributors("jquery", "jquery", callbackDownloader);

// downloadImageByURL(
//   "https://avatars2.githubusercontent.com/u/2741?v=3&s=466",
//   process.cwd().toString() +
//   "/w2d1/github-avatar-downloader/downloads/" +
//   "kvirani.jpg"
// );
