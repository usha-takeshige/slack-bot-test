export default function handler(req, res) {
  // CORSヘッダーを設定（Google Apps Scriptからのアクセスを許可）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GETまたはPOSTリクエストの処理
  if (req.method === 'GET' || req.method === 'POST') {
    // パラメータの取得（GETの場合はクエリパラメータ、POSTの場合はボディから）
    const message = req.method === 'GET' ? req.query.message : req.body.message;
    
    if (!message) {
      return res.status(400).json({ error: 'メッセージが必要です' });
    }

    let response;
    
    // メッセージに応じた応答を決定
    if (message.toLowerCase() === 'おはよう') {
      response = 'こんばんは';
    } else if (message.toLowerCase() === 'hello') {
      response = 'good night';
    } else {
      response = 'メッセージを理解できませんでした';
    }

    return res.status(200).json({ 
      input: message,
      output: response 
    });
  }

  // サポートされていないメソッド
  res.status(405).json({ error: 'メソッドがサポートされていません' });
}