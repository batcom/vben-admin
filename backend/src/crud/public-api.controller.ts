import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../common/prisma.service';

@Controller('public')
export class PublicApiController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get('articles')
  async listArticles() {
    return this.prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true, summary: true, coverUrl: true, tags: true, publishedAt: true },
    });
  }

  @Public()
  @Get('articles/:id')
  async getArticle(@Param('id') id: string) {
    return this.prisma.article.findUnique({ where: { id: parseInt(id, 10) } });
  }
}
