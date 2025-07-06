import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const sendMessage = async () => {
    try {
      const res = await fetch('/api/greeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      const data = await res.json();
      setResponse(data.output);
    } catch (error) {
      setResponse('エラーが発生しました');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Slack Bot - Greeting System</h1>
      
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
        <h2>🤖 Slackボット機能</h2>
        <p>このアプリはSlackボットとして動作します：</p>
        <ul>
          <li>「おはよう」→「こんにちは」と返答</li>
          <li>「hello」→「good night」と返答</li>
          <li>その他のメッセージには理解できない旨を返答</li>
        </ul>
        <p><strong>使用方法：</strong> Slackでボットをメンションしてメッセージを送信してください。</p>
        <p><strong>エンドポイント：</strong> <code>/api/slack</code> - Slack Events APIからのWebhookを処理</p>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f8f8', borderRadius: '5px' }}>
        <h2>🧪 テスト用インターフェース</h2>
        <p>ボットの動作をテストするためのインターフェースです：</p>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="メッセージを入力してください（例：おはよう、hello）"
            style={{ padding: '10px', marginRight: '10px', width: '300px' }}
          />
          <button onClick={sendMessage} style={{ padding: '10px 20px' }}>
            送信
          </button>
        </div>
        {response && (
          <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
            <strong>応答:</strong> {response}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <h2>📋 セットアップ手順</h2>
        <ol>
          <li>Slack APIでアプリを作成</li>
          <li>Bot Token Scopesを設定（app_mentions:read, chat:write, im:read, im:write）</li>
          <li>Event Subscriptionsを有効化（app_mention, message.im）</li>
          <li>Request URLを設定：<code>https://your-app.vercel.app/api/slack</code></li>
          <li>環境変数<code>SLACK_BOT_TOKEN</code>を設定</li>
          <li>ワークスペースにボットをインストール</li>
        </ol>
        <p>詳細な手順は<code>README.md</code>を参照してください。</p>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>🔧 API使用方法</h2>
        <p>Google Apps Scriptから以下のようにアクセスできます：</p>
        <pre style={{ backgroundColor: '#f8f8f8', padding: '10px', borderRadius: '5px' }}>
{`function callGreetingAPI() {
  const url = 'https://your-app-name.vercel.app/api/greeting';
  
  const payload = {
    message: 'おはよう'
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  };
  
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  
  console.log(data.output); // "こんにちは"
}`}
        </pre>
      </div>
    </div>
  );
}