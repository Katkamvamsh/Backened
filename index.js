const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { products } = require("./data.js");
// testing to check commit
const app = express();
const port = process.env.PORT || 5000;
const uploadDir = path.join(__dirname, "uploading Files");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeFileName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safeFileName}`);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));
app.use(express.static(__dirname));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/products", (req, res) => {
  const filter = req.query.category;

  if (filter) {
    const list = products.filter((item) => item.category === filter);
    return res.json(list);
  }

  return res.json(products);
});

app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
});

app.get("/users/profile", (_req, res) => {
  res.send("Users profile list");
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please select a file to upload" });
  }

  return res.status(201).json({
    message: "File uploaded successfully",
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
    },
  });
});

app.listen(port, () => {
  console.log(`Server connected successfully on http://localhost:${port}`);
});