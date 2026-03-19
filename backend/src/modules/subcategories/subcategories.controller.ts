import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SubcategoriesService } from './subcategories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('subcategories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @ApiOperation({ summary: 'Cria uma subcategoria personalizada atrelada à categoria pai' })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'iFood' } } } })
  @Post('categories/:categoryId/subcategories')
  create(
    @Param('categoryId') categoryId: string,
    @Body('name') name: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.subcategoriesService.create(categoryId, name, user.id);
  }

  @ApiOperation({ summary: 'Busca as subcategorias mistas (Globais e Customizadas) de uma categoria pai' })
  @Get('categories/:categoryId/subcategories')
  findAllByCategory(
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.subcategoriesService.findAllByCategory(categoryId, user.id);
  }

  @ApiOperation({ summary: 'Remove uma subcategoria privada do usuário (Soft Delete)' })
  @Delete('subcategories/:id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.subcategoriesService.remove(id, user.id);
  }
}
