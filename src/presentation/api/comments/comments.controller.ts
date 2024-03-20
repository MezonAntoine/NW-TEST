import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    HttpCode,
} from "@nestjs/common";
import { ArticlesService } from "../../../domain/articles/articles.service";
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiTags,
} from "@nestjs/swagger";
import {
    CommentDto,
    CommentResponse,
    CreateCommentDto,
    CreateCommentRequest,
    UpdateCommentDto,
    UpdateCommentRequest,
} from "./comment.dto";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CommentsService } from "../../../domain/comments/comments.service";
import { validateCommentContent } from "../../../domain/comments/rules";

@Controller("comments")
@ApiTags("comments")
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly articlesService: ArticlesService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post("/:articleId")
    @ApiCreatedResponse({ type: CommentDto })
    async create(
        @Param("articleId") articleId: number,
        @Body() createCommentDto: CreateCommentDto,
        @Request() request,
    ) {
        validateCommentContent(createCommentDto.content);

        await this.articlesService.isArticlePublished(+articleId);

        const comment = new CreateCommentRequest(createCommentDto).toEntity();
        const createdComment = await this.commentsService.create({
            ...comment,
            authorId: request.user.id,
            articleId: +articleId,
        });

        return new CommentResponse(createdComment).fromEntity();
    }

    @Get("/:articleId")
    @ApiOkResponse({ type: CommentDto, isArray: true })
    async getAllByArticleId(@Param("articleId") articleId: number) {
        await this.articlesService.isArticlePublished(+articleId);
        const comments = await this.commentsService.findAllByArticleId(
            +articleId,
        );
        return comments.map((comment) =>
            new CommentResponse(comment).fromEntity(),
        );
    }

    @Get("/:id")
    @ApiOkResponse({ type: CommentDto })
    async getById(@Param("id") id: number) {
        const comment = await this.commentsService.findById(id);
        return new CommentResponse(comment).fromEntity();
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(":id")
    async update(
        @Param("id") id: number,
        @Body() updateCommentDto: UpdateCommentDto,
        @Request() request,
    ) {
        validateCommentContent(updateCommentDto.content);

        const formattedComment = new UpdateCommentRequest(
            updateCommentDto,
        ).toEntity();

        const updatedComment = await this.commentsService.update(
            +id,
            formattedComment,
            request.user.id,
        );
        return new CommentResponse(updatedComment).fromEntity();
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete(":id")
    @HttpCode(204)
    async deleteById(@Param("id") id: number, @Request() request) {
        await this.commentsService.deleteById(+id, request.user.id);
    }
}
