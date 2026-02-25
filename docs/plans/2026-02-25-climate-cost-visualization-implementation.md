# 기후변화 피해비용 시각화 웹사이트 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 사용자가 변수를 선택하면 사전 계산된 기후변화 피해비용(SCC)을 차트/그래프/표로 시각화하는 인터랙티브 웹사이트를 구축한다.

**Architecture:** Next.js 15 App Router 풀스택. 프론트엔드에서 변수를 선택하면 API Route를 통해 PostgreSQL에서 사전 계산된 결과를 조회하고 Recharts로 렌더링한다. 관리자 CMS는 NextAuth.js로 보호된 /admin 경로에서 콘텐츠와 시각화 설정을 관리한다.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Drizzle ORM, PostgreSQL (Docker), NextAuth.js

**Design Doc:** `docs/plans/2026-02-25-climate-cost-visualization-design.md`

---

## Task 1: Next.js 프로젝트 초기화

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `.env.local`, `.env.example`, `.gitignore`

**Step 1: Next.js 15 프로젝트 생성**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

프로젝트 루트(현재 디렉토리)에 생성. `docs/` 폴더는 이미 존재하므로 덮어쓰지 않는다.

**Step 2: 핵심 의존성 설치**

```bash
npm install recharts drizzle-orm postgres dotenv
npm install -D drizzle-kit @types/node
```

**Step 3: shadcn/ui 초기화**

```bash
npx shadcn@latest init -d
```

기본 설정으로 초기화한다. `components.json`이 생성된다.

**Step 4: 필요한 shadcn/ui 컴포넌트 설치**

```bash
npx shadcn@latest add button card tabs accordion select label input textarea table dropdown-menu separator badge dialog sheet tooltip
```

**Step 5: 환경변수 파일 생성**

`.env.local`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/climate_viz
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

`.env.example`:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**Step 6: .gitignore에 추가**

`.gitignore` 에 다음 항목 확인/추가:
```
.env.local
.env.*.local
```

**Step 7: 개발 서버 실행 확인**

```bash
npm run dev
```
Expected: `http://localhost:3000` 에서 Next.js 기본 페이지 표시

**Step 8: 커밋**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 project with dependencies"
```

---

## Task 2: Docker PostgreSQL 설정

**Files:**
- Create: `docker-compose.yml`
- Create: `scripts/init-db.sql`

**Step 1: docker-compose.yml 작성**

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: climate-viz-db
    restart: unless-stopped
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: climate_viz
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  pgdata:
```

**Step 2: init-db.sql 작성**

```sql
-- 확장 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Step 3: Docker 컨테이너 실행**

```bash
docker compose up -d
```
Expected: `climate-viz-db` 컨테이너가 실행 중

**Step 4: DB 연결 확인**

```bash
docker exec -it climate-viz-db psql -U postgres -d climate_viz -c "SELECT 1;"
```
Expected: `1` 반환

**Step 5: 커밋**

```bash
git add docker-compose.yml scripts/init-db.sql
git commit -m "infra: add Docker PostgreSQL setup"
```

---

## Task 3: Drizzle ORM 스키마 정의

**Files:**
- Create: `src/db/index.ts`
- Create: `src/db/schema.ts`
- Create: `drizzle.config.ts`

**Step 1: Drizzle 설정 파일 작성**

`drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Step 2: DB 연결 모듈 작성**

`src/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

**Step 3: 스키마 작성**

`src/db/schema.ts`:
```typescript
import { pgTable, uuid, varchar, text, integer, real, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

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
  setId: uuid('set_id').notNull().references(() => variableSets.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
});

// 하위 파라미터의 값 (저/중/고 등)
export const parameterValues = pgTable('parameter_values', {
  id: uuid('id').defaultRandom().primaryKey(),
  subParameterId: uuid('sub_parameter_id').notNull().references(() => subParameters.id),
  label: varchar('label', { length: 100 }).notNull(),
  value: real('value').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
});

