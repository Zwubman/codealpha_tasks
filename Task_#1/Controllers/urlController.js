import mongoose from "mongoose";
import Url from "../Models/urlModel.js";
import { nanoid } from "nanoid";
import { URL } from "url";
import validUrl from "valid-url";

// shorten the original url
export const shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL is required" });
    }

    let existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(200).json({
        shortUrl: `${req.protocol}://${req.get("host")}/${existingUrl.shortId}`,
      });
    }

    // Generate a unique short ID
    const shortId = nanoid(6); 

    
    const newUrl = new Url({ shortId, originalUrl });
    await newUrl.save();

    res
      .status(201)
      .json({ shortUrl: `${req.protocol}://${req.get("host")}/${shortId}` });
  } catch (error) {
    console.error("Error shortening URL:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//User custom the original url
export const userCustomUrl = async (req, res) => {
  try {
    const { originalUrl, customUrl } = req.body;

    if (!originalUrl || !customUrl) {
      return res
        .status(400)
        .json({ message: "Original URL and Custom URL is required" });
    }

    // Check if the URL already exists in the database
    let existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(200).json({
        shortUrl: `${req.protocol}://${req.get("host")}/${existingUrl.shortId}`,
      });
    }

    // create the custom url
    const shortId = customUrl;

    
    const newUrl = new Url({ shortId, originalUrl });
    await newUrl.save();

    res
      .status(201)
      .json({ shortUrl: `${req.protocol}://${req.get("host")}/${shortId}` });
  } catch (error) {
    console.error("Error creating custom URL:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//function use the short url to access the original url
export const redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    const urlData = await Url.findOne({ shortId });
    if (!urlData) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    //to display the data in console
    console.log("Redirecting to:", urlData.originalUrl);
    console.log("Short URL ID:", shortId);
    console.log("Redirecting user...");

    // Redirect to the original URL
    res.redirect(urlData.originalUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
