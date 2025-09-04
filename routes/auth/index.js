import express from 'express'
import { loginUser, logoutUser, middleware, registerUser } from '../../controller/auth/index.js'

const authRouter = express.Router()


authRouter.post('/register', registerUser );
authRouter.post('/login',  loginUser);
authRouter.post('/logout' , logoutUser);

authRouter.post("/check-auth", middleware, (req, res) => {
  const { userId, username, email } = req.user; // decoded JWT payload
  res.status(200).send({
    success: true,
    message: "Authenticated access granted",
    user: { userId, username, email }, // clean user object
  });
});



export default authRouter;