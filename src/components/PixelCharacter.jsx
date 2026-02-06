import React from 'react';

// 임시 도트 이미지 URL (나중에 PD님이 준비한 실제 이미지 경로로 바꾸시면 됩니다)
// 예: import charLv1 from '../assets/char_lv1.png';
const CHAR_IMAGES = {
  lv1: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f9d1-200d-1f4bb.png", // (임시) 노트북 하는 사람
  lv5: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f93e-200d-2642-fe0f.png", // (임시) 운동하는 사람
  lv10: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f478.png" // (임시) 공주님/왕자님
};

export default function PixelCharacter({ level, gearColor }) {
  // 1. 레벨에 따라 보여줄 이미지 결정하는 로직
  let currentImage = CHAR_IMAGES.lv1; // 기본: 레벨 1
  if (level >= 10) {
    currentImage = CHAR_IMAGES.lv10;
  } else if (level >= 5) {
    currentImage = CHAR_IMAGES.lv5;
  }

  // 2. 캐릭터 화면 구성 (이미지 + 아우라 + 장비 효과)
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      
      {/* [효과 1] 배경 아우라 (기어 색상 반영) */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-xl animate-pulse transition-colors duration-500"
        style={{ backgroundColor: gearColor }}
      ></div>

      {/* [핵심] 도트 캐릭터 이미지 */}
      {/* image-rendering: pixelated가 도트를 선명하게 해줍니다 */}
      <img 
        src={currentImage} 
        alt="Pixel Character" 
        className="relative z-10 w-40 h-40 animate-bounce-slow drop-shadow-lg"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* [효과 2] 장비(라켓) 빛 효과 */}
      <div 
         className="absolute z-20 -right-4 top-4 w-4 h-24 rounded-full rotate-45 border-2 border-white shadow-[0_0_10px_currentColor] transition-colors duration-500" 
         style={{ backgroundColor: gearColor, color: gearColor }}
      ></div>
      <div 
         className="absolute z-20 -right-6 -top-2 w-16 h-24 rounded-full border-4 rotate-45 shadow-[0_0_15px_currentColor] transition-colors duration-500" 
         style={{ borderColor: gearColor, color: gearColor }}
      ></div>

    </div>
  );
}