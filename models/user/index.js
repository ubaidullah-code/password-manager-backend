import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

    username:{
        type: String,
        required : true,
    },
    email : {
        type : String,
        required: true,
        unique: true,
    },
    password : {
        type : String,
        required : true,
    },
     createTime: {
    type: Date,
    default: Date.now, // auto-sets creation date
  },
}
)

export const User = mongoose.model("user", UserSchema);