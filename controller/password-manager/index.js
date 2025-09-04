import { PasswordEntry } from "../../models/passwordManager/index.js";
import crypto from "crypto";

const SECRET_KEY = process.env.SECRET_KEY || "checkmysecret";
const ENCRYPTION_KEY = crypto.scryptSync(SECRET_KEY, "salt", 32); // 32-byte key
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}


function decrypt(text) {
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}





export const passwordStore = async (req, res) => {
  let { sitename, password, notes, url } = req.body;
  let { userId, username } = req.user;


  
  if (!sitename || !password || !notes || !url) {
    return res.status(400).send({ message: "Required parameter is missing" });
  }

  
  try {
    const encryptedPassword = encrypt(password);
    console.log("encryptedPassword", encryptedPassword)
    const add_new_one = new PasswordEntry({
      userId: userId, // better naming than just "id"
      username: username,
      serviceName: sitename.trim(),
      password: encryptedPassword,
      notes: notes.trim(),
      siteUrl: url.trim(),
    });

    await add_new_one.save();

    res.status(201).send({ success: true, message: "Successfully Added" });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};



export const passwordGet = async (req, res) => {
  try {
    const userId = req.user.userId;
    const entries = await PasswordEntry.find({ userId })
   

    if (!entries || entries.length === 0) {
      return res.status(404).json({ success: false, message: "No passwords found" });
    }
  
    // decrypt each entry
    const result = entries.map(entry => ({
      id: entry._id,
      serviceName: entry.serviceName,
      username: entry.username,
      password: decrypt(entry.password), // 🔓 decrypt here
      siteUrl: entry.siteUrl,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

export const passwordDelete = async (req ,res) =>{
   
  const { id } = req.body;
  if(!id) return res.status(400).send({success : false , message : "Required perameter is missing"});

  try {
    
    const response = await PasswordEntry.findByIdAndDelete(id)

    res.status(201).send({success: true , message: "Successfully Delete "});
  } catch (error) {
    console.log("error" , error) 
   res.status(500).send({success : false , message : "Internal Server Error"});
  }
}

export const passwordEdit = async (req, res) => {
  let { serviceName, password, notes, siteUrl, id } = req.body;
  
  let { userId, username } = req.user;
     
  if (!serviceName || !password || !notes || !siteUrl || !id) {
    return res.status(400).send({ message: "Required parameter is missing" });
  }

  try {
    const encryptedPassword = encrypt(password);

    const updatedEntry = await PasswordEntry.findByIdAndUpdate(
      id,
      {
        userId,
        username,
        serviceName: serviceName.trim(),
        password: encryptedPassword,
        notes: notes.trim(),
        siteUrl: siteUrl.trim(),
      },
      { new: true } // returns the updated doc
    );

    if (!updatedEntry) {
      return res.status(404).send({ success: false, message: "Entry not found" });
    }

    res.status(200).send({ success: true, message: "Successfully Updated", data: updatedEntry });
  } catch (error) {
    console.log("error", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};
