import mongoose from "mongoose";

const PasswordManagerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // link to User model
    required: true,
  },
  serviceName: {
    type: String,
    required: true, // e.g. "Google", "Facebook"
  },
  username: {
    type: String,
    required: true, // the account username/email
    trim : true
  },
  password: {
    type: String,
    required: true, // should be encrypted/hashed before saving
    trim : true
  },
  siteUrl:{
    type: String,
    
  },
  notes: {
    type: String,
    default: "", // optional field for extra notes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export model
export const PasswordEntry = mongoose.model("PasswordEntry", PasswordManagerSchema);
