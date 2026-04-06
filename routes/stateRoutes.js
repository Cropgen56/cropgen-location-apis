const express = require("express");
const { getStatesByCountry } = require("../controllers/stateController");

const router = express.Router();

router.get("/:countryCode", getStatesByCountry);

module.exports = router;
