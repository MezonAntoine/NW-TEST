import {
    ConflictException,
    HttpException,
    NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "../../../domain/comments/comments.service";
import { ArticlesService } from "../../../domain/articles/articles.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CommentDto } from "./comment.dto";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { NotificationService } from "../../../domain/notifications/notifications.service";
import { EmailService } from "../../../infrastructure/email/email.service";

const UNPUBLISHED_ARTICLE_ID = 1;
const PUBLISHED_ARTICLE_ID = 2;
const NON_EXISTANT_ARTICLE_ID = 100;
const NON_EXISTANT_COMMENT_ID = 100;

let comment: CommentDto;
let subComment: CommentDto;
const requestUser1 = { user: { id: 1 } };
const requestUser2 = { user: { id: 2 } };

const commentHateFulWord = { content: "boiteux" };
const newComment = { content: "New comment" };
const newSubComment = { content: "New sub comment" };
const updatedComment = { content: "Updated comment" };

describe("CommentsController", () => {
    let controller: CommentsController;
    // let commentsService: CommentsService;
    // let articlesService: ArticlesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentsController],
            providers: [
                CommentsService,
                ArticlesService,
                PrismaService,
                NotificationService,
                EmailService,
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .compile();

        controller = module.get<CommentsController>(CommentsController);
        // commentsService = module.get<CommentsService>(CommentsService);
        // articlesService = module.get<ArticlesService>(ArticlesService);
    });

    it("should initialize CommentsController", () => {
        expect(controller).toBeDefined();
    });

    describe("CommentController", () => {
        describe("Simple comment", () => {
            describe("create comment", () => {
                it("should throw ConflictException when commenting on unpublished article", async () => {
                    await expect(
                        controller.create(
                            UNPUBLISHED_ARTICLE_ID,
                            newComment,
                            requestUser1,
                        ),
                    ).rejects.toThrowError(ConflictException);
                });

                it("should throw NotFoundException when commenting on non-existent article", async () => {
                    await expect(
                        controller.create(
                            NON_EXISTANT_ARTICLE_ID,
                            newComment,
                            requestUser1,
                        ),
                    ).rejects.toThrowError(NotFoundException);
                });

                it("should throw HttpException when comment content contains hateful word", async () => {
                    await expect(
                        controller.create(
                            PUBLISHED_ARTICLE_ID,
                            commentHateFulWord,
                            requestUser1,
                        ),
                    ).rejects.toThrowError(HttpException);
                });

                it("should create a new comment successfully", async () => {
                    const result = await controller.create(
                        PUBLISHED_ARTICLE_ID,
                        newComment,
                        requestUser1,
                    );
                    expect(result).toHaveProperty("content", "New comment");
                    expect(result).toHaveProperty(
                        "articleId",
                        PUBLISHED_ARTICLE_ID,
                    );

                    comment = result;
                });
            });

            describe("get comment by id", () => {
                it("should throw NotFoundException when retrieving non-existent comment", async () => {
                    await expect(
                        controller.getById(NON_EXISTANT_COMMENT_ID),
                    ).rejects.toThrowError(NotFoundException);
                });
                it("should retrieve comment by ID successfully", async () => {
                    const result = await controller.getById(comment.id);
                    expect(result).toHaveProperty(
                        "content",
                        newComment.content,
                    );
                    expect(result).toHaveProperty(
                        "articleId",
                        PUBLISHED_ARTICLE_ID,
                    );
                });
            });

            describe("get comments by articleId", () => {
                it("should throw NotFoundException when retrieving comments for non-existent article", async () => {
                    await expect(
                        controller.getAllByArticleId(NON_EXISTANT_ARTICLE_ID),
                    ).rejects.toThrowError(NotFoundException);
                });

                it("should throw ConflictException when retrieving comments for unpublished article", async () => {
                    await expect(
                        controller.getAllByArticleId(UNPUBLISHED_ARTICLE_ID),
                    ).rejects.toThrowError(ConflictException);
                });
                it("should retrieve comments by article ID successfully", async () => {
                    const result = await controller.getAllByArticleId(
                        PUBLISHED_ARTICLE_ID,
                    );

                    expect(result.length).toBe(1);
                    expect(result[0]).toHaveProperty("id", comment.id);
                });
            });

            describe("update comment by id", () => {
                it("should throw Error when updating comment if user is not the owner", async () => {
                    await expect(
                        controller.update(
                            comment.id,
                            updatedComment,
                            requestUser2,
                        ),
                    ).rejects.toThrowError(Error);
                });

                it("should throw NotFoundException when updating non-existent comment", async () => {
                    await expect(
                        controller.update(
                            NON_EXISTANT_COMMENT_ID,
                            updatedComment,
                            requestUser1,
                        ),
                    ).rejects.toThrowError(NotFoundException);
                });

                it("should throw HttpException when updating comment with hateful word", async () => {
                    await expect(
                        controller.update(
                            comment.id,
                            commentHateFulWord,
                            requestUser1,
                        ),
                    ).rejects.toThrowError(HttpException);
                });

                it("should update a comment successfully", async () => {
                    const result = await controller.update(
                        comment.id,
                        updatedComment,
                        requestUser1,
                    );
                    expect(result).toHaveProperty("content", "Updated comment");
                    expect(result).toHaveProperty(
                        "articleId",
                        PUBLISHED_ARTICLE_ID,
                    );
                });
            });

            describe("delete comment by id", () => {
                it("should throw Error when deleting comment if user is not the owner", async () => {
                    await expect(
                        controller.deleteById(comment.id, requestUser2),
                    ).rejects.toThrowError(Error);
                });
                it("should throw NotFoundException when deleting non-existent comment", async () => {
                    await expect(
                        controller.deleteById(
                            NON_EXISTANT_COMMENT_ID,
                            requestUser1,
                        ),
                    ).rejects.toThrowError(NotFoundException);
                });

                it("should delete comment by ID successfully", async () => {
                    const result = await controller.deleteById(
                        comment.id,
                        requestUser1,
                    );
                    expect(result).toBe(undefined);
                });

                it("should retrieve empty comments by article ID after deletion", async () => {
                    const result = await controller.getAllByArticleId(
                        PUBLISHED_ARTICLE_ID,
                    );

                    expect(result.length).toBe(0);
                });
            });
        });
        describe("Multiple comment", () => {
            describe("create comment and sub comment", () => {
                it("should throw NotFoundException when attempting to comment on non-existent parent", async () => {
                    await expect(
                        controller.create(
                            PUBLISHED_ARTICLE_ID,
                            {
                                ...newComment,
                                parentId: NON_EXISTANT_COMMENT_ID,
                            },
                            requestUser1,
                        ),
                    ).rejects.toThrowError(NotFoundException);
                });

                it("should throw HttpException when attempting to create sub-comment with hateful word", async () => {
                    await expect(
                        controller.create(
                            PUBLISHED_ARTICLE_ID,
                            {
                                ...commentHateFulWord,
                                parentId: comment.id,
                            },
                            requestUser1,
                        ),
                    ).rejects.toThrowError(HttpException);
                });

                it("should create a sub-comment for a parent comment successfully", async () => {
                    const newParentComment = await controller.create(
                        PUBLISHED_ARTICLE_ID,
                        newComment,
                        requestUser1,
                    );

                    const newChildComment = await controller.create(
                        PUBLISHED_ARTICLE_ID,
                        { ...newSubComment, parentId: newParentComment.id },
                        requestUser1,
                    );
                    expect(newChildComment).toHaveProperty(
                        "parentId",
                        newParentComment.id,
                    );
                    const parent = await controller.getById(
                        newParentComment.id,
                    );

                    expect(parent.childrens).toBeDefined();
                    expect(Array.isArray(parent.childrens)).toBe(true);
                    expect(parent.childrens.length).toBe(1);

                    comment = newParentComment;
                    subComment = newChildComment;
                });

                it("should create a sub-comment for an existing sub-comment successfully", async () => {
                    const newChildComment = await controller.create(
                        PUBLISHED_ARTICLE_ID,
                        { ...newSubComment, parentId: subComment.id },
                        requestUser1,
                    );

                    expect(newChildComment).toHaveProperty(
                        "parentId",
                        subComment.id,
                    );
                    const parent = await controller.getById(comment.id);

                    expect(parent.childrens).toBeDefined();
                    expect(Array.isArray(parent.childrens)).toBe(true);
                    expect(parent.childrens.length).toBe(1);

                    expect(Array.isArray(parent.childrens[0].childrens)).toBe(
                        true,
                    );
                    expect(parent.childrens[0].childrens.length).toBe(1);

                    subComment = newChildComment;
                });
            });
            describe("update sub comment by id", () => {
                it("should update sub-comment successfully", async () => {
                    const toUpdate = { content: "Updated sub comment" };
                    const result = await controller.update(
                        subComment.id,
                        toUpdate,
                        requestUser1,
                    );
                    expect(result).toHaveProperty("content", toUpdate.content);
                });
            });
            describe("Cascade deletion", () => {
                let parentComment: CommentDto;
                let childComments: CommentDto[];

                beforeAll(async () => {
                    parentComment = await controller.create(
                        PUBLISHED_ARTICLE_ID,
                        newComment,
                        requestUser1,
                    );
                    childComments = [];
                    const subComment = {
                        ...newSubComment,
                        parentId: parentComment.id,
                    };

                    for (let i = 0; i < 3; i++) {
                        const childComment = await controller.create(
                            PUBLISHED_ARTICLE_ID,
                            subComment,
                            requestUser1,
                        );
                        childComments.push(childComment);
                    }
                });

                it("should delete parent comment and all its children successfully", async () => {
                    expect(parentComment).toBeDefined();
                    expect(childComments.length).toBe(3);

                    await controller.deleteById(parentComment.id, requestUser1);

                    await expect(
                        controller.getById(parentComment.id),
                    ).rejects.toThrowError(NotFoundException);
                    for (const childComment of childComments) {
                        await expect(
                            controller.getById(childComment.id),
                        ).rejects.toThrowError(NotFoundException);
                    }
                });
            });
        });
    });
});
