import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
          한국형 앙상블 기후변화통합평가모형(IAM)의 연구 결과를 인터랙티브
          시각화로 확인하세요. 변수를 조정하여 기후변화가 초래하는 경제적
          피해비용의 변화를 탐색할 수 있습니다.
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
            <CardDescription>
              변수를 조정하며 실시간으로 변화하는 결과를 확인
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              할인율, 기후 시나리오, 피해함수, 사회경제 경로 등 주요 변수를
              선택하면 해당하는 기후변화 피해비용을 다양한 차트로
              시각화합니다.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>다양한 시나리오</CardTitle>
            <CardDescription>
              4개 변수 세트, 각 27가지 조합
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              연구팀이 사전 계산한 방대한 데이터 세트를 기반으로, 다양한
              가정 하에서의 피해비용을 비교 분석할 수 있습니다.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>데이터 기반 정책</CardTitle>
            <CardDescription>
              투명한 연구 결과 공개
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              시민, 정책 입안자, 연구자 모두가 접근할 수 있도록 데이터를
              투명하게 공개하여 정책적 논의를 활성화합니다.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
