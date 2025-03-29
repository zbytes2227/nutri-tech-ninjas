
import Cards from "@/model/Cards";
import connectDb from "../../middleware/mongoose";


const handler = async (req, res) => {
  if (req.method == "POST") {
    try {
      console.log(req.body);
      const newCard = new Cards({
        cardID: req.body.cardID,
        name: req.body.name,
      });

      await newCard.save();
      console.log("okay");
      return res.status(200).json({ success: true, msg: "New Card Added Successfuly..", name: req.body.name});
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, msg: "Server error..Contact the Developers." });
    }
  }
};

export default connectDb(handler);