import { WebClient } from '@slack/web-api';

export default async function handler(req, res) {
  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 全てのHTTPメソッドを受け付ける
  // メソッドチェックを削除

  try {
    console.log('Received request:', {
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    const data = req.method === 'GET' ? req.query : req.body;
    
    // URL検証チャレンジ（初回設定時のみ）
    if (data.challenge) {
      console.log('URL verification challenge received:', data.challenge);
      return res.status(200).send(data.challenge);
    }
    
    // メンションイベントを処理
    if (data.event && data.event.type === 'app_mention') {
      console.log('App mention event received:', data.event);
      await handleMention(data.event);
    }
    
    // DMイベントを処理
    if (data.event && data.event.type === 'message' && data.event.channel_type === 'im') {
      console.log('Direct message event received:', data.event);
      await handleMention(data.event);
    }
    
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Error in doPost:', error);
    return res.status(500).send('Error');
  }
}

async function handleMention(event) {
  console.log('Handling mention:', event);

  // ボットからのメッセージは無視
  if (event.bot_id || event.subtype === 'bot_message') {
    console.log('Ignoring bot message');
    return;
  }

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

// Next.jsのAPIルートでJSONパースを無効化
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
} 