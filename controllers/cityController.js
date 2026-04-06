const City = require("../models/City");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchCities = async (req, res, next) => {
  try {
    const stateCode = (req.query.state || "").trim().toUpperCase();
    const queryText = (req.query.q || "").trim();
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 20)
        : 20;

    if (!stateCode || !/^[A-Z0-9]{1,10}$/.test(stateCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid state query parameter.",
      });
    }

    if (!queryText || queryText.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Query parameter q is required.",
      });
    }

    const regex = new RegExp(escapeRegex(queryText), "i");
    const cities = await City.find({
      state_code: stateCode,
      name: { $regex: regex },
    })
      .sort({ name: 1 })
      .limit(limit)
      .select("name state_code country_code latitude longitude -_id")
      .lean();

    return res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    return next(error);
  }
};

const getAllCitiesPaginated = async (req, res, next) => {
  try {
    const stateCode = (req.query.state || "").trim().toUpperCase();
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page =
      Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 100;

    if (!stateCode || !/^[A-Z0-9]{1,10}$/.test(stateCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid state query parameter.",
      });
    }

    const filter = { state_code: stateCode };
    const skip = (page - 1) * limit;

    const [cities, total] = await Promise.all([
      City.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .select("name state_code country_code latitude longitude -_id")
        .lean(),
      City.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: cities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  searchCities,
  getAllCitiesPaginated,
};
