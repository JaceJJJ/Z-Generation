export default function handler(req, res) {
  res.status(200).json({
    status: "success",
    message: "API正常运行",
    character: "闻叙白"
  });
}
