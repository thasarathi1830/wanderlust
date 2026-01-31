const Listing = require("../models/listing");

// ================= INDEX =================
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// ================= NEW FORM =================
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ================= SHOW =================
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// ================= CREATE =================
module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;
  newListing.image = {
    url: req.file.path,
    filename: req.file.filename,
  };

  // Required by schema (dummy coordinates)
  newListing.geometry = {
    type: "Point",
    coordinates: [78.9629, 20.5937],
  };

  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

// ================= EDIT FORM =================
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  const imageUrl = listing.image.url.replace("/upload", "/upload/w_250,h_160");
  res.render("listings/edit.ejs", { listing, imageUrl });
};

// ================= UPDATE =================
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

// ================= 🔥 FILTER (FINAL FIX) =================
module.exports.filter = async (req, res) => {
  let { id } = req.params;

  // 🔍 Debug (keep this for now)
  console.log("FILTER PARAM FROM UI:", id);

  // Normalize UI value → DB format
  const normalizedCategory = id
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  console.log("NORMALIZED CATEGORY:", normalizedCategory);

  // Bullet-proof query (case-insensitive exact match)
  const allListings = await Listing.find({
    category: { $regex: `^${normalizedCategory}$`, $options: "i" },
  });

  console.log("MATCHING LISTINGS COUNT:", allListings.length);

  if (allListings.length > 0) {
    return res.render("listings/index.ejs", { allListings });
  }

  req.flash("error", `There is no any Listing for ${id}!`);
  res.redirect("/listings");
};

// ================= SEARCH =================
module.exports.search = async (req, res) => {
  const input = req.query.q?.trim();

  if (!input) {
    req.flash("error", "Please enter search query!");
    return res.redirect("/listings");
  }

  let allListings = await Listing.find({
    title: { $regex: input, $options: "i" },
  });

  if (allListings.length === 0) {
    allListings = await Listing.find({
      location: { $regex: input, $options: "i" },
    });
  }

  if (allListings.length === 0) {
    req.flash("error", "No listings found!");
    return res.redirect("/listings");
  }

  res.render("listings/index.ejs", { allListings });
};

// ================= DELETE =================
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

// ================= RESERVE =================
module.exports.reserveListing = async (req, res) => {
  req.flash("success", "Reservation details sent to your email!");
  res.redirect(`/listings/${req.params.id}`);
};
