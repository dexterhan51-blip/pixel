import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Minus, Plus, Camera, Sun, Cloud, CloudRain, CloudSnow, Wind, Calendar as CalendarIcon, Trophy, XCircle } from 'lucide-react';

export default function Log({ onSave }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // --- [New] 날짜 선택 기능 ---
  // 기본값: 오늘 날짜 (YYYY-MM-DD 형식)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [activityType, setActivityType] = useState('lesson'); // lesson, game, practice
  const [duration, setDuration] = useState(60);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);

  // --- [New] 고도화된 경기 데이터 ---
  const [matchCount, setMatchCount] = useState(1);
  const [weather, setWeather] = useState('sunny');
  
  // 경기별 상세 기록 (배열로 관리)
  const [gameRecords, setGameRecords] = useState([
    { type: 'doubles', myScore: 6, oppScore: 4, result: 'win' } 
  ]);

  // 태그 데이터 (레슨/연습용)
  const [selectedTags, setSelectedTags] = useState([]);

  // 스탯 데이터
  const [pointsLeft, setPointsLeft] = useState(5);
  const [tempStats, setTempStats] = useState({
    forehand: 0, backhand: 0, serve: 0, volley: 0, footwork: 0, mental: 0
  });

  // --- 옵션 정의 ---
  const matchTypes = [
    { value: 'doubles', label: '복식' },
    { value: 'mixed', label: '혼복' },
    { value: 'singles', label: '단식' },
  ];

  const weatherOptions = [
    { value: 'sunny', label: '맑음', icon: <Sun size={20} className="text-orange-500" /> },
    { value: 'cloudy', label: '흐림', icon: <Cloud size={20} className="text-gray-500" /> },
    { value: 'rain', label: '비', icon: <CloudRain size={20} className="text-blue-500" /> },
    { value: 'snow', label: '눈', icon: <CloudSnow size={20} className="text-sky-300" /> },
    { value: 'wind', label: '바람', icon: <Wind size={20} className="text-teal-500" /> },
  ];

  const lessonTags = ['포핸드', '백핸드', '발리', '서브', '스매싱', '풋워크', '게임드릴'];
  const practiceTags = ['밴딩', '스트레칭', '달리기', '빈스윙', '벽치기', '서브연습', '볼머신'];

  // --- 핸들러 ---

  // 경기 수 변경 시 배열 길이 조절
  useEffect(() => {
    setGameRecords(prev => {
      const newRecords = [...prev];
      if (matchCount > prev.length) {
        // 늘어난 만큼 기본값 추가
        for (let i = prev.length; i < matchCount; i++) {
          newRecords.push({ type: 'doubles', myScore: 0, oppScore: 0, result: 'win' });
        }
      } else {
        // 줄어든 만큼 자르기
        newRecords.splice(matchCount);
      }
      return newRecords;
    });
  }, [matchCount]);

  // 개별 경기 데이터 수정
  const handleGameChange = (index, field, value) => {
    const newRecords = [...gameRecords];
    newRecords[index] = { ...newRecords[index], [field]: value };
    
    // 점수 변경 시 승패 자동 추천 (편의성)
    if (field === 'myScore' || field === 'oppScore') {
      const my = field === 'myScore' ? value : newRecords[index].myScore;
      const opp = field === 'oppScore' ? value : newRecords[index].oppScore;
      if (my > opp) newRecords[index].result = 'win';
      else if (my < opp) newRecords[index].result = 'lose';
    }
    
    setGameRecords(newRecords);
  };

  const handleStatChange = (key, delta) => {
    if (delta > 0 && pointsLeft > 0) {
      setTempStats(prev => ({ ...prev, [key]: prev[key] + 1 }));
      setPointsLeft(prev => prev - 1);
    } else if (delta < 0 && tempStats[key] > 0) {
      setTempStats(prev => ({ ...prev, [key]: prev[key] - 1 }));
      setPointsLeft(prev => prev + 1);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag));
    else setSelectedTags([...selectedTags, tag]);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const handleComplete = () => {
    if (pointsLeft > 0) {
      alert(`성장 포인트가 ${pointsLeft}점 남았습니다!`);
      return;
    }

    const logData = {
      date: date, // [New] 선택한 날짜 저장
      type: activityType,
      duration,
      note,
      photo,
      details: activityType === 'game' 
        ? { matchCount, games: gameRecords, weather } // [New] 상세 경기 기록 저장
        : { tags: selectedTags }
    };

    onSave(logData, tempStats);
    navigate('/');
  };

  return (
    <div className="pt-6 pb-32 px-4 max-w-md mx-auto min-h-screen font-sans">
      
      {/* 상단 헤더 & 날짜 선택 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-[#121716]">
            {step === 1 && "운동 종류 선택"}
            {step === 2 && "상세 내용 기록"}
            {step === 3 && "성장 포인트 분배"}
          </h2>
          <div className="text-xs font-bold text-gray-400">Step {step}/3</div>
        </div>
        
        {/* [New] 날짜 선택기 */}
        <div className="relative">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-100 p-3 rounded-xl border border-gray-200 font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <CalendarIcon className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={20} />
        </div>
      </div>

      {/* === Step 1: 종류 선택 === */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          {[
            { id: 'lesson', label: '🎾 레슨', desc: '코치님과 함께한 수업' },
            { id: 'game', label: '⚔️ 경기', desc: '승부를 겨루는 실전' },
            { id: 'practice', label: '🔥 혼자 운동', desc: '개인 연습 및 트레이닝' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivityType(item.id)}
              className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                activityType === item.id 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <p className={`text-lg font-bold mb-1 ${activityType === item.id ? 'text-primary' : 'text-gray-700'}`}>
                {item.label}
              </p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </button>
          ))}

          <button 
            onClick={() => setStep(2)}
            className="w-full bg-[#121716] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 mt-8 hover:opacity-90 transition-opacity"
          >
            다음 <ChevronRight />
          </button>
        </div>
      )}

      {/* === Step 2: 상세 입력 === */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in pb-10">
          
          {/* 운동 시간 */}
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">운동 시간 (분)</label>
            <input 
              type="number" 
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-4 rounded-xl border border-gray-200 text-lg font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* [CASE: 경기 상세 입력] */}
          {activityType === 'game' && (
            <div className="space-y-6">
              {/* 날씨 선택 */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2">날씨</label>
                <div className="flex gap-2 justify-between">
                  {weatherOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setWeather(opt.value)}
                      className={`flex-1 aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        weather === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-400'
                      }`}
                    >
                      {opt.icon}
                      <span className="text-[10px] font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 총 경기 수 조절 */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="text-sm font-bold text-gray-700">총 경기 수</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setMatchCount(Math.max(1, matchCount - 1))} className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold text-gray-500 shadow-sm">-</button>
                  <span className="text-lg font-black w-4 text-center">{matchCount}</span>
                  <button onClick={() => setMatchCount(Math.min(10, matchCount + 1))} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm">+</button>
                </div>
              </div>

              {/* [New] 경기별 상세 기록 카드 */}
              <div className="space-y-3">
                {gameRecords.map((game, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500 rounded-br-lg">Game {idx + 1}</div>
                    
                    {/* 1열: 경기 타입 선택 */}
                    <div className="flex justify-center gap-2 mb-4 mt-2">
                      {matchTypes.map(type => (
                        <button
                          key={type.value}
                          onClick={() => handleGameChange(idx, 'type', type.value)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            game.type === type.value ? 'bg-[#121716] text-white border-[#121716]' : 'text-gray-400 border-gray-200'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    {/* 2열: 점수 입력 및 승패 */}
                    <div className="flex items-center gap-2">
                      {/* 우리팀 */}
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-400 mb-1">우리팀</span>
                        <input 
                          type="number" 
                          value={game.myScore}
                          onChange={(e) => handleGameChange(idx, 'myScore', Number(e.target.value))}
                          className="w-full text-center p-2 bg-gray-50 rounded-lg border border-gray-200 font-bold text-lg focus:border-primary outline-none"
                        />
                      </div>
                      <span className="text-gray-300 font-bold">:</span>
                      {/* 상대팀 */}
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-400 mb-1">상대팀</span>
                        <input 
                          type="number" 
                          value={game.oppScore}
                          onChange={(e) => handleGameChange(idx, 'oppScore', Number(e.target.value))}
                          className="w-full text-center p-2 bg-gray-50 rounded-lg border border-gray-200 font-bold text-lg focus:border-primary outline-none"
                        />
                      </div>
                      
                      {/* 승패 버튼 (토글) */}
                      <div className="flex flex-col ml-2 gap-1">
                        <button 
                          onClick={() => handleGameChange(idx, 'result', 'win')}
                          className={`flex items-center justify-center w-16 py-1 rounded-md text-xs font-bold border transition-all ${
                            game.result === 'win' ? 'bg-primary text-white border-primary' : 'text-gray-300 border-gray-200'
                          }`}
                        >
                          <Trophy size={12} className="mr-1" /> WIN
                        </button>
                        <button 
                          onClick={() => handleGameChange(idx, 'result', 'lose')}
                          className={`flex items-center justify-center w-16 py-1 rounded-md text-xs font-bold border transition-all ${
                            game.result === 'lose' ? 'bg-red-500 text-white border-red-500' : 'text-gray-300 border-gray-200'
                          }`}
                        >
                          <XCircle size={12} className="mr-1" /> LOSE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 사진 첨부 */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2">코트 인증샷</label>
                <div className="relative w-full h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors">
                  {photo ? (
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Camera size={24} className="mb-2" />
                      <span className="text-xs font-bold">사진 업로드</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* [CASE: 레슨/연습] */}
          {(activityType === 'lesson' || activityType === 'practice') && (
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">태그 선택</label>
              <div className="flex flex-wrap gap-2">
                {(activityType === 'lesson' ? lessonTags : practiceTags).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      selectedTags.includes(tag) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 공통 메모 */}
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">메모</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="피드백이나 특이사항을 적어주세요."
              className="w-full p-4 rounded-xl border border-gray-200 h-28 resize-none focus:outline-none focus:border-primary"
            ></textarea>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl font-bold text-gray-500 bg-gray-100">이전</button>
            <button onClick={() => setStep(3)} className="flex-[2] py-4 rounded-xl font-bold text-white bg-[#121716] flex items-center justify-center gap-2">
              다음 <ChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* === Step 3: 스탯 분배 === */}
      {step === 3 && (
        <div className="animate-fade-in">
          <div className="bg-primary/10 p-6 rounded-2xl mb-8 text-center border border-primary/20">
            <p className="text-primary font-bold text-sm mb-1">획득한 성장 포인트</p>
            <p className="text-5xl font-black text-primary tracking-tighter">{pointsLeft}</p>
          </div>

          <div className="space-y-3 mb-8">
            {[
              { key: 'forehand', label: '포핸드' },
              { key: 'backhand', label: '백핸드' },
              { key: 'serve', label: '서브' },
              { key: 'volley', label: '발리' },
              { key: 'footwork', label: '풋워크' },
              { key: 'mental', label: '멘탈' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#dde4e3] shadow-sm">
                <span className="font-bold text-gray-700 w-24">{label}</span>
                <div className="flex items-center gap-5">
                  <button 
                    onClick={() => handleStatChange(key, -1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 active:scale-90"
                  >
                    <Minus size={16} />
                  </button>
                  <span className={`text-xl font-black w-6 text-center ${tempStats[key] > 0 ? 'text-primary' : 'text-gray-300'}`}>
                    {tempStats[key]}
                  </span>
                  <button 
                    onClick={() => handleStatChange(key, 1)}
                    className="w-8 h-8 rounded-full bg-[#121716] text-white flex items-center justify-center shadow-md active:scale-90"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-xl font-bold text-gray-500 bg-gray-100">수정</button>
            <button 
              onClick={handleComplete}
              className={`flex-[2] py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                pointsLeft === 0 ? 'bg-primary text-white hover:bg-[#238b7e]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              기록 완료 <Check />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}