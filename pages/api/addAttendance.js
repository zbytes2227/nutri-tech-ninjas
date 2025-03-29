import Cards from "@/model/Cards";
import connectDb from "../../middleware/mongoose";
import Attendance from "@/model/Attendance";

const formatDate = (date) => {
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZone: 'Asia/Kolkata', // Set the time zone to India Standard Time
  });
};

const sendMail = async (type_,time_,data_) => {
  const fetch_api = await fetch(process.env.SHEETS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TYPE: type_,
      TIME: time_,
      DATA: data_
    }),
  });

  const data = await fetch_api;
}

const handler = async (req, res) => {
  if (req.method === "POST") {
    try {
      // Get the 'id' parameter from the request query
   

      // Check if id is provided
      if (!req.body.cardID) {
        return res.status(400).json({ success: false, msg: "Missing 'id' parameter" });
      }

      // Find the card details by cardID
      const reqCard = await Cards.findOne({ cardID: req.body.cardID });

      // Check if the card is found
      if (!reqCard) {
        return res.status(200).json({ success: false, msg: "UnAuthorised Card", status: 109 });
      }


        // Check if the card has already logged in on the same day
  const existingAttendance = await Attendance.findOne({
    cardID: req.body.cardID,
    Login: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) },
  });

  if (existingAttendance) {
    // Card has already logged in on the same day, update Logout time
    existingAttendance.Logout = new Date();
    try {
      const updatedAttendance = await existingAttendance.save();
      const formattedLogoutTime = formatDate(existingAttendance.Logout);
      // send a mail
      sendMail("Logout",formattedLogoutTime,reqCard)
      // Handle success, send response, etc.
      return res.status(200).json({ success: true, msg: ("Logout : "+formattedLogoutTime), data: reqCard });
    } catch (error) {
      // Handle error, send appropriate response
      console.error("Error updating attendance:", error);
      return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
  } else {
    // Card is logging in for the first time on the same day, create new attendance record
    const newAttendance = new Attendance({
      cardID: req.body.cardID,
      Login: new Date(),
      // Logout: You can set Logout if needed, depending on your logic
    });

    // Save the new attendance record to the database
    try {
      const savedAttendance = await newAttendance.save();
      // Handle success, send response, etc.
      const formattedLoginTime = formatDate(newAttendance.Login);

      sendMail("Login",formattedLoginTime,reqCard)
      return res.status(200).json({ success: true, msg: ("Login : "+formattedLoginTime), data: reqCard });
    } catch (error) {
      // Handle error, send appropriate response
      console.error("Error saving attendance:", error);
      return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
  }

      // return res.json({ success: true, card_details: reqCard, status: 105 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: "Server error...." });
    }
  }
};

export default connectDb(handler);
