export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
        <p>기후에너지환경부 국가과제</p>
        <p>한국형 앙상블 기후변화통합평가모형(IAM) 연구</p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
