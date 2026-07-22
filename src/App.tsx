/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, GraduationCap, Youtube, Crown, Library, X, Plus, Trash2, ExternalLink, Folder, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DayStreakView } from './components/DayStreakView';

interface SavedLink {
  id: string;
  title: string;
  url: string;
  dateAdded: number;
}

interface LibraryCategory {
  id: string;
  name: string;
  links: SavedLink[];
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'library' | 'streak'>('library');
  
  const [categories, setCategories] = useState<LibraryCategory[]>([
    { id: 'default', name: 'General', links: [] }
  ]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('default');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('goodtube_libraries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setCategories(parsed);
          setActiveCategoryId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse libraries from local storage');
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('goodtube_libraries', JSON.stringify(categories));
  }, [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to YouTube search
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery.trim())}`, '_blank');
    }
  };

  const handleCoursesRedirect = () => {
    window.open('https://www.youtube.com/feed/courses_destination', '_blank');
  };

  const activeCategory = categories.find(c => c.id === activeCategoryId) || categories[0];

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim() || !activeCategory) return;

    let formattedUrl = newLinkUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newLink: SavedLink = {
      id: crypto.randomUUID(),
      title: newLinkTitle.trim(),
      url: formattedUrl,
      dateAdded: Date.now()
    };

    setCategories(categories.map(cat => 
      cat.id === activeCategory.id ? { ...cat, links: [newLink, ...cat.links] } : cat
    ));
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleDeleteLink = (linkId: string) => {
    setCategories(categories.map(cat => 
      cat.id === activeCategory.id ? { ...cat, links: cat.links.filter(l => l.id !== linkId) } : cat
    ));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCategory: LibraryCategory = {
      id: crypto.randomUUID(),
      name: newCategoryName.trim(),
      links: []
    };

    setCategories([...categories, newCategory]);
    setActiveCategoryId(newCategory.id);
    setNewCategoryName('');
    setIsCreatingCategory(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (categories.length === 1) return; // Don't delete the last category
    const newCategories = categories.filter(c => c.id !== categoryId);
    setCategories(newCategories);
    if (activeCategoryId === categoryId) {
      setActiveCategoryId(newCategories[0].id);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white font-sans selection:bg-red-500 selection:text-white overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-72 bg-[#121212] border-r border-[#222] flex flex-col h-full flex-shrink-0 z-20 shadow-2xl">
        
        {/* Header Logo */}
        <div 
          onClick={() => setCurrentView('library')} 
          className="p-6 border-b border-[#222] flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="bg-red-600 p-2 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.3)] group-hover:scale-105 transition-transform">
            <Youtube className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">The GoodTube</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          
          {/* Main Navigation */}
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-3">Navigation</h2>
            
            <button
              onClick={() => setCurrentView('library')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'library'
                  ? 'bg-red-600/10 text-red-500 font-semibold'
                  : 'text-gray-400 hover:bg-[#222] hover:text-gray-200'
              }`}
            >
              <Library className="w-4 h-4 text-red-500" />
              <span>Libraries</span>
            </button>

            <button
              onClick={() => setCurrentView('streak')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'streak'
                  ? 'bg-orange-500/10 text-orange-400 font-semibold'
                  : 'text-gray-400 hover:bg-[#222] hover:text-gray-200'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Day Streak</span>
            </button>
          </div>

          {/* Libraries Sub-list */}
          {currentView === 'library' && (
            <div className="flex flex-col gap-1 border-t border-[#222] pt-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-3">Your Folders</h2>
              
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setCurrentView('library');
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    activeCategoryId === cat.id && currentView === 'library'
                      ? 'bg-red-600/10 text-red-500' 
                      : 'text-gray-400 hover:bg-[#222] hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Folder className={`w-4 h-4 ${activeCategoryId === cat.id && currentView === 'library' ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeCategoryId === cat.id && currentView === 'library' ? 'bg-red-600/20 text-red-400' : 'bg-[#222] text-gray-500 group-hover:bg-[#333]'
                  }`}>
                    {cat.links.length}
                  </span>
                </button>
              ))}

              {isCreatingCategory ? (
                <form onSubmit={handleAddCategory} className="mt-2 px-1">
                  <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] rounded-lg p-1">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Library name..."
                      className="flex-1 bg-transparent border-none px-2 py-1.5 text-sm focus:outline-none text-white placeholder-gray-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!newCategoryName.trim()}
                      className="bg-[#333] hover:bg-[#444] text-white p-1.5 rounded-md transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCategory(false);
                        setNewCategoryName('');
                      }}
                      className="text-gray-500 hover:text-gray-300 p-1.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreatingCategory(true)}
                  className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-[#1a1a1a] hover:text-gray-300 transition-colors border border-dashed border-[#333] hover:border-[#555]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Library</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0a0a0a]">
        
        {/* Top Header / Search Bar */}
        <div className="p-6 border-b border-[#222] bg-[#0a0a0a]/80 backdrop-blur-xl z-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <form onSubmit={handleSearch} className="w-full relative group shadow-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YouTube..."
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded-full py-3 pl-12 pr-28 text-base focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-white placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-[#2a2a2a] hover:bg-[#333] disabled:opacity-50 disabled:hover:bg-[#2a2a2a] rounded-full font-medium transition-colors border border-[#333] text-sm text-gray-200"
              >
                Search
              </button>
            </form>

            {/* Quick Links Header */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              <button
                onClick={() => window.open('https://www.chess.com', '_blank')}
                className="flex items-center gap-2 bg-[#141414] hover:bg-[#222] px-4 py-2 rounded-xl font-medium transition-all border border-[#2a2a2a] hover:border-[#444] text-gray-300"
              >
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Play Chess</span>
              </button>
              <button
                onClick={handleCoursesRedirect}
                className="flex items-center gap-2 bg-[#141414] hover:bg-[#222] px-4 py-2 rounded-xl font-medium transition-all border border-[#2a2a2a] hover:border-[#444] text-gray-300"
              >
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Discover Courses</span>
              </button>
              <button
                onClick={() => setCurrentView('streak')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border ${
                  currentView === 'streak'
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-md shadow-orange-950/40'
                    : 'bg-[#141414] hover:bg-[#222] border-[#2a2a2a] hover:border-[#444] text-gray-300'
                }`}
              >
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Day Streak</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic View Content */}
        {currentView === 'streak' ? (
          <DayStreakView />
        ) : (
          /* Library Content View */
          <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
            <div className="max-w-4xl mx-auto">
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-white mb-1">{activeCategory?.name}</h2>
                  <p className="text-gray-500 text-sm">
                    {activeCategory?.links.length} {activeCategory?.links.length === 1 ? 'link' : 'links'} saved in this library
                  </p>
                </div>
                
                {categories.length > 1 && (
                  <button
                    onClick={() => handleDeleteCategory(activeCategory.id)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete Library</span>
                  </button>
                )}
              </div>

              {/* Add Link Form */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141414] border border-[#222] rounded-2xl p-5 mb-10 shadow-lg"
              >
                <form onSubmit={handleAddLink} className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="Title (e.g., React Tutorial)"
                    className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder-gray-500"
                    required
                  />
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="URL (https://...)"
                    className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder-gray-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-red-900/20"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Save Link</span>
                  </button>
                </form>
              </motion.div>

              {/* Links Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!activeCategory || activeCategory.links.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 bg-[#141414] border border-[#222] border-dashed rounded-2xl">
                    <Library className="w-12 h-12 opacity-20 mb-4" />
                    <p className="font-medium">No links saved yet</p>
                    <p className="text-sm mt-1 opacity-70">Add a link above to get started.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {activeCategory.links.map(link => (
                      <motion.div 
                        key={link.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#141414] border border-[#222] rounded-2xl p-5 flex items-start justify-between group hover:border-[#444] transition-all shadow-sm hover:shadow-xl hover:shadow-black/40 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-600/0 group-hover:bg-red-600/80 transition-colors" />
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="font-medium text-base truncate text-gray-100 mb-1.5">{link.title}</h4>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 truncate flex items-center gap-1.5 w-fit group/link"
                          >
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                            <span className="truncate">{link.url}</span>
                          </a>
                          <div className="text-xs text-gray-600 mt-3 font-medium">
                            Added {new Date(link.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                          title="Delete link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
