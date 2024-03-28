import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';

const app: Application = express();

dotenv.config({
  path: '.env',
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 8888);

app.post('/slack/fang', (req: Request, res: Response) => {
  const { text, token } = req.body;

  if (!token || token !== process.env.SLACK_VERIFICATION_TOKEN) {
    return res.status(200).send('You are unauthorized to make this request. The URL remains unchanged.');
  }

  if (!text) {
    return res.status(200).send('A URL was not provided or is invalid. Please provide a valid URL.');
  }

  const isValidUrl = text.match(/(https?):\/\/[^\s/$.?#].[^\s]*/);
  const isDefangedUrl = text.includes('hxxps[://]') || text.includes('hxxp[://]');

  if (!isValidUrl && !isDefangedUrl) {
    return res.status(200).send('A URL was not provided or is invalid. Please provide a valid URL.');
  }

  if (isDefangedUrl) {
    const enabledUrl = text
      .replace(/hxxp\[:\/\/\]/g, 'http://')
      .replace(/hxxps\[:\/\/\]/g, 'https://')
      .replace(/\[\.\]/g, '.')
      .replace(/[<>]/g, '');

    return res.status(200).json({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Your URL has been enabled! Please find the URL below and please be careful using it:',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '```' + enabledUrl + '```',
          },
        },
      ],
    });
  }

  const defangedUrl = text
    .replace(/http:\/\//g, 'hxxp[://]')
    .replace(/https:\/\//g, 'hxxps[://]')
    .replace(/\./g, '[.]')
    .replace(/[<>]/g, '');

  return res.status(200).json({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Your URL has been defanged! Please find the URL below:',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: defangedUrl,
        },
      },
    ],
  });
});

app.listen(app.get('port'), () => {
  console.log(`Server is running on port http://localhost:${app.get('port')}`);
});
