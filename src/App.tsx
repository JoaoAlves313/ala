/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, GraduationCap, Youtube } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-red-500 selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl flex flex-col items-center gap-8"
      >
        
        {/* Logo / Header */}
        <div className="flex items-center gap-3 select-none">
          <div className="bg-red-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <Youtube className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">The GoodTube</h1>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for videos, channels, or topics..."
            className="w-full bg-[#121212] border border-[#303030] rounded-full py-4 pl-12 pr-24 text-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-inner"
            autoFocus
          />
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="absolute right-1 top-1 bottom-1 px-6 bg-[#222222] hover:bg-[#303030] disabled:opacity-50 disabled:hover:bg-[#222222] rounded-full font-medium transition-colors border border-[#303030]"
          >
            Search
          </button>
        </form>

        {/* Quick Links / Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap gap-4 mt-4 justify-center"
        >
          <button
            onClick={handleCoursesRedirect}
            className="flex items-center gap-2 bg-[#222222] hover:bg-[#303030] px-5 py-3 rounded-xl font-medium transition-all border border-[#303030] hover:border-gray-500"
          >
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span>Discover Courses</span>
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
