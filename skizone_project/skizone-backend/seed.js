require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Product = require('./models/Product');

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('> Підключено до MongoDB для сидування (SkiZone)');

    await Product.deleteMany({});
    await User.deleteMany({});

    const sampleProducts = [
      {
        name: 'Ski Jacket',
        description: 'Високоякісна лижна куртка для захисту від холоду.',
        price: 120,
        category: 'outerwear',
        imagePath: ''
      },
      {
        name: 'Ski Pants',
        description: 'Теплі лижні штани з водонепроникного матеріалу.',
        price: 90,
        category: 'outerwear',
        imagePath: ''
      },
      {
        name: 'Ski Goggles',
        description: 'Антифог лижні окуляри з високою захисною здатністю.',
        price: 70,
        category: 'accessories',
        imagePath: ''
      },
      {
        name: 'Ski Poles',
        description: 'Легкі лижні палиці для кращої стабільності на схилах.',
        price: 50,
        category: 'accessories',
        imagePath: ''
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log('> Тестові товари для лижнього спорядження додано');

    const hashedPass = await bcrypt.hash('admin1234', 10);
    const adminUser = new User({
      login: 'adminUser',
      password: hashedPass,
      role: 'admin'
    });
    await adminUser.save();
    console.log('> Адмін: login=adminUser, pass=admin1234');

    process.exit();
  } catch (error) {
    console.error('Помилка seed:', error);
    process.exit(1);
  }
}

seedDB();
