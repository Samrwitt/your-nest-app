import { NestFactory } from '@nestjs/core';
import { AppModule } from './auth.module';
import * as cookieParser from 'cookie-parser';
import {JwtMiddleware} from './jwt.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(new JwtMiddleware().use);
  app.enableCors({origin:'https://localhost:8080',
  credentials:true});
  await app.listen(8001);
}
bootstrap();



