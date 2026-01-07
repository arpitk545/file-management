//const FileRegion = require('../models/file');

const {CreateFile,FileRegion} =require('../models/file');
const User =require("../models/auth")
const{uploadImageToCloudinary,uploadFileToCloudinary,deleteImageFromCloudinary, deleteFileFromCloudinary, } =require('../config/cloudinary');
const fs = require('fs');
const os = require('os');
const path = require('path');

exports.createFileRegions = async (req, res) => {
  try {
   
    const regionsData = req.body;

    if (!Array.isArray(regionsData) || regionsData.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty region data.' });
    }

    const validRegions = regionsData.filter(region =>
      region.name && Array.isArray(region.category1)
    );

    if (validRegions.length === 0) {
      return res.status(400).json({ error: 'No valid region entries found.' });
    }

    const insertedRegions = await FileRegion.insertMany(validRegions, { ordered: false });

    return res.status(201).json({
      message: 'Regions created successfully.',
      count: insertedRegions.length,
      data: insertedRegions
    });

  } catch (error) {
    console.error('Error creating regions:', error);

    if (error.name === 'ValidationError' || error.name === 'BulkWriteError') {
      return res.status(400).json({
        error: 'Some regions failed validation.',
        details: error.message
      });
    }

    return res.status(500).json({ error: 'Server error while creating regions.' });
  }
};

