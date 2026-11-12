import { INestApplication, ValidationPipe } from "@nestjs/common";

export function initApp(app: INestApplication<any>) {
    app.enableCors({});                         // CORS: one line
    app.useGlobalPipes(new ValidationPipe({}))  // validate every DTO
}