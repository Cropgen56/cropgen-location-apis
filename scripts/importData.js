require("dotenv").config();

const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");
const Country = require("../models/Country");
const State = require("../models/State");
const City = require("../models/City");

const JSON_FILE_NAME = "countries+states+cities.json";
const JSON_CANDIDATE_PATHS = [
  path.join(__dirname, "..", JSON_FILE_NAME),
  path.join(__dirname, JSON_FILE_NAME),
];

const toUpperSafe = (value) => String(value || "").trim().toUpperCase();

const readJsonFile = () => {
  const jsonPath = JSON_CANDIDATE_PATHS.find((candidatePath) =>
    fs.existsSync(candidatePath)
  );

  if (!jsonPath) {
    throw new Error(
      `JSON source file not found. Checked: ${JSON_CANDIDATE_PATHS.join(", ")}`
    );
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Expected top-level JSON array of countries.");
  }
  return parsed;
};

const buildBulkOperations = (countriesInput) => {
  const countryMap = new Map();
  const stateMap = new Map();
  const cityMap = new Map();

  for (const countryItem of countriesInput) {
    const countryCode = toUpperSafe(countryItem.iso2 || countryItem.country_code);
    const countryName = String(countryItem.name || "").trim();
    if (!countryCode || !countryName) continue;

    countryMap.set(countryCode, {
      name: countryName,
      iso2: countryCode,
    });

    const states = Array.isArray(countryItem.states) ? countryItem.states : [];
    for (const stateItem of states) {
      const stateCode = toUpperSafe(stateItem.state_code || stateItem.iso2 || stateItem.code);
      const stateName = String(stateItem.name || "").trim();
      if (!stateCode || !stateName) continue;

      const stateKey = `${countryCode}::${stateCode}`;
      stateMap.set(stateKey, {
        name: stateName,
        state_code: stateCode,
        country_code: countryCode,
      });

      const cities = Array.isArray(stateItem.cities) ? stateItem.cities : [];
      for (const cityItem of cities) {
        const cityName = String(cityItem.name || "").trim();
        if (!cityName) continue;

        const cityKey = `${countryCode}::${stateCode}::${cityName.toLowerCase()}`;
        cityMap.set(cityKey, {
          name: cityName,
          state_code: stateCode,
          country_code: countryCode,
          latitude: String(cityItem.latitude || ""),
          longitude: String(cityItem.longitude || ""),
        });
      }
    }
  }

  const countryOps = Array.from(countryMap.values()).map((country) => ({
    updateOne: {
      filter: { iso2: country.iso2 },
      update: { $set: country },
      upsert: true,
    },
  }));

  const stateOps = Array.from(stateMap.values()).map((state) => ({
    updateOne: {
      filter: { country_code: state.country_code, state_code: state.state_code },
      update: { $set: state },
      upsert: true,
    },
  }));

  const cityOps = Array.from(cityMap.values()).map((city) => ({
    updateOne: {
      filter: {
        country_code: city.country_code,
        state_code: city.state_code,
        name: city.name,
      },
      update: { $set: city },
      upsert: true,
    },
  }));

  return { countryOps, stateOps, cityOps };
};

const run = async () => {
  try {
    await connectDB();
    const countriesInput = readJsonFile();
    const { countryOps, stateOps, cityOps } = buildBulkOperations(countriesInput);

    if (countryOps.length) {
      await Country.bulkWrite(countryOps, { ordered: false });
    }
    if (stateOps.length) {
      await State.bulkWrite(stateOps, { ordered: false });
    }
    if (cityOps.length) {
      await City.bulkWrite(cityOps, { ordered: false });
    }

    console.log(`Countries upserted: ${countryOps.length}`);
    console.log(`States upserted: ${stateOps.length}`);
    console.log(`Cities upserted: ${cityOps.length}`);
    process.exit(0);
  } catch (error) {
    console.error("Import failed:", error.message);
    process.exit(1);
  }
};

run();
