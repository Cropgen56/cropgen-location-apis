const Country = require("../models/Country");

const cache = {
  countries: null,
  expiresAt: 0,
};

const CACHE_TTL_MS = 10 * 60 * 1000;

const getCountries = async (req, res, next) => {
  try {
    const now = Date.now();
    if (cache.countries && cache.expiresAt > now) {
      return res.status(200).json({
        success: true,
        data: cache.countries,
      });
    }

    const countries = await Country.find({})
      .sort({ name: 1 })
      .select("name iso2 -_id")
      .lean();

    cache.countries = countries;
    cache.expiresAt = now + CACHE_TTL_MS;

    return res.status(200).json({
      success: true,
      data: countries,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCountries,
};
