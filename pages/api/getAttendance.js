import Cards from "@/model/Cards";
import connectDb from "../../middleware/mongoose";
import Attendance from "@/model/Attendance";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
       
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
