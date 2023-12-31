import { Request, Response } from "express";
import { ZodError } from "zod";
import { UserBusiness } from "../business/UserBusiness";
import { LoginSchema } from "../dtos/user/login.dto";
import { SignupSchema } from "../dtos/user/signup.dto";
import { BaseError } from "../errors/BaseError";
import { GetUsersSchema } from "../dtos/user/getUsers.dto";

export class Usercontroller{
    constructor(private userBusiness: UserBusiness) {}

    public signup = async (req: Request, res: Response) => {
      try {
        const input = SignupSchema.parse({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        });
  
        const output = await this.userBusiness.signup(input);
  
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
  
    public login = async (req: Request, res: Response) => {
      try {
        const input = LoginSchema.parse({
          email: req.body.email,
          password: req.body.password,
        });
  
        const output = await this.userBusiness.userLogin(input);
  
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
    public getUsers = async (req: Request, res: Response) => {
      try {
        const input = GetUsersSchema.parse({
          q: req.query.q,
        });
  
        const output = await this.userBusiness.getUsers(input);
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