const Region = require('../models/regions');
//create Articles 
const Article = require('../models/articles');
const {  uploadImageToCloudinary, deleteImageFromCloudinary } = require('../config/cloudinary');
const fs = require('fs');


// Create Region with multiple categories and subcategories
exports.createRegionWithStructure = async (req, res) => {
  const { name, category } = req.body;

  if (!name || !Array.isArray(category)) {
    return res.status(400).json({ error: 'Region name and categories array are required.' });
  }

  try {
    const region = new Region({
      name,
      category: category.map(category => ({
        name: category.name,
        subCategory: (category.subCategory || []).map(sub => ({ name: sub }))
      }))
    });

    await region.save();
    res.status(201).json({ message: 'Region created successfully', region });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create region structure.' });
  }
};


exports.updateRegionByName = async (req, res) => {
  const { name: oldName } = req.params; // old name from URL
  const { name: newName, category } = req.body; // new name (optional), category array

  if (!oldName || !Array.isArray(category)) {
    return res.status(400).json({ error: 'Old region name and categories array are required.' });
  }

  try {
    const sanitizedCategory = category.map(cat => ({
      name: cat.name,
      subCategory: (cat.subCategory || []).map(sub => {
        return typeof sub === 'string' ? { name: sub } :
               typeof sub === 'object' && sub.name ? { name: sub.name } :
               { name: String(sub) }; // fallback
      })
    }));

    const updateData = {
      category: sanitizedCategory
    };

    // Only update name if a new name is provided and is different
    if (newName && newName.trim() !== '' && newName !== oldName) {
      updateData.name = newName;
    }

    const updatedRegion = await Region.findOneAndUpdate(
      { name: oldName },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRegion) {
      return res.status(404).json({ error: 'Region not found.' });
    }

    res.status(200).json({ 
      message: 'Region updated successfully', 
      region: updatedRegion,
      nameChanged: !!newName && newName !== oldName // Indicate if name was changed
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update region structure.', details: error.message });
  }
};

//delete the region with multiple categories and subcategories
exports.deleteRegionByName = async (req, res) => {
  const { name } = req.params;

  try {
    const deletedRegion = await Region.findOneAndDelete({ name });

    if (!deletedRegion) {
      return res.status(404).json({ error: 'Region not found.' });
    }

    res.status(200).json({ message: 'Details deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete region.' });
  }
};

//Get the Articles 
exports.getAllRegionsWithStructure = async (req, res) => {
  try {
    const regions = await Region.find();

    res.status(200).json({
      message: 'Regions fetched successfully',
      regions,
    });
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const {
      region,
      category,
      subCategory,
      title,
      tags,
      content,
      status,
      commentsEnabled,      
      date     
    } = req.body;
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    const thumbnail = req.files?.thumbnail;
    const imageFiles = req.files?.images;

    // Upload thumbnail images
    const thumbnailUrls = [];
    if (thumbnail) {
      const files = Array.isArray(thumbnail) ? thumbnail : [thumbnail];
      for (let file of files) {
        const url = await uploadImageToCloudinary(file.tempFilePath, 'articles/thumbnails');
        thumbnailUrls.push(url);
        fs.unlinkSync(file.tempFilePath);
      }
    }

    // Upload additional content images
    const imageUrls = [];
    if (imageFiles) {
      const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
      for (let file of files) {
        const url = await uploadImageToCloudinary(file.tempFilePath, 'articles/images');
        imageUrls.push(url);
        fs.unlinkSync(file.tempFilePath);
      }
    }

    const newArticle = await Article.create({
      region,
      category,
      subCategory,
      title,
      thumbnail: thumbnailUrls,
      image: imageUrls,
      tags: parsedTags, 
      content,
      status: status || 'draft', 
      date: date || Date.now(),
      commentsEnabled: commentsEnabled !== undefined ? commentsEnabled : true
    });

    return res.status(201).json({ success: true, article: newArticle });
  } catch (err) {
    console.error("Error creating article:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

//get all articles
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 }); 
    res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
      error: error.message,
    });
  }
};

//get articles by id 
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({ success: true, article });
  } catch (error) {
    console.error("Error fetching article by ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//update article 

exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      region,
      category,
      subCategory,
      title,
      tags,
      content,
      status,
      commentsEnabled,
      date
    } = req.body;

    const parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;

    const thumbnail = req.files?.thumbnail;
    const imageFiles = req.files?.images;

    const updateData = {
      region,
      category,
      subCategory,
      title,
      tags: parsedTags,
      content,
      status,
      date,
      commentsEnabled
    };

    // Handle thumbnail uploads
    if (thumbnail) {
      const thumbnailUrls = [];
      const files = Array.isArray(thumbnail) ? thumbnail : [thumbnail];
      for (let file of files) {
        const url = await uploadImageToCloudinary(file.tempFilePath, 'articles/thumbnails');
        thumbnailUrls.push(url);
        fs.unlinkSync(file.tempFilePath);
      }
      updateData.thumbnail = thumbnailUrls;
    }

    // Handle image uploads
    if (imageFiles) {
      const imageUrls = [];
      const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
      for (let file of files) {
        const url = await uploadImageToCloudinary(file.tempFilePath, 'articles/images');
        imageUrls.push(url);
        fs.unlinkSync(file.tempFilePath);
      }
      updateData.image = imageUrls;
    }

    const updatedArticle = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedArticle) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article: updatedArticle
    });
  } catch (err) {
    console.error("Error updating article:", err);
    res.status(500).json({ success: false, message: "Failed to update article", error: err.message });
  }
};

//delete article by id
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedArticle = await Article.findByIdAndDelete(id);

    if (!deletedArticle) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({
      success: true,
      message: "Article deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting article:", err);
    res.status(500).json({ success: false, message: "Failed to delete article", error: err.message });
  }
};

//delete article by title
exports.deleteArticleByTitle = async (req, res) => {
  const title = req.params.title.trim();

  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }

  try {
    // Case-insensitive and ignores trailing spaces
    const deletedArticle = await Article.findOneAndDelete({
      title: { $regex: new RegExp(`^${title}\\s*$`, 'i') }
    });

    if (!deletedArticle) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Update article status controller
exports.updateArticleStatus = async (req, res) => {
  try {
    const { id } = req.params;         
    const { status } = req.body;  

    // Validate status input
    const validStatuses = ['draft', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    // Find and update the article's status
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { status },
      { new: true }  
    );

    if (!updatedArticle) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({ success: true, article: updatedArticle });
  } catch (error) {
    console.error("Error updating article status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

