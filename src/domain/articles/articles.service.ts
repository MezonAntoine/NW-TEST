import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { Article, MutableArticle } from "./article.entity";
import { validateUserCanMutateArticle } from "./rules";
import { NotificationService } from "../notifications/notifications.service";
import { Mutable } from "../../utils/types";

@Injectable()
export class ArticlesService {
    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService,
    ) {}

    create = async (article: Mutable<Article>) => {
        const createdArticle = await this.prisma.article.create({
            data: { ...article },
        });
        if (createdArticle.published)
            this.notificationService.notifyPublishedArticle(createdArticle);
    };

    publish = (id: number) => {
        this.prisma.article
            .update({
                where: { id },
                data: { published: true },
            })
            .then((article: Article) =>
                this.notificationService.notifyPublishedArticle(article),
            );
    };

    findAll = async (): Promise<Article[]> => {
        return await this.prisma.article.findMany({
            where: { published: true },
        });
    };

    findMine = (authorId: number): Promise<Article[]> => {
        return this.prisma.article.findMany({
            where: { authorId },
        });
    };

    findDrafts = (authorId: number) => {
        return this.prisma.article.findMany({
            where: { published: false, authorId },
        });
    };

    findOne = (id: number) => {
        return this.prisma.article.findUnique({ where: { id } });
    };

    async isArticlePublished(articleId: number): Promise<Article> {
        const article = await this.findOne(articleId);

        if (!article) {
            throw new NotFoundException("Article not found");
        }

        if (!article.published) {
            throw new ConflictException("Article is not published");
        }

        return article;
    }

    update = async (
        id: number,
        article: Partial<MutableArticle>,
        userId: number,
    ) => {
        const persistedArticle = await this.prisma.article.findUnique({
            where: { id },
        });
        validateUserCanMutateArticle(persistedArticle, userId);
        return this.prisma.article.update({
            where: { id },
            data: article,
        });
    };

    remove = async (id: number, userId: number) => {
        const article = await this.prisma.article.findUnique({ where: { id } });
        validateUserCanMutateArticle(article, userId);
        return this.prisma.article.delete({ where: { id } });
    };
}
