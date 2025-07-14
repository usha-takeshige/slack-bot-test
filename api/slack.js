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
    
    // チャレンジレスポンス
    if (data && data.challenge) {
      console.log('Sending challenge response:', data.challenge);
      return res.status(200).send(data.challenge);
    }
    
    console.log('No challenge, sending OK');
    return res.status(200).send('OK');
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Error');
  }
}