// 사전 계산된 시각화 결과
export const visualizationResults = pgTable('visualization_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  // 4개 세트에서 각각 선택된 조합 키 (sub_param_id:value_id 형태의 복합키)
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
  pageId: uuid('page_id').notNull().references(() => pages.id),
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
```

**Step 4: 마이그레이션 생성 및 실행**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```
Expected: 테이블이 PostgreSQL에 생성됨

**Step 5: DB 테이블 확인**

```bash
docker exec -it climate-viz-db psql -U postgres -d climate_viz -c "\dt"
```
Expected: variable_sets, sub_parameters, parameter_values, visualization_results, pages, page_images, chart_settings, admin_users 테이블 목록 표시

**Step 6: 커밋**

```bash
git add src/db/ drizzle.config.ts drizzle/
git commit -m "feat: add Drizzle ORM schema for all tables"
```

---

## Task 4: 목업 데이터 시드 스크립트

**Files:**
- Create: `scripts/seed.ts`
- Modify: `package.json` (seed 스크립트 추가)

**Step 1: 시드 스크립트 작성**

`scripts/seed.ts`:
```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding database...');

  // 1. 변수 세트 생성
  const sets = await db.insert(schema.variableSets).values([
    { name: '할인율', description: '미래 피해의 현재가치 환산 관련 파라미터', order: 1 },
    { name: '기후 시나리오', description: '온실가스 배출 경로 및 기후 민감도', order: 2 },
    { name: '피해함수', description: '기온 상승에 따른 경제적 피해 관계', order: 3 },
    { name: '사회경제 경로', description: 'GDP, 인구, 기술 발전 전망', order: 4 },
  ]).returning();

  // 2. 각 세트별 하위 파라미터 + 값 생성
  const subParamConfigs = [
    {
      setIndex: 0,
      params: [
        { name: '순시간선호율 (PRTP)', values: [{ label: '0.1%', value: 0.001 }, { label: '1.5%', value: 0.015 }, { label: '3.0%', value: 0.03 }] },
        { name: '소비탄력성 (η)', values: [{ label: '1.0', value: 1.0 }, { label: '1.5', value: 1.5 }, { label: '2.0', value: 2.0 }] },
        { name: '성장률 조정', values: [{ label: '저성장', value: 0.01 }, { label: '기준', value: 0.02 }, { label: '고성장', value: 0.03 }] },
      ],
    },
    {
      setIndex: 1,
      params: [
        { name: 'SSP-RCP 시나리오', values: [{ label: 'SSP1-2.6', value: 2.6 }, { label: 'SSP2-4.5', value: 4.5 }, { label: 'SSP5-8.5', value: 8.5 }] },
        { name: '기후민감도 (ECS)', values: [{ label: '2.0°C', value: 2.0 }, { label: '3.0°C', value: 3.0 }, { label: '4.5°C', value: 4.5 }] },
        { name: '탄소순환 모델', values: [{ label: '보수적', value: 1 }, { label: '중간', value: 2 }, { label: '적극적', value: 3 }] },
      ],
    },
    {
      setIndex: 2,
      params: [
        { name: '피해함수 유형', values: [{ label: 'Howard-Sterner', value: 1 }, { label: 'DICE-2016', value: 2 }, { label: 'Burke et al.', value: 3 }] },
        { name: '지역 가중치', values: [{ label: '균등', value: 1 }, { label: 'GDP 가중', value: 2 }, { label: '인구 가중', value: 3 }] },
        { name: '비선형 정도', values: [{ label: '선형', value: 1 }, { label: '이차', value: 2 }, { label: '지수', value: 3 }] },
      ],
    },
    {
      setIndex: 3,
      params: [
        { name: 'GDP 성장률', values: [{ label: '저성장', value: 0.015 }, { label: '중간', value: 0.025 }, { label: '고성장', value: 0.04 }] },
        { name: '인구 전망', values: [{ label: '감소', value: -0.005 }, { label: '안정', value: 0.0 }, { label: '증가', value: 0.005 }] },
        { name: '기술 발전', values: [{ label: '점진적', value: 1 }, { label: '기준', value: 2 }, { label: '혁신적', value: 3 }] },
      ],
    },
  ];

  for (const config of subParamConfigs) {
    for (let p = 0; p < config.params.length; p++) {
      const param = config.params[p];
      const [subParam] = await db.insert(schema.subParameters).values({
        setId: sets[config.setIndex].id,
        name: param.name,
        order: p + 1,
      }).returning();

      for (let v = 0; v < param.values.length; v++) {
        await db.insert(schema.parameterValues).values({
          subParameterId: subParam.id,
          label: param.values[v].label,
          value: param.values[v].value,
          order: v + 1,
        });
      }
    }
  }

  // 3. 목업 시각화 결과 생성 (대표 조합 몇 개)
  const years = Array.from({ length: 28 }, (_, i) => 2023 + i * 3); // 2023~2104
  const combos = ['default', 'high-damage', 'low-discount', 'extreme'];

  for (const combo of combos) {
    for (const year of years) {
      const baseValue = combo === 'default' ? 50 : combo === 'high-damage' ? 120 : combo === 'low-discount' ? 80 : 200;
      const yearFactor = (year - 2023) / 80;

      await db.insert(schema.visualizationResults).values({
        combinationKey: combo,
        year,
        sccValue: baseValue * (1 + yearFactor * 2) + (Math.random() - 0.5) * 10,
        temperature: 1.1 + yearFactor * (combo === 'extreme' ? 4.5 : 2.5),
        damageCost: baseValue * yearFactor * 100,
        gdpLoss: yearFactor * (combo === 'high-damage' ? 8 : 3),
      });
    }
  }

  // 4. 차트 설정 시드
  await db.insert(schema.chartSettings).values([
    { chartKey: 'scc-timeline', title: '탄소의 사회적 비용 (SCC) 시계열', xLabel: '연도', yLabel: 'SCC ($/tCO₂)', unit: '$/tCO₂', description: '시간에 따른 탄소의 사회적 비용 변화 추이' },
    { chartKey: 'scenario-comparison', title: '시나리오별 피해비용 비교', xLabel: '시나리오', yLabel: '피해비용', unit: '조 원', description: '각 시나리오별 누적 피해비용 비교' },
    { chartKey: 'temp-damage', title: '기온 상승 vs 경제적 피해', xLabel: '기온 상승 (°C)', yLabel: 'GDP 손실 (%)', unit: '%', description: '기온 상승 정도에 따른 GDP 손실률' },
    { chartKey: 'damage-distribution', title: '피해비용 확률 분포', xLabel: '피해비용 (조 원)', yLabel: '빈도', unit: '', description: '피해비용의 확률적 분포' },
  ]);

  // 5. CMS 페이지 시드
  await db.insert(schema.pages).values([
    { slug: 'about', title: '모델 소개', content: '한국형 앙상블 기후변화통합평가모형(IAM)은 기후에너지환경부의 국가과제로 개발되었습니다.', published: true },
    { slug: 'about/background', title: '연구 배경', content: '해외 탄소의 사회적 비용(SCC) 추정 기술을 국내 상황에 맞게 고도화하는 연구입니다.', published: true },
    { slug: 'about/methodology', title: '모형 개요', content: '본 모형은 기후 모듈, 경제 모듈, 피해 모듈을 통합한 앙상블 접근법을 사용합니다.', published: true },
    { slug: 'about/applications', title: '활용 방안', content: '정책 결정, 탄소 가격 산정, 기후 적응 전략 수립 등에 활용됩니다.', published: true },
  ]);

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

**Step 2: package.json에 seed 스크립트 추가**

```json
"scripts": {
  "seed": "npx tsx scripts/seed.ts"
}
```

**Step 3: tsx 설치 및 시드 실행**

```bash
npm install -D tsx
npm run seed
```
Expected: "Seeding complete!" 출력

**Step 4: 시드 데이터 확인**

```bash
docker exec -it climate-viz-db psql -U postgres -d climate_viz -c "SELECT count(*) FROM variable_sets;"
```
Expected: `4`

**Step 5: 커밋**

```bash
git add scripts/seed.ts package.json
git commit -m "feat: add mock data seed script"
```

---

## Task 5: 공통 레이아웃 + 네비게이션

**Files:**
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/layout/nav-links.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: 한국어 폰트 + 글로벌 CSS 설정**

`src/app/globals.css` 에 Pretendard 폰트 import 추가 (기존 Tailwind 설정 유지):
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
```

`tailwind.config.ts` 의 fontFamily에 추가:
```typescript
fontFamily: {
  sans: ['Pretendard Variable', ...defaultTheme.fontFamily.sans],
},
```

**Step 2: 네비게이션 링크 컴포넌트 작성**

`src/components/layout/nav-links.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: '홈' },
  { href: '/visualization', label: '데이터 시각화' },
  { href: '/about', label: '모델 소개' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === link.href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

**Step 3: 헤더 컴포넌트 작성**

`src/components/layout/header.tsx`:
```tsx
import Link from 'next/link';
import { NavLinks } from './nav-links';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold">기후변화 피해비용 시각화</span>
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
```

**Step 4: 푸터 컴포넌트 작성**

`src/components/layout/footer.tsx`:
```tsx
export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
        <p>기후에너지환경부 국가과제</p>
        <p>한국형 앙상블 기후변화통합평가모형(IAM) 연구</p>
        <p className="mt-2">&copy; {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  );
}
```

**Step 5: 루트 레이아웃 수정**

`src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';

