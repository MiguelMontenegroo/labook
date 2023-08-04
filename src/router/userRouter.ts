import express from "express";
import { UserBusiness } from "../business/UserBusiness";
import { Usercontroller } from "../controller/UserController";
import { UserDatabase } from "../database/UserDatabase";
import { HashManager } from "../services/HashManeger";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManeger";

export const userRouter = express.Router();

const userController = new Usercontroller(
  new UserBusiness(
    new UserDatabase(),
    new IdGenerator(),
    new TokenManager(),
    new HashManager()
  )
);

userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);