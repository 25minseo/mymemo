/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Tag as TagIcon, 
  Calendar,
  Hash,
  LayoutGrid,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

// --- Constants ---
const STORAGE_KEY = "mymemo.notes";
const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "브랜드 컬러 가이드라인을 준수하며 타이포그래피 계층 구조를 명확히 설계하세요.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 리팩터링\n3. 디자인 패턴의 아름다움",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "개인화된 AI 가계부 서비스: 영수증 사진을 찍으면 자동으로 카테고리 분류 및 지출 통계 생성.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString(),
  },
];

export default function App() {
  // --- State ---
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formTags, setFormTags] = useState("");

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // --- Derived Data ---
  const allTags = useMemo(() => {
    const tagsMap = new Map<string, number>();
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagsMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const matchesTag = !selectedTag || note.tags.includes(selectedTag);
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          note.title.toLowerCase().includes(searchLower) ||
          note.body.toLowerCase().includes(searchLower) ||
          note.tags.some(tag => tag.toLowerCase().includes(searchLower));
        return matchesTag && matchesSearch;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, selectedTag, searchQuery]);

  // --- Logic ---
  const handleAddNote = () => {
    if (!formTitle.trim() && !formBody.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      title: formTitle,
      body: formBody,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    resetForm();
    setIsModalOpen(false);
  };

  const handleDeleteNote = (id: number) => {
    if (confirm("이 메모를 삭제하시겠습니까?")) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormBody("");
    setFormTags("");
  };

  return (
    <div className="min-h-screen text-primary font-sans flex flex-col transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/20 rounded-lg text-secondary lg:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
                <LayoutGrid size={22} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-primary">MyMemo</h1>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary opacity-50" size={18} />
            <input 
              type="text"
              placeholder="제목, 내용, 태그 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 h-11 bg-white/50 border border-glass-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all text-sm outline-none placeholder:text-secondary/50"
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-accent/20 active:scale-95"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span className="hidden sm:inline text-sm">새 메모</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-20 w-72 glass border-r border-glass-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          mt-20 lg:mt-0
        `}>
          <div className="p-6 flex flex-col h-full gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[11px] font-bold text-secondary uppercase tracking-widest px-4 mb-1">Filters</h2>
              <button 
                onClick={() => setSelectedTag(null)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${!selectedTag ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-primary hover:bg-white/30'}`}
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid size={18} />
                  <span className="font-semibold text-sm">전체</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${!selectedTag ? 'bg-white/20' : 'bg-black/5'}`}>{notes.length}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <h2 className="text-[11px] font-bold text-secondary uppercase tracking-widest px-4 mb-3">Tags</h2>
              <div className="space-y-1.5 px-1">
                {allTags.map(([tag, count]) => (
                  <button 
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${selectedTag === tag ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-primary hover:bg-white/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Hash size={18} className={selectedTag === tag ? "opacity-100" : "opacity-30"} />
                      <span className="truncate max-w-[140px] text-left font-semibold text-sm">{tag}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedTag === tag ? 'bg-white/20' : 'bg-black/5'}`}>{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-10 bg-slate-900/20 backdrop-blur-sm lg:hidden mt-16"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-primary tracking-tight">
                {selectedTag ? `#${selectedTag}` : '모든 메모'}
              </h2>
              <p className="text-sm font-medium text-secondary/70 mt-2">
                총 {filteredNotes.length}개의 정제된 메모가 발견되었습니다.
              </p>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} />
                </div>
                <p className="text-lg font-medium">검색 결과가 없습니다.</p>
                <p className="text-sm">다른 키워드나 태그를 시도해보세요.</p>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredNotes.map((note: Note) => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      onDelete={handleDeleteNote}
                      onTagClick={(tag: string) => setSelectedTag(tag === selectedTag ? null : tag)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass w-full max-w-lg rounded-3xl overflow-hidden relative z-10 p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-primary tracking-tight">새 메모 추가</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/30 rounded-xl text-secondary transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="form-group flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">제목</label>
                  <input 
                    type="text"
                    autoFocus
                    placeholder="제목을 입력하세요"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-5 py-3 bg-white/60 border border-glass-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:bg-white outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div className="form-group flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">본문</label>
                  <textarea 
                    placeholder="메모 내용을 입력하세요"
                    rows={6}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full px-5 py-3 bg-white/60 border border-glass-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:bg-white outline-none transition-all resize-none text-sm leading-relaxed"
                  />
                </div>
                <div className="form-group flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-secondary uppercase tracking-widest ml-1">태그 (쉼표로 구분)</label>
                  <div className="relative">
                    <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary opacity-50" size={16} />
                    <input 
                      type="text"
                      placeholder="디자인, 개발, 가이드"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/60 border border-glass-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3.5 bg-white/20 hover:bg-white/40 text-primary font-bold rounded-2xl transition-all"
                >
                  취소
                </button>
                <button 
                  onClick={handleAddNote}
                  disabled={!formTitle.trim() && !formBody.trim()}
                  className="flex-1 px-4 py-3.5 bg-accent hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl shadow-accent/20 transition-all active:scale-95"
                >
                  저장하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Card Component ---
interface NoteCardProps {
  note: Note;
  onDelete: (id: number) => void;
  onTagClick: (tag: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onDelete, 
  onTagClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      id={`note-${note.id}`}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group glass p-6 rounded-3xl hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1.5 transition-all duration-500 relative flex flex-col gap-4 min-h-[220px]"
    >
      <div className="flex flex-col h-full gap-3">
        {/* Delete Button (visible on hover) */}
        <AnimatePresence>
          {isHovered && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => onDelete(note.id)}
              className="absolute top-4 right-4 w-9 h-9 bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm z-10 flex items-center justify-center backdrop-blur-md border border-rose-500/20"
            >
              <Trash2 size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        <h3 className="text-lg font-black text-primary leading-tight line-clamp-2 pr-6">
          {note.title || "제목 없음"}
        </h3>
        
        <p className="text-sm text-secondary leading-relaxed line-clamp-4 flex-1 whitespace-pre-wrap">
          {note.body}
        </p>

        <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-glass-border">
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map(tag => (
              <button 
                key={tag}
                onClick={() => onTagClick(tag)}
                className="text-[10px] font-bold px-2.5 py-1 bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-all"
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-secondary opacity-40">
            <Calendar size={12} strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-tighter">
              {new Date(note.updatedAt).toLocaleDateString('ko-KR', { 
                month: 'long', 
                day: 'numeric' 
              }).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
