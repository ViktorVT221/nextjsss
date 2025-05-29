const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: { $regex: regex } },
        { description: { $regex: regex } }
      ];
    }
    if (category) {
      filter.category = category;
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання товарів', error });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // Тільки адміністратор може створювати товари
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостатньо прав доступу' });
    }

    const { name, description, price, category } = req.body;
    const numericPrice = Number(price);
    if (numericPrice < 0) {
      return res.status(400).json({ message: 'Ціна не може бути від’ємною' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = req.file.path;
    }

    const newProduct = new Product({
      name,
      description,
      price: numericPrice,
      category,
      imagePath
    });

    await newProduct.save();
    res.status(201).json({ message: 'Товар створено', product: newProduct });
  } catch (error) {
    console.error('Помилка створення товару:', error);
    res.status(500).json({ message: 'Не вдалося зберегти товар', error });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не знайдено' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Лише адміністратор може оновлювати товари
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостатньо прав доступу' });
    }

    const { name, description, price, category } = req.body;
    const numericPrice = Number(price);
    if (numericPrice < 0) {
      return res.status(400).json({ message: 'Ціна не може бути від’ємною' });
    }

    let updateFields = {
      name,
      description,
      price: numericPrice,
      category
    };

    if (req.file) {
      updateFields.imagePath = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Товар не знайдено' });
    }
    res.json({ message: 'Товар оновлено', product: updatedProduct });
  } catch (error) {
    console.error('Помилка оновлення товару:', error);
    res.status(500).json({ message: 'Не вдалося оновити товар', error });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    // Лише адміністратор може видаляти товари
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостатньо прав доступу' });
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Товар не знайдено' });
    }
    res.json({ message: 'Товар видалено' });
  } catch (error) {
    console.error('Помилка видалення товару:', error);
    res.status(500).json({ message: 'Не вдалося видалити товар', error });
  }
};

