import { HttpException, HttpStatus } from "@nestjs/common";
import { hatefulWords } from "../../config";

export const validateUserCanMutateComment = (
    authorId: number,
    userId: number,
) => {
    if (authorId !== userId) {
        throw new Error("User cannot mutate comment");
    }
};

export const validateCommentContent = (content: string) => {
    for (const word of hatefulWords) {
        if (content.toLowerCase().includes(word)) {
            throw new HttpException(
                "Hateful comment detected",
                HttpStatus.BAD_REQUEST,
            );
        }
    }
};
