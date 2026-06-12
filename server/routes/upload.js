const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
};

const upload = multer({
  storage,
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

router.post('/', upload.single('image'), (req, res) => {
  // Simulate AI visual recognition by extracting keywords from the filename
  let dynamicTags = ['Casual', 'Trendy']; // Base tags
  
  if (req.file && req.file.originalname) {
    const filename = req.file.originalname.toLowerCase();
    
    // Simple mock "AI" keyword extraction based on common clothing terms
    const keywords = ['shirt', 't-shirt', 'jeans', 'dress', 'jacket', 'coat', 'blue', 'red', 'black', 'white', 'green', 'summer', 'winter', 'formal', 'casual', 'cotton', 'denim', 'leather', 'sneakers', 'shoes', 'boots', 'saree', 'kurta'];
    
    const matchedKeywords = keywords.filter(kw => filename.includes(kw));
    
    if (matchedKeywords.length > 0) {
      dynamicTags = [...new Set([...dynamicTags, ...matchedKeywords])];
    }
  }

  res.send({ 
    message: 'Image processed successfully by AI', 
    imagePath: `/${req.file.path.replace(/\\/g, '/')}`,
    tags: dynamicTags,
    searchQuery: dynamicTags.join(' ')
  });
});

module.exports = router;
