import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3, Layers, Globe } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: '인터랙티브 시각화',
    description: '변수를 조정하며 실시간으로 변화하는 결과를 확인',
    detail:
      '할인율, 기후 시나리오, 피해함수, 사회경제 경로 등 주요 변수를 선택하면 해당하는 기후변화 피해비용을 다양한 차트로 시각화합니다.',
  },
  {
    icon: Layers,
    title: '다양한 시나리오',
    description: '4개 변수 세트, 각 27가지 조합',
    detail:
      '연구팀이 사전 계산한 방대한 데이터 세트를 기반으로, 다양한 가정 하에서의 피해비용을 비교 분석할 수 있습니다.',
  },
  {
    icon: Globe,
    title: '데이터 기반 정책',
    description: '투명한 연구 결과 공개',
    detail:
      '시민, 정책 입안자, 연구자 모두가 접근할 수 있도록 데이터를 투명하게 공개하여 정책적 논의를 활성화합니다.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b">
        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-fade-in-up text-sm font-medium uppercase tracking-widest text-muted-foreground">
              EcoVision 통합 환경분석 플랫폼
            </p>
            <h1 className="animate-fade-in-up stagger-1 mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              기후변화 피해비용
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                통합평가 모델
              </span>
            </h1>
            <p className="animate-fade-in-up stagger-2 mt-6 text-lg leading-relaxed text-muted-foreground">
              변수를 조정하여 다양한 환경 시나리오를 비교·분석하세요.
              사전 계산된 연구 데이터를 인터랙티브 시각화로
              확인할 수 있습니다.
            </p>
            <div className="animate-fade-in-up stagger-3 mt-10 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                <Link href="/visualization">데이터 시각화 시작</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">플랫폼 소개</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            핵심 기능
          </h2>
          <p className="mt-3 text-muted-foreground">
            기후변화 피해비용을 다각도로 분석할 수 있는 도구를 제공합니다
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              className={`animate-fade-in-up stagger-${i + 1} group transition-shadow hover:shadow-lg`}
            >
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-semibold">
            지금 바로 데이터를 탐색해 보세요
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            EcoVision Research Lab에서 개발된 연구 결과를 누구나 확인할 수
            있습니다
          </p>
          <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
            <Link href="/visualization">시각화 대시보드 열기</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
