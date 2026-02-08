import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Minus, Plus, Camera, Sun, Cloud, CloudRain, CloudSnow, Wind, Calendar as CalendarIcon, Trophy, XCircle } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';
import { hapticsLight, hapticsMedium } from '../utils/haptics';
import { calculatePoints } from '../utils/gameData';
import { useData } from '../contexts/DataContext';

export default function Log() {
  const { handleSaveLog, editingLog } = useData();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const [date, setDate] = useState(editingLog?.date || new Date().toISOString().split('T')[0]);
  const [activityType, setActivityType] = useState(editingLog?.type || 'lesson');
  const [duration, setDuration] = useState(editingLog?.duration || 60);
  const [note, setNote] = useState(editingLog?.note || '');
  const [photo, setPhoto] = useState(editingLog?.photo || null);

  const [satisfaction, setSatisfaction] = useState(editingLog?.satisfaction || 0);

  const [matchCount, setMatchCount] = useState(editingLog?.details?.matchCount || 1);
  const [weather, setWeather] = useState(editingLog?.details?.weather || 'sunny');

  const [gameRecords, setGameRecords] = useState(
    editingLog?.details?.games || [{ type: 'doubles', myScore: 6, oppScore: 4, result: 'win' }]
  );

  const [selectedTags, setSelectedTags] = useState(editingLog?.details?.tags || []);

  const [pointsLeft, setPointsLeft] = useState(editingLog ? 0 : calculatePoints(duration));
  const [tempStats, setTempStats] = useState(
    editingLog?.gainedStats || { forehand: 0, backhand: 0, serve: 0, volley: 0, footwork: 0, mental: 0 }
  );

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

  useEffect(() => {
    setGameRecords(prev => {
      const newRecords = [...prev];
      if (matchCount > prev.length) {
        for (let i = prev.length; i < matchCount; i++) {
          newRecords.push({ type: 'doubles', myScore: 0, oppScore: 0, result: 'win' });
        }
      } else {
        newRecords.splice(matchCount);
      }
      return newRecords;
    });
  }, [matchCount]);

  useEffect(() => {
    if (editingLog) return;
    const pts = calculatePoints(duration);
    setPointsLeft(pts);
    setTempStats({ forehand: 0, backhand: 0, serve: 0, volley: 0, footwork: 0, mental: 0 });
  }, [duration, editingLog]);

  const handleGameChange = (index, field, value) => {
    const newRecords = [...gameRecords];
    newRecords[index] = { ...newRecords[index], [field]: value };

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
      hapticsLight();
    } else if (delta < 0 && tempStats[key] > 0) {
      setTempStats(prev => ({ ...prev, [key]: prev[key] - 1 }));
      setPointsLeft(prev => prev + 1);
      hapticsLight();
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag));
    else setSelectedTags([...selectedTags, tag]);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoError('');
    try {
      const dataUrl = await compressImage(file);
      setPhoto(dataUrl);
    } catch {
      setPhotoError('사진을 불러올 수 없습니다. 다른 사진을 선택해주세요.');
    }
  };

  const handleComplete = () => {
    const earnedPoints = calculatePoints(duration);
    if (pointsLeft > 0 && earnedPoints > 0 && !editingLog) return;
    if (duration < 1 || duration > 480) return;

    setSaving(true);
    hapticsMedium();

    const logData = {
      id: editingLog?.id || crypto.randomUUID(),
      date,
      type: activityType,
      duration,
      satisfaction,
      note,
      photo,
      gainedStats: { ...tempStats },
      details: activityType === 'game'
        ? { matchCount, games: gameRecords, weather }
        : { tags: selectedTags }
    };

    handleSaveLog(logData, tempStats);
    navigate('/');
  };

  const canProceedStep1 = true;
  const canProceedStep2 = duration >= 1 && duration <= 480;
  const totalPoints = calculatePoints(duration);
  const canComplete = editingLog ? true : (totalPoints === 0 || pointsLeft === 0);

  const ProgressBar = () => (
    <div className="flex gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`flex-1 h-[3px] rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-[#F4F4F4]'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="pt-6 pb-32 px-5 max-w-md mx-auto min-h-screen font-sans">
      <ProgressBar />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[22px] font-bold text-[#191F28]">
            {step === 1 && "운동 종류 선택"}
            {step === 2 && "상세 내용 기록"}
            {step === 3 && `성장 포인트 분배 (${totalPoints}P)`}
          </h2>
          <div className="text-xs font-medium text-[#B0B8C1]">Step {step}/3</div>
        </div>

        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#F4F4F4] p-3 rounded-[12px] border-none font-bold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <CalendarIcon className="absolute right-4 top-3.5 text-[#B0B8C1] pointer-events-none" size={20} />
        </div>
      </div>

      {/* === Step 1: 종류 선택 === */}
      {step === 1 && (
        <div className="space-y-3 animate-fade-in">
          {[
            { id: 'lesson', label: '레슨', desc: '코치님과 함께한 수업' },
            { id: 'game', label: '경기', desc: '승부를 겨루는 실전' },
            { id: 'practice', label: '혼자 운동', desc: '개인 연습 및 트레이닝' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivityType(item.id)}
              className={`w-full p-5 rounded-[16px] shadow-card text-left transition-all flex items-center justify-between ${
                activityType === item.id
                  ? 'bg-white ring-2 ring-primary'
                  : 'bg-white'
              }`}
            >
              <div>
                <p className={`text-base font-bold mb-0.5 ${activityType === item.id ? 'text-primary' : 'text-[#191F28]'}`}>
                  {item.label}
                </p>
                <p className="text-xs text-[#8B95A1]">{item.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                activityType === item.id ? 'border-primary bg-primary' : 'border-[#B0B8C1]'
              }`}>
                {activityType === item.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          ))}

          <button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="w-full bg-primary text-white py-4 rounded-[12px] font-bold text-lg flex items-center justify-center gap-2 mt-6 hover:brightness-105 transition-all disabled:opacity-50"
          >
            다음 <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* === Step 2: 상세 입력 === */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in pb-10">

          <div>
            <label className="block text-sm font-bold text-[#8B95A1] mb-2">운동 시간 (분)</label>
            <input
              type="number"
              value={duration}
              min={1}
              max={480}
              onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
              className={`w-full p-4 rounded-[12px] bg-[#F4F4F4] border-none text-lg font-bold text-[#191F28] focus:outline-none focus:ring-2 focus:ring-primary ${
                duration < 1 || duration > 480 ? 'ring-2 ring-red-300' : ''
              }`}
            />
            {(duration < 1 || duration > 480) && (
              <p className="text-xs text-red-500 mt-1">1~480분 사이로 입력해주세요</p>
            )}
          </div>

          {/* Satisfaction Rating */}
          <div>
            <label className="block text-sm font-bold text-[#8B95A1] mb-2">오늘의 만족도</label>
            <div className="flex justify-between bg-[#F4F4F4] p-3 rounded-[12px]">
              {[
                { value: 1, emoji: '😫', label: '힘들었어' },
                { value: 2, emoji: '😕', label: '아쉬워' },
                { value: 3, emoji: '😐', label: '보통' },
                { value: 4, emoji: '🙂', label: '좋았어' },
                { value: 5, emoji: '😆', label: '최고!' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSatisfaction(opt.value)}
                  className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-[10px] transition-all ${
                    satisfaction === opt.value ? 'bg-white shadow-card scale-105' : ''
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className={`text-[10px] font-bold ${satisfaction === opt.value ? 'text-[#191F28]' : 'text-[#B0B8C1]'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {activityType === 'game' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#8B95A1] mb-2">날씨</label>
                <div className="flex gap-2 justify-between">
                  {weatherOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setWeather(opt.value)}
                      className={`flex-1 aspect-square rounded-[12px] flex flex-col items-center justify-center gap-1 transition-all ${
                        weather === opt.value ? 'bg-primary/10 ring-2 ring-primary' : 'bg-[#F4F4F4]'
                      }`}
                    >
                      {opt.icon}
                      <span className="text-[10px] font-bold text-[#8B95A1]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#F4F4F4] p-4 rounded-[12px]">
                <label className="text-sm font-bold text-[#191F28]">총 경기 수</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setMatchCount(Math.max(1, matchCount - 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#8B95A1] shadow-card">-</button>
                  <span className="text-lg font-black w-4 text-center text-[#191F28]">{matchCount}</span>
                  <button onClick={() => setMatchCount(Math.min(10, matchCount + 1))} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-card">+</button>
                </div>
              </div>

              <div className="space-y-3">
                {gameRecords.map((game, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-[16px] shadow-card relative overflow-hidden">
                    <div className="text-[10px] font-bold text-[#B0B8C1] mb-3">Game {idx + 1}</div>

                    <div className="flex justify-center gap-2 mb-4">
                      {matchTypes.map(type => (
                        <button
                          key={type.value}
                          onClick={() => handleGameChange(idx, 'type', type.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            game.type === type.value ? 'bg-primary text-white' : 'bg-[#F4F4F4] text-[#8B95A1]'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-[#B0B8C1] mb-1">우리팀</span>
                        <input
                          type="number"
                          value={game.myScore}
                          min={0}
                          max={99}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleGameChange(idx, 'myScore', Math.min(99, Math.max(0, Number(e.target.value))))}
                          className="w-full text-center p-2 bg-[#F4F4F4] rounded-[12px] border-none font-bold text-lg text-[#191F28] focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <span className="text-[#B0B8C1] font-bold">:</span>
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-[#B0B8C1] mb-1">상대팀</span>
                        <input
                          type="number"
                          value={game.oppScore}
                          min={0}
                          max={99}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleGameChange(idx, 'oppScore', Math.min(99, Math.max(0, Number(e.target.value))))}
                          className="w-full text-center p-2 bg-[#F4F4F4] rounded-[12px] border-none font-bold text-lg text-[#191F28] focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>

                      <div className="flex flex-col ml-2 gap-1">
                        <button
                          onClick={() => handleGameChange(idx, 'result', 'win')}
                          className={`flex items-center justify-center w-16 py-1.5 rounded-[8px] text-xs font-bold transition-all ${
                            game.result === 'win' ? 'bg-primary text-white' : 'bg-[#F4F4F4] text-[#B0B8C1]'
                          }`}
                        >
                          <Trophy size={12} className="mr-1" /> WIN
                        </button>
                        <button
                          onClick={() => handleGameChange(idx, 'result', 'lose')}
                          className={`flex items-center justify-center w-16 py-1.5 rounded-[8px] text-xs font-bold transition-all ${
                            game.result === 'lose' ? 'bg-red-500 text-white' : 'bg-[#F4F4F4] text-[#B0B8C1]'
                          }`}
                        >
                          <XCircle size={12} className="mr-1" /> LOSE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold text-[#8B95A1] mb-2">코트 인증샷</label>
                <div className="relative w-full h-40 bg-[#F4F4F4] rounded-[12px] flex flex-col items-center justify-center overflow-hidden transition-colors">
                  {photo ? (
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-[#B0B8C1]">
                      <Camera size={24} className="mb-2" />
                      <span className="text-xs font-bold">사진 업로드</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
              </div>
            </div>
          )}

          {(activityType === 'lesson' || activityType === 'practice') && (
            <div>
              <label className="block text-sm font-bold text-[#8B95A1] mb-2">태그 선택</label>
              <div className="flex flex-wrap gap-2">
                {(activityType === 'lesson' ? lessonTags : practiceTags).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      selectedTags.includes(tag) ? 'bg-primary text-white' : 'bg-[#F4F4F4] text-[#8B95A1]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#8B95A1] mb-2">메모</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="피드백이나 특이사항을 적어주세요."
              className="w-full p-4 rounded-[12px] bg-[#F4F4F4] border-none h-28 resize-none text-[#191F28] focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-[12px] font-bold text-[#8B95A1] bg-[#F4F4F4] flex items-center justify-center gap-1">
              <ChevronLeft size={18} /> 이전
            </button>
            <button
              onClick={() => {
                if (!canProceedStep2) return;
                if (calculatePoints(duration) === 0) {
                  handleComplete();
                } else {
                  setStep(3);
                }
              }}
              disabled={!canProceedStep2}
              className="flex-[2] py-4 rounded-[12px] font-bold text-white bg-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {calculatePoints(duration) === 0 ? '기록 완료' : '다음'} {calculatePoints(duration) === 0 ? <Check size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* === Step 3: 스탯 분배 === */}
      {step === 3 && (
        <div className="animate-fade-in">
          <div className="bg-white shadow-card p-6 rounded-[16px] mb-6 text-center">
            <p className="text-[#8B95A1] font-medium text-sm mb-1">남은 성장 포인트</p>
            <p className="text-[48px] font-bold text-primary tracking-tighter leading-none">{pointsLeft}</p>
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
              <div key={key} className="flex items-center justify-between bg-white p-4 rounded-[16px] shadow-card">
                <span className="font-bold text-[#191F28] w-24">{label}</span>
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => handleStatChange(key, -1)}
                    className="w-8 h-8 rounded-full bg-[#F4F4F4] flex items-center justify-center text-[#B0B8C1] active:scale-90"
                  >
                    <Minus size={16} />
                  </button>
                  <span className={`text-xl font-black w-6 text-center ${tempStats[key] > 0 ? 'text-primary' : 'text-[#B0B8C1]'}`}>
                    {tempStats[key]}
                  </span>
                  <button
                    onClick={() => handleStatChange(key, 1)}
                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-card active:scale-90"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-[12px] font-bold text-[#8B95A1] bg-[#F4F4F4] flex items-center justify-center gap-1">
              <ChevronLeft size={18} /> 수정
            </button>
            <button
              onClick={handleComplete}
              disabled={!canComplete || saving}
              className={`flex-[2] py-4 rounded-[12px] font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                canComplete ? 'bg-primary text-white hover:brightness-105' : 'bg-[#F4F4F4] text-[#B0B8C1] cursor-not-allowed'
              }`}
            >
              {saving ? '저장 중...' : '기록 완료'} {!saving && <Check size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
