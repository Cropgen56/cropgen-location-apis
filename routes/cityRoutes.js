const express = require("express");
const {
  searchCities,
  getAllCitiesPaginated,
} = require("../controllers/cityController");

const router = express.Router();

router.get("/all", getAllCitiesPaginated);
router.get("/", searchCities);

module.exports = router;
