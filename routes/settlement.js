const express = require('express');
const router = express.Router({mergeParams : true});
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const { splitExpenses, getSettlements, getNetBalances, minimumTransactions } = require('../utils.js');

router.get('/settlelments', async (req, res) => {
  try {
    const { Gid } = req.params;
    const group = await prisma.group.findUnique({
      where: { id: Gid },
      include: { expenses: { include: { expenseSplits: true } } }
    });
    if (!group) return res.send("Invalid group");

    const settlements = getSettlements(group.expenses);
    if (!settlements) return res.send("Error calculating settlements");

    res.send(settlements);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get('/settle', async (req, res) => {
  try {
    const { Gid } = req.params;
    const group = await prisma.group.findUnique({
      where: { id: Gid },
      include: { expenses: { include: { expenseSplits: true } } }
    });
    if (!group) return res.send("Invalid group");

    const settlements = getSettlements(group.expenses);
    const netBalances = getNetBalances(settlements);
    const transactions = minimumTransactions(netBalances);
    res.send(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
