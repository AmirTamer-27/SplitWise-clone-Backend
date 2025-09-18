const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { isLoggedIn } = require('../middleware.js');
const { v4: uuidv4 } = require('uuid');

router.post('/', isLoggedIn, async (req, res) => {
  try {
    const { from, to, amount, note } = req.body;
    if (!from || !to || !amount) return res.status(400).send("Missing required fields");

    const payment = await prisma.payment.create({
      data: {
        id: uuidv4(),
        amount,
        note: note || "",
        date: new Date(),
        fromUser: { connect: { id: from } },
        toUser: { connect: { id: to } }
      }
    });
    res.send("Payment recorded successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get('/:Uid', isLoggedIn, async (req, res) => {
  try {
    const { Uid } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Uid },
      include: { paymentsMade: true, paymentsReceived: true }
    });
    if (!user) return res.status(404).send("User not found");

    res.send({
      paymentsMade: user.paymentsMade,
      paymentsReceived: user.paymentsReceived
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
