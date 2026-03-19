-- Script to seed initial global categories for the MVP
-- Run this in your database or configure a TypeORM migration/seeder later.

INSERT INTO categories (id, name, icon, color, "created_at", "updated_at") VALUES 
  (gen_random_uuid(), 'Alimentação', 'utensils', '#FF5733', NOW(), NOW()),
  (gen_random_uuid(), 'Transporte', 'car', '#3357FF', NOW(), NOW()),
  (gen_random_uuid(), 'Lazer', 'gamepad', '#F333FF', NOW(), NOW()),
  (gen_random_uuid(), 'Salário', 'money-bill', '#33FF57', NOW(), NOW()),
  (gen_random_uuid(), 'Mercado', 'shopping-cart', '#FFAA33', NOW(), NOW()),
  (gen_random_uuid(), 'Saúde', 'heartbeat', '#FF3357', NOW(), NOW()),
  (gen_random_uuid(), 'Fatura de Cartão', 'credit-card', '#330000', NOW(), NOW())
ON CONFLICT DO NOTHING;
