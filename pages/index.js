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
      <h1>挨拶アプリ</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力してください"
          style={{ padding: '10px', marginRight: '10px', width: '200px' }}
        />
        <button onClick={sendMessage} style={{ padding: '10px 20px' }}>
          送信
        </button>
      </div>
      {response && (
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <strong>応答:</strong> {response}
        </div>
      )}
      
      <div style={{ marginTop: '40px' }}>
        <h2>API使用方法</h2>
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
  
  console.log(data.output); // "こんばんは"
}`}
        </pre>
      </div>
    </div>
  );
}