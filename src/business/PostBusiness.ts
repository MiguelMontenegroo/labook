import { PostDatabase } from "../database/PostDatabase";
import {
  CreatePostInputDTO,
  CreatePostOutputDTO,
} from "../dtos/user/post/createPost.dto";
import {
  DeletePostInputDTO,
  DeletePostOutputDTO,
} from "../dtos/user/post/delete.dto";
import { EditPostInputDTO, EditPostOutputDTO } from "../dtos/user/post/editPost.dto";
import { GetPostsInputDTO, GetPostsOutputDTO } from "../dtos/user/post/getPosts.dto";
import {
  LikeOrDislikePostInputDTO,
  LikeOrDislikePostOutputDTO,
} from "../dtos/user/post/likeOrDislikePost.dto";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { LikeDislikeDB, Posts, PostDB, POST_LIKE } from "../models/Posts";
import { USER_ROLES } from "../models/User";
import { IdGenerator } from "../services/idGenerator";
import { TokenManager } from "../services/tokenManager";

export class PostBusiness {
  constructor(
    private postDatabase: PostDatabase,
    private idGenerator: IdGenerator,
    private tokenManeger: TokenManager
  ) {}

  public getPost = async (
    input: GetPostsInputDTO
  ): Promise<GetPostsOutputDTO> => {
    const { token } = input;

    const payload = this.tokenManeger.getPayload(token);

    if (!payload) {
      throw new UnauthorizedError("Invalid token");
    }

    const postsWithCreatorName =
      await this.postDatabase.findPostsWithCreatorName();

    const posts = postsWithCreatorName.map((postWithCreatorName) => {
      const post = new Posts(
        postWithCreatorName.id,
        postWithCreatorName.creator_id,
        postWithCreatorName.content,
        postWithCreatorName.likes,
        postWithCreatorName.dislikes,
        postWithCreatorName.created_at,
        postWithCreatorName.updated_at,
        postWithCreatorName.creator_name
      );
      return post.toBusinessModel();
    });

    const output: GetPostsOutputDTO = posts;

    return output;
  };

  public postPost = async (
    input: CreatePostInputDTO
  ): Promise<CreatePostOutputDTO> => {
    const { token, content } = input;

    const payload = this.tokenManeger.getPayload(token);

    if (!payload) {
      throw new UnauthorizedError("Invalid token");
    }

    const id = this.idGenerator.generate();

    const newPost = new Posts(
      id,
      payload.id,
      content,
      0,
      0,
      new Date().toString(),
      new Date().toString(),
      payload.name
    );

    const newPostDB = newPost.toDBModel();
    await this.postDatabase.createPost(newPostDB);

    const output: CreatePostOutputDTO = undefined;

    return output;
  };

  public putPost = async (
    input: EditPostInputDTO
  ): Promise<EditPostOutputDTO> => {
    const { token, idToEdit, content } = input;

    const payload = this.tokenManeger.getPayload(token);

    if (!payload) {
      throw new UnauthorizedError("Invalid token");
    }

    const postDBExists = await this.postDatabase.findPostById(idToEdit);

    if (!postDBExists) {
      throw new NotFoundError("Post id not found");
    }

    if (postDBExists.creator_id !== payload.id) {
      throw new UnauthorizedError("Only the creator of the post can edit it");
    }

    const post = new Posts(
      postDBExists.id,
      postDBExists.creator_id,
      postDBExists.content,
      postDBExists.likes,
      postDBExists.dislikes,
      postDBExists.created_at,
      postDBExists.updated_at,
      payload.name
    );

    post.setContent(content);

    const updatedPostDB = post.toDBModel();
    await this.postDatabase.editPost(updatedPostDB);

    const output: EditPostOutputDTO = undefined;

    return output;
  };

  public deletePost = async (
    input: DeletePostInputDTO
  ): Promise<DeletePostOutputDTO> => {
    const { token, idToDelete } = input;

    const payload = this.tokenManeger.getPayload(token);

    if (!payload) {
      throw new UnauthorizedError("Invalid token");
    }

    const postDBExists = await this.postDatabase.findPostById(idToDelete);

    if (!postDBExists) {
      throw new NotFoundError("Post id doesn't exist");
    }

    if (payload.role !== USER_ROLES.ADMIN) {
      if (payload.id !== postDBExists.creator_id) {
        throw new ForbiddenError("Only the creator of the post can delete it");
      }
    }

    await this.postDatabase.removePost(idToDelete);

    const output: DeletePostOutputDTO = undefined;

    return output;
  };

  public likeOrDislikePost = async (
    input: LikeOrDislikePostInputDTO
  ): Promise<LikeOrDislikePostOutputDTO> => {
    const { token, idToLikeOrDislike, like } = input;

    const payload = this.tokenManeger.getPayload(token);

    if (!payload) {
      throw new UnauthorizedError("Invalid token");
    }

    const postDBWithCreatorName =
      await this.postDatabase.findPostsWithCreatorNameById(idToLikeOrDislike);

    if (!postDBWithCreatorName) {
      throw new NotFoundError("Post id not found");
    }

    const post = new Posts(
      postDBWithCreatorName.id,
      postDBWithCreatorName.creator_id,
      postDBWithCreatorName.content,
      postDBWithCreatorName.likes,
      postDBWithCreatorName.dislikes,
      postDBWithCreatorName.created_at,
      postDBWithCreatorName.updated_at,
      postDBWithCreatorName.creator_name
    );

    const likeSQLlite = like ? 1 : 0;

    const likeOrDislikeDB: LikeDislikeDB = {
      user_id: payload.id,
      post_id: postDBWithCreatorName.id,
      like: likeSQLlite,
    };

    const likeOrDislikePostExists = await this.postDatabase.findLikeDislikePost(
      likeOrDislikeDB
    );

    if (post.getCreatorId() === payload.id) {
      throw new ForbiddenError(
        "The post creator can not give likes or dislikes"
      );
    }

    if (likeOrDislikePostExists === POST_LIKE.ALREADY_LIKED) {
      if (like) {
        await this.postDatabase.removeLikeOrDislike(likeOrDislikeDB);
        post.removeLike();
      } else {
        await this.postDatabase.updateLikeOrDislike(likeOrDislikeDB);
        post.removeLike();
        post.addDislike();
      }
    } else if (likeOrDislikePostExists === POST_LIKE.ALREADY_DISLIKED) {
      if (like === false) {
        await this.postDatabase.removeLikeOrDislike(likeOrDislikeDB);
        post.removeDislike();
      } else {
        await this.postDatabase.updateLikeOrDislike(likeOrDislikeDB);
        post.removeDislike();
        post.addLike();
      }
    } else {
      await this.postDatabase.insertLikeOrDislike(likeOrDislikeDB);
      like ? post.addLike() : post.addDislike();
    }

    const updatedPostDB = post.toDBModel();
    await this.postDatabase.editPost(updatedPostDB);

    const output: LikeOrDislikePostOutputDTO = undefined;

    return output;
  };
}