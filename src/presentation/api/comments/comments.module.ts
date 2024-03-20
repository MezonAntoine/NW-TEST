import { Module } from "@nestjs/common";
import { CommentsController } from "./comments.controller";
import { CommentsModule } from "../../../domain/comments/comments.module";

@Module({
    controllers: [CommentsController],
    imports: [CommentsModule],
})
export class CommentsApiModule {}
