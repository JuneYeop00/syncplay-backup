import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, Share2, Sun, Moon, Monitor, Palette } from 'lucide-react';

const Settings = ({ isDarkMode, toggleTheme }) => {
  const cardClass = isDarkMode 
    ? "bg-white/5 backdrop-blur-3xl border-white/10 shadow-2xl" 
    : "bg-white/70 backdrop-blur-xl border-slate-200 shadow-xl";

  const textPrimary = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-500" : "text-slate-500";
  const itemHover = isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50";

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="max-w-4xl space-y-10">
        
        {/* 1. 외관 및 테마 설정 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Palette className="text-indigo-500" size={24} />
            <h3 className={`text-2xl font-black ${textPrimary} tracking-tight`}>화면 설정</h3>
          </div>
          
          <div className={`${cardClass} rounded-[3rem] p-10 border overflow-hidden`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 테마 스위치 카드 */}
              <div 
                onClick={toggleTheme}
                className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer group flex flex-col justify-between h-48 ${
                  isDarkMode 
                    ? "bg-white/5 border-white/10 hover:border-indigo-500/50" 
                    : "bg-slate-50 border-slate-200 hover:border-blue-500/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl ${isDarkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-blue-500/10 text-blue-600"}`}>
                    {isDarkMode ? <Moon size={28} /> : <Sun size={28} />}
                  </div>
                  <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? "bg-indigo-600" : "bg-slate-300"}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? "translate-x-6" : "translate-x-0"}`} />
                  </div>
                </div>
                <div>
                  <h4 className={`text-xl font-black ${textPrimary}`}>{isDarkMode ? "다크 모드" : "라이트 모드"}</h4>
                  <p className={`text-sm font-bold ${textSecondary} mt-1`}>현재 테마를 변경하려면 클릭하세요</p>
                </div>
              </div>

              {/* 시스템 연동 안내 (더미) */}
              <div className={`p-8 rounded-[2.5rem] border opacity-50 flex flex-col justify-between h-48 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                <div className={`p-4 rounded-2xl w-fit ${isDarkMode ? "bg-slate-500/20 text-slate-400" : "bg-slate-500/10 text-slate-500"}`}>
                  <Monitor size={28} />
                </div>
                <div>
                  <h4 className={`text-xl font-black ${textPrimary}`}>시스템 자동 설정</h4>
                  <p className={`text-sm font-bold ${textSecondary} mt-1`}>운영체제 설정에 따라 자동 전환</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 일반 설정 리스트 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <SettingsIcon className="text-indigo-500" size={24} />
            <h3 className={`text-2xl font-black ${textPrimary} tracking-tight`}>애플리케이션 설정</h3>
          </div>

          <div className={`${cardClass} rounded-[3rem] border overflow-hidden`}>
            <div className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-slate-100"}`}>
              {[
                { icon: <Bell size={22} />, title: "알림 설정", desc: "시청 중인 콘텐츠의 업데이트 소식을 받습니다", color: "text-blue-500" },
                { icon: <Lock size={22} />, title: "보안 및 계정", desc: "비밀번호 변경 및 보안 설정을 관리합니다", color: "text-emerald-500" },
                { icon: <Share2 size={22} />, title: "서비스 연동", desc: "Netflix, Disney+ 등 외부 계정을 관리합니다", color: "text-purple-500" },
              ].map((item, index) => (
                <div key={index} className={`p-8 flex items-center justify-between ${itemHover} cursor-pointer transition-all group`}>
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${isDarkMode ? "bg-white/5" : "bg-slate-100"} ${item.color} group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className={`text-lg font-black ${textPrimary}`}>{item.title}</h3>
                      <p className={`text-sm font-bold ${textSecondary} mt-1`}>{item.desc}</p>
                    </div>
                  </div>
                  <span className={`${textSecondary} text-2xl group-hover:translate-x-1 transition-transform`}>›</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
