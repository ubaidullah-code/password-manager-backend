import bcrypt from "bcrypt"
import { User } from "../../models/user/index.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const SECRET = process.env.SECRET_TOKEN

// REGISTER
export const registerUser = async (req, res) => {
  let { username, email, password } = req.body

  if (!username || !password || !email) {
    return res.status(400).send({ success: false, message: "Required parameter is missing" })
  }

  try {
    email = email.toLowerCase()
    const existUser = await User.findOne({ email })
    if (existUser) {
      return res.status(400).send({ success: false, message: "User already exists with this email" })
    }

    const hash = bcrypt.hashSync(password, 10)
    const newUser = new User({ username, email, password: hash })
    const savedUser = await newUser.save()

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: savedUser,
    })
  } catch (error) {
    console.log("error", error)
    res.status(500).send({ success: false, message: "Internal server error" })
  }
}

// LOGIN
export const loginUser = async (req, res) => {
  let { email, password } = req.body

  if (!email || !password) {
    return res.status(400).send({ success: false, message: "Required parameter is missing" })
  }

  try {
    email = email.toLowerCase()
    const existUser = await User.findOne({ email })
    if (!existUser) {
      return res.status(400).send({ success: false, message: "User does not exist with this email" })
    }

    const isPasswordValid = await bcrypt.compare(password, existUser.password)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Password is incorrect" })
    }

    const payload = { userId: existUser._id, email: existUser.email, username: existUser.username }
    const token = jwt.sign(payload, SECRET, { expiresIn: "1d" })

    res.cookie("Token", token, {
      httpOnly: true,
      maxAge: 86400000,
       // 1 day
         httpOnly: true,
      secure: true,        // since Vercel serves HTTPS
      sameSite: "None",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: payload,
      token, // send it back too (optional if you only want cookie auth)
    })
  } catch (error) {
    console.log("error", error)
    res.status(500).send({ success: false, message: "Internal server error" })
  }
}

// LOGOUT
export const logoutUser = (req, res) => {
  try {
    res.clearCookie("Token",{
  httpOnly: true,
  secure: true,
  sameSite: "None",
})
    
    .send({
      success: true,
      message: "Logout successfully",
    })
  } catch (error) {
    console.log("error", error)
    res.status(500).send({ success: false, message: "Internal server error" })
  }
}

// MIDDLEWARE
export const middleware = (req, res, next) => {
  const token = req.cookies?.Token
  if (!token) {
    return res.status(401).send({ success: false, message: "Unauthorized access" })
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ success: false, message: "Invalid or expired token" })
    }
    req.user = decoded
    next()
  })
}
