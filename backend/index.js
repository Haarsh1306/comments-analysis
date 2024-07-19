const fetchAllComments = require('./fetchComment')

const videoUrl = 'https://www.youtube.com/watch?v=zbBRgBkZprk';
let comments;

async function getAllComment(videoUrl){
  comments = await fetchAllComments(videoUrl);
  console.log(comments);
}

getAllComment(videoUrl);
