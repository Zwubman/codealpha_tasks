import mongoose from "mongoose";
import express from "express";
import { redirectToOriginalUrl, shortenUrl, userCustomUrl} from "../Controllers/urlController.js";

const router = express.Router();

router.post('/shorten', shortenUrl);
router.post('/customurl', userCustomUrl)
router.get('/:shortId', redirectToOriginalUrl);

export default router;