import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
} from "@nestjs/common";
import { hatefulWords } from "../../../config";

@Injectable()
export class ValidateCommentContentGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const content: string = request.body.content;
        for (const word of hatefulWords) {
            if (content.toLowerCase().includes(word)) {
                throw new BadRequestException("Hateful comment detected");
            }
        }

        return true;
    }
}
