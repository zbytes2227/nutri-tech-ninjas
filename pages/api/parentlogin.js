import argon2 from "argon2";
import connectDb from "@/middleware/mongoose";
import jwt from "jsonwebtoken";
import { serialize } from 'cookie';
import Cards from "@/model/Cards";

const handler = async (req, res) => {
    if (req.method === 'POST') {
        try {
            // Check if password and cardID are provided
            if (req.body.password && req.body.cardID) {
                // Await the result of findOne() with the correct filter
                const oldUser = await Cards.findOne({ cardID: req.body.cardID });


                // If user is not found
                if (!oldUser) {
                    return res.json({ success: false, msg: "Card Not Found" });
                }


                // Verify the password
                const isMatch = await argon2.verify(oldUser.password, req.body.password);
                if (!isMatch) {
                    return res.json({ success: false, msg: "Wrong Credentials" });
                }


                // Generate JWT token
                const token = jwt.sign({ _id: req.body.cardID }, process.env.TOKEN_ADMIN, { expiresIn: "12h" });

                // Set the cookie with the token
                return res.setHeader('Set-Cookie', serialize('parent_access_token', token, {
                    httpOnly: true,
                    sameSite: "strict",
                    secure: true,
                    path: '/',
                })).json({ success: true, msg: "Login Successful" });

            } else {
                // Missing password or cardID in the request body
                return res.json({ success: false, msg: "Missing Credentials" });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, msg: "Internal Server Error" });
        }
    } else {
        // Handle unsupported methods (e.g., GET, PUT)
        return res.status(405).json({ success: false, msg: "Method Not Allowed" });
    }
};

export default connectDb(handler);
