const express = require("express");
const router = express.Router();
const{createAboutUs,getAboutUs,updateAboutUs} = require("../controllers/Pages/AboutUs");
const{createContactUs,getContactUs,updateContactUs,submitContactForm,getContactMessages,deleteContactByEmail} = require("../controllers/Pages/contactUs");
const{getDisclaimer,updateDisclaimer,createDisclaimer} = require("../controllers/Pages/disclaimer");
const {getPrivacyPolicy,createPrivacyPolicy,updatePrivacyPolicy} = require("../controllers/Pages/privacyPolicy");
const { authenticate } = require("../middleware/auth");

router.post("/create-about-us", authenticate, createAboutUs);
router.get("/get-about-us", getAboutUs);
router.put("/update-about-us", authenticate, updateAboutUs);

//contact us routes
router.post("/create-contact-us", authenticate, createContactUs);
router.get("/get-contact-us", getContactUs);
router.put("/update-contact-us", authenticate, updateContactUs);
router.post("/submit-contact-form", submitContactForm);
router.get("/get-contact-messages", authenticate, getContactMessages);
router.delete("/delete-contact-by-email/:email", authenticate, deleteContactByEmail);

//disclaimer routes
router.get("/get-disclaimer", getDisclaimer);
router.put("/update-disclaimer", authenticate, updateDisclaimer);
router.post("/create-disclaimer", authenticate, createDisclaimer);

//privacy policy routes
router.get("/get-privacy-policy", getPrivacyPolicy);
router.post("/create-privacy-policy", authenticate, createPrivacyPolicy);
router.put("/update-privacy-policy", authenticate, updatePrivacyPolicy);

module.exports = router;