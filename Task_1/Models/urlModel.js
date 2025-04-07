import mongoose from "mongoose";
import { type } from "os";

//URL model
const UrlsSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },

  originalUrl: {
    type: String,
    required: true,
    allowNull: false,
  },
});

const Url = mongoose.model("Url", UrlsSchema);
export default Url;
