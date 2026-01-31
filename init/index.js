require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

// ================== DB CONNECTION ==================
const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error("❌ ATLASDB_URL missing in .env");
  process.exit(1);
}

mongoose
  .connect(dbUrl)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ================== INIT DATABASE ==================
const initDB = async () => {
  try {
    // 🔥 clear old data completely
    await Listing.deleteMany({});
    console.log("🗑️ Old listings deleted");

    const cleanedData = initData.data.map((obj) => ({
      title: obj.title,
      description: obj.description,
      price: obj.price,
      location: obj.location,
      country: obj.country,

      // ✅ normalize category ONCE
      category: obj.category
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-"),

      image: obj.image,

      owner: "66567b03fda820235197b582", // existing user

      geometry: {
        type: "Point",
        coordinates: obj.geometry.coordinates,
      },
    }));

    await Listing.insertMany(cleanedData);
    console.log("✅ Database initialized successfully");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error initializing DB:", err);
    mongoose.connection.close();
  }
};

initDB();
