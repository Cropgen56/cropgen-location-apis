const State = require("../models/State");

const getStatesByCountry = async (req, res, next) => {
  try {
    const countryCode = (req.params.countryCode || "").trim().toUpperCase();
    if (!countryCode || !/^[A-Z0-9]{2,3}$/.test(countryCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid countryCode parameter.",
      });
    }

    const states = await State.find({ country_code: countryCode })
      .sort({ name: 1 })
      .select("name state_code country_code -_id")
      .lean();

    return res.status(200).json({
      success: true,
      data: states,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getStatesByCountry,
};
