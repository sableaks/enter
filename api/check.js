export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  if (req.body.password === process.env.SITE_PASSWORD) {
    // Send a success flag (in a larger app, you'd sign a JWT token here)
    return res.status(200).json({ success: true, token: "authorized" });
  } else {
    return res.status(401).json({ success: false });
  }
}
