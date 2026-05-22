const Outfit = require('../models/Outfit');

exports.getOutfits = async (req, res) => {
  try {
    const { gender, season, minPrice, maxPrice, category, search, tags } = req.query;
    
    let query = {};
    
    if (gender && gender !== 'All') query.gender = gender;
    if (season && season !== 'All') query.season = season;
    if (category && category !== 'All') {
      const categoriesArray = category.split(',').map(c => c.trim());
      query.category = { $in: categoriesArray };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Tag matching (for "image upload" mock recommendation)
    if (tags) {
      const tagsArray = tags.split(',').map(t => t.trim());
      query.tags = { $in: tagsArray };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Outfit.countDocuments(query);
    const outfits = await Outfit.find(query).skip(skip).limit(limit);
    
    // Return object containing outfits and pagination data
    res.json({
      outfits,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.create(req.body);
    res.status(201).json(outfit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getOutfitById = async (req, res) => {
  try {
    const outfit = await Outfit.findById(req.params.id);
    if (outfit) {
      res.json(outfit);
    } else {
      res.status(404).json({ message: 'Outfit not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
