import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [selectedApi, setSelectedApi] = useState('greeting');
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseDetails, setResponseDetails] = useState(null);

  const apiEndpoints = {
    greeting: {
      name: 'Greeting API',
      endpoint: '/api/greeting',
      method: 'POST',
      description: 'テスト用のGreeting API - 「おはよう」や「hello」に応答'
    },
    slack: {
      name: 'Slack API',
      endpoint: '/api/slack',
      method: 'POST',
      description: 'Slack Events API - app_mentionやmessage.imイベントをシミュレート'
    },
    slackChallenge: {
      name: 'Slack Challenge',
      endpoint: '/api/slack',
      method: 'POST',
      description: 'Slack URL検証チャレンジ - 初回セットアップ時のURL検証をテスト'
    }
  };

  const sendMessage = async () => {
    if (!message.trim() && selectedApi !== 'slackChallenge') {
      alert('メッセージを入力してください');
      return;
    }

    setLoading(true);
    setResponse('');
    setResponseDetails(null);

    try {
      const startTime = Date.now();
      let requestBody;
      
      if (selectedApi === 'greeting') {
        requestBody = { message };
      } else if (selectedApi === 'slack') {
        // Slack API用のイベントデータをシミュレート
        requestBody = {
          event: {
            type: 'app_mention',
            text: `<@U123456789> ${message}`,
            user: 'U123456789',
            channel: 'C123456789',
            ts: '1234567890.123456'
          }
        };
      } else if (selectedApi === 'slackChallenge') {
        // Slack Challenge用のデータをシミュレート
        requestBody = {
          token: 'verification_token_example',
          challenge: message || 'challenge_code_12345',
          type: 'url_verification'
        };
      }

      const res = await fetch(apiEndpoints[selectedApi].endpoint, {
        method: apiEndpoints[selectedApi].method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      const testResult = {
        timestamp: new Date().toISOString(),
        api: selectedApi,
        request: requestBody,
        response: data,
        status: res.status,
        statusText: res.statusText,
        responseTime: responseTime,
        success: res.ok,
        headers: Object.fromEntries(res.headers.entries())
      };

      setTestHistory(prev => [testResult, ...prev.slice(0, 9)]); // 最新10件を保持
      
      if (res.ok) {
        if (selectedApi === 'greeting' && data.output) {
          setResponse(`✅ ${data.output}`);
        } else if (selectedApi === 'slack') {
          setResponse(data === 'OK' ? '✅ Slackイベントが正常に処理されました' : data);
        } else if (selectedApi === 'slackChallenge') {
          if (data === requestBody.challenge) {
            setResponse(`✅ チャレンジ検証成功！ 返答: "${data}"`);
          } else {
            setResponse(`❌ チャレンジ検証失敗。期待値: "${requestBody.challenge}", 実際: "${data}"`);
          }
        } else {
          setResponse(`✅ レスポンス: ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`);
        }
      } else {
        setResponse(`❌ エラー: ${res.status} ${res.statusText}`);
      }
      
      setResponseDetails(testResult);
      
    } catch (error) {
      const errorResult = {
        timestamp: new Date().toISOString(),
        api: selectedApi,
        request: message,
        error: error.message,
        success: false
      };
      
      setTestHistory(prev => [errorResult, ...prev.slice(0, 9)]);
      setResponse(`❌ ネットワークエラー: ${error.message}`);
      setResponseDetails(errorResult);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setTestHistory([]);
    setResponse('');
    setResponseDetails(null);
  };

  const testPresets = [
    { label: 'おはよう', value: 'おはよう', apis: ['greeting', 'slack'] },
    { label: 'hello', value: 'hello', apis: ['greeting', 'slack'] },
    { label: 'こんにちは', value: 'こんにちは', apis: ['greeting', 'slack'] },
    { label: 'good morning', value: 'good morning', apis: ['greeting', 'slack'] },
    { label: 'テストメッセージ', value: 'テストメッセージ', apis: ['greeting', 'slack'] },
    { label: 'チャレンジコード例', value: 'challenge_code_12345', apis: ['slackChallenge'] },
    { label: 'ランダムチャレンジ', value: `challenge_${Math.random().toString(36).substring(7)}`, apis: ['slackChallenge'] }
  ];

  // 現在のAPIに適用可能なプリセットのみを表示
  const availablePresets = testPresets.filter(preset => 
    preset.apis.includes(selectedApi)
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Slack Bot - Greeting System</h1>
      
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
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

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f8f8', borderRadius: '8px' }}>
        <h2>🧪 APIテストインターフェース</h2>
        <p>ボットのAPIエンドポイントを包括的にテストできます：</p>
        
        {/* API選択 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            テストするAPI:
          </label>
          <select 
            value={selectedApi} 
            onChange={(e) => {
              setSelectedApi(e.target.value);
              setMessage(''); // APIが変わったらメッセージをクリア
            }}
            style={{ padding: '8px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {Object.entries(apiEndpoints).map(([key, api]) => (
              <option key={key} value={key}>{api.name}</option>
            ))}
          </select>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {apiEndpoints[selectedApi].description}
          </span>
        </div>

        {/* 特別な説明（Challenge API用） */}
        {selectedApi === 'slackChallenge' && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#fff3cd', 
            borderRadius: '5px',
            border: '1px solid #ffeaa7'
          }}>
            <h4>📝 チャレンジテストについて</h4>
            <p>SlackのURL検証プロセスをシミュレートします。</p>
            <ul>
              <li>Slackは初回セットアップ時に、指定されたRequest URLに<code>challenge</code>パラメータを送信</li>
              <li>アプリは同じ<code>challenge</code>値をプレーンテキストで返す必要があります</li>
              <li>これによりSlackがURL所有権を確認します</li>
            </ul>
          </div>
        )}

        {/* プリセットメッセージ */}
        {availablePresets.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              プリセット{selectedApi === 'slackChallenge' ? 'チャレンジコード' : 'メッセージ'}:
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {availablePresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(preset.value)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#e0e0e0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* メッセージ入力 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            {selectedApi === 'slackChallenge' ? 'チャレンジコード:' : 'テストメッセージ:'}
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                selectedApi === 'slackChallenge' 
                  ? "チャレンジコードを入力（例：challenge_code_12345）" 
                  : "メッセージを入力してください（例：おはよう、hello）"
              }
              style={{ 
                padding: '10px', 
                width: '400px', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage} 
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '送信中...' : '送信'}
            </button>
          </div>
        </div>

        {/* レスポンス表示 */}
        {response && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: response.includes('❌') ? '#ffe6e6' : '#e8f5e8', 
            borderRadius: '5px',
            marginBottom: '20px',
            border: response.includes('❌') ? '1px solid #ff9999' : '1px solid #99cc99'
          }}>
            <strong>🔄 APIレスポンス:</strong> 
            <div style={{ marginTop: '5px', fontFamily: 'monospace', fontSize: '14px' }}>
              {response}
            </div>
          </div>
        )}

        {/* レスポンス詳細 */}
        {responseDetails && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f9f9f9', 
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #ddd'
          }}>
            <h4>📊 レスポンス詳細</h4>
            <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
              <p><strong>ステータス:</strong> 
                <span style={{ 
                  color: responseDetails.success ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>
                  {responseDetails.status} {responseDetails.statusText}
                </span>
              </p>
              <p><strong>応答時間:</strong> {responseDetails.responseTime}ms</p>
              <p><strong>タイムスタンプ:</strong> {new Date(responseDetails.timestamp).toLocaleString()}</p>
              <p><strong>API:</strong> {apiEndpoints[responseDetails.api].name}</p>
              
              {responseDetails.headers && (
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>レスポンスヘッダー</summary>
                  <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                    {JSON.stringify(responseDetails.headers, null, 2)}
                  </pre>
                </details>
              )}
              
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>リクエスト詳細</summary>
                <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                  {JSON.stringify(responseDetails.request, null, 2)}
                </pre>
              </details>
              
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>レスポンス詳細</summary>
                <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                  {typeof responseDetails.response === 'string' 
                    ? responseDetails.response 
                    : JSON.stringify(responseDetails.response, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        {/* テスト履歴 */}
        {testHistory.length > 0 && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#ffffff', 
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4>📝 テスト履歴 ({testHistory.length}件)</h4>
              <button 
                onClick={clearHistory}
                style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                履歴クリア
              </button>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {testHistory.map((test, index) => (
                <div key={index} style={{ 
                  padding: '10px', 
                  backgroundColor: test.success ? '#f8f9fa' : '#fff3cd',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>
                      {test.success ? '✅' : '❌'} {apiEndpoints[test.api]?.name || test.api}
                    </span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>
                    {test.status && <span>Status: {test.status}</span>}
                    {test.responseTime && <span> | Time: {test.responseTime}ms</span>}
                  </div>
                </div>
              ))}
            </div>
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
        <pre style={{ backgroundColor: '#f8f8f8', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>
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