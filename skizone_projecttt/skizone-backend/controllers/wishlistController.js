const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Отримати список бажань користувача
exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.userId }).populate('products');

        // Якщо список бажань не існує, створюємо новий
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user.userId,
                products: []
            });
        }

        // Повертаємо тільки товари
        res.json(wishlist.products);
    } catch (error) {
        console.error('Помилка при отриманні списку бажань:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

// Додати товар до списку бажань
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Перевіряємо, чи існує товар
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не знайдено' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user.userId });

        // Якщо список бажань не існує, створюємо новий
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user.userId,
                products: [productId]
            });
        } else {
            // Перевіряємо, чи товар вже є в списку
            if (wishlist.products.includes(productId)) {
                return res.status(400).json({ message: 'Товар вже є в списку бажань' });
            }

            // Додаємо товар до списку
            wishlist.products.push(productId);
            await wishlist.save();
        }

        res.json({ message: 'Товар додано до списку бажань' });
    } catch (error) {
        console.error('Помилка при додаванні до списку бажань:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

// Видалити товар зі списку бажань
exports.removeFromWishlist = async (req, res) => {
    try {
        const productId = req.params.productId;

        const wishlist = await Wishlist.findOne({ user: req.user.userId });
        if (!wishlist) {
            return res.status(404).json({ message: 'Список бажань не знайдено' });
        }

        // Видаляємо товар зі списку
        wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
        await wishlist.save();

        res.json({ message: 'Товар видалено зі списку бажань' });
    } catch (error) {
        console.error('Помилка при видаленні зі списку бажань:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

// Очистити весь список бажань
exports.clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.userId });
        if (!wishlist) {
            return res.status(404).json({ message: 'Список бажань не знайдено' });
        }

        wishlist.products = [];
        await wishlist.save();

        res.json({ message: 'Список бажань очищено' });
    } catch (error) {
        console.error('Помилка при очищенні списку бажань:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};
