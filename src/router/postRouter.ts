import express from "express";
import { PostBusiness } from "../business/PostBusiness";
import { PostsController } from "../controller/PostsController";
import { PostDatabase } from "../database/PostDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManeger";

export const postRouter = express.Router();

const postController = new PostsController(
  new PostBusiness(new PostDatabase(), new IdGenerator(), new TokenManager())
);

postRouter.get("/", postController.getPosts);
postRouter.post("/", postController.postPost);
postRouter.put("/:id", postController.putPost);
postRouter.delete("/:id", postController.deletePosts);

postRouter.put("/:id/like", postController.likeOrDislikePost)