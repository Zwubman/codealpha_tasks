import mongoose from "mongoose";
import express from "express";
import { redirectToOriginalUrl, shortenUrl, userCustomUrl} from "../Controllers/urlController.js";

const userRouter = express.Router();

userRouter.post('/shorten', shortenUrl);
userRouter.post('/customurl', userCustomUrl)
userRouter.get('/:shortId', redirectToOriginalUrl);

export default userRouter;