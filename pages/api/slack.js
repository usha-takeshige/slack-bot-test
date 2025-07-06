import { WebClient } from '@slack/web-api';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Slackからのリクエストのみを受け付ける
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POSTメソッドのみ許可されています' });
  }

  // Slack署名検証（本番環境では必須）
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  
  // リクエストボディの解析
  const { type, challenge, event } = req.body;

  // URL検証（Slack appの初期設定時）
  if (type === 'url_verification') {
    return res.status(200).json({ challenge });
  }

  // イベントの処理
  if (type === 'event_callback' && event) {
    try {
      await handleSlackEvent(event);
      return res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Slackイベント処理エラー:', error);
      return res.status(500).json({ error: 'イベント処理に失敗しました' });
    }
  }

  return res.status(200).json({ status: 'ok' });
}

async function handleSlackEvent(event) {
  // ボットからのメッセージは無視
  if (event.bot_id || event.subtype === 'bot_message') {
    return;
  }

  // メンションまたはDMのみ処理
  if (event.type === 'app_mention' || event.channel_type === 'im') {
    const text = event.text;
    const channel = event.channel;
    const user = event.user;

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

    // Slack Web APIを使用して返答を送信
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
    
    await slack.chat.postMessage({
      channel: channel,
      text: response,
      username: 'Greeting Bot',
      icon_emoji: ':robot_face:'
    });
  }
} 