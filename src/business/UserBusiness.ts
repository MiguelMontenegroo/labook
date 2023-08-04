import { UserDatabase } from "../database/UserDatabase";
import { LoginInputDTO, LoginOutputDTO } from "../dtos/user/login.dto";
import { SignupInputDTO, SignupOutputDTO } from "../dtos/user/signup.dto";
import { BadRequestError } from "../errors/BadRequestError";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import { TokenPayload, User, USER_ROLES } from "../models/User";
import { HashManager } from "../services/HashManeger";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManeger";

export class UserBusiness {
  constructor(
    private userDatabase: UserDatabase,
    private idGenerator: IdGenerator,
    private tokenManeger: TokenManager,
    private hashManeger: HashManager
  ) {}

  public signup = async (input: SignupInputDTO) => {
    const { name, email, password } = input;

    const userBDExists = await this.userDatabase.findUserByEmail(email);

    if (userBDExists) {
      throw new ConflictError("email already exists");
    }

    const id = this.idGenerator.generate();
    const hashedPassword = await this.hashManeger.hash(password);

    const newUser = new User(
      id,
      name,
      email,
      hashedPassword,
      USER_ROLES.NORMAL,
      new Date().toISOString()
    );

    const newUserDB = newUser.toDBModel();
    await this.userDatabase.postUser(newUserDB);

    const payload: TokenPayload = {
      id: newUser.getId(),
      name: newUser.getName(),
      role: newUser.getRole(),
    };

    const token = this.tokenManeger.createToken(payload);

    const output: SignupOutputDTO = {
      token,
    };

    return output;
  };

  public userLogin = async (input: LoginInputDTO) => {
    const { email, password } = input;

    const userBDExists = await this.userDatabase.findUserByEmail(email);

    if (!userBDExists) {
      throw new NotFoundError("Email not found");
    }

    const user = new User(
      userBDExists.id,
      userBDExists.name,
      userBDExists.email,
      userBDExists.password,
      userBDExists.role,
      userBDExists.created_at
    );

    const hashedPassword = userBDExists.password;

    const isCorrectPassword = await this.hashManeger.compare(
      password,
      hashedPassword
    );

    if (!isCorrectPassword) {
      throw new BadRequestError("Incorrect email or password");
    }

    const payload: TokenPayload = {
      id: user.getId(),
      name: user.getName(),
      role: user.getRole(),
    };

    const token = this.tokenManeger.createToken(payload);

    const output: LoginOutputDTO = {
      token,
    };

    return output;
  };
}