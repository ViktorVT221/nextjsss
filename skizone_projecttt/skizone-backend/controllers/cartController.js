const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання кошика', error });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (quantity <= 0) return res.status(400).json({ message: 'Кількість має бути додатньою' });
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
    }
    const index = cart.items.findIndex(item => item.product.toString() === productId);
    if (index >= 0) {
      cart.items[index].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    res.json({ message: 'Товар додано до кошика', cart });
  } catch (error) {
    res.status(500).json({ message: 'Помилка додавання до кошика', error });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Кошик не знайдено' });
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    res.json({ message: 'Товар видалено з кошика', cart });
  } catch (error) {
    res.status(500).json({ message: 'Помилка видалення товару з кошика', error });
  }
};
