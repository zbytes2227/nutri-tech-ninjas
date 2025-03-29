import Cards from "@/model/Cards";
import connectDb from "../../middleware/mongoose";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

const handler = async (req, res) => {
  if (req.method === "POST") {
    try {
      // Check if the request body contains the 'cardid' field
      if (!req.body.cardid) {
        return res.status(400).json({ success: false, msg: "Missing 'cardid' in the request body." });
      }

      const cardid = req.body.cardid;

      // Find the card in the database based on the provided cardid
      const foundCard = await Cards.findOne({ cardID: cardid });

      if (!foundCard) {
        return res.status(404).json({ success: false, msg: "Card not found." });
      }

      // Return the details of the found card as a JSON response
      return res.status(200).json({ success: true, card: foundCard });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "Server error. Contact the Developers." });
    }
  } else if (req.method === "GET") {
    try {

      const cookies = parse(req.headers.cookie || "");
      const token = cookies.admin_access_token;
      let decoded = await jwt.verify(token, process.env.TOKEN_ADMIN);
      if (!decoded._id == process.env.ADMIN_PASSWORD) {
        return res
          .status(403)
          .json({ success: false, errors: "Unable to Authenticate" });
      }
      
      const { search } = req.query; // Access the search query parameter

      // Build the query object based on the search parameter
      let query = {};
      if (search) {
        // Example: Search in name, class, cardID, contact, and email fields
        query = {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { class: { $regex: search, $options: "i" } },
            { cardID: { $regex: search, $options: "i" } },
            { contact: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        };
      }

      // Find all cards in the database based on the query
      const allCards = await Cards.find(query, { name: 1, class: 1, cardID: 1, contact: 1, email: 1, _id: 0 }); // Query to select only specific fields


      // const allCards = await Cards.find({}, { name: 1, class: 1, cardID: 1, contact: 1, email: 1,_id: 0 }); // Query to select only specific fields

      // Return the found cards as a JSON response
      return res.status(200).json({ success: true, cards: allCards });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "Server error. Contact the Developers." });
    }
  }
};

export default connectDb(handler);
