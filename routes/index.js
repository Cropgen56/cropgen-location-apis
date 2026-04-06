const express = require("express");
const countryRoutes = require("./countryRoutes");
const stateRoutes = require("./stateRoutes");
const cityRoutes = require("./cityRoutes");

const router = express.Router();

router.use("/countries", countryRoutes);
router.use("/states", stateRoutes);
router.use("/cities", cityRoutes);

module.exports = router;
