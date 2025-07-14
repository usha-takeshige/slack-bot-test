export default function handler(req, res) {
  // 詳細なCORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // リクエストの詳細をログに出力（デバッグ用）
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Body:', req.body);
  console.log('Query:', req.query);

  // GETまたはPOSTリクエストの処理
  if (req.method === 'GET' || req.method === 'POST') {
    // パラメータの取得（GETの場合はクエリパラメータ、POSTの場合はボディから）
    const message = req.method === 'GET' ? req.query.message : req.body.message;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'メッセージが必要です',
        method: req.method,
        receivedData: {
          body: req.body,
          query: req.query
        }
      });
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
      output: response,
      timestamp: new Date().toISOString(),
      method: req.method
    });
  }

  // サポートされていないメソッド
  res.status(405).json({ 
    error: 'メソッドがサポートされていません',
    method: req.method,
    supportedMethods: ['GET', 'POST']
  });
}