const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const { isLoggedIn } = require('../middleware.js');
const { v4: uuidv4 } = require('uuid');

router.post('/', isLoggedIn, async (req, res) => {
  try {
    const { Gname, Gdescription, Gmembers } = req.body;
    if (!Gname|| !Gmembers) return res.status(400).send("Missing required fields");
    const des = (Gdescription? Gdescription : "")
    await prisma.group.create({
      data: {
        id: uuidv4(),
        name: Gname,
        description: des,
        user: { connect: { id: req.session.userId } },
        members: { connect: Gmembers.map(id => ({ id })) },
        createdAt : new Date()
      }
    });
    res.send("Group created successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get('/', isLoggedIn, async (req, res) => {
  try {
   const groups = await prisma.group.findMany({
  where: {
    members: {
      some: {
        id: req.session.userId
      }
    }
  },
  include: {
    members: true,
    expenses: {
      include: {
        expenseSplits: true
      }
    }
  }
});
    res.send(groups);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.get('/:Gid', isLoggedIn, async (req, res) => {
  try {
    const { Gid } = req.params;
    const group = await prisma.group.findUnique({
      where: { id: Gid },
      include: { members: true, expenses: { include: { expenseSplits: true } } }
    });
    if (!group) return res.send("There is no group with that ID");
    res.send(group);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.put('/:Gid', isLoggedIn, async (req, res) => {
  try {
    const { Gid } = req.params;
    const { Gname, Gdescription, Gmembers } = req.body;

    const group = await prisma.group.findUnique({ where: { id: Gid } });
    if (!group) return res.send("This group doesn't exist");
    if (group.creatorId !== req.session.userId) return res.send("You don't have access to this group");

    await prisma.group.update({
      where: { id: Gid },
      data: {
        name: Gname,
        description: Gdescription,
        members: { set: Gmembers.map(id => ({ id })) }
      }
    });
    res.send("Group data updated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.delete('/:Gid', isLoggedIn, async (req, res) => {
  try {
    const { Gid } = req.params;
    const group = await prisma.group.findUnique({ where: { id: Gid } });
    if (!group) return res.send("This group doesn't exist");
    if (group.creatorId !== req.session.userId) return res.send("You don't have access to this group");

    await prisma.group.delete({ where: { id: Gid } });
    res.send("Group deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;