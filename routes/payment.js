require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cons = require("consolidate");
const router = express.Router();

router.post("/payment/orders", async (req, res) => {
    // console.log("payment api called");
    try {
        const instance = new Razorpay({
            key_id: process.env.RZP_KEY,
            key_secret: process.env.RZP_SECRET,
        });
           console.log(`req is ::${JSON.stringify(req.body)}`);
        const { amount } = req.body;
        // console.log(`req is ::${amount*100}`);

        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_order_" + Math.floor(Math.random() * 10000),
        };

        const order = await instance.orders.create(options);
        
        // console.log(JSON.stringify(order));
        if (!order) return res.status(500).send("Some error occured");
        order.rzrpay_key=process.env.RZP_KEY;
        res.send(order);
    } catch (error) {
        res.status(500).send(error);
    }
});
router.get('/orderSuccess/:orderId', async function(req, res) {
    // console.log(__dirname);
    const rzrPayInstance = new Razorpay({
        key_id: process.env.RZP_KEY,
        key_secret: process.env.RZP_SECRET,
    });
    const orderDetails=await rzrPayInstance.orders.fetch(req.params.orderId);
    const name="Santosh";
    // res.sendFile('/views/test.html', {root: __dirname })
    // res.send
    orderDetails.rzrpay_key=process.env.RZP_KEY;
    orderDetails.amount=orderDetails.amount/100;
    res.render(__dirname + '/views/orderSuccess.html', orderDetails);
    console.log(`req is ${req.params.orderId}`);
    console.log(`Order Details are ${JSON.stringify(orderDetails)}`);
    // res.json(orderDetails);
    
    
});
router.post("/payment/success", async (req, res) => {

    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        } = req.body;
        const rzrPayInstance = new Razorpay({
            key_id: process.env.RZP_KEY,
            key_secret: process.env.RZP_SECRET,
        });
        const paymentDetails=await rzrPayInstance.payments.fetch(razorpay_payment_id);
        // getting the details back from our font-end
        const {order_id}=paymentDetails;
       console.log(`payment details are ${JSON.stringify(paymentDetails)}`);
        console.log(`req body is ${JSON.stringify(req.body)}`);
        console.log(`req body is ${order_id} ${razorpay_payment_id} ${razorpay_order_id} ${razorpay_signature}`);
        // Creating our own digest
        const shasum = crypto.createHmac("sha256", process.env.RZP_SECRET);
        shasum.update(`${order_id}|${razorpay_payment_id}`);
        const generated_signature = shasum.digest("hex");
        // const generated_signature = crypto.createHash('sha256').update(order_id + "|" + razorpay_payment_id, process.env.RZP_SECRET).digest('hex');
        console.log(`in success digestt ${generated_signature}`);
        // comaparing our digest with the actual signature
        if (generated_signature !== razorpay_signature)
            return res.status(400).json({ msg: "Transaction not legit!" });

        // THE PAYMENT IS LEGIT & VERIFIED
        // TODO: save these details in the database
        // res.json({
        //     msg: "Your payment is successful",
          
        // });
        const orderDate= new Date(paymentDetails.created_at).toString();
        const htmlPayLoad={razorpay_order_id: razorpay_order_id,
            razorpay_payment_id: razorpay_payment_id,
            amount:paymentDetails.currency+" "+ paymentDetails.amount/100,
            orderDate:orderDate,
            transactionId:paymentDetails.acquirer_data.rrn
        }
        res.render(__dirname + '/views/success.html', htmlPayLoad);
    } catch (error) {
        res.status(500).send(error);
    }
});
module.exports = router;