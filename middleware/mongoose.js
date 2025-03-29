const mongoose = require("mongoose");

const connectDb = (handler) => async (req, res) => {
  if (mongoose.connections[0].readyState) {
    return handler(req, res);
  }
  await mongoose.connect(process.env.DB, {  serverSelectionTimeoutMS: 30000  // Increase timeout to 30 seconds
  });
  return handler(req, res);
 
};
export default connectDb;