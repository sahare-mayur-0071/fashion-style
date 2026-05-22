require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Outfit = require('./models/Outfit');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion_stylist';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const CSV_FILE_PATH = path.join(__dirname, '../archive/data.csv');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected for Seeding');
    importData();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

function determineGender(name, category) {
  const combined = `${name} ${category}`.toLowerCase();
  if (combined.includes('men') && !combined.includes('women')) return 'Men';
  if (combined.includes('boy')) return 'Men';
  if (combined.includes('women') || combined.includes('girl')) return 'Women';
  return 'Unisex';
}

function determineSeason(name, category, desc) {
  const combined = `${name} ${category} ${desc}`.toLowerCase();
  if (combined.includes('winter') || combined.includes('jacket') || combined.includes('sweater') || combined.includes('wool')) return 'Winter';
  if (combined.includes('summer') || combined.includes('shorts') || combined.includes('swim')) return 'Summer';
  if (combined.includes('rain')) return 'Rainy';
  return 'All';
}

async function importData() {
  console.log('Clearing existing outfits...');
  await Outfit.deleteMany({});
  
  const results = [];
  console.log('Reading CSV file...');
  
  fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on('data', (data) => {
      // CSV has columns: image, description, display name, category
      const title = data['display name'] || data['category'] || 'Fashion Item';
      const category = data['category'] || 'General';
      const description = data['description'] || 'No description available.';
      const image = `${BACKEND_URL}/dataset/${data['image']}`;
      
      const gender = determineGender(title, category);
      const season = determineSeason(title, category, description);
      
      const price = Math.floor(Math.random() * 4500) + 500; // 500 to 5000
      const stock = Math.floor(Math.random() * 51) + 10; // 10 to 60
      
      const tags = [];
      const titleWords = title.split(' ').map(w => w.trim()).filter(w => w.length > 3);
      if (titleWords.length > 0) tags.push(...titleWords.slice(0, 5));
      tags.push(category);
      
      results.push({
        title,
        gender,
        season,
        price,
        category,
        image,
        description,
        stock,
        tags
      });
    })
    .on('end', async () => {
      console.log(`Parsed ${results.length} rows from CSV.`);
      console.log('Inserting into database in batches of 1000...');
      
      const BATCH_SIZE = 1000;
      let insertedCount = 0;
      
      for (let i = 0; i < results.length; i += BATCH_SIZE) {
        const batch = results.slice(i, i + BATCH_SIZE);
        try {
          await Outfit.insertMany(batch);
          insertedCount += batch.length;
          console.log(`Inserted ${insertedCount} / ${results.length}`);
        } catch (err) {
          console.error(`Error inserting batch ${i}:`, err.message);
        }
      }
      
      console.log('Import complete!');
      process.exit(0);
    });
}
