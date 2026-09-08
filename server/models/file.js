const mongoose = require('mongoose');

const Category5Schema = new mongoose.Schema({
  name: { type: String, required: true }
}, { _id: false });

const Category4Schema = new mongoose.Schema({
  name: { type: String, required: true },
  category5: [Category5Schema]
}, { _id: false });

const Category3Schema = new mongoose.Schema({
  name: { type: String, required: true },
  category4: [Category4Schema]
}, { _id: false });

const Category2Schema = new mongoose.Schema({
  name: { type: String, required: true },
  category3: [Category3Schema]
}, { _id: false });

const Category1Schema = new mongoose.Schema({
  name: { type: String, required: true },
  category2: [Category2Schema]
}, { _id: false });

const RegionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category1: [Category1Schema]
}, { timestamps: true });



//create file 
const fileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  region: String,
  category1: String,
  category2: String,
  category3: String,
  category4: String,
  category5: String,
  fileCreatorName: String,
  fileType: String,
  fileTitle: String,
  fileDescription: String,
  uploadMethod: { type: String, enum: ["file", "link"] },
  externalLink: String,
  //file:{type:String},
  fileUrl: String, // if file is uploaded
  fileName: {
  type: String,
  required: function () {
    return this.uploadMethod === 'file';
  },
  trim: true,
},

  image:{type:String},
  imageUrl:{type:[String],default:[]},
  tags: [String],
  showCommentBox:{ type: Boolean, default: true },
  addYears: { type: String, enum: ["none", "year", "academic"], default: "none" },
  academicYear: String,
  additionalYears: [String],
  additionalAcademicYears: [String],
  status: {
  type: String,
  enum: ['Waiting for Approval', 'Approved File', 'Rejected File'],
  default: 'Waiting for Approval',
},
role:{type:String},
}, { timestamps: true }
);

const CreateFile = mongoose.model('CreateFile', fileSchema);
const FileRegion = mongoose.model('FileRegion', RegionSchema);

module.exports = {
  CreateFile,
  FileRegion,
};