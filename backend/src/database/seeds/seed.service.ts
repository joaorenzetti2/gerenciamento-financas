import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../modules/categories/entities/category.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.seedCategories();
  }

  private async seedCategories() {
    const defaultCategories = [
      { name: 'Alimentação', icon: 'utensils', color: '#FF5733' },
      { name: 'Transporte', icon: 'car', color: '#3357FF' },
      { name: 'Lazer', icon: 'gamepad', color: '#F333FF' },
      { name: 'Salário', icon: 'money-bill', color: '#33FF57' },
      { name: 'Mercado', icon: 'shopping-cart', color: '#FFAA33' },
      { name: 'Saúde', icon: 'heartbeat', color: '#FF3357' },
      { name: 'Fatura de Cartão', icon: 'credit-card', color: '#330000' },
    ];

    for (const cat of defaultCategories) {
      const exists = await this.categoryRepository.findOne({
        where: { name: cat.name },
      });

      if (!exists) {
        const newCat = this.categoryRepository.create(cat);
        await this.categoryRepository.save(newCat);
        this.logger.log(`🌱 Categoria "${cat.name}" inserida com sucesso.`);
      }
    }

    this.logger.log('✅ Seed de categorias concluído.');
  }
}