export const metadata: Metadata = {
  title: '기후변화 피해비용 시각화',
  description: '한국형 앙상블 기후변화통합평가모형(IAM) 연구 결과 시각화',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

**Step 6: 개발 서버 확인**

```bash
npm run dev
```
Expected: `http://localhost:3000` 에서 헤더 + 네비게이션 + 푸터 표시

**Step 7: 커밋**

```bash
git add src/components/layout/ src/app/layout.tsx src/app/globals.css tailwind.config.ts
git commit -m "feat: add layout with header, navigation, and footer"
```

---

## Task 6: 메인 랜딩 페이지

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 메인 페이지 작성**

`src/app/page.tsx`:
```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* 히어로 섹션 */}
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          기후변화 피해비용
          <br />
          <span className="text-primary">통합평가 모델</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          한국형 앙상블 기후변화통합평가모형(IAM)의 연구 결과를 인터랙티브 시각화로 확인하세요.
          변수를 조정하여 기후변화가 초래하는 경제적 피해비용의 변화를 탐색할 수 있습니다.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/visualization">데이터 시각화 시작</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">모델 소개</Link>
          </Button>
        </div>
      </section>

      {/* 핵심 기능 카드 */}
      <section className="mt-24 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>인터랙티브 시각화</CardTitle>
            <CardDescription>변수를 조정하며 실시간으로 변화하는 결과를 확인</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              할인율, 기후 시나리오, 피해함수, 사회경제 경로 등 주요 변수를 선택하면
              해당하는 기후변화 피해비용을 다양한 차트로 시각화합니다.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>다양한 시나리오</CardTitle>
            <CardDescription>4개 변수 세트, 각 27가지 조합</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              연구팀이 사전 계산한 방대한 데이터 세트를 기반으로,
              다양한 가정 하에서의 피해비용을 비교 분석할 수 있습니다.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>데이터 기반 정책</CardTitle>
            <CardDescription>투명한 연구 결과 공개</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              시민, 정책 입안자, 연구자 모두가 접근할 수 있도록
              데이터를 투명하게 공개하여 정책적 논의를 활성화합니다.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
```

**Step 2: 확인**

```bash
npm run dev
```
Expected: 랜딩 페이지에 히어로 섹션 + 3개 카드 표시

**Step 3: 커밋**

```bash
git add src/app/page.tsx
git commit -m "feat: add landing page with hero and feature cards"
```

---

## Task 7: 시각화 API Route

**Files:**
- Create: `src/app/api/variables/route.ts`
- Create: `src/app/api/visualization/route.ts`
- Create: `src/app/api/chart-settings/route.ts`

**Step 1: 변수 세트 API 작성**

`src/app/api/variables/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { variableSets, subParameters, parameterValues } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  const sets = await db.select().from(variableSets).orderBy(asc(variableSets.order));

  const result = await Promise.all(
    sets.map(async (set) => {
      const params = await db
        .select()
        .from(subParameters)
        .where(eq(subParameters.setId, set.id))
        .orderBy(asc(subParameters.order));

      const paramsWithValues = await Promise.all(
        params.map(async (param) => {
          const values = await db
            .select()
            .from(parameterValues)
            .where(eq(parameterValues.subParameterId, param.id))
            .orderBy(asc(parameterValues.order));
          return { ...param, values };
        })
      );

      return { ...set, subParameters: paramsWithValues };
    })
  );

  return NextResponse.json(result);
}
```

**Step 2: 시각화 결과 API 작성**

`src/app/api/visualization/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { visualizationResults } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const combinationKey = searchParams.get('combination') || 'default';

  const results = await db
    .select()
    .from(visualizationResults)
    .where(eq(visualizationResults.combinationKey, combinationKey))
    .orderBy(asc(visualizationResults.year));

  return NextResponse.json(results);
}
```

**Step 3: 차트 설정 API 작성**

`src/app/api/chart-settings/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chartSettings } from '@/db/schema';

export async function GET() {
  const settings = await db.select().from(chartSettings);
  return NextResponse.json(settings);
}
```

**Step 4: API 테스트**

```bash
curl http://localhost:3000/api/variables | jq '.[0].name'
```
Expected: `"할인율"` 반환

```bash
curl "http://localhost:3000/api/visualization?combination=default" | jq '.[0]'
```
Expected: year, sccValue 등의 JSON 객체 반환

**Step 5: 커밋**

```bash
git add src/app/api/
git commit -m "feat: add API routes for variables, visualization, and chart settings"
```

---

## Task 8: 시각화 페이지 - 변수 선택 패널

**Files:**
- Create: `src/app/visualization/page.tsx`
- Create: `src/components/visualization/variable-panel.tsx`
- Create: `src/components/visualization/variable-set-accordion.tsx`
- Create: `src/lib/types.ts`

**Step 1: 타입 정의**

`src/lib/types.ts`:
```typescript
export interface ParameterValue {
  id: string;
  label: string;
  value: number;
  description: string | null;
  order: number;
}

export interface SubParameter {
  id: string;
  name: string;
  description: string | null;
  order: number;
  values: ParameterValue[];
}

export interface VariableSet {
  id: string;
  name: string;
  description: string | null;
  order: number;
  subParameters: SubParameter[];
}

export interface VisualizationResult {
  id: string;
  combinationKey: string;
  year: number;
  sccValue: number | null;
  temperature: number | null;
  damageCost: number | null;
  gdpLoss: number | null;
}

export interface ChartSetting {
  id: string;
  chartKey: string;
  title: string;
  xLabel: string | null;
  yLabel: string | null;
  unit: string | null;
  description: string | null;
}
```

**Step 2: 변수 세트 아코디언 컴포넌트**

`src/components/visualization/variable-set-accordion.tsx`:
```tsx
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { VariableSet } from '@/lib/types';

interface Props {
  sets: VariableSet[];
  selections: Record<string, string>;
  onSelectionChange: (subParamId: string, valueId: string) => void;
}

export function VariableSetAccordion({ sets, selections, onSelectionChange }: Props) {
  return (
    <TooltipProvider>
      <Accordion type="multiple" defaultValue={sets.map((s) => s.id)} className="w-full">
        {sets.map((set) => (
          <AccordionItem key={set.id} value={set.id}>
            <AccordionTrigger className="text-sm font-semibold">
              {set.name}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              {set.description && (
                <p className="text-xs text-muted-foreground">{set.description}</p>
              )}
              {set.subParameters.map((param) => (
                <div key={param.id} className="space-y-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="cursor-help text-xs">{param.name}</Label>
                    </TooltipTrigger>
                    {param.description && (
                      <TooltipContent>
                        <p className="max-w-xs text-xs">{param.description}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  <Select
                    value={selections[param.id] || param.values[0]?.id}
                    onValueChange={(valueId) => onSelectionChange(param.id, valueId)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {param.values.map((v) => (
                        <SelectItem key={v.id} value={v.id} className="text-xs">
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </TooltipProvider>
  );
}
```

**Step 3: 변수 패널 컴포넌트**

`src/components/visualization/variable-panel.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { VariableSetAccordion } from './variable-set-accordion';
import type { VariableSet } from '@/lib/types';

interface Props {
  onCombinationChange: (combination: string) => void;
}

export function VariablePanel({ onCombinationChange }: Props) {
  const [sets, setSets] = useState<VariableSet[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/variables')
      .then((res) => res.json())
      .then((data: VariableSet[]) => {
        setSets(data);
        // 기본값 설정: 각 파라미터의 첫 번째 값
        const defaults: Record<string, string> = {};
        data.forEach((set) => {
          set.subParameters.forEach((param) => {
            if (param.values.length > 0) {
              defaults[param.id] = param.values[0].id;
            }
          });
        });
        setSelections(defaults);
        setLoading(false);
      });
  }, []);

  const handleSelectionChange = (subParamId: string, valueId: string) => {
    const newSelections = { ...selections, [subParamId]: valueId };
    setSelections(newSelections);
    // 프로토타입에서는 간단한 combination key 사용
    onCombinationChange('default');
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">변수 데이터 로딩 중...</div>;
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="mb-4 text-sm font-bold">변수 선택</h2>
      <VariableSetAccordion
        sets={sets}
        selections={selections}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}
```

**Step 4: 시각화 페이지 작성 (기본 구조)**

`src/app/visualization/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { VariablePanel } from '@/components/visualization/variable-panel';

export default function VisualizationPage() {
  const [combination, setCombination] = useState('default');

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">기후변화 피해비용 데이터 시각화</h1>
      <div className="flex gap-6">
        {/* 좌측: 변수 선택 패널 */}
        <aside className="w-72 shrink-0 rounded-lg border bg-card">
          <VariablePanel onCombinationChange={setCombination} />
        </aside>

        {/* 우측: 차트 영역 (Task 9에서 구현) */}
        <section className="flex-1 space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              선택된 조합: <code>{combination}</code>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">차트가 여기에 표시됩니다.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
```

**Step 5: 확인**

```bash
npm run dev
```
Expected: `/visualization` 경로에서 좌측에 4개 변수 세트 아코디언, 각 세트에 3개 드롭다운 표시

**Step 6: 커밋**

```bash
git add src/lib/types.ts src/components/visualization/ src/app/visualization/
git commit -m "feat: add visualization page with variable selection panel"
```

---

## Task 9: 시각화 페이지 - 차트 구현

**Files:**
- Create: `src/components/visualization/charts/scc-line-chart.tsx`
- Create: `src/components/visualization/charts/scenario-bar-chart.tsx`
- Create: `src/components/visualization/charts/temp-damage-scatter.tsx`
- Create: `src/components/visualization/charts/data-table-view.tsx`
- Create: `src/components/visualization/chart-area.tsx`
- Create: `src/hooks/use-visualization-data.ts`
- Modify: `src/app/visualization/page.tsx`

**Step 1: 데이터 페칭 훅**

`src/hooks/use-visualization-data.ts`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import type { VisualizationResult, ChartSetting } from '@/lib/types';

export function useVisualizationData(combination: string) {
  const [data, setData] = useState<VisualizationResult[]>([]);
  const [chartSettings, setChartSettings] = useState<ChartSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/visualization?combination=${combination}`).then((r) => r.json()),
      fetch('/api/chart-settings').then((r) => r.json()),
    ]).then(([vizData, settings]) => {
      setData(vizData);
      setChartSettings(settings);
      setLoading(false);
    });
  }, [combination]);

  const getSetting = (key: string) => chartSettings.find((s) => s.chartKey === key);

  return { data, chartSettings, getSetting, loading };
}
```

**Step 2: SCC 라인 차트**

`src/components/visualization/charts/scc-line-chart.tsx`:
```tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { VisualizationResult, ChartSetting } from '@/lib/types';

interface Props {
  data: VisualizationResult[];
  setting?: ChartSetting;
}

export function SccLineChart({ data, setting }: Props) {
  const chartData = data.map((d) => ({
    year: d.year,
    scc: d.sccValue ? Math.round(d.sccValue * 100) / 100 : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{setting?.title || 'SCC 시계열'}</CardTitle>
        {setting?.description && (
          <CardDescription className="text-xs">{setting.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" fontSize={12} />
            <YAxis fontSize={12} label={{ value: setting?.unit || '$/tCO₂', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="scc" name="SCC" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

**Step 3: 시나리오 바 차트**

`src/components/visualization/charts/scenario-bar-chart.tsx`:
```tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { VisualizationResult, ChartSetting } from '@/lib/types';

interface Props {
  data: VisualizationResult[];
  setting?: ChartSetting;
}

export function ScenarioBarChart({ data, setting }: Props) {
  // 10년 간격 데이터만 추출하여 바 차트 표시
  const chartData = data
    .filter((d) => d.year % 10 === 3) // 2023, 2033, 2043, ...
    .map((d) => ({
      year: d.year.toString(),
      damageCost: d.damageCost ? Math.round(d.damageCost) : 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{setting?.title || '시나리오별 피해비용'}</CardTitle>
        {setting?.description && (
          <CardDescription className="text-xs">{setting.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="damageCost" name="피해비용" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

**Step 4: 기온-피해 산점도**

`src/components/visualization/charts/temp-damage-scatter.tsx`:
```tsx
'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { VisualizationResult, ChartSetting } from '@/lib/types';

interface Props {
  data: VisualizationResult[];
  setting?: ChartSetting;
}

export function TempDamageScatter({ data, setting }: Props) {
  const chartData = data.map((d) => ({
    temperature: d.temperature ? Math.round(d.temperature * 100) / 100 : 0,
    gdpLoss: d.gdpLoss ? Math.round(d.gdpLoss * 100) / 100 : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{setting?.title || '기온 vs GDP 손실'}</CardTitle>
        {setting?.description && (
          <CardDescription className="text-xs">{setting.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="temperature" name="기온 상승" unit="°C" fontSize={12} />
            <YAxis dataKey="gdpLoss" name="GDP 손실" unit="%" fontSize={12} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="기온-피해" data={chartData} fill="#ef4444" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

**Step 5: 데이터 테이블**

`src/components/visualization/charts/data-table-view.tsx`:
```tsx
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { VisualizationResult } from '@/lib/types';

interface Props {
  data: VisualizationResult[];
}

export function DataTableView({ data }: Props) {
  const downloadCSV = () => {
    const headers = ['연도', 'SCC ($/tCO₂)', '기온상승 (°C)', '피해비용', 'GDP 손실 (%)'];
    const rows = data.map((d) =>
      [d.year, d.sccValue?.toFixed(2), d.temperature?.toFixed(2), d.damageCost?.toFixed(0), d.gdpLoss?.toFixed(2)].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate-cost-data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">상세 데이터</CardTitle>
        <Button variant="outline" size="sm" onClick={downloadCSV}>
          CSV 다운로드
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>연도</TableHead>
                <TableHead className="text-right">SCC ($/tCO₂)</TableHead>
                <TableHead className="text-right">기온상승 (°C)</TableHead>
                <TableHead className="text-right">피해비용</TableHead>
                <TableHead className="text-right">GDP 손실 (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell className="text-right">{row.sccValue?.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{row.temperature?.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{row.damageCost?.toFixed(0)}</TableCell>
                  <TableCell className="text-right">{row.gdpLoss?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 6: 차트 영역 통합 컴포넌트**

`src/components/visualization/chart-area.tsx`:
```tsx
'use client';

import { useVisualizationData } from '@/hooks/use-visualization-data';
import { SccLineChart } from './charts/scc-line-chart';
import { ScenarioBarChart } from './charts/scenario-bar-chart';
import { TempDamageScatter } from './charts/temp-damage-scatter';
import { DataTableView } from './charts/data-table-view';

interface Props {
  combination: string;
}

export function ChartArea({ combination }: Props) {
  const { data, getSetting, loading } = useVisualizationData(combination);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-muted-foreground">데이터 로딩 중...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-muted-foreground">선택한 조합에 해당하는 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SccLineChart data={data} setting={getSetting('scc-timeline')} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ScenarioBarChart data={data} setting={getSetting('scenario-comparison')} />
        <TempDamageScatter data={data} setting={getSetting('temp-damage')} />
      </div>
      <DataTableView data={data} />
    </div>
  );
}
```

**Step 7: 시각화 페이지에 차트 영역 연결**

`src/app/visualization/page.tsx` 수정 — 차트 영역 placeholder를 `<ChartArea combination={combination} />`로 교체:

```tsx
'use client';

import { useState } from 'react';
import { VariablePanel } from '@/components/visualization/variable-panel';
import { ChartArea } from '@/components/visualization/chart-area';

export default function VisualizationPage() {
  const [combination, setCombination] = useState('default');

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">기후변화 피해비용 데이터 시각화</h1>
      <div className="flex gap-6">
        <aside className="w-72 shrink-0 rounded-lg border bg-card">
          <VariablePanel onCombinationChange={setCombination} />
        </aside>
        <section className="min-w-0 flex-1">
          <ChartArea combination={combination} />
        </section>
      </div>
    </div>
  );
}
```

**Step 8: 확인**

```bash
npm run dev
```
Expected: `/visualization`에서 좌측 변수 패널 + 우측에 라인차트, 바차트, 산점도, 데이터 테이블 모두 표시

**Step 9: 커밋**

```bash
git add src/hooks/ src/components/visualization/ src/app/visualization/
git commit -m "feat: add visualization charts (line, bar, scatter) and data table"
```

---

## Task 10: 모델 설명 페이지 (About)

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/about/background/page.tsx`
- Create: `src/app/about/methodology/page.tsx`
- Create: `src/app/about/applications/page.tsx`
- Create: `src/app/about/layout.tsx`
- Create: `src/components/about/about-sidebar.tsx`

**Step 1: About 사이드바 네비게이션**

`src/components/about/about-sidebar.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const aboutLinks = [
  { href: '/about', label: '모델 소개' },
  { href: '/about/background', label: '연구 배경' },
  { href: '/about/methodology', label: '모형 개요' },
  { href: '/about/applications', label: '활용 방안' },
];

export function AboutSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {aboutLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'block rounded-md px-3 py-2 text-sm transition-colors',
            pathname === link.href
              ? 'bg-primary/10 font-medium text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

**Step 2: About 레이아웃**

`src/app/about/layout.tsx`:
```tsx
import { AboutSidebar } from '@/components/about/about-sidebar';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="w-48 shrink-0">
          <AboutSidebar />
        </aside>
        <article className="min-w-0 flex-1 prose prose-neutral max-w-none">
          {children}
        </article>
      </div>
    </div>
  );
}
```

**Step 3: About 메인 페이지 (DB에서 콘텐츠 조회)**

`src/app/about/page.tsx`:
```tsx
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function AboutPage() {
  const page = await db.select().from(pages).where(eq(pages.slug, 'about')).limit(1);
  const content = page[0];

  return (
    <div>
      <h1 className="text-3xl font-bold">{content?.title || '모델 소개'}</h1>
      <div className="mt-6 whitespace-pre-wrap">{content?.content || '콘텐츠가 준비 중입니다.'}</div>
    </div>
  );
}
```

**Step 4: 하위 페이지들 (background, methodology, applications)**

각 페이지는 동일한 패턴으로 slug만 다르게:

`src/app/about/background/page.tsx`:
```tsx
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function BackgroundPage() {
  const page = await db.select().from(pages).where(eq(pages.slug, 'about/background')).limit(1);
  const content = page[0];

  return (
    <div>
      <h1 className="text-3xl font-bold">{content?.title || '연구 배경'}</h1>
      <div className="mt-6 whitespace-pre-wrap">{content?.content || '콘텐츠가 준비 중입니다.'}</div>
    </div>
  );
}
```

`src/app/about/methodology/page.tsx` 와 `src/app/about/applications/page.tsx`도 같은 패턴으로 slug를 `about/methodology`, `about/applications`로 변경하여 작성.

**Step 5: 확인**

```bash
npm run dev
```
Expected: `/about` 경로에서 좌측 사이드바 + 우측 콘텐츠 표시

**Step 6: 커밋**

```bash
git add src/app/about/ src/components/about/
git commit -m "feat: add about pages with CMS-driven content"
```

---

## Task 11: NextAuth.js 관리자 인증

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/auth.ts`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/middleware.ts`
- Create: `scripts/create-admin.ts`

**Step 1: NextAuth + bcrypt 설치**

```bash
npm install next-auth@beta @auth/drizzle-adapter bcryptjs
npm install -D @types/bcryptjs
```

**Step 2: NextAuth 설정**

`src/lib/auth.ts`:
```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, credentials.email as string));

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
});
```

**Step 3: API 라우트**

`src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

**Step 4: 미들웨어 (admin 경로 보호)**

`src/middleware.ts`:
```typescript
import { auth } from '@/lib/auth';

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = req.nextUrl.pathname === '/admin/login';

  if (isAdminRoute && !isLoginPage && !req.auth) {
    return Response.redirect(new URL('/admin/login', req.url));
  }
});

export const config = {
  matcher: ['/admin/:path*'],
};
```

**Step 5: 로그인 페이지**

`src/app/admin/login/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>관리자 로그인</CardTitle>
          <CardDescription>콘텐츠 관리를 위해 로그인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 6: 관리자 계정 생성 스크립트**

`scripts/create-admin.ts`:
```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as schema from '../src/db/schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function createAdmin() {
  const hash = await bcrypt.hash('admin1234', 12);
  await db.insert(schema.adminUsers).values({
    email: 'admin@climate.kr',
    passwordHash: hash,
    name: '관리자',
  });
  console.log('Admin created: admin@climate.kr / admin1234');
  process.exit(0);
}

createAdmin().catch(console.error);
```

**Step 7: 관리자 생성 및 로그인 테스트**

```bash
npx tsx scripts/create-admin.ts
npm run dev
```
Expected: `/admin/login`에서 `admin@climate.kr` / `admin1234`로 로그인 후 `/admin/dashboard`로 리다이렉트

**Step 8: 커밋**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/app/admin/ src/middleware.ts scripts/create-admin.ts
git commit -m "feat: add NextAuth admin authentication with middleware"
```

---

## Task 12: 관리자 대시보드 + CMS 콘텐츠 관리

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/dashboard/page.tsx`
- Create: `src/app/admin/content/page.tsx`
- Create: `src/app/admin/content/[slug]/page.tsx`
- Create: `src/app/api/admin/pages/route.ts`
- Create: `src/app/api/admin/pages/[id]/route.ts`
- Create: `src/components/admin/admin-sidebar.tsx`

**Step 1: 관리자 사이드바**

`src/components/admin/admin-sidebar.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

const adminLinks = [
  { href: '/admin/dashboard', label: '대시보드' },
  { href: '/admin/content', label: '콘텐츠 관리' },
  { href: '/admin/visualization', label: '시각화 설정' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r bg-muted/30 p-4">
      <h2 className="mb-6 text-lg font-bold">관리자</h2>
      <nav className="flex-1 space-y-1">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'block rounded-md px-3 py-2 text-sm transition-colors',
              pathname.startsWith(link.href)
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
        로그아웃
      </Button>
    </aside>
  );
}
```

**Step 2: 관리자 레이아웃**

`src/app/admin/layout.tsx`:
```tsx
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

**Step 3: 관리자 대시보드**

`src/app/admin/dashboard/page.tsx`:
```tsx
import { db } from '@/db';
import { pages, chartSettings, visualizationResults } from '@/db/schema';
import { count } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboard() {
  const [pageCount] = await db.select({ count: count() }).from(pages);
  const [chartCount] = await db.select({ count: count() }).from(chartSettings);
  const [dataCount] = await db.select({ count: count() }).from(visualizationResults);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">관리자 대시보드</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">콘텐츠 페이지</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{pageCount.count}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">차트 설정</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{chartCount.count}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">시각화 데이터</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{dataCount.count}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Step 4: 콘텐츠 관리 API**

`src/app/api/admin/pages/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allPages = await db.select().from(pages);
  return NextResponse.json(allPages);
}
```

`src/app/api/admin/pages/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const updated = await db
    .update(pages)
    .set({
      title: body.title,
      content: body.content,
      published: body.published,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))
    .returning();

  return NextResponse.json(updated[0]);
}
```

**Step 5: 콘텐츠 목록 페이지**

`src/app/admin/content/page.tsx`:
```tsx
import Link from 'next/link';
import { db } from '@/db';
import { pages } from '@/db/schema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function ContentListPage() {
  const allPages = await db.select().from(pages);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">콘텐츠 관리</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>경로</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>수정일</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allPages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-medium">{page.title}</TableCell>
              <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
              <TableCell>
                <Badge variant={page.published ? 'default' : 'secondary'}>
                  {page.published ? '공개' : '비공개'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {page.updatedAt?.toLocaleDateString('ko-KR')}
              </TableCell>
              <TableCell>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/content/${page.id}`}>편집</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Step 6: 콘텐츠 편집 페이지**

`src/app/admin/content/[slug]/page.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
}

export default function ContentEditPage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<PageData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pages')
      .then((r) => r.json())
      .then((pages: PageData[]) => {
        const found = pages.find((p) => p.id === params.slug);
        if (found) setPage(found);
      });
  }, [params.slug]);

  const handleSave = async () => {
    if (!page) return;
    setSaving(true);
    await fetch(`/api/admin/pages/${page.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: page.title,
        content: page.content,
        published: page.published,
      }),
    });
    setSaving(false);
    router.push('/admin/content');
  };

  if (!page) return <p>로딩 중...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">콘텐츠 편집</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">/{page.slug}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>제목</Label>
            <Input value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>내용</Label>
            <Textarea
              value={page.content}
              onChange={(e) => setPage({ ...page, content: e.target.value })}
              rows={15}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={page.published}
              onChange={(e) => setPage({ ...page, published: e.target.checked })}
            />
            <Label htmlFor="published">공개</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/content')}>
              취소
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 7: 확인**

```bash
npm run dev
```
Expected: `/admin/dashboard`에서 통계 카드, `/admin/content`에서 페이지 목록, 편집 기능 작동

**Step 8: 커밋**

```bash
git add src/app/admin/ src/components/admin/ src/app/api/admin/
git commit -m "feat: add admin dashboard and CMS content management"
```

---

## Task 13: 관리자 시각화 설정 관리

**Files:**
- Create: `src/app/admin/visualization/page.tsx`
- Create: `src/app/api/admin/chart-settings/route.ts`
- Create: `src/app/api/admin/chart-settings/[id]/route.ts`

**Step 1: 차트 설정 관리 API**

`src/app/api/admin/chart-settings/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { chartSettings } from '@/db/schema';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await db.select().from(chartSettings);
  return NextResponse.json(settings);
}
```

`src/app/api/admin/chart-settings/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { chartSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const updated = await db
    .update(chartSettings)
    .set({
      title: body.title,
      xLabel: body.xLabel,
      yLabel: body.yLabel,
      unit: body.unit,
      description: body.description,
      updatedAt: new Date(),
    })
    .where(eq(chartSettings.id, id))
    .returning();

  return NextResponse.json(updated[0]);
}
```

**Step 2: 시각화 설정 관리 페이지**

`src/app/admin/visualization/page.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartSetting } from '@/lib/types';

export default function VisualizationSettingsPage() {
  const [settings, setSettings] = useState<ChartSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ChartSetting>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/chart-settings')
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  const startEdit = (setting: ChartSetting) => {
    setEditingId(setting.id);
    setForm(setting);
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    const res = await fetch(`/api/admin/chart-settings/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    setSettings(settings.map((s) => (s.id === editingId ? updated : s)));
    setEditingId(null);
    setSaving(false);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">시각화 설정 관리</h1>
      <div className="space-y-4">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <CardTitle className="text-base">{setting.chartKey}</CardTitle>
            </CardHeader>
            <CardContent>
              {editingId === setting.id ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">제목</Label>
                    <Input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">X축 레이블</Label>
                      <Input value={form.xLabel || ''} onChange={(e) => setForm({ ...form, xLabel: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Y축 레이블</Label>
                      <Input value={form.yLabel || ''} onChange={(e) => setForm({ ...form, yLabel: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">단위</Label>
                      <Input value={form.unit || ''} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">설명</Label>
                    <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? '저장 중...' : '저장'}</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>취소</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">제목:</span> {setting.title}</p>
                    <p><span className="font-medium">축:</span> {setting.xLabel} / {setting.yLabel} ({setting.unit})</p>
                    {setting.description && <p className="text-muted-foreground">{setting.description}</p>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(setting)}>편집</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: 확인**

```bash
npm run dev
```
Expected: `/admin/visualization`에서 차트 설정 목록 표시, 편집/저장 동작

**Step 4: 커밋**

```bash
git add src/app/admin/visualization/ src/app/api/admin/chart-settings/
git commit -m "feat: add admin visualization settings management"
```

---

## Task 14: 이미지 스토리지 추상화 레이어

**Files:**
- Create: `src/lib/storage/index.ts`
- Create: `src/lib/storage/local-adapter.ts`
- Create: `src/app/api/admin/upload/route.ts`

**Step 1: 스토리지 인터페이스 정의**

`src/lib/storage/index.ts`:
```typescript
export interface StorageAdapter {
  upload(file: File, path: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
}

// 환경에 따라 어댑터 전환
export function getStorageAdapter(): StorageAdapter {
  // 추후 STORAGE_PROVIDER 환경변수로 Cloudinary/S3 전환
  const { LocalStorageAdapter } = require('./local-adapter');
  return new LocalStorageAdapter();
}
```

**Step 2: 로컬 어댑터**

`src/lib/storage/local-adapter.ts`:
```typescript
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import type { StorageAdapter } from './index';

export class LocalStorageAdapter implements StorageAdapter {
  private basePath = path.join(process.cwd(), 'public', 'uploads');

  async upload(file: File, filePath: string): Promise<string> {
    const fullPath = path.join(this.basePath, filePath);
    const dir = path.dirname(fullPath);
    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    return `/uploads/${filePath}`;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    await unlink(fullPath).catch(() => {});
  }

  getUrl(filePath: string): string {
    return `/uploads/${filePath}`;
  }
}
```

**Step 3: 업로드 API**

`src/app/api/admin/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStorageAdapter } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const storage = getStorageAdapter();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${timestamp}-${safeName}`;
  const url = await storage.upload(file, filePath);

  return NextResponse.json({ url, path: filePath });
}
```

**Step 4: public/uploads 디렉토리 생성 + .gitkeep**

```bash
mkdir -p public/uploads
touch public/uploads/.gitkeep
echo "public/uploads/*" >> .gitignore
echo "!public/uploads/.gitkeep" >> .gitignore
```

**Step 5: 커밋**

```bash
git add src/lib/storage/ src/app/api/admin/upload/ public/uploads/.gitkeep .gitignore
git commit -m "feat: add storage abstraction layer with local adapter"
```

---

## 실행 순서 요약

| Task | 내용 | 의존성 |
|------|------|--------|
| 1 | Next.js 프로젝트 초기화 | 없음 |
| 2 | Docker PostgreSQL 설정 | 없음 |
| 3 | Drizzle ORM 스키마 | Task 1, 2 |
| 4 | 목업 데이터 시드 | Task 3 |
| 5 | 공통 레이아웃 + 네비게이션 | Task 1 |
| 6 | 메인 랜딩 페이지 | Task 5 |
| 7 | 시각화 API Route | Task 3, 4 |
| 8 | 시각화 - 변수 선택 패널 | Task 5, 7 |
| 9 | 시각화 - 차트 구현 | Task 8 |
| 10 | 모델 설명 페이지 | Task 4, 5 |
| 11 | NextAuth 관리자 인증 | Task 3 |
| 12 | 관리자 CMS 콘텐츠 관리 | Task 11 |
| 13 | 관리자 시각화 설정 | Task 11, 7 |
| 14 | 이미지 스토리지 추상화 | Task 11 |
