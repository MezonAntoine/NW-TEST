import { Test, TestingModule } from "@nestjs/testing";
import { NotificationService } from "../notifications/notifications.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { InfrastructureModule } from "../../infrastructure/infrastructure.module";
import { CommentsService } from "./comments.service";
import { Comment } from "./comment.entity";
import { NotFoundException } from "@nestjs/common";

const PUBLISHED_ARTICLE_ID = 2;
const AUTHOR_ID = 2;
const NON_EXISTANT_COMMENT_ID = 100;

let comment: Comment;
let subComment: Comment;

const newComment = { content: "New comment" };
const updatedComment = { content: "Updated comment" };

describe("CommentsService", () => {
    let service: CommentsService;
    let notificationService: NotificationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [InfrastructureModule],
            providers: [PrismaService, CommentsService, NotificationService],
        }).compile();

        notificationService =
            module.get<NotificationService>(NotificationService);
        service = module.get<CommentsService>(CommentsService);
    });

    it("should initialize CommentsService", () => {
        expect(service).toBeDefined();
    });

    describe("should create comment and notify", () => {
        it("should throw NotFoundException when attempting to comment on non-existent parent", async () => {
            await expect(
                service.create({
                    ...newComment,
                    authorId: 1,
                    articleId: PUBLISHED_ARTICLE_ID,
                    parentId: NON_EXISTANT_COMMENT_ID,
                }),
            ).rejects.toThrowError(NotFoundException);
        });

        it("should create comment and notify article owner", async () => {
            const notifySpy = jest.spyOn(
                notificationService,
                "notifyNewComment",
            );
            const result = await service.create({
                ...newComment,
                authorId: 1,
                articleId: PUBLISHED_ARTICLE_ID,
            });

            expect(result).toHaveProperty("content", newComment.content);
            expect(notifySpy).toHaveBeenCalled();
            comment = result;
        });

        describe("get comment by id", () => {
            it("should throw NotFoundException when retrieving non-existent comment", async () => {
                await expect(
                    service.findById(NON_EXISTANT_COMMENT_ID),
                ).rejects.toThrowError(NotFoundException);
            });
            it("should retrieve comment by ID successfully", async () => {
                const result = await service.findById(comment.id);
                expect(result).toHaveProperty("content", newComment.content);
                expect(result).toHaveProperty(
                    "articleId",
                    PUBLISHED_ARTICLE_ID,
                );
            });
        });

        describe("get comments by articleId", () => {
            it("should retrieve comments by article ID successfully", async () => {
                const result = await service.findAllByArticleId(
                    PUBLISHED_ARTICLE_ID,
                );

                expect(result.length).toBe(1);
                expect(result[0]).toHaveProperty("id", comment.id);
            });
        });

        it("should create comment and not notify comment owner if same author", async () => {
            const notifySpy = jest.spyOn(
                notificationService,
                "notifyNewComment",
            );
            const result = await service.create({
                ...newComment,
                parentId: comment.id,
                authorId: 1,
                articleId: PUBLISHED_ARTICLE_ID,
            });
            subComment = result;

            expect(notifySpy).not.toHaveBeenCalled();
        });
    });
    describe("update comment by id", () => {
        it("should throw Error when updating comment if user is not the owner", async () => {
            await expect(
                service.update(
                    comment.id,
                    {
                        content: "Updated comment",
                    },
                    2,
                ),
            ).rejects.toThrowError(Error);
        });

        it("should throw NotFoundException when updating non-existent comment", async () => {
            await expect(
                service.update(NON_EXISTANT_COMMENT_ID, updatedComment, 1),
            ).rejects.toThrowError(NotFoundException);
        });

        it("should update a comment successfully", async () => {
            const result = await service.update(comment.id, updatedComment, 1);
            expect(result).toHaveProperty("content", "Updated comment");
            expect(result).toHaveProperty("articleId", PUBLISHED_ARTICLE_ID);
        });
        it("should update sub-comment successfully", async () => {
            const toUpdate = { content: "Updated sub comment" };
            const result = await service.update(subComment.id, toUpdate, 1);
            expect(result).toHaveProperty("content", toUpdate.content);
        });
    });
    describe("delete comment by id", () => {
        it("should throw Error when deleting comment if user is not the owner", async () => {
            await expect(
                service.deleteById(comment.id, AUTHOR_ID),
            ).rejects.toThrowError(Error);
        });
        it("should throw NotFoundException when deleting non-existent comment", async () => {
            await expect(
                service.deleteById(NON_EXISTANT_COMMENT_ID, AUTHOR_ID),
            ).rejects.toThrowError(NotFoundException);
        });

        it("should delete comment with childrens successfully", async () => {
            await service.deleteById(comment.id, 1);
            await expect(service.findById(comment.id)).rejects.toThrowError(
                NotFoundException,
            );
            await expect(service.findById(subComment.id)).rejects.toThrowError(
                NotFoundException,
            );
        });

        it("should retrieve empty comments by article ID after deletion", async () => {
            const result = await service.findAllByArticleId(
                PUBLISHED_ARTICLE_ID,
            );

            expect(result.length).toBe(0);
        });
    });
});
