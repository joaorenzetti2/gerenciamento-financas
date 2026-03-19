import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({ summary: 'Cria uma nova conta/carteira para o usuário autenticado' })
  @Post()
  create(@Body() createAccountDto: CreateAccountDto, @CurrentUser() user: { id: string }) {
    return this.accountsService.create(createAccountDto, user.id);
  }

  @ApiOperation({ summary: 'Lista todas as contas do usuário autenticado' })
  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.accountsService.findAll(user.id);
  }

  @ApiOperation({ summary: 'Busca os detalhes de uma conta específica' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.accountsService.findOne(id, user.id);
  }

  @ApiOperation({ summary: 'Atualiza informações básicas de uma conta' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.accountsService.update(id, updateAccountDto, user.id);
  }

  @ApiOperation({ summary: 'Remove uma conta (Soft Delete)' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.accountsService.remove(id, user.id);
  }
}
