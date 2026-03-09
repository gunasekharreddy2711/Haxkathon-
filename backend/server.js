// Owner: Manideep Reddy Eevuri
// GitHub: https://github.com/Maniredii
// LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Root endpoint so the browser shows something friendly
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body style="font-family: system-ui, sans-serif; padding: 40px; text-align: center;">
                <h1 style="color: #10b981;">✅ ExpensifyPro Backend is Running!</h1>
                <p>The file upload server is active and listening for API requests.</p>
                <p style="color: #64748b;">(You can return to the frontend at localhost:3000 to use the application)</p>
            </body>
        </html>
    `);
});

// Setup storage
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const userId = req.body.userId || 'User';
        const userName = (req.body.userName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${userId}-${userName}-${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
    }
});

const upload = multer({ storage: storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

// File upload endpoint
app.post('/api/upload', upload.single('receipt'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    const filePath = req.file.path;

    let extractedText = '';
    const mimeType = req.file.mimetype;

    // Tesseract OCR has been temporarily disabled because it causes fatal WebAssembly 
    // crashes in Node.js on certain uploads, killing the backend server.
    if (mimeType.startsWith('image/')) {
        // extractedText = '...';
    } else {
        // extractedText = '...';
    }

    res.json({
        message: 'File uploaded successfully',
        fileUrl: fileUrl,
        extractedText: extractedText
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
