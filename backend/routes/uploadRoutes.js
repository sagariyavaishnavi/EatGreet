const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');

const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/signature', protect, authorize('admin', 'super-admin'), (req, res) => {
    try {
        const timestamp = Math.round((new Date()).getTime() / 1000);
        const folder = 'eatgreet_menu';

        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: folder
        }, process.env.CLOUDINARY_API_SECRET);

        res.json({
            timestamp,
            folder,
            signature,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        });
    } catch (error) {
        console.error('Signature Generation Error:', error);
        res.status(500).json({ message: 'Could not generate upload signature' });
    }
});

router.post('/', protect, authorize('admin', 'super-admin'), upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({
            url: req.file.path,
            public_id: req.file.filename,
            format: req.file.format,
            type: req.file.mimetype
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Image upload failed' });
    }
});

module.exports = router;
