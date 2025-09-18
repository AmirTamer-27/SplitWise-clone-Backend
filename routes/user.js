const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { isLoggedIn } = require('../middleware.js');
const bcrypt = require('bcrypt');

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.put('/', isLoggedIn, async (req, res) => {
  try {
    const { Uname, Uemail, Upassword } = req.body;
    if (!Uname || !Uemail || !Upassword) return res.status(400).send("Missing required fields");

    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(Upassword, salt);

    await prisma.user.update({
      where: { id: req.session.userId },
      data: { name: Uname, email: Uemail, password: hashedPass }
    });
    res.send("Data updated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.delete('/', isLoggedIn, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.session.userId } });
    req.session.userId = null;
    res.send("User has been deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
