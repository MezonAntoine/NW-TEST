import { Mutable } from "../../utils/types";

export type Comment = {
    id: number;
    articleId: number;
    authorId: number;
    content: string;
    parentId?: number;
    createdAt: Date;
    updatedAt: Date;
};

export interface CommentChildrens extends Comment {
    childrens?: Comment[];
}

export type MutableComment = Mutable<Omit<Comment, "articleId" | "authorId">>;
