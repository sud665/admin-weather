import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { pages } from '@/db/schema';

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (db) {
      const allPages = await db.select().from(pages);
      return NextResponse.json(allPages);
    }
  } catch {
    // DB 연결 실패 시 목업 데이터 반환
  }

  return NextResponse.json([
    { id: 'mock-1', slug: 'about', title: '플랫폼 소개', content: 'EcoVision 통합 환경분석 플랫폼은 EcoVision Research Lab에서 개발되었습니다.', published: true, updatedAt: new Date() },
    { id: 'mock-2', slug: 'about/background', title: '연구 배경', content: '환경 변화로 인한 경제적 피해를 정량화하는 것은 효과적인 환경 정책 수립의 핵심입니다.', published: true, updatedAt: new Date() },
    { id: 'mock-3', slug: 'about/methodology', title: '분석 방법론', content: '본 모형은 세 가지 핵심 모듈로 구성됩니다.', published: true, updatedAt: new Date() },
    { id: 'mock-4', slug: 'about/applications', title: '활용 방안', content: '본 플랫폼의 분석 결과는 다양한 분야에 활용됩니다.', published: true, updatedAt: new Date() },
  ]);
}
