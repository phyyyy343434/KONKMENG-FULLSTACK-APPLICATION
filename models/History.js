const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: false },
    tech: { type: String, required: true, trim: true },
    result: { type: String, required: true, trim: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("History", HistorySchema);

