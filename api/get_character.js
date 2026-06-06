export default async function handler(req, res) {
  res.status(200).json({
    api_key_exists: !!process.env.OPENAI_API_KEY,
    api_key_preview: process.env.OPENAI_API_KEY
      ? process.env.OPENAI_API_KEY.substring(0, 10)
      : null
  });
}
