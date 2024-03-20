import { Module } from "@nestjs/common";
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { CommentsService } from "./comments.service";
import { ArticlesService } from "../articles/articles.service";

@Module({
    providers: [CommentsService, ArticlesService],
    imports: [PrismaModule, NotificationsModule],
    exports: [CommentsService, ArticlesService],
})
export class CommentsModule {}
