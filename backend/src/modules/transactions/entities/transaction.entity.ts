import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Account } from '../../accounts/entities/account.entity';
import { Category } from '../../categories/entities/category.entity';
import { Subcategory } from '../../subcategories/entities/subcategory.entity';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
}

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp with time zone' })
  date: Date;

  @Column({ name: 'due_date', type: 'timestamp with time zone', nullable: true })
  dueDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.PIX })
  paymentMethod: PaymentMethod;

  // Relation with User
  @Index()
  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relation with Account
  @Index()
  @ManyToOne(() => Account, (account) => account.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  // Relation with Category (Global)
  @Index()
  @ManyToOne(() => Category, (category) => category.transactions, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  // Relation with Subcategory
  @ManyToOne(() => Subcategory, { nullable: true })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory?: Subcategory;
}
