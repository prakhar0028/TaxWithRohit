import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ArrowRight, 
  Calendar, 
  User, 
  Sparkles, 
  Tag,
  ChevronRight
} from 'lucide-react';
import { useTax } from '../../context/TaxContext';
import { SEED_BLOGS } from '../../config/seedData';
import { BlogPost } from '../../types';

export const BlogsView: React.FC = () => {
  const { selectedBlogSlug, setSelectedBlogSlug } = useTax();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'BUDGET_2024', 'ITR_FILING', 'CAPITAL_GAINS', 'GST_COMPLIANCE'];

  const filteredBlogs = SEED_BLOGS.filter((b) => {
    const matchesCat = selectedCategory === 'ALL' || b.category === selectedCategory;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedPost = SEED_BLOGS.find((b) => b.slug === selectedBlogSlug);

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
        <button
          onClick={() => setSelectedBlogSlug(null)}
          className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to All Articles</span>
        </button>

        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full">
              {selectedPost.category.replace('_', ' ')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {selectedPost.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <strong className="text-slate-700">{selectedPost.author.name}</strong> ({selectedPost.author.role})
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedPost.publishedDate}</span>
              </span>
            </div>
          </div>

          <div className="prose text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {selectedPost.content}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-[#07383D] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-300">
            Knowledge Hub & Insights
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Tax Guides & Budget Updates
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            In-depth guides on Union Budget revisions, Section 80C optimization, capital gains rates, and notice resolution written by Chartered Accountants.
          </p>
        </div>

        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tax guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedBlogSlug(post.slug)}
            className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-teal-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">
                {post.category.replace('_', ' ')}
              </span>

              <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-700 transition-colors leading-snug">
                {post.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{post.publishedDate}</span>
              <span className="font-bold text-teal-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Read Full Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
