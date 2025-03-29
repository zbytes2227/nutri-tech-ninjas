import connectDb from "@/middleware/mongoose";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { serialize } from "cookie";
import Cards from "@/model/Cards";

const handler = async (req, res) => {
  if (req.method == "GET") {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.parent_access_token;

    try {
      console.log(token);
      
      let decoded = await jwt.verify(token, process.env.TOKEN_ADMIN);

      let userFound = await Cards.findOne({ cardID: decoded._id });
    
 
      if (!userFound) {
        return res.status(400).json({ success: false, msg: "User Not Found" });
      }else{
        return res.status(200).json({ success: true, msg: "User Found", user: userFound});
      } 
    } catch (err) {
      // Handle token verification errors
      return res.status(400).json({ success: false, msg: "User Invalid 2" , er: err});
    }
  }
};

export default connectDb(handler);