// Get all regions and their categories
exports.getAllFileRegions = async (req, res) => {
  try {
    const regions = await FileRegion.find();
    res.status(200).json({ data: regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Server error while fetching regions.' });
  }
};

// Update region by name
exports.updateFileRegionByName = async (req, res) => {
  const { name } = req.params;

  // Clone the request body and remove _id to avoid immutable field update error
  const updateData = { ...req.body };
  delete updateData._id;

  try {
    const updatedRegion = await FileRegion.findOneAndUpdate(
      { name },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRegion) {
      return res.status(404).json({ error: `Region with name '${name}' not found.` });
    }

    res.status(200).json({ message: 'Region updated successfully.', data: updatedRegion });
  } catch (error) {
    console.error('Error updating region:', error);
    res.status(500).json({ error: 'Server error while updating region.' });
  }
};

// Delete region by name
exports.deleteFileRegionByName = async (req, res) => {
  const { name } = req.params;

  try {
    const deletedRegion = await FileRegion.findOneAndDelete({ name });

    if (!deletedRegion) {
      return res.status(404).json({ error: `Region with name '${name}' not found.` });
    }

    res.status(200).json({ message: 'Region deleted successfully.', data: deletedRegion });
  } catch (error) {
    console.error('Error deleting region:', error);
    res.status(500).json({ error: 'Server error while deleting region.' });
  }
};

//create file
exports.createFile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      region,
      category1,
      category2,
      category3,
      category4,
      category5,
      fileCreatorName,
      fileType,
      fileTitle,
      fileDescription,
      uploadMethod,
      externalLink,
      tags,
      showCommentBox,
      addYears,
      academicYear,
      additionalYears,
      additionalAcademicYears,
      role,
    } = req.body

   // Upload file
let fileUrl = "";
let fileName = "";

if (uploadMethod === "file"){
const fileFiles = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
const file = fileFiles[0];

if (!file || !file.tempFilePath) {
  return res.status(400).json({ success: false, message: "File is missing or invalid" });
}



try {
  const uploadResult = await uploadFileToCloudinary(file.tempFilePath, "files", file.name);
  fileUrl = uploadResult.url;
  fileName = uploadResult.fileName;
} catch (error) {
  console.error("File upload failed:", error);
} finally {
  fs.unlinkSync(file.tempFilePath);
}
}else if (uploadMethod === "link") {
  fileUrl = externalLink;
  const parts = externalLink.trim().split('/');
  fileName = parts[parts.length - 1] || externalLink; 
}

    // Upload image (optional)
   const imageUrl = [];
   if (req.files?.image) {
  const imageFiles = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

  for (const file of imageFiles) {
    try {
      const uploadedUrl = await uploadImageToCloudinary(file.tempFilePath, 'articles/images');
      if (uploadedUrl) imageUrl.push(uploadedUrl);
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      fs.unlinkSync(file.tempFilePath);
    }
  }
}

    const newFile = await CreateFile.create({
       user: userId,
      region,
      category1,
      category2,
      category3,
      category4,
      category5,
      fileCreatorName,
      fileType,
      fileTitle,
      fileDescription,
      uploadMethod,
      externalLink,
      fileUrl,
      imageUrl,
      fileName,
      tags: JSON.parse(tags || "[]"),
      showCommentBox,
      addYears,
      academicYear,
      additionalYears: JSON.parse(additionalYears || "[]"),
      additionalAcademicYears: JSON.parse(additionalAcademicYears || "[]"),
      role,
    })

    res.status(201).json({
      success: true,
      message: "File created successfully",
      data: newFile,
    })
  } catch (error) {
    console.error("Error creating file:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// Get all files
exports.getAllFiles = async (req, res) => {
  try {
    const files = await CreateFile.find().sort({ createdAt: -1 }); 
    
    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getUserFiles = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userFiles = await CreateFile.find({ user: userId });

    res.status(200).json({
      success: true,
      data: userFiles,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.deleteByFileTitle = async (req, res) => {
  try {
    const { fileTitle } = req.params;

    // Fetch all matching files
    const files = await CreateFile.find({ fileTitle });

    if (!files.length) {
      return res.status(404).json({ success: false, message: "No file found with this title" });
    }

    for (const file of files) {
      // Delete the main file from Cloudinary (resource_type: 'raw')
      if (file.uploadMethod === 'file' && file.fileUrl) {
        const filePublicId = getCloudinaryPublicId(file.fileUrl);
        if (filePublicId) {
          try {
            await cloudinary.uploader.destroy(filePublicId, {
              invalidate: true,
              resource_type: "raw", // for files like pdf, doc, etc.
            });
          } catch (err) {
            console.error(`Failed to delete file from Cloudinary: ${filePublicId}`, err.message);
          }
        }
      }

      // Delete all images from Cloudinary (resource_type: 'image')
      if (Array.isArray(file.imageUrl)) {
        for (const imgUrl of file.imageUrl) {
          const imagePublicId = getCloudinaryPublicId(imgUrl);
          if (imagePublicId) {
            try {
              await cloudinary.uploader.destroy(imagePublicId, {
                invalidate: true,
                resource_type: "image",
              });
            } catch (err) {
              console.error(`Failed to delete image from Cloudinary: ${imagePublicId}`, err.message);
            }
          }
        }
      }
    }

    // Delete files from MongoDB
    await CreateFile.deleteMany({ fileTitle });

    res.status(200).json({ success: true, message: `Deleted ${files.length} file(s) with title "${fileTitle}"` });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get file by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await CreateFile.findById(id);

    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    res.status(200).json({
      success: true,
      message: "File fetched successfully",
      file,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingFile = await CreateFile.findById(id);
    if (!existingFile) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Parse JSON fields
    if (typeof updateData.tags === "string") {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (err) {
        console.error("Invalid tags JSON");
      }
    }

    if (typeof updateData.additionalYears === "string") {
      try {
        updateData.additionalYears = JSON.parse(updateData.additionalYears);
      } catch (err) {
        updateData.additionalYears = [];
      }
    }

    if (typeof updateData.additionalAcademicYears === "string") {
      try {
        updateData.additionalAcademicYears = JSON.parse(updateData.additionalAcademicYears);
      } catch (err) {
        updateData.additionalAcademicYears = [];
      }
    }

    // === Handle file update ===
    if (req.files?.file) {
      const fileFiles = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
      const newFile = fileFiles[0];

      if (newFile?.tempFilePath) {
        // Delete old file from Cloudinary
        if (existingFile.fileName) {
          await deleteFileFromCloudinary(existingFile.fileName);
        }

        // Upload new file
        const uploadResult = await uploadFileToCloudinary(newFile.tempFilePath, "files", newFile.name);
        updateData.fileUrl = uploadResult.url;
        updateData.fileName = uploadResult.fileName;

        fs.unlinkSync(newFile.tempFilePath); // clean up temp file
      }
    }

    // === Handle image update ===
    if (req.files?.image) {
      const newImageFiles = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

      // Delete old images from Cloudinary
      for (const oldUrl of existingFile.imageUrl || []) {
        const publicId = getCloudinaryPublicId(oldUrl);
        if (publicId) {
          await deleteImageFromCloudinary(publicId);
        }
      }

      // Upload new images
      const newImageUrls = [];
      for (const imageFile of newImageFiles) {
        if (imageFile?.tempFilePath) {
          const uploadedUrl = await uploadImageToCloudinary(imageFile.tempFilePath, 'articles/images');
          if (uploadedUrl) newImageUrls.push(uploadedUrl);
          fs.unlinkSync(imageFile.tempFilePath);
        }
      }

      updateData.imageUrl = newImageUrls;
    }

    // === Proceed with Update ===
    const updatedFile = await CreateFile.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: "File updated successfully",
      data: updatedFile,
    });

  } catch (error) {
    console.error("Error updating file:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// === Helper ===
function getCloudinaryPublicId(url) {
  try {
    const parts = url.split('/');
    const fileWithExt = parts.pop().split('.')[0]; 
    const folder = parts.slice(-2).join('/'); 
    return `${folder}/${fileWithExt}`;
  } catch {
    return null;
  }
}


// Delete file by ID
exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the file first
    const file = await CreateFile.findById(id);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Delete the main file from Cloudinary (resource_type: 'raw')
    if (file.uploadMethod === 'file' && file.fileUrl) {
      const filePublicId = getCloudinaryPublicId(file.fileUrl);
      if (filePublicId) {
        try {
          await cloudinary.uploader.destroy(filePublicId, {
            invalidate: true,
            resource_type: "raw",
          });
        } catch (err) {
          console.error(`Failed to delete file from Cloudinary: ${filePublicId}`, err.message);
        }
      }
    }

    // Delete all images from Cloudinary (resource_type: 'image')
    if (Array.isArray(file.imageUrl)) {
      for (const imgUrl of file.imageUrl) {
        const imagePublicId = getCloudinaryPublicId(imgUrl);
        if (imagePublicId) {
          try {
            await cloudinary.uploader.destroy(imagePublicId, {
              invalidate: true,
              resource_type: "image",
            });
          } catch (err) {
            console.error(`Failed to delete image from Cloudinary: ${imagePublicId}`, err.message);
          }
        }
      }
    }

    // Delete from MongoDB
    await CreateFile.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update file status by ID
exports.updateFileStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate input
    const allowedStatuses = ["Waiting for Approval", "Approved File", "Rejected File"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Find and update
    const updatedFile = await CreateFile.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "File status updated successfully",
      data: updatedFile,
    });
  } catch (error) {
    console.error("Error updating file status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}