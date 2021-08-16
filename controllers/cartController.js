const Cart = require("../models/cartModel");
const catchAsync = require("../utils/catchAsync");
const { getMany, deleteOne } = require("./handleFactory");

exports.updateCartItem = catchAsync(async (req, res, _next) => {
  const { productId, name, price, query } = req.body;
  const { id: userId } = req.user;

  let cart = await Cart.findOne({ userId });

  if (cart) {
    //cart exists for user
    let itemIndex = cart.products.findIndex((p) => p.productId == productId);

    const productItemExists = itemIndex > -1;

    if (productItemExists) {
      let productItem = cart.products[itemIndex];

      if (query === "delete") {
        // Delete Item
        cart.products.splice(itemIndex, 1);
      } else if (query === "increase") {
        // Increase quantity
        productItem.quantity = +productItem.quantity + 1;
        cart.products[itemIndex] = productItem;
      } else if (query === "decrease") {
        // Decrease quantity
        productItem.quantity = +productItem.quantity - 1;
        cart.products[itemIndex] = productItem;
      }
    } else {
      //product does not exists in cart, add new item
      cart.products.push({ productId, quantity: 1, name, price });
    }

    cart = await cart.save();
    return res.status(201).json({
      status: "success",
      data: { cart },
    });
  } else {
    //no cart for user, create new cart
    const newCart = await Cart.create({
      userId,
      products: [{ productId, quantity: 1, name, price }],
    });

    return res.status(201).json({
      status: "success",
      data: { cart: newCart },
    });
  }
});

exports.beforeGetCart = catchAsync(async (req, _res, next) => {
  req.filterOptions = {
    userId: req.user.id,
  };

  next();
});
exports.getCart = getMany(Cart, "cart");

exports.beforeDeleteCart = catchAsync(async (req, _res, next) => {
  req.filterOptions = { userId: req.user.id };

  next();
});
exports.deleteCart = deleteOne(Cart, "cart");
