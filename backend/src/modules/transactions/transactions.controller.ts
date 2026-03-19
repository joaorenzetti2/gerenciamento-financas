import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Registra uma nova transação financeira' })
  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @CurrentUser() user: { id: string }) {
    return this.transactionsService.create(createTransactionDto, user.id);
  }

  @ApiOperation({ summary: 'Lista todas as transações do usuário logado' })
  @ApiQuery({ name: 'day', required: false, type: String, description: 'Dia (1-31)' })
  @ApiQuery({ name: 'week', required: false, type: String, description: 'Semana do ano (1-52)' })
  @ApiQuery({ name: 'month', required: false, type: String, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'year', required: false, type: String, description: 'Ano (ex: 2026)' })
  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query('day') day?: string,
    @Query('week') week?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.transactionsService.findAll(user.id, day, week, month, year);
  }

  @ApiOperation({ summary: 'Retorna detalhes de uma transação específica' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.transactionsService.findOne(id, user.id);
  }

  @ApiOperation({ summary: 'Atualiza dados de uma transação (exceto valor/conta)' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.transactionsService.update(id, updateTransactionDto, user.id);
  }

  @ApiOperation({ summary: 'Estorna e remove uma transação financeira' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.transactionsService.remove(id, user.id);
  }
}
