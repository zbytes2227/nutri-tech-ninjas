import Cards from "@/model/Cards";
import connectDb from "../../middleware/mongoose";
import Attendance from "@/model/Attendance";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      
      const cookies = parse(req.headers.cookie || "");
      const token = cookies.admin_access_token;
      let decoded = await jwt.verify(token, process.env.TOKEN_ADMIN);
      if (!decoded._id==process.env.ADMIN_PASSWORD) {
        return res
          .status(403)
          .json({ success: false, errors: "Unable to Authenticate" });
      }
      // Fetch all attendance records
      const allAttendance = await Attendance.find({}, { cardID: 1, Login: 1, Logout: 1, _id: 0 });
      return res.json({ success: true, allAttendanceLogs :  allAttendance});
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: "Server error...." });
    }
  }
};
export default connectDb(handler);
