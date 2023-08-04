import { Request, Response } from "express";
import { ZodError } from "zod";
import { PostBusiness } from "../business/PostBusiness";
import { CreatePostSchema } from "../dtos/user/post/createPost.dto";
import { DeletePostSchema } from "../dtos/user/post/delete.dto";
import { EditPostSchema } from "../dtos/user/post/editPost.dto";
import { GetPostsSchema } from "../dtos/user/post/getPosts.dto";
import { LikeOrDislikePostSchema } from "../dtos/user/post/likeOrDislikePost.dto";
import { BaseError } from "../errors/BaseError";

export class PostsController{

    constructor(private postBusiness: PostBusiness) {}

    public getPosts = async (req: Request, res: Response) => {
      try {
        const input = GetPostsSchema.parse({
          token: req.headers.authorization,
        });
        const output = await this.postBusiness.getPost(input);
  
        res.status(200).send(output);
      } catch (error) {
        console.log(error);
  
        if (error instanceof ZodError) {
          res.status(400).send(error.issues);
        } else if (error instanceof BaseError) {
          res.status(error.statusCode).send(error.message);
        } else {
          res.status(500).send("Unexpected Error");
        }
      }
    };
  
    public postPost = async (req: Request, res: Response) => {
      try {
        const input = CreatePostSchema.parse({
          token: req.headers.authorization,
          content: req.body.content,
        });
  
        const output = await this.postBusiness.postPost(input);
  
        res.status(201).send(output);
      } catch (error) {
        console.log(error);
  
        if (error instanceof ZodError) {
          res.status(400).send(error.issues);
        } else if (error instanceof BaseError) {
          res.status(error.statusCode).send(error.message);
        } else {
          res.status(500).send("Unexpected Error");
        }
      }
    };
  
    public putPost = async (req: Request, res: Response) => {
      try {
        const input = EditPostSchema.parse({
          token: req.headers.authorization,
          idToEdit: req.params.id,
          content: req.body.content,
        });
  
        const output = await this.postBusiness.putPost(input);
  
        res.status(200).send(output);
      } catch (error) {
        console.log(error);
  
        if (error instanceof ZodError) {
          res.status(400).send(error.issues);
        } else if (error instanceof BaseError) {
          res.status(error.statusCode).send(error.message);
        } else {
          res.status(500).send("Unexpected Error");
        }
      }
    };
  
    public deletePosts = async (req: Request, res: Response) => {
      try {
        const input = DeletePostSchema.parse({
          token: req.headers.authorization,
          idToDelete: req.params.id,
        });
  
        const output = await this.postBusiness.deletePost(input);
  
        res.status(200).send(output);
      } catch (error) {
        console.log(error);
  
        if (error instanceof ZodError) {
          res.status(400).send(error.issues);
        } else if (error instanceof BaseError) {
          res.status(error.statusCode).send(error.message);
        } else {
          res.status(500).send("Unexpected Error");
        }
      }
    };
  
    public likeOrDislikePost = async (req: Request, res: Response) => {
      try {
        const input = LikeOrDislikePostSchema.parse({
          token: req.headers.authorization,
          idToLikeOrDislike: req.params.id,
          like: req.body.like
        });
  
        const output = await this.postBusiness.likeOrDislikePost(input);
  
        res.status(200).send(output);
      } catch (error) {
        console.log(error);
  
        if (error instanceof ZodError) {
          res.status(400).send(error.issues);
        } else if (error instanceof BaseError) {
          res.status(error.statusCode).send(error.message);
        } else {
          res.status(500).send("Unexpected Error");
        }
      }
    };
}