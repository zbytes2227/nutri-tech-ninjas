
import Cards from "@/model/Cards";
import connectDb from "../../middleware/mongoose";
import argon2 from "argon2"; 
import jwt from "jsonwebtoken";
import { serialize } from 'cookie';

const handler = async (req, res) => {
  if (req.method == "POST") {
    try {
      console.log(req.body);
      const hashedPassword = await argon2.hash(req.body.password);
      const newCard = new Cards({
        cardID: req.body.cardID,
        name: req.body.name,
        password: hashedPassword,
      });

      await newCard.save();
      console.log("okay");
      return res.status(200).json({ success: true, msg: "New Card Added Successfuly..", newcard: newCard});
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, msg: "Server error..Contact the Developers." });
    }
  }
};

export default connectDb(handler);