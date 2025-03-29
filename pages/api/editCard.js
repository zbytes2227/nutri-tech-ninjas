import Cards from "@/model/Cards";
import connectDb from "../../middleware/mongoose";

const handler = async (req, res) => {
    if (req.method === "POST") {
        try {
            // Check if the request body contains the required fields
            if (!req.body.cardid || !req.body.name || !req.body.class || !req.body.contact || !req.body.email) {
                return res.status(400).json({ success: false, msg: "Missing required fields in the request body." });
            }

            const { cardid, name, class: cardClass, contact, email } = req.body;

            const forbiddenSymbols = /[^a-zA-Z0-9\s\-()]/;

            if (forbiddenSymbols.test(name) || forbiddenSymbols.test(cardClass) || forbiddenSymbols.test(contact)) {
                return res.status(400).json({ success: false, msg: "Details should not contain symbols except '-' and '()'." });
            }
            // Find the card in the database based on the provided cardid
            const foundCard = await Cards.findOne({ cardID: cardid });

            if (!foundCard) {
                return res.status(404).json({ success: false, msg: "Card not found." });
            }

            // Update the details of the found card
            foundCard.name = name;
            foundCard.class = cardClass;
            foundCard.contact = contact;
            foundCard.email = email;


            // Save the updated card to the database
            await foundCard.save();

            // Return the updated details of the card as a JSON response
            return res.status(200).json({ success: true, card: foundCard, msg: "Details Updated Sucessfully" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, msg: "Server error. Contact the Developers." });
        }
    }
};

export default connectDb(handler);
