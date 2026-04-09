import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      alert('비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    // 로컬 스토리지에 사용자 정보 저장
    const userData = { name, email, password };
    localStorage.setItem('user', JSON.stringify(userData));
    
    alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] font-sans relative overflow-hidden p-6 py-12">
      {/* 🌌 미드나잇 오로라 배경 오브제 */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[160px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="bg-white/5 backdrop-blur-[80px] p-12 lg:p-16 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex justify-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-[1.8rem] shadow-[0_0_40px_rgba(79,70,229,0.4)] flex items-center justify-center text-white text-3xl font-black">SP</div>
        </div>
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-3 tracking-tighter">계정 생성</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">스마트한 OTT 생활의 시작</p>
        </div>
        
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">사용자 이름</label>
              <input type="text" placeholder="성함 입력" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white/10 transition-all font-medium text-white placeholder:text-slate-700" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">이메일 주소</label>
              <input type="email" placeholder="example@email.com" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white/10 transition-all font-medium text-white placeholder:text-slate-700" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">비밀번호 설정</label>
            <input type="password" placeholder="••••••••" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white/10 transition-all font-medium text-white placeholder:text-slate-700" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">비밀번호 확인</label>
            <input type="password" placeholder="••••••••" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white/10 transition-all font-medium text-white placeholder:text-slate-700" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          
          <button type="submit" className="w-full bg-white text-[#020617] font-black py-5 rounded-[2rem] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all active:scale-95 mt-8 text-lg">
            회원가입 완료
          </button>
        </form>
        
        <p className="mt-12 text-center text-sm text-slate-500 font-bold">
          이미 계정이 있으신가요? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">로그인하기</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;