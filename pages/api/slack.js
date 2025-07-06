import { WebClient } from '@slack/web-api';
import crypto from 'crypto';

export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Slack-Signature, X-Slack-Request-Timestamp');

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Slackからのリクエストのみを受け付ける
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POSTメソッドのみ許可されています' });
  }

  try {
    // リクエストボディを文字列として取得
    let body = '';
    if (typeof req.body === 'string') {
      body = req.body;
    } else if (typeof req.body === 'object') {
      body = JSON.stringify(req.body);
    }

    // JSONパース
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      parsedBody = req.body;
    }

    console.log('Received request:', {
      method: req.method,
      headers: req.headers,
      body: parsedBody
    });

    const { type, challenge, event } = parsedBody;

    // URL検証（Slack appの初期設定時）
    if (type === 'url_verification') {
      console.log('URL verification request received, challenge:', challenge);
      return res.status(200).json({ challenge });
    }

    // イベントの処理
    if (type === 'event_callback' && event) {
      console.log('Event callback received:', event);
      try {
        await handleSlackEvent(event);
        return res.status(200).json({ status: 'ok' });
      } catch (error) {
        console.error('Slackイベント処理エラー:', error);
        return res.status(500).json({ error: 'イベント処理に失敗しました' });
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('リクエスト処理エラー:', error);
    return res.status(500).json({ error: 'リクエスト処理に失敗しました' });
  }
}

async function handleSlackEvent(event) {
  console.log('Handling Slack event:', event);

  // ボットからのメッセージは無視
  if (event.bot_id || event.subtype === 'bot_message') {
    console.log('Ignoring bot message');
    return;
  }

  // メンションまたはDMのみ処理
  if (event.type === 'app_mention' || event.channel_type === 'im') {
    const text = event.text || '';
    const channel = event.channel;
    const user = event.user;

    console.log('Processing message:', { text, channel, user });

    // Bot IDを除去してテキストを取得
    const cleanText = text.replace(/<@[^>]+>/g, '').trim();

    // メッセージ内容に応じた返答を決定
    let response;
    if (cleanText.includes('おはよう')) {
      response = 'こんにちは';
    } else if (cleanText.toLowerCase().includes('hello')) {
      response = 'good night';
    } else {
      response = 'メッセージを理解できませんでした。「おはよう」または「hello」と送信してください。';
    }

    console.log('Sending response:', response);

    // 環境変数の確認
    if (!process.env.SLACK_BOT_TOKEN) {
      console.error('SLACK_BOT_TOKEN environment variable is not set');
      return;
    }

    // Slack Web APIを使用して返答を送信
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
    
    try {
      await slack.chat.postMessage({
        channel: channel,
        text: response,
        username: 'Greeting Bot',
        icon_emoji: ':robot_face:'
      });
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }
}

// Next.jsのAPIルートでJSONパースを無効化
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
} 