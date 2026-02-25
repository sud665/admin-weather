import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

// 변수 세트 정의 (할인율, 기후시나리오, 피해함수, 사회경제경로)
export const variableSets = pgTable('variable_sets', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
});

// 각 세트의 하위 파라미터 정의
export const subParameters = pgTable('sub_parameters', {
  id: uuid('id').defaultRandom().primaryKey(),
  setId: uuid('set_id')
    .notNull()
    .references(() => variableSets.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
});

// 하위 파라미터의 값 (저/중/고 등)
export const parameterValues = pgTable('parameter_values', {
  id: uuid('id').defaultRandom().primaryKey(),
  subParameterId: uuid('sub_parameter_id')
    .notNull()
    .references(() => subParameters.id),
  label: varchar('label', { length: 100 }).notNull(),
  value: real('value').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
});

// 사전 계산된 시각화 결과
export const visualizationResults = pgTable('visualization_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  combinationKey: varchar('combination_key', { length: 500 }).notNull(),
  year: integer('year').notNull(),
  sccValue: real('scc_value'),
  temperature: real('temperature'),
  damageCost: real('damage_cost'),
  gdpLoss: real('gdp_loss'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// CMS 페이지 콘텐츠
export const pages = pgTable('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  title: varchar('title', { length: 300 }).notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 페이지 이미지
export const pageImages = pgTable('page_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  pageId: uuid('page_id')
    .notNull()
    .references(() => pages.id),
  filename: varchar('filename', { length: 300 }).notNull(),
  path: varchar('path', { length: 500 }).notNull(),
  altText: varchar('alt_text', { length: 300 }),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// 시각화 차트 설정 (관리자 수정 가능)
export const chartSettings = pgTable('chart_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  chartKey: varchar('chart_key', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(),
  xLabel: varchar('x_label', { length: 100 }),
  yLabel: varchar('y_label', { length: 100 }),
  unit: varchar('unit', { length: 50 }),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 관리자 계정
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
