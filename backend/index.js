const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const language = require('@google-cloud/language');

dotenv.config();

const app = express();
const port = 3000;

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

const client = new language.LanguageServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

app.get('/analyze-comments', async (req, res) => {
  const videoId = req.query.videoId;

  try {
    const response = await youtube.commentThreads.list({
      part: 'snippet',
      videoId: videoId,
      maxResults: 100,
    });

    const comments = response.data.items.map(
      (item) => item.snippet.topLevelComment.snippet.textDisplay
    );

    const analysisResults = await analyzeComments(comments);

    res.json(analysisResults);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

async function analyzeComments(comments) {
  const document = {
    content: comments.join('\n'),
    type: 'PLAIN_TEXT',
  };

  const [result] = await client.analyzeSentiment({ document });
  const sentiment = result.documentSentiment;

  return comments.map((comment, index) => ({
    comment,
    sentiment: sentiment.score >= 0 ? 'Positive' : 'Negative',
  }));
}
