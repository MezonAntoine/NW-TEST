import { ApiProperty, PartialType } from "@nestjs/swagger";
import {
    Comment,
    CommentChildrens,
    MutableComment,
} from "../../../domain/comments/comment.entity";
import { RequestDto, ResponseDto } from "../dto";
import { WithOptional } from "../../../utils/types";

export class CommentDto implements CommentChildrens {
    @ApiProperty()
    id: number;

    @ApiProperty()
    authorId: number;

    @ApiProperty()
    articleId: number;

    @ApiProperty()
    content: string;

    @ApiProperty({ required: false, nullable: true })
    parentId?: number;

    @ApiProperty({ required: false, nullable: true })
    childrens?: CommentDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class CommentResponse implements ResponseDto<Comment, CommentDto> {
    data: CommentChildrens;
    constructor(data: CommentChildrens) {
        this.data = data;
    }
    fromEntity = (): CommentDto => {
        return {
            id: this.data.id,
            authorId: this.data.authorId,
            articleId: this.data.articleId,
            parentId: this.data.parentId,
            childrens: this.data?.childrens,
            content: this.data.content,
            createdAt: this.data.createdAt,
            updatedAt: this.data.updatedAt,
        };
    };
}

export class CreateCommentDto
    implements WithOptional<MutableComment, "parentId">
{
    @ApiProperty()
    content: string;

    @ApiProperty({ required: false })
    parentId?: number;
}

export class CreateCommentRequest
    implements RequestDto<MutableComment, CreateCommentDto>
{
    data: CreateCommentDto;
    constructor(data: CreateCommentDto) {
        this.data = data;
    }
    toEntity = (): MutableComment => {
        return {
            content: this.data.content,
            parentId: this.data.parentId,
        };
    };
}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}

export class UpdateCommentRequest
    implements RequestDto<Partial<MutableComment>, UpdateCommentDto>
{
    data: UpdateCommentDto;
    constructor(data: UpdateCommentDto) {
        this.data = data;
    }
    toEntity = (): Partial<MutableComment> => {
        return {
            content: this.data.content,
        };
    };
}
