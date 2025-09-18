const isLoggedIn = (req , res , next)=>{
    if(!req.session.userId){
        return res.send("You need to be logged in to do that")
    }
     next();
}
module.exports = {isLoggedIn}
