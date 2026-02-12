import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, Calendar, ChevronLeft, ChevronRight, X, Plus, 
  PieChart, Search, Trash2, Settings2, Wallet, Utensils, 
  Users, Home, Gamepad2, Landmark 
} from 'lucide-react';
import { Transaction, MonthlyBudget, Budget } from './types';
import { apiService } from './services/api';
import { CATEGORIES, COMMON_TAGS, CATEGORY_COLORS } from './constants';

const App: React.FC = () => {
  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const [budgets, setBudgets] = useState<MonthlyBudget>(() => {
    const saved = localStorage.getItem('monthly_budgets');
    return saved ? JSON.parse(saved) : {};
  });

  // --- Derived Data ---
  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getFullYear() === currentDate.getFullYear() && 
             txDate.getMonth() === currentDate.getMonth();
    });
  }, [transactions, currentDate]);

  const monthlyNetSpending = useMemo(() => {
    return currentMonthTransactions.reduce((acc, t) => {
      return t.mainCategory === "收" ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [currentMonthTransactions]);

  const spentByPerson = useMemo(() => {
    const stats = { zhu: 0, luo: 0 };
    currentMonthTransactions.forEach(t => {
      if (t.mainCategory === "收") return;
      if (t.tags.includes("朱")) stats.zhu += t.amount;
      if (t.tags.includes("羅")) stats.luo += t.amount;
    });
    return stats;
  }, [currentMonthTransactions]);

  const currentBudget: Budget = budgets[currentMonthKey] || { zhu: 0, luo: 0 };

  // --- Handlers ---
  const refreshData = async () => {
    setIsLoading(true);
    const data = await apiService.fetchTransactions();
    setTransactions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCarouselIndex(prev => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const handleSaveBudget = (monthKey: string, zhu: number, luo: number) => {
    const newBudgets = {
      ...budgets,
      [monthKey]: { zhu, luo }
    };
    setBudgets(newBudgets);
    localStorage.setItem('monthly_budgets', JSON.stringify(newBudgets));
    setIsSettingsOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("確定要刪除這筆紀錄嗎？")) {
      setIsLoading(true);
      await apiService.deleteTransaction(id);
      await refreshData();
      setIsFormOpen(false);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  // --- UI Components ---
  const BudgetCarousel = () => {
    const data = [
      { name: "朱", spent: spentByPerson.zhu, limit: currentBudget.zhu },
      { name: "羅", spent: spentByPerson.luo, limit: currentBudget.luo }
    ];
    const item = data[activeCarouselIndex];
    const remaining = item.limit - item.spent;
    const percentage = item.limit > 0 ? Math.min(Math.round((item.spent / item.limit) * 100), 100) : 0;

    return (
      <div className="morandi-track h-12 relative overflow-hidden z-30 shadow-inner banner-transition flex-shrink-0">
        <div 
          className="morandi-fill absolute inset-y-0 left-0 transition-all duration-1000 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center px-8 z-10">
          <div className="flex items-center gap-10">
            <span className="text-xl font-black morandi-text-dark tracking-wider budget-text">{item.name}</span>
            <div className="flex items-center gap-4 morandi-text-dark budget-text">
              <span className="text-sm font-black">剩餘 {remaining.toLocaleString()} 元</span>
              <span className="text-sm font-black">已使用 {percentage}%</span>
            </div>
          </div>
        </div>
        <div className="absolute left-4 bottom-2 flex gap-1 z-20">
          <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeCarouselIndex === 0 ? 'bg-[#4A5568] scale-110' : 'bg-[#4A5568]/30'}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeCarouselIndex === 1 ? 'bg-[#4A5568] scale-110' : 'bg-[#4A5568]/30'}`}></div>
        </div>
      </div>
    );
  };

  const formattedNetSpending = useMemo(() => {
    const val = Math.abs(monthlyNetSpending).toLocaleString();
    return monthlyNetSpending < 0 ? `$-${val}` : `$${val}`;
  }, [monthlyNetSpending]);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-[#f3f4f6] pb-24 shadow-2xl overflow-x-hidden">
      
      {/* Sticky Banner */}
      <div className={`header-container flex flex-col ${isScrolled ? 'compact' : ''}`}>
        <header className={`header-bg ${isScrolled ? 'compact' : 'pt-6'} text-white relative z-20 banner-transition border-none`}>
          {!isScrolled ? (
            /* Large Mode */
            <div className="px-6 animate-fade-in relative flex flex-col">
              <div className="flex justify-between items-start z-10 relative mb-4">
                <button onClick={() => setIsSettingsOpen(true)} className="p-1 -ml-1 opacity-80 hover:opacity-100 transition-opacity interactive-overlay">
                  <Menu size={32} />
                </button>
                <div className="text-center flex-1">
                  <div className="text-3xl font-black opacity-30 leading-none">{currentDate.getFullYear()}</div>
                  <div className="text-6xl font-black leading-none mt-1">{String(currentDate.getMonth() + 1).padStart(2, '0')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[100px] text-right border border-white/10">
                  <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">本月收支</div>
                  <div className={`text-xl font-black ${monthlyNetSpending >= 0 ? 'text-emerald-400' : 'text-[#ff7979]'}`}>
                    {formattedNetSpending}
                  </div>
                </div>
              </div>
              {/* Tightened Navigation Gap */}
              <div className="flex items-center justify-center gap-6 z-30 interactive-overlay mb-[5px] banner-transition">
                <button onClick={() => changeMonth(-1)} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
                  <ChevronLeft size={24} />
                </button>
                <div className="relative group">
                  <div className="bg-white text-blue-600 p-2 rounded-xl shadow-xl flex items-center justify-center group-active:scale-95 transition-transform cursor-pointer">
                    <Calendar size={18} />
                  </div>
                  <input 
                    type="month" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    value={currentMonthKey}
                    onChange={(e) => {
                      const [y, m] = e.target.value.split('-');
                      setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1));
                    }}
                  />
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          ) : (
            /* Compact Mode */
            <div className="h-full flex flex-col justify-between animate-fade-in pt-3">
              <div className="flex justify-between items-center px-6 mb-2">
                <div className="flex items-center gap-1">
                  <button onClick={() => changeMonth(-1)} className="p-1 opacity-50 hover:opacity-100 transition-opacity">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="relative">
                    <div className="text-2xl font-black tracking-tighter text-white cursor-pointer hover:opacity-80 transition-opacity">
                      {currentDate.getFullYear()} / {String(currentDate.getMonth() + 1).padStart(2, '0')}
                    </div>
                    <input 
                      type="month" 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      value={currentMonthKey}
                      onChange={(e) => {
                        const [y, m] = e.target.value.split('-');
                        setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1));
                      }}
                    />
                  </div>
                  <button onClick={() => changeMonth(1)} className="p-1 opacity-50 hover:opacity-100 transition-opacity">
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-bold opacity-70 uppercase tracking-wider leading-none mb-1">本月收支</div>
                   <div className={`text-base font-black leading-none ${monthlyNetSpending >= 0 ? 'text-emerald-400' : 'text-[#ff7979]'}`}>
                      {formattedNetSpending}
                   </div>
                </div>
              </div>
              <BudgetCarousel />
            </div>
          )}
        </header>
        {!isScrolled && <BudgetCarousel />}
      </div>

      {/* Adjust padding for the header - Targeted for 10-15px gap in large mode */}
      <div className={`${isScrolled ? 'pt-[115px]' : 'pt-[220px]'} transition-all duration-300 ease-in-out`} />

      {/* List - Tightened Padding */}
      <main className="flex-1 px-4 py-2 space-y-2.5 app-container">
        {isLoading && <p className="text-center py-10 text-slate-400 font-bold">載入中...</p>}
        {!isLoading && currentMonthTransactions.length === 0 && (
          <div className="text-center py-20 opacity-30 font-bold">目前無任何紀錄</div>
        )}
        {currentMonthTransactions
          .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
          .map((tx) => (
          <div 
            key={tx.id} 
            className="bg-white rounded-[18px] p-3 px-4 shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all"
            onClick={() => handleEdit(tx)}
          >
            <div className="flex flex-col items-center gap-1.5 min-w-[32px]">
              <div 
                className="diamond-icon" 
                style={{ backgroundColor: CATEGORY_COLORS[tx.mainCategory] || '#373e4b' }}
              >
                <span className="font-black text-sm">{tx.mainCategory.charAt(0)}</span>
              </div>
              <span className="text-[9px] text-slate-300 font-bold tracking-tighter text-center leading-none">
                {tx.subCategory}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-700">{tx.date.substring(5)}</span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-tight">{tx.time}</span>
                </div>
                <div className={`text-lg font-black ${tx.mainCategory === '收' ? 'text-emerald-500' : 'text-slate-800'}`}>
                  {tx.mainCategory === '收' ? '' : '-'}{tx.amount.toLocaleString()}
                </div>
              </div>
              <h4 className="font-bold text-slate-600 text-[15px] mb-1 truncate leading-tight">{tx.description || tx.subCategory}</h4>
              <div className="flex flex-wrap gap-1">
                {tx.tags.map(tag => (
                  <span key={tag} className="bg-indigo-50 text-indigo-500 text-[9px] px-1.5 py-0 rounded-full border border-indigo-100 font-bold">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 max-w-md w-full bg-[#373e4b] h-20 flex items-center justify-around px-8 z-40">
        <button className="text-white/40 hover:text-white transition-colors">
          <PieChart size={28} />
        </button>
        <div className="relative -top-8">
          <button 
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
            className="w-16 h-16 bg-white text-[#373e4b] rounded-full shadow-2xl flex items-center justify-center border-[6px] border-[#373e4b] active:scale-90 transition-transform"
          >
            <Plus size={40} />
          </button>
        </div>
        <button className="text-white/40 hover:text-white transition-colors">
          <Search size={28} />
        </button>
      </footer>

      {/* Modals */}
      {isSettingsOpen && (
        <BudgetSettingsModal 
          onClose={() => setIsSettingsOpen(false)} 
          onSave={handleSaveBudget}
          initialData={currentBudget}
          currentMonthKey={currentMonthKey}
        />
      )}

      {isFormOpen && (
        <TransactionForm 
          onClose={() => setIsFormOpen(false)} 
          onSave={refreshData}
          onDelete={handleDelete}
          editData={editingTransaction}
        />
      )}
    </div>
  );
};

// --- Budget Settings Modal ---
interface BudgetSettingsModalProps {
  onClose: () => void;
  onSave: (monthKey: string, zhu: number, luo: number) => void;
  initialData: Budget;
  currentMonthKey: string;
}

const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({ onClose, onSave, initialData, currentMonthKey }) => {
  const [month, setMonth] = useState(currentMonthKey);
  const [zhu, setZhu] = useState(initialData.zhu.toString());
  const [luo, setLuo] = useState(initialData.luo.toString());

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-10 sm:items-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-slide-up">
        <div className="bg-[#373e4b] p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-orange-400" />
            <span className="text-xl font-black">設定值</span>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity"><X size={24} /></button>
        </div>
        <div className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-100 pb-2">一、預算設定 (依月份)</div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">選擇月份</label>
                <input 
                  type="month" 
                  value={month} 
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-slate-500">朱 (預算)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                    <input 
                      type="number" 
                      value={zhu}
                      onChange={(e) => setZhu(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-8 font-black text-slate-700 outline-none" 
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-slate-500">羅 (預算)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                    <input 
                      type="number" 
                      value={luo}
                      onChange={(e) => setLuo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-8 font-black text-slate-700 outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onSave(month, Number(zhu), Number(luo))}
            className="w-full bg-[#373e4b] text-white font-black py-5 rounded-[20px] shadow-xl shadow-slate-200 active:scale-95 transition-all"
          >
            確認並儲存
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Transaction Form Modal ---
interface TransactionFormProps {
  onClose: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  editData: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSave, onDelete, editData }) => {
  const [date, setDate] = useState(editData?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(editData?.time || new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
  const [amount, setAmount] = useState(editData?.amount?.toString() || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [mainCat, setMainCat] = useState(editData?.mainCategory || '');
  const [subCat, setSubCat] = useState(editData?.subCategory || '');
  const [tags, setTags] = useState<string[]>(editData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubCatVisible, setIsSubCatVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleMainCatClick = (cat: string) => {
    setMainCat(cat);
    setSubCat('');
    setIsSubCatVisible(true);
  };

  const handleSubCatClick = (sub: string) => {
    setSubCat(sub);
    setIsSubCatVisible(false);
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !mainCat || !subCat) {
      alert("請填寫金額與分類");
      return;
    }

    setIsSaving(true);
    const tx = {
      date,
      time,
      amount: Number(amount),
      description,
      mainCategory: mainCat,
      subCategory: subCat,
      tags
    };

    let success = false;
    if (editData) {
      success = await apiService.updateTransaction(editData.id, tx);
    } else {
      success = await apiService.addTransaction(tx);
    }

    if (success) {
      onSave();
      onClose();
    } else {
      alert("儲存失敗，請檢查 API 設定");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-white animate-slide-up overflow-y-auto hide-scrollbar">
      <header className="sticky top-0 bg-white border-b px-6 py-5 flex items-center justify-between z-10">
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={28} /></button>
        <h2 className="text-xl font-black text-slate-800">{editData ? '編輯明細' : '記一筆'}</h2>
        <div className="w-7" />
      </header>

      <form onSubmit={handleSubmit} className="p-8 space-y-8 pb-12">
        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">日期</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">時間</label>
            <input 
              type="time" 
              value={time} 
              onChange={e => setTime(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">金額</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-indigo-400">$</span>
            <input 
              type="number" 
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-10 font-black text-slate-700 outline-none border-b-2 border-transparent focus:border-indigo-500"
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">帳務說明</label>
          <input 
            type="text" 
            placeholder="例如：全聯買菜"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none border-b-2 border-transparent focus:border-indigo-500"
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">主分類</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(CATEGORIES).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => handleMainCatClick(cat)}
                style={{ 
                  backgroundColor: mainCat === cat ? CATEGORY_COLORS[cat] : '#f8fafc',
                  color: mainCat === cat ? 'white' : '#94a3b8'
                }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all shadow-sm`}
              >
                <div className="text-sm font-black uppercase">{cat}</div>
              </button>
            ))}
          </div>
        </div>

        {isSubCatVisible && mainCat && (
          <div className="space-y-3 p-4 bg-slate-50 rounded-3xl animate-fade-in border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">子分類：{mainCat}</label>
              <button type="button" onClick={() => setIsSubCatVisible(false)} className="text-slate-300"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES[mainCat].map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => handleSubCatClick(sub)}
                  className={`py-3 px-1 rounded-xl text-xs font-bold border transition-colors ${subCat === sub ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-600'}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isSubCatVisible && subCat && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-300">已選分類:</span>
            <button 
              type="button"
              onClick={() => setIsSubCatVisible(true)}
              className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black border border-indigo-100 shadow-sm"
            >
              {mainCat} - {subCat}
            </button>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">標籤</label>
          <div className="flex flex-wrap gap-2 mb-2 p-2 min-h-[50px] bg-slate-50 rounded-2xl border border-slate-100">
            {tags.length === 0 && <span className="text-xs text-slate-300 italic py-2 px-1">尚未選擇標籤...</span>}
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1.5 bg-indigo-600 text-white pl-4 pr-3 py-1.5 rounded-full text-xs font-black shadow-md animate-fade-in">
                {tag}
                <button type="button" onClick={() => toggleTag(tag)} className="opacity-70 hover:opacity-100"><X size={14} /></button>
              </span>
            ))}
          </div>
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="新增自訂標籤 (Enter)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-700 outline-none"
            />
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto hide-scrollbar p-1">
              {COMMON_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${tags.includes(tag) ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="pt-6 flex gap-4">
          {editData && (
            <button 
              type="button"
              onClick={() => onDelete(editData.id)}
              className="bg-red-50 text-red-500 p-5 rounded-3xl active:scale-95 transition-all hover:bg-red-100"
            >
              <Trash2 size={24} />
            </button>
          )}
          <button 
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-[#373e4b] text-white font-black py-5 rounded-3xl shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? '儲存中...' : (editData ? '更新紀錄' : '確認儲存')}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default App;