import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, ChevronRight, Heart, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const OTT_LOGOS = {
  "Netflix": "/logos/netflix.png",
  "TVING": "/logos/tving.png",
  "Disney+": "/logos/disneyplus.svg",
  "Coupang Play": "/logos/coupangplay.png",
  "Wavve": "/logos/wavve.png"
};

const OTT_LIST = [
  { id: 'netflix', name: 'Netflix', color: 'bg-red-600' },
  { id: 'tving', name: 'TVING', color: 'bg-red-500' },
  { id: 'disneyplus', name: 'Disney+', color: 'bg-blue-700' },
  { id: 'coupangplay', name: 'Coupang Play', color: 'bg-sky-500' },
  { id: 'wavve', name: 'Wavve', color: 'bg-blue-500' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUserInfo({ name: savedUser.name, email: savedUser.email });
      fetchAllData(savedUser.email);
    }
  }, []);

  const fetchAllData = async (email) => {
    setLoading(true);
    try {
      // 1. 구독 정보 가져오기
      const subRes = await fetch(`http://localhost:8080/api/users/subscriptions?email=${encodeURIComponent(email)}`);
      if (subRes.ok) {
        const subData = await subRes.json();
        setMySubscriptions(subData.subscriptions || []);
      }

      // 2. 찜 목록 가져오기
      const wishRes = await fetch(`http://localhost:8080/api/wishlist?email=${encodeURIComponent(email)}`);
      if (wishRes.ok) {
        const wishData = await wishRes.json();
        setWishlist(wishData.slice(0, 4)); // 홈에서는 4개만 노출
      }

      // 3. 시청 기록 가져오기 (TMDB 연동 포함)
      const historyRes = await fetch('http://localhost:8080/api/history');
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        const top3History = historyData.reverse().slice(0, 3);

        const enrichedHistory = await Promise.all(
          top3History.map(async (item) => {
            try {
              const tmdbResp = await fetch(
                `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(item.title)}&include_adult=false&language=ko-KR&page=1`,
                { headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` } }
              );
              const tmdbData = await tmdbResp.json();
              const detail = tmdbData.results?.find(res => res.media_type === 'movie' || res.media_type === 'tv') || tmdbData.results?.[0] || {};
              return {
                ...item,
                posterUrl: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : null,
                mediaType: detail.media_type || (item.subTitle ? 'tv' : 'movie')
              };
            } catch (e) {
              return item;
            }
          })
        );
        setRecentHistory(enrichedHistory);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeServices = OTT_LIST.filter(ott => mySubscriptions.includes(ott.id));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* 1. 상단 환영 섹션 */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-3 tracking-tight">안녕하세요, {userInfo.name}님!</h2>
          <p className="text-blue-100 text-lg max-w-md">
            오늘도 즐거운 시청 시간 되세요. <br />
            구독 중인 서비스의 새로운 콘텐츠를 확인해 보세요.
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="mt-8 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <TrendingUp size={20} />
            <span>전체 OTT 검색하기</span>
          </button>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 2. 내 서비스 (활성화된 것만 표시) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">내 서비스</h3>
            <button onClick={() => navigate('/mypage')} className="text-sm text-blue-600 font-semibold hover:underline">관리</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {activeServices.length > 0 ? (
              activeServices.map((ott) => (
                <div key={ott.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative">
                  <img src={OTT_LOGOS[ott.name]} alt={ott.name} className="h-8 mb-4 object-contain" />
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-xs font-medium text-gray-500">연동됨</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-sm text-gray-400 mb-4">연동된 서비스가 없습니다.</p>
                <button onClick={() => navigate('/mypage')} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">서비스 추가</button>
              </div>
            )}
          </div>
        </div>

        {/* 3. 최근 시청 기록 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">최근 시청 기록</h3>
            <button onClick={() => navigate('/movies')} className="text-sm text-blue-600 font-semibold hover:underline flex items-center">전체보기 <ChevronRight size={16} /></button>
          </div>
          <div className="space-y-4">
            {recentHistory.length > 0 ? (
              recentHistory.map((watch) => (
                <div key={watch.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(watch.subTitle ? '/tv' : '/movies')}>
                  <div className="flex items-center space-x-4">
                    <img src={watch.posterUrl || 'https://via.placeholder.com/100x150?text=No+Image'} alt={watch.title} className="w-12 h-16 object-cover rounded-xl shadow-sm" />
                    <div>
                      <h4 className="font-bold text-gray-900 line-clamp-1">{watch.title}</h4>
                      <p className="text-xs text-gray-500">{watch.subTitle || '영화'} · {watch.progress}% 시청 중</p>
                    </div>
                  </div>
                  <div className="text-right w-24">
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${watch.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm py-10 text-center bg-white rounded-2xl border border-dashed">시청 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. 찜한 콘텐츠 섹션 추가 */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Heart size={24} className="text-pink-500 fill-pink-500" />
            내가 찜한 콘텐츠
          </h3>
          <button onClick={() => navigate('/mypage')} className="text-sm text-blue-600 font-semibold hover:underline">전체보기</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.length > 0 ? (
            wishlist.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group cursor-pointer" onClick={() => navigate(`/search?q=${encodeURIComponent(item.title)}`)}>
                <div className="relative aspect-[2/3]">
                  <img src={item.posterUrl || 'https://via.placeholder.com/300x450?text=No+Image'} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full text-pink-500 shadow-sm">
                    <Heart size={16} fill="currentColor" />
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{item.releaseDate?.split('-')[0]} · {item.mediaType?.toUpperCase()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <Heart size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400">아직 찜한 콘텐츠가 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
