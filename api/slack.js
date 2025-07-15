export default async function handler(req, res) {
  try {
    console.log('=== SLACK WEBHOOK DEBUG ===');
    console.log('Method:', req.method);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body type:', typeof req.body);
    console.log('Body:', req.body);
    
    // bodyが文字列の場合はパース
    let data = req.body;
    if (typeof req.body === 'string') {
      try {
        data = JSON.parse(req.body);
      } catch (e) {
        console.log('JSON parse error:', e);
      }
    }
    
    console.log('Parsed data:', data);
    
    // チャレンジレスポンス（初回設定時のみ）
    if (data && data.challenge) {
      console.log('Sending challenge response:', data.challenge);
      return res.status(200).send(data.challenge);
    }
    
    // メンションイベントを処理
    if (data && data.event && data.event.type === 'app_mention') {
      console.log('Processing mention event');
      await handleMention(data.event);
    }
    
    console.log('Request processed successfully');
    return res.status(200).send('OK');
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Error');
  }
}

// メンションを処理する関数
async function handleMention(event) {
  const channel = event.channel;
  const user = event.user;
  const threadTs = event.ts; // メンションされたメッセージのタイムスタンプ
  
  // 現在時刻を取得してフォーマット
  const now = new Date();
  const timeString = now.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // 返信メッセージを作成
  const message = `<@${user}> 現在時刻は ${timeString} です！`;
  
  // Slackにスレッド返信を送信
  await sendSlackMessage(channel, message, threadTs);
}

// Slackにメッセージを送信する関数
async function sendSlackMessage(channel, message, threadTs = null) {
  const token = process.env.SLACK_BOT_TOKEN;
  
  if (!token) {
    console.error('Slack bot token not found');
    return;
  }
  
  const url = 'https://slack.com/api/chat.postMessage';
  const payload = {
    channel: channel,
    text: message
  };
  
  // スレッド返信の場合はthread_tsを追加
  if (threadTs) {
    payload.thread_ts = threadTs;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error('Slack API error:', responseData.error);
    } else {
      console.log('Message sent successfully');
    }
  } catch (error) {
    console.error('Error sending message to Slack:', error);
  }
}