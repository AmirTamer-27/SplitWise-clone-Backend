const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:5173', 'http://localhost:8080'],
  credentials: true
}));
const session = require('express-session');
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();



const authRouter = require('./routes/auth.js')
const expensesRouter = require('./routes/expenses.js')
const groupRouter = require('./routes/group.js')
const paymentsRouter = require('./routes/payments.js')
const settlemnetsRouter = require('./routes/settlement.js')
const userRoutes = require('./routes/user.js')

//MiddleWare
app.use(session({
  secret: 'notagoodsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax' // Use 'lax' in lowercase
  }
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}))

//Routes
app.use('/' , authRouter)
app.use('/me' , userRoutes)
app.use('/groups' , groupRouter)
app.use('/groups/:Gid/expenses' , expensesRouter)
app.use('/groups/:Gid' , settlemnetsRouter)
app.use('/group/:Gid' , paymentsRouter)

app.get('/users' , async (req , res)=>{
    const users = await prisma.user.findMany()
    res.send(users)
})
app.get('/users/:Uid' , async (req , res)=>{
  const {Uid}  = req.params
  const user = await prisma.user.findUnique({
    where : {
      id : Uid
    }
  })
  return user
})
app.listen(3000 , ()=>{
    console.log("Listening on port 3000");
})