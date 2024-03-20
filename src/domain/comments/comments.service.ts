import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { NotificationService } from "../notifications/notifications.service";
import { Mutable } from "../../utils/types";
import { Comment, MutableComment } from "./comment.entity";
import { validateUserCanMutateComment } from "./rules";

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService,
    ) {}

    create = async (newComment: Mutable<Comment>) => {
        const parrent = newComment.parentId
            ? await this.findById(newComment.parentId)
            : null;

        const createdComment = await this.prisma.comment.create({
            data: { ...newComment },
        });

        if (
            !parrent ||
            (parrent && parrent.authorId !== createdComment.authorId)
        ) {
            this.notificationService.notifyNewComment(
                createdComment,
                !!parrent,
            );
        }

        return createdComment;
    };

    findAllByArticleId = (articleId: number) => {
        return this.prisma.comment.findMany({
            where: { articleId, parentId: null },
            include: {
                childrens: {
                    include: {
                        childrens: {
                            include: {
                                childrens: true,
                            },
                        },
                    },
                },
            },
        });
    };

    findById = async (id: number) => {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
            include: {
                childrens: {
                    include: {
                        childrens: {
                            include: {
                                childrens: true,
                            },
                        },
                    },
                },
            },
        });

        if (!comment) {
            throw new NotFoundException("Comment not found");
        }

        return comment;
    };

    update = async (
        commentId: number,
        comment: Partial<MutableComment>,
        userId: number,
    ) => {
        const persistedComment = await this.findById(commentId);
        validateUserCanMutateComment(persistedComment.authorId, userId);

        return this.prisma.comment.update({
            where: { id: persistedComment.id },
            data: comment,
        });
    };

    deleteById = async (commentId: number, userId: number) => {
        const comment = await this.findById(commentId);

        validateUserCanMutateComment(comment.authorId, userId);

        return this.prisma.comment.delete({ where: { id: comment.id } });
    };
}
