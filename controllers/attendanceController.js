import moment from "moment";
import attendanceModel from "../models/attendanceModel.js";
import Admin from "../models/adminModel.js";


const getUserObjectId = async (userId) => {
  const user = await Admin.findOne({ userId });
  if (!user) throw new Error("User not found");
  return user._id;
};

// GET: Status for today
const getStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const objectId = await getUserObjectId(userId);
    const date = moment().format("YYYY-MM-DD");

    const attendance = await attendanceModel.findOne({ userId: objectId, date });

    res.json({
      timeIn: attendance?.timeIn ? moment(attendance.timeIn, "HH:mm:ss").format("hh:mm A") : null,
      timeOut: attendance?.timeOut ? moment(attendance.timeOut, "HH:mm:ss").format("hh:mm A") : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance status" });
  }
};

// POST: Time In
const markTimeIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const objectId = await getUserObjectId(userId);
    const timeIn = moment().utcOffset("+05:30").format("HH:mm:ss");
    const date = moment().utcOffset("+05:30").format("YYYY-MM-DD");

    let record = await attendanceModel.findOne({ userId: objectId, date });

    if (!record) {
      record = new attendanceModel({ userId: objectId, date, timeIn });
    } else if (!record.timeIn) {
      record.timeIn = timeIn;
    } else {
      return res.status(400).json({ message: "Already clocked in." });
    }

    await record.save();

    res.json({
      message: "Time In saved",
      timeIn: moment(timeIn, "HH:mm:ss").format("hh:mm A"),
      date,
    });
  } catch (err) {
    console.error("Error in markTimeIn:", err);
    res.status(500).json({ error: "Time In failed" });
  }
};

// POST: Time Out
const markTimeOut = async (req, res) => {
  try {
    const { userId } = req.body;
    const objectId = await getUserObjectId(userId);
    const timeOut = moment().utcOffset("+05:30").format("HH:mm:ss");
    const date = moment().utcOffset("+05:30").format("YYYY-MM-DD");

    const record = await attendanceModel.findOne({ userId: objectId, date });

    if (!record) {
      return res.status(404).json({ message: "No Time In found." });
    }

    if (record.timeOut) {
      return res.status(400).json({ message: "Already clocked out." });
    }

    record.timeOut = timeOut;
    await record.save();

    res.json({
      message: "Time Out saved",
      timeOut: moment(timeOut, "HH:mm:ss").format("hh:mm A"),
      date,
    });
  } catch (err) {
    console.error("Error in markTimeOut:", err);
    res.status(500).json({ error: "Time Out failed" });
  }
};

// GET: All Attendance Records
const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = {};

    if (date) filter.date = date;

    const records = await attendanceModel
      .find(filter)
      .populate("userId", "name userId")
      .sort({ date: -1 });

    const formatted = records.map((r) => ({
      ...r._doc,
      timeIn: r.timeIn ? moment(r.timeIn, "HH:mm:ss").format("hh:mm A") : null,
      timeOut: r.timeOut ? moment(r.timeOut, "HH:mm:ss").format("hh:mm A") : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error in getAllAttendance:", err);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
};

export { getStatus, markTimeIn, markTimeOut, getAllAttendance };
