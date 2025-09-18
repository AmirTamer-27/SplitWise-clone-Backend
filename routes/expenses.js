const express = require('express');
const router = express.Router({mergeParams : true});
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { splitExpenses, getSettlements, getNetBalances, minimumTransactions } = require('../utils.js');
const { isLoggedIn } = require('../middleware.js');
const { v4: uuidv4 } = require('uuid');

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const { Gid } = req.params;
    const group = await prisma.group.findUnique({
      where: { id: Gid },
      include: { members: true, expenses:{
        include : {
          expenseSplits : true
        }
      } }
    });
    if (!group) return res.status(404).send("Group not found");

    const member = group.members.find(m => m.id === req.session.userId);
    if (!member) return res.status(403).send("You don't have access to this group");

    res.send(group.expenses);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get('/:Eid', isLoggedIn, async (req, res) => {
  try {
    const { Gid, Eid } = req.params;
    const group = await prisma.group.findUnique({
      where: { id: Gid },
      include: { members: true, expenses: {
        include : {
          expenseSplits: true
        }
      }, user : true }
    });
    if (!group) return res.status(404).send("Group not found");

    const expense = group.expenses.find(exp => exp.id === Eid);
    if (!expense) return res.status(404).send("Expense not found");

    res.send(expense);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.post('/', isLoggedIn, async (req, res) => {
  try {
    console.log("meh")
    const { Gid } = req.params;
    const { splitType, splits, totalAmount, EpaidBy, Edescription } = req.body;
    if (!splitType || !splits || !totalAmount || !EpaidBy || !Edescription) return res.status(400).send("Missing required fields");

    const expenseSplits = splitExpenses(totalAmount, splitType, splits);
    if (!expenseSplits) return res.status(400).send("Invalid split type");

    await prisma.expense.create({
      data: {
        id: uuidv4(),
        description: Edescription,
        amount: totalAmount,
        date: new Date(),
        user: { connect: { id: EpaidBy } },
        group: { connect: { id: Gid } },
        expenseSplits: {
          create: expenseSplits.map(split => ({
            id: uuidv4(),
            amountOwed: split.amount,
            user: { connect: { id: split.userId } }
          }))
        }
      }
    });
    res.send("Expense created successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.delete('/:Eid', isLoggedIn, async (req, res) => {
  try {
    const { Eid } = req.params;
    const expense = await prisma.expense.findUnique({ where: { id: Eid } });
    if (!expense) return res.status(404).send("Expense not found");

    if (expense.userId !== req.session.userId) return res.status(403).send("You can only delete your own expenses.");

    await prisma.expense.delete({ where: { id: Eid } });
    res.send("Expense deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
