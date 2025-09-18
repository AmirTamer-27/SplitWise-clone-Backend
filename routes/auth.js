const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
  try {
    const { Uemail, Upass, Uname , Uprofilepic} = req.body;
    if (!Uemail || !Upass || !Uname) return res.status(400).send("Missing required fields");

    const Uid = uuidv4();
    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(Upass, salt);
    const prof = (Uprofilepic ? Uprofilepic : "")
    const user = await prisma.user.create({
      data: { id: Uid, name: Uname, email: Uemail, password: hashedPass , profilePic : prof
        , createdAt : new Date()
      }
    });
    res.send(`Welcome ${user.name}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.post('/login', async (req, res) => {
  try {
    const { Uemail, Upass } = req.body;
    if (!Uemail || !Upass) return res.status(400).send("Missing email or password");

    const user = await prisma.user.findFirst({ where: { email: Uemail } });
    if (!user) return res.send("The email or password you entered is incorrect");

    const match = await bcrypt.compare(Upass, user.password);
    if (!match) return res.send("The email or password you entered is incorrect");

    req.session.userId = user.id;
    res.send(`Logged in successfully as ${user.name}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.post('/logout', (req, res) => {
  try {
    req.session.userId = null;
    res.send("Successfully logged out");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
