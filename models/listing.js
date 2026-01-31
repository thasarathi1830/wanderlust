const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
  },

  image: {
    filename: String,
    url: {
      type: String,
      required: true,
    },
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  location: {
    type: String,
    required: true,
  },

  country: {
    type: String,
    required: true,
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },

  // ✅ ENUM FIX — MATCHES YOUR DATA
  category: {
    type: String,
    enum: [
      "rooms",
      "iconic-cities",
      "trending",
      "mountains",
      "castles",
      "amazing-pools",
      "camping",
      "farm",
      "arctic",
      "beach",
      "boat",
      "ski-in-out",
      "apartment",

      // 🔥 additional categories from your dataset
      "historical-homes",
      "bed-and-breakfasts",
      "countryside",
      "cabins",
      "lake",
      "new",
      "woodlands",
      "campsite",
    ],
    required: true,
  },
});

// delete reviews when listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);
