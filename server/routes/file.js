const express = require('express');
const router = express.Router();
const upload =require("../config/multer")

const { createFileRegions,getAllFileRegions,updateFileRegionByName,deleteFileRegionByName,
createFile,getAllFiles,updateFileStatusById,deleteByFileTitle,updateById,deleteById,getById,
getUserFiles, 
} = require('../controllers/file');
const { authenticate } =require('../middleware/auth');

router.post('/create-file-region', createFileRegions);
router.get('/get-all-region',getAllFileRegions);
router.put('/update-details/:name',updateFileRegionByName);
router.delete("/delete-details/:name",deleteFileRegionByName);

router.post('/create-file',authenticate,createFile);
router.get('/get-all-file',getAllFiles);
router.get('/get-user-file',authenticate,getUserFiles)
router.delete('/title/:fileTitle',deleteByFileTitle)
router.patch("/update-status/:id", updateFileStatusById);
router.get("/get-file/:id",getById);
router.patch("/update/:id",updateById);
router.delete("/delete/:id",deleteById);

module.exports = router;