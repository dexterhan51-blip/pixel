import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#F4F4F4] pb-32 font-sans">
      <div className="bg-white shadow-card">
        <div className="px-5 py-4 pt-safe">
          <h2 className="text-lg font-bold text-[#191F28]">개인정보 처리방침</h2>
        </div>
      </div>

      <div className="px-5 pt-4 max-w-md mx-auto">
        <div className="bg-white rounded-[16px] shadow-card p-5 space-y-6 text-sm text-[#191F28] leading-relaxed">
          <p className="text-xs text-[#8B95A1]">시행일: 2025년 1월 1일</p>

          <section>
            <h3 className="font-bold mb-2">1. 수집하는 개인정보</h3>
            <p>잇츠 마이 테니스(이하 "앱")는 최소한의 정보만 수집합니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[#8B95A1]">
              <li><strong className="text-[#191F28]">닉네임</strong>: 앱 내 표시용으로 사용자가 직접 입력합니다.</li>
              <li><strong className="text-[#191F28]">운동 기록</strong>: 운동 종류, 시간, 메모, 사진 등 사용자가 입력한 기록입니다.</li>
            </ul>
            <p className="mt-2 text-[#8B95A1]">위 정보는 모두 사용자의 기기(로컬 저장소)에만 저장되며, 외부 서버로 전송되지 않습니다.</p>
          </section>

          <section>
            <h3 className="font-bold mb-2">2. 개인정보의 이용 목적</h3>
            <p className="text-[#8B95A1]">수집된 정보는 오직 앱 내에서 사용자 경험을 제공하기 위한 목적으로만 사용됩니다.</p>
          </section>

          <section>
            <h3 className="font-bold mb-2">3. 개인정보의 보관 및 파기</h3>
            <p className="text-[#8B95A1]">모든 데이터는 사용자의 기기에 저장됩니다. 앱을 삭제하거나 설정에서 데이터를 초기화하면 모든 정보가 삭제됩니다.</p>
          </section>

          <section>
            <h3 className="font-bold mb-2">4. 개인정보의 제3자 제공</h3>
            <p className="text-[#8B95A1]">앱은 사용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
          </section>

          <section>
            <h3 className="font-bold mb-2">5. 문의</h3>
            <p className="text-[#8B95A1]">개인정보 처리방침에 관한 문의는 앱 내 설정 메뉴를 통해 할 수 있습니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
