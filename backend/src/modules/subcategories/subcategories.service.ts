import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from './entities/subcategory.entity';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
  ) {}

  async create(categoryId: string, name: string, userId: string): Promise<Subcategory> {
    const subcategory = this.subcategoryRepository.create({
      name,
      category: { id: categoryId },
      user: { id: userId },
    });
    return this.subcategoryRepository.save(subcategory);
  }

  async findAllByCategory(categoryId: string, userId: string): Promise<Subcategory[]> {
    return this.subcategoryRepository
      .createQueryBuilder('subcategory')
      .where('subcategory.category_id = :categoryId', { categoryId })
      .andWhere('(subcategory.user_id IS NULL OR subcategory.user_id = :userId)', { userId })
      .orderBy('subcategory.name', 'ASC')
      .getMany();
  }

  async remove(id: string, userId: string): Promise<void> {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!subcategory) {
      throw new NotFoundException('Subcategoria não encontrada.');
    }

    if (!subcategory.user || subcategory.user.id !== userId) {
      throw new ForbiddenException('Acesso negado. Apenas o criador pode remover essa subcategoria.');
    }

    await this.subcategoryRepository.softRemove(subcategory);
  }
}
