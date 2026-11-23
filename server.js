const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4173;
const SRC_DIR = path.join(__dirname, "src");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const cleanUrl = (req.url || "/").split("?")[0];
  const filePath = path.join(SRC_DIR, cleanUrl === "/" ? "index.html" : cleanUrl);

  // Prevent directory traversal
  if (!filePath.startsWith(SRC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(content);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Checkout app running at http://127.0.0.1:${PORT}`);
});