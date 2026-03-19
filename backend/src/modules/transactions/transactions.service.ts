import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, PaymentMethod } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly accountsService: AccountsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: string): Promise<Transaction> {
    const { amount, type, paymentMethod, dueDate, accountId, categoryId, subcategoryId, date, description } = createTransactionDto;

    const account = await this.accountsService.findOne(accountId, userId);

    const transaction = this.transactionRepository.create({
      amount,
      date: new Date(date),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      description,
      type,
      paymentMethod,
      user: { id: userId },
      account: { id: accountId },
      category: categoryId ? { id: categoryId } : undefined,
      subcategory: subcategoryId ? { id: subcategoryId } : undefined,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Sync Balance - Skip logic for Credit Card expenses
    if (!(type === TransactionType.EXPENSE && paymentMethod === PaymentMethod.CREDIT_CARD)) {
      let newBalance = Number(account.balance);
      if (type === TransactionType.INCOME) {
        newBalance += Number(amount);
      } else {
        newBalance -= Number(amount);
      }
      await this.accountsService.update(accountId, { balance: newBalance }, userId);
    }

    return savedTransaction;
  }

  async findAll(userId: string, day?: string, week?: string, month?: string, year?: string): Promise<Transaction[]> {
    const query = this.transactionRepository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.subcategory', 'subcategory')
      .where('transaction.user_id = :userId', { userId })
      .orderBy('transaction.date', 'DESC');

    if (year) {
      if (day && month) {
        query.andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
             .andWhere('EXTRACT(MONTH FROM transaction.date) = :month', { month })
             .andWhere('EXTRACT(DAY FROM transaction.date) = :day', { day });
      } else if (week) {
        query.andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
             .andWhere('EXTRACT(WEEK FROM transaction.date) = :week', { week });
      } else if (month) {
        query.andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
             .andWhere('EXTRACT(MONTH FROM transaction.date) = :month', { month });
      } else {
        query.andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year });
      }
    }

    return query.getMany();
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['account', 'category', 'subcategory'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, userId: string): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);

    if (updateTransactionDto.amount || updateTransactionDto.type || updateTransactionDto.accountId || updateTransactionDto.paymentMethod) {
      throw new BadRequestException('Para alterar valores, constas, tipos ou métodos da transação, por favor delete e recrie a transação.');
    }

    Object.assign(transaction, updateTransactionDto);
    
    if (updateTransactionDto.categoryId) {
      transaction.category = { id: updateTransactionDto.categoryId } as any;
    }
    
    if (updateTransactionDto.subcategoryId) {
      transaction.subcategory = { id: updateTransactionDto.subcategoryId } as any;
    }

    return this.transactionRepository.save(transaction);
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);
    
    // Revert balance backwards checking credit card bypass
    if (!(transaction.type === TransactionType.EXPENSE && transaction.paymentMethod === PaymentMethod.CREDIT_CARD)) {
      const account = await this.accountsService.findOne(transaction.account.id, userId);
      let revertAmount = Number(account.balance);
      
      if (transaction.type === TransactionType.INCOME) {
        revertAmount -= Number(transaction.amount); // Undo income
      } else {
        revertAmount += Number(transaction.amount); // Undo expense
      }
        
      await this.accountsService.update(account.id, { balance: revertAmount }, userId);
    }

    await this.transactionRepository.softRemove(transaction);
  }
}
