export default async function handler(req, res) {
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  
  // チャレンジレスポンス
  if (req.body && req.body.challenge) {
    return res.status(200).send(req.body.challenge);
  }
  
  if (req.query && req.query.challenge) {
    return res.status(200).send(req.query.challenge);
  }
  
  return res.status(200).json({ ok: true });
}