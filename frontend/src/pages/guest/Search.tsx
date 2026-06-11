import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, ArrowRight, UtensilsCrossed, Store } from 'lucide-react';
import Header from '../../components/organisms/Header';
import useCart from '../../hooks/useCart';
import searchApi, { SearchSuggestion, SearchResult } from '../../services/searchApi';

type TabType = 'all' | 'menu' | 'restaurant';

const categoryNames: Record<string, string> = {
  all: 'Tất cả',
  pho: 'Phở & Bún',
  com: 'Cơm Tấm',
  coffee: 'Cà Phê Vợt',
  snack: 'Ăn Vặt Hẻm',
  dessert: 'Chè Ngọt',
  bread: 'Bánh Mì Sài Gòn',
};

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { totalItems } = useCart();

  // State
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [results, setResults] = useState<SearchResult>({ menuItems: [], restaurants: [] });
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch kết quả tìm kiếm chính
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults({ menuItems: [], restaurants: [] });
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchApi.search(q, 'all');
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch gợi ý autocomplete (debounce 300ms)
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    try {
      const data = await searchApi.getSuggestions(q);
      setSuggestions(data);
    } catch (err) {
      setSuggestions([]);
    }
  }, []);

  // Khi URL param thay đổi (ví dụ user dán link)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setInputValue(q);
    if (q) doSearch(q);
  }, [searchParams, doSearch]);

  // Debounce gợi ý khi gõ
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputValue, fetchSuggestions]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    setQuery(trimmed);
    setSearchParams({ q: trimmed });
    doSearch(trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(inputValue);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'menu') {
      navigate(`/menu-items/${suggestion.id}`);
    } else {
      navigate(`/restaurants/${suggestion.id}`);
    }
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setInputValue('');
    setQuery('');
    setResults({ menuItems: [], restaurants: [] });
    setSuggestions([]);
    setHasSearched(false);
    setSearchParams({});
    inputRef.current?.focus();
  };

  // Filtered results by tab
  const displayMenuItems = activeTab !== 'restaurant' ? results.menuItems : [];
  const displayRestaurants = activeTab !== 'menu' ? results.restaurants : [];
  const totalResults = displayMenuItems.length + displayRestaurants.length;

  return (
    <div className="texture-paper min-h-screen flex flex-col bg-neutral-50 selection:bg-[#BF3A20] selection:text-white">
      <Header cartCount={totalItems} />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-10">

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display italic font-bold text-[#2C1A0E] mb-2">
            🔍 Tìm Kiếm Món Ngon
          </h1>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest">
            ☆ Khám phá hàng nghìn món ăn và nhà hàng Sài Thành ☆
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <form onSubmit={handleSubmit}>
            <div className="flex border-2 border-neutral-900 bg-[#FEFCF9] shadow-retro">
              <div className="flex items-center pl-4 text-neutral-400">
                <Search size={18} />
              </div>
              <input
                ref={inputRef}
                id="search-input"
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Nhập tên món ăn, nhà hàng, địa chỉ..."
                className="flex-grow bg-transparent px-4 py-3.5 text-sm text-neutral-900 font-body placeholder:text-neutral-400 focus:outline-none"
                autoComplete="off"
              />
              {inputValue && (
                <button type="button" onClick={handleClear} className="px-3 text-neutral-400 hover:text-neutral-900 transition-colors">
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="bg-[#BF3A20] hover:bg-[#D44B2F] text-white font-mono font-bold text-xs px-6 border-l-2 border-neutral-900 uppercase tracking-widest transition-colors"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-50 bg-[#FEFCF9] border-2 border-t-0 border-neutral-900 shadow-retro max-h-72 overflow-y-auto"
            >
              {suggestions.map((s, idx) => (
                <button
                  key={`${s.type}-${s.id}-${idx}`}
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#BF3A20]/5 transition-colors flex items-center gap-3 border-b border-dashed border-neutral-100 last:border-0"
                >
                  <span className="text-lg flex-shrink-0">
                    {s.type === 'menu' ? '🍜' : '🏪'}
                  </span>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 font-body truncate">{s.label}</p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      {s.type === 'menu'
                        ? `Món ăn • ${categoryNames[s.category || 'all'] || s.category}`
                        : `Nhà hàng • ${s.address}`}
                    </p>
                  </div>
                  <ArrowRight size={12} className="text-neutral-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results area */}
        {!hasSearched && !loading && (
          <div className="text-center py-8 text-neutral-400 flex flex-col items-center">
            <div className="max-w-[240px] w-full mb-6 opacity-90 select-none">
              <img
                src="/saigon_food_stall.png"
                alt="Khám phá ẩm thực Sài Thành"
                className="w-full h-auto object-contain filter sepia-[5%] drop-shadow-md rounded-sm border-2 border-neutral-900 shadow-retro-sm"
              />
            </div>
            <p className="font-mono text-sm text-neutral-700">Nhập từ khóa để bắt đầu khám phá ẩm thực Sài Thành</p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {['Phở', 'Cơm Tấm', 'Bánh Mì', 'Cà Phê', 'Chè'].map((kw) => (
                <button
                  key={kw}
                  onClick={() => { setInputValue(kw); handleSearch(kw); }}
                  className="px-3 py-1.5 border-2 border-neutral-900 text-xs font-mono font-bold bg-[#FEFCF9] hover:bg-[#BF3A20]/5 shadow-retro-sm hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12 gap-2 font-mono text-xs text-[#BF3A20] uppercase font-bold">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-[#BF3A20]"></div>
            <span>Đang tìm kiếm...</span>
          </div>
        )}

        {hasSearched && !loading && (
          <>
            {/* Tab Switcher */}
            <div className="flex items-center gap-0 border-2 border-neutral-900 w-fit mb-6 shadow-retro-sm">
              {([
                { key: 'all', label: `Tất cả (${results.menuItems.length + results.restaurants.length})` },
                { key: 'menu', label: `🍜 Món ăn (${results.menuItems.length})` },
                { key: 'restaurant', label: `🏪 Nhà hàng (${results.restaurants.length})` },
              ] as { key: TabType; label: string }[]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-xs font-mono font-bold transition-all duration-150 border-r-2 last:border-r-0 border-neutral-900 ${
                    activeTab === tab.key
                      ? 'bg-[#BF3A20] text-white'
                      : 'bg-[#FEFCF9] text-neutral-700 hover:bg-[#BF3A20]/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Summary */}
            {query && (
              <p className="text-xs font-mono text-neutral-500 mb-6">
                Kết quả tìm kiếm cho <strong className="text-neutral-900">"{query}"</strong>: {totalResults} kết quả
              </p>
            )}

            {/* Empty */}
            {totalResults === 0 && (
              <div className="text-center py-10 card-retro bg-[#FEFCF9] flex flex-col items-center justify-center">
                <div className="w-24 h-24 mb-4 opacity-85 select-none">
                  <img
                    src="/empty_bowl.png"
                    alt="Không tìm thấy kết quả"
                    className="w-full h-full object-contain filter sepia-[5%]"
                  />
                </div>
                <p className="font-mono text-sm text-neutral-500">[ Không tìm thấy kết quả nào cho "{query}" ]</p>
                <p className="text-xs text-neutral-400 mt-2">Hãy thử từ khóa khác hoặc kiểm tra lại chính tả</p>
              </div>
            )}

            {/* Menu Items Results */}
            {displayMenuItems.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-neutral-900 pb-2">
                  <UtensilsCrossed size={16} className="text-[#BF3A20]" />
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wide text-[#BF3A20]">
                    Món Ăn ({displayMenuItems.length})
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {displayMenuItems.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/menu-items/${item.id}`)}
                      className="card-retro bg-[#FEFCF9] cursor-pointer group flex flex-col gap-2 p-3 hover:border-[#BF3A20] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                    >
                      <div className="w-full aspect-square overflow-hidden border border-neutral-200 rounded-sm">
                        <img
                          src={item.imageUrl || item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://placehold.co/300x300/FEFCF9/BF3A20?text=${encodeURIComponent(item.name)}`;
                          }}
                          className="w-full h-full object-cover filter sepia-[5%] group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900 line-clamp-1 group-hover:text-[#BF3A20] transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-neutral-400 font-mono mt-0.5">
                          {categoryNames[item.category] || item.category}
                        </p>
                        <p className="font-mono font-bold text-[#BF3A20] text-xs mt-1">
                          {Number(item.price).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Restaurant Results */}
            {displayRestaurants.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 border-b-2 border-neutral-900 pb-2">
                  <Store size={16} className="text-[#BF3A20]" />
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wide text-[#BF3A20]">
                    Nhà Hàng ({displayRestaurants.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayRestaurants.map((r: any) => (
                    <div
                      key={r.id}
                      onClick={() => navigate(`/restaurants/${r.id}`)}
                      className="card-retro bg-[#FEFCF9] cursor-pointer group flex items-center gap-4 p-4 hover:border-[#BF3A20] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                    >
                      <div className="w-16 h-16 overflow-hidden border border-neutral-200 rounded-sm flex-shrink-0">
                        <img
                          src={r.imageUrl || r.logo}
                          alt={r.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://placehold.co/100x100/FEFCF9/BF3A20?text=${encodeURIComponent(r.name?.slice(0, 2) || 'Q')}`;
                          }}
                          className="w-full h-full object-cover filter sepia-[5%]"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-sm text-neutral-900 line-clamp-1 group-hover:text-[#BF3A20] transition-colors">
                          {r.name}
                        </h4>
                        <p className="text-[10px] text-neutral-500 font-mono mt-0.5 line-clamp-1">📍 {r.address}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          {r.rating && (
                            <span className="text-[10px] font-mono font-bold text-amber-700">⭐ {r.rating || r.ratingAvg}</span>
                          )}
                          {r.deliveryFee !== undefined && (
                            <span className="text-[10px] font-mono text-neutral-500">
                              🛵 {r.deliveryFee > 0 ? `${(r.deliveryFee / 1000).toFixed(0)}k` : 'Free'}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-neutral-300 group-hover:text-[#BF3A20] transition-colors flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="bg-[#FEFCF9] border-t-2 border-neutral-900 py-8 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <p className="font-display italic font-bold text-base text-[#BF3A20]">GrabFood Mini © 1990 - 2026</p>
          <p className="font-mono text-[10px] text-neutral-400">TypeScript · React · Tailwind CSS · Sequelize MySQL</p>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;
