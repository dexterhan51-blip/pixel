import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#F4F4F4] pb-32 font-sans">
      <div className="bg-white shadow-card">
        <div className="px-5 py-4 pt-safe">
          <h2 className="text-lg font-bold text-[#191F28]">이용약관</h2>
        </div>
      </div>

      <div className="px-5 pt-4 max-w-md mx-auto">
        <div className="bg-white rounded-[16px] shadow-card p-5 space-y-6 text-sm text-[#191F28] leading-relaxed">
          <p className="text-xs text-[#8B95A1]">시행일: 2025년 1월 1일</p>

          <section>
            <h3 className="font-bold mb-2">제1조 (목적)</h3>
            <p className="text-[#8B95A1]">이 약관은 잇츠 마이 테니스(이하 "앱")의 이용에 관한 조건 및 절차를 규정합니다.</p>
          </section>

          <section>
            <h3 className="font-bold mb-2">제2조 (서비스 내용)</h3>
            <p className="text-[#8B95A1]">앱은 테니스 활동 기록, 스탯 추적, 게이미피케이션 기능을 제공합니다. 모든 데이터는 사용자의 기기에 저장되며, 별도의 서버를 사용하지 않습니다.</p>
          </section>

          <section>
            <h3 className="font-bold mb-2">제3조 (이용자의 의무)</h3>
            <ul className="list-disc pl-5 space-y-1 text-[#8B95A1]">
              <li>앱을 불법적인 목적으로 사용할 수 없습니다.</li>
              <li>앱의 정상적인 운영을 방해하는 행위를 할 수 없습니다.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold mb-2">제4조 (면책사항)</h3>
            <p className="text-[#8B95A1]">앱은 기기의 데이터 손실에 대해 책임지지 않습니다. 중요한 기록은 설정의 내보내기 기능을 통해 백업해주세요.</p>
          </section>

          <section>
            <h3 className="font-bold mb-2">제5조 (약관의 변경)</h3>
            <p className="text-[#8B95A1]">약관이 변경되는 경우, 앱 업데이트를 통해 공지합니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
