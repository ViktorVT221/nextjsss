const Order = require('../models/Order');
const Cart = require('../models/Cart');

exports.getMyOrders = async (req, res) => {
  try {
    // Знаходимо всі замовлення поточного користувача, сортуємо за датою і популюємо інформацію про товари
    const orders = await Order.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання замовлень', error });
  }
};

exports.createOrder = async (req, res) => {
  try {
    // Отримуємо кошик користувача та популюємо дані товарів
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Кошик порожній' });
    }
    // Обчислюємо загальну суму замовлення
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + (item.product.price || 0) * item.quantity,
      0
    );
    // Створюємо замовлення
    const order = new Order({
      user: req.user.userId,
      items: cart.items,
      totalAmount,
      status: 'Processing'
    });
    await order.save();
    // Очищаємо кошик
    cart.items = [];
    await cart.save();
    res.status(201).json({ message: 'Замовлення оформлено', order });
  } catch (error) {
    res.status(500).json({ message: 'Помилка створення замовлення', error });
  }
};
