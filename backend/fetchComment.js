const { google } = require("googleapis");
require('dotenv').config();
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

function extractVideoId(url) {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : false;
}

async function fetchAllComments(videoUrl) {
  let comments = [];
  let nextPageToken = "";
  let videoId = extractVideoId(videoUrl);
  do {
    const response = await youtube.commentThreads.list({
      part: "snippet",
      videoId: videoId,
      maxResults: 100,
      pageToken: nextPageToken,
    });

    comments = comments.concat(
      response.data.items.map(
        (item) => item.snippet.topLevelComment.snippet.textDisplay
      )
    );

    nextPageToken = response.data.nextPageToken;
  } while (nextPageToken);

  return comments;
}

module.exports = fetchAllComments