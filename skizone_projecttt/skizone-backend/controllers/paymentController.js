const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body; // очікуємо суму в доларах
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // перетворення в центи
      currency: 'usd'
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: 'Помилка створення платіжного наміру', error });
  }
};
