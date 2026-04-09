import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, CheckCircle2, AlertCircle, X, Star, Heart, Play } from 'lucide-react';

const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_BASE_URL = 'http://localhost:8080';

const SearchPage = ({ isDarkMode }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [myWishlist, setMyWishlist] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userEmail = currentUser?.email || '';

  const textPrimary = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-500";
  const cardClass = isDarkMode 
    ? "bg-white/5 backdrop-blur-3xl border-white/10 shadow-2xl hover:bg-white/10" 
    : "bg-white/70 backdrop-blur-xl border-slate-200 shadow-lg hover:bg-white/90";

  useEffect(() => {
    if (!userEmail) return;
    fetch(`${API_BASE_URL}/api/wishlist?email=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => setMyWishlist(data))
      .catch(err => console.error("찜 목록 불러오기 실패:", err));
  }, [userEmail]);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const tmdbRes = await fetch(`${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&language=ko-KR&page=1`, {
          headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` }
        });
        const tmdbData = await tmdbRes.json();
        
        const enrichedResults = await Promise.all(
          (tmdbData.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv').map(async (item) => {
            const title = item.title || item.name;
            let providerStatuses = [];
            
            try {
              const provRes = await fetch(`${API_BASE_URL}/api/providers/availability?title=${encodeURIComponent(title)}&email=${encodeURIComponent(userEmail)}&region=KR`);
              if (provRes.ok) {
                const provData = await provRes.json();
                providerStatuses = provData.providers || [];
              }
            } catch (err) { console.error("Provider fetch error:", err); }

            return {
              id: item.id,
              title: title,
              mediaType: item.media_type,
              posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
              overview: item.overview || '상세 정보가 없습니다.',
              releaseDate: item.release_date || item.first_air_date,
              rating: item.vote_average || 0,
              providerStatuses
            };
          })
        );
        setResults(enrichedResults);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchSearchResults();
  }, [query, userEmail]);

  const toggleWishlist = async (item) => {
    if (!userEmail) return alert("로그인이 필요합니다.");
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist?email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const updated = await res.json();
        setMyWishlist(updated);
      }
    } catch (err) { console.error(err); }
  };

  const isWished = (id) => myWishlist.some(w => w.id === id);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchInput.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSelectedItem(null);
    }
  };

  const getSubscribed = (providers) => providers.filter(p => p.status === 'SUBSCRIBED');

  const handlePlayDirectly = (item) => {
    const subscribed = getSubscribed(item.providerStatuses);
    if (subscribed.length === 0) return;

    const platformName = subscribed[0].providerName.toLowerCase().replace(/\s/g, '');
    const encodedTitle = encodeURIComponent(item.title);
    
    let targetUrl = `https://www.google.com/search?q=${encodedTitle}+보러가기`;

    if (platformName.includes('netflix')) targetUrl = `https://www.netflix.com/search?q=${encodedTitle}`;
    else if (platformName.includes('tving')) targetUrl = `https://www.tving.com/search?keyword=${encodedTitle}`;
    else if (platformName.includes('wavve')) targetUrl = `https://www.wavve.com/search?searchWord=${encodedTitle}`;
    else if (platformName.includes('coupang')) targetUrl = `https://www.coupangplay.com`;
    else if (platformName.includes('disney')) targetUrl = `https://www.disneyplus.com`; 
    else if (platformName.includes('watcha')) targetUrl = `https://watcha.com/search?query=${encodedTitle}`;

    window.open(targetUrl, '_blank');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 relative animate-in fade-in duration-1000">
      <div className="flex items-center gap-6 mb-16">
        <button onClick={() => navigate(-1)} className={`p-6 backdrop-blur-3xl rounded-[2.2rem] shadow-2xl transition-all border shrink-0 ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white border-white/10' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}>
          <ArrowLeft size={24} />
        </button>
        <div className={`flex-1 backdrop-blur-3xl rounded-[2.5rem] px-10 py-6 flex items-center border shadow-2xl focus-within:ring-4 transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50 focus-within:ring-indigo-500/10' : 'bg-white border-slate-200 focus-within:border-blue-400/50 focus-within:ring-blue-400/10'}`}>
          <Search size={28} className="text-indigo-400 mr-6 shrink-0" />
          <input type="text" className={`bg-transparent text-xl outline-none w-full font-black ${isDarkMode ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'} tracking-tight`} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleSearch} placeholder="작품 제목이나 키워드를 입력하세요..." autoFocus />
        </div>
      </div>

      {query && !loading && (
        <div className="mb-12 px-6">
          <h2 className={`text-3xl font-black ${textPrimary} flex items-center gap-4`}>
            <span className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            "<span className="text-indigo-400">{query}</span>" 검색 결과
          </h2>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center py-40 text-slate-500 font-black items-center gap-10">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-full" />
            <div className="absolute inset-0 w-24 h-24 border-t-2 border-indigo-500 rounded-full animate-spin" />
          </div>
          <p className="text-xl uppercase tracking-[0.3em]">전 세계 OTT를 탐색하는 중...</p>
        </div>
      ) : 
      query && results.length === 0 ? (
        <div className={`p-32 text-center border-2 border-dashed rounded-[4rem] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600 bg-white/5 border-white/10' : 'text-slate-400 bg-slate-50 border-slate-200'}`}>
          일치하는 검색 결과가 없습니다.
        </div>
      ) :
      !query ? (
        <div className={`p-32 text-center border-2 border-dashed rounded-[4rem] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600 bg-white/5 border-white/10' : 'text-slate-400 bg-slate-50 border-slate-200'}`}>
          찾으시는 영화나 TV 프로그램을 검색해 보세요.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {results.map((item) => {
            const subscribedProviders = getSubscribed(item.providerStatuses);

            return (
              <div key={item.id} onClick={() => setSelectedItem(item)} className={`${cardClass} rounded-[3rem] border overflow-hidden flex flex-col hover:-translate-y-3 transition-all duration-700 cursor-pointer group shadow-2xl`}>
                 <div className={`flex h-64 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="w-40 bg-[#020617] flex-shrink-0 relative overflow-hidden">
                      {item.posterUrl ? <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full flex items-center justify-center text-xs text-slate-600 uppercase font-black">이미지 없음</div>}
                      <div className="absolute top-4 left-4">
                        <span className="text-[10px] font-black text-white bg-indigo-600/60 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 uppercase tracking-widest">
                          {item.mediaType === 'movie' ? '영화' : 'TV 시리즈'}
                        </span>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col justify-between w-full">
                      <div>
                        <h3 className={`font-black ${textPrimary} leading-tight mb-3 line-clamp-2 text-xl group-hover:text-indigo-500 transition-colors tracking-tight`}>{item.title}</h3>
                        <p className={`text-sm ${textSecondary} font-black tracking-widest uppercase`}>{item.releaseDate?.substring(0, 4) || '날짜 미상'}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                          <Star size={14} className="fill-yellow-500" />
                          <span className="text-sm font-black">{item.rating?.toFixed(1)}</span>
                        </div>
                        {isWished(item.id) && <Heart size={22} className="text-pink-500 fill-pink-500" />}
                      </div>
                    </div>
                 </div>
                 
                 <div className={`p-6 flex-1 flex flex-col justify-center ${isDarkMode ? 'bg-white/5' : 'bg-slate-50/50'}`}>
                   {item.providerStatuses.length === 0 ? (
                     <p className={`text-[10px] font-black ${isDarkMode ? 'text-slate-600' : 'text-slate-400'} text-center uppercase tracking-[0.3em]`}>스트리밍 정보 없음</p>
                   ) : (
                     <div className="flex items-center gap-4 px-2">
                       <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                       <div className="flex flex-wrap gap-2">
                         {subscribedProviders.length > 0 ? (
                           subscribedProviders.slice(0, 2).map(p => (
                             <span key={p.providerId} className={`text-[11px] font-black px-3 py-1 rounded-xl border uppercase tracking-wider ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-white text-slate-600 border-slate-200 shadow-sm'}`}>
                               {p.providerName}
                             </span>
                           ))
                         ) : (
                           <span className={`text-[11px] font-black ${isDarkMode ? 'text-slate-600' : 'text-slate-400'} uppercase tracking-widest`}>구매 또는 대여 전용</span>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <div onClick={() => setSelectedItem(null)} className={`fixed inset-0 z-[999] flex items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in duration-500 ${isDarkMode ? 'bg-[#020617]/80' : 'bg-slate-900/40'}`}>
          <div onClick={(e) => e.stopPropagation()} className={`rounded-[4rem] overflow-hidden max-w-5xl w-full shadow-[0_40px_100px_rgba(0,0,0,0.6)] border relative animate-in zoom-in-95 slide-in-from-bottom-12 duration-700 ${isDarkMode ? 'bg-white/5 backdrop-blur-[80px] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-[45%] bg-[#020617] relative group overflow-hidden">
                {selectedItem.posterUrl ? (
                  <img src={selectedItem.posterUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="poster" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700 font-black uppercase tracking-[0.4em]">이미지 없음</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#020617]/20" />
              </div>
              
              <div className="p-16 md:w-[55%] flex flex-col justify-between relative">
                <button onClick={() => setSelectedItem(null)} className={`absolute top-8 right-10 p-4 rounded-[1.5rem] transition-all border group ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-500 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-900'}`}><X size={24} /></button>
                
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] border ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{selectedItem.mediaType === 'movie' ? '영화' : 'TV 시리즈'}</span>
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border ${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                      <Star size={18} className="fill-yellow-500" />
                      <span className="text-base font-black">{selectedItem.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <h2 className={`text-5xl font-black ${textPrimary} mb-8 tracking-tighter leading-tight drop-shadow-2xl`}>{selectedItem.title}</h2>
                  
                  <div className={`mb-10 p-8 rounded-[2.5rem] border shadow-inner ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <h4 className={`text-[10px] font-black ${textSecondary} uppercase tracking-[0.3em] mb-4`}>줄거리 요약</h4>
                    <p className={`leading-relaxed font-medium text-lg max-h-48 overflow-y-auto pr-4 scrollbar-hide ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{selectedItem.overview}</p>
                  </div>
                </div>

                <div className="flex gap-5 mt-4">
                  {getSubscribed(selectedItem.providerStatuses).length > 0 ? (
                    <button onClick={() => handlePlayDirectly(selectedItem)} className={`flex-1 font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all group ${isDarkMode ? 'bg-white text-[#020617] hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}>
                      <Play size={28} className={isDarkMode ? "fill-[#020617]" : "fill-white"} />
                      <span className="text-xl">{getSubscribed(selectedItem.providerStatuses)[0].providerName}에서 시청하기</span>
                    </button>
                  ) : (
                    <div className={`flex-1 font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-4 border uppercase tracking-widest text-sm ${isDarkMode ? 'bg-white/5 text-slate-600 border-white/5' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      <AlertCircle size={22} /> 구독 정보 없음
                    </div>
                  )}
                  
                  <button onClick={() => toggleWishlist(selectedItem)} className={`px-12 py-6 font-black rounded-[2.5rem] flex items-center gap-4 border transition-all active:scale-95 ${isWished(selectedItem.id) ? 'bg-pink-500 text-white border-transparent shadow-xl' : 'bg-white/5 text-pink-500 border-white/10 hover:bg-white/10'}`}>
                    <Heart size={28} className={isWished(selectedItem.id) ? "fill-white" : ""} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
