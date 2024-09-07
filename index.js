require('dotenv').config();
const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const app = express()

// serve static files (css, js) from public directory
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Home route
app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.post('/checkout', async (req, res) => {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'product'
                    },
                    unit_amount: 49.99 * 100
                },
                quantity: 1
            }
        ],
        mode: 'payment',
        shipping_address_collection: {
            allowed_countries: ['US', 'PL']
        },
        success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/cancel`
    });

    res.redirect(session.url)
});

// send message after successful payment
app.get('/complete', async (req, res) => {
    // returns the payment details and purchased items to customer
    const result = Promise.all([
        stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] }),
        stripe.checkout.sessions.listLineItems(req.query.session_id)
    ])

    console.log(JSON.stringify(await result))
    res.send('Your payment was successful')
})

// send message after cancelling payment
app.get('/cancel', (req, res) => {
    res.redirect('/')
})

app.listen(3000, () => console.log('server started on port 3000:'))