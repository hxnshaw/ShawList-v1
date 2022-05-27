const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const auth = require("../middleware/auth");

router.post("/products", auth, async (req, res) => {
  //const product = new Product(req.body);
  const product = new Product({
    ...req.body,
    seller: req.user._id,
  });
  try {
    await product.save();
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    // res.status(400).json({ success: false, message: "An error occurred" });
    res.status(400).send({ error: error.message });
  }
});

//GET/products?sold=true
//GET/products?limit=10&skip=20
//GET/products?sortBy=createdAt:desc
router.get("/products", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.sold) {
    match.sold = req.query.sold === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user.populate({
      path: "products",
      match,
      options: {
        limit: parseInt(req.query.limit) || 10,
        skip: parseInt(req.query.skip) || 0,
        sort,
      },
    });
    res.status(200).json({
      success: true,
      Number_Of_Products: req.user.products.length,
      data: req.user.products,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get("/products/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const product = await Product.findOne({ _id, seller: req.user._id });

    if (!product) {
      res.status(404).json({ success: false, error: "Product Not Found." });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).send();
  }
});

router.patch("/products/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "description", "sold", "price"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({
      success: false,
      error: "Invalid update attempted.",
    });
  }

  try {
    // const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // }); This bypasses whatever we set up and runs operations dierctly on the database.

    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id,
    });

    if (!product) {
      res.status(404).json({ success: false, error: "Product Not Found." });
    }

    updates.forEach((update) => (product[update] = req.body[update]));
    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
});

router.delete("/products/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete({
      _id: req.params.id,
      seller: req.user._id,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product Not Found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;
