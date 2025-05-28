require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.post('/refund-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).send({ error: 'Payment Intent ID is required' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    res
      .status(200)
      .send({ success: true, message: 'Refund successful', refund });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/payment-sheet', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    const customer = await stripe.customers.create();

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2025-04-30.basil' }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    console.error('Error in /payment-sheet:', error);
    res.status(500).json({
      error: 'An error occurred while processing the payment',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
