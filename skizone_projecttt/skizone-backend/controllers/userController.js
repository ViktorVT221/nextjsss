const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  try {
    const { login, password } = req.body;
    const existing = await User.findOne({ login });
    if (existing) return res.status(400).json({ message: 'Користувач із таким логіном вже існує' });
    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = new User({ login, password: hashedPass });
    await newUser.save();
    res.status(201).json({ message: 'Користувача створено' });
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    res.status(500).json({ message: 'Помилка реєстрації', error });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ login });
    if (!user) return res.status(401).json({ message: 'Невірний логін або пароль' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Невірний логін або пароль' });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Успішний вхід', token, user: { role: user.role } });
  } catch (error) {
    console.error('Помилка логіну:', error);
    res.status(500).json({ message: 'Помилка логіну', error });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json({ login: user.login });
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання профілю', error });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    if (login) user.login = login;
    if (password) {
      const hashedPass = await bcrypt.hash(password, 10);
      user.password = hashedPass;
    }
    await user.save();
    res.json({ message: 'Дані оновлено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка оновлення даних', error });
  }
};
