"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  tags: string[];
  readTime: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlogs(data);
      })
      .catch(() => {});
  }, []);

  if (blogs.length === 0) return null;

  const featured = blogs[0];
  const rest = blogs.slice(1, 4);

  return (
    <section className="px-5 py-16 xl:px-24 xl:py-24 bg-[#0a0a0a]">
      {/* Section header */}
      <div className="flex items-end justify-between mb-10 xl:mb-14 max-w-[1200px] mx-auto">
        <div>
          <p className="text-[#5A45F9] text-sm font-semibold tracking-widest uppercase mb-2">
            Blog
          </p>
          <h2 className="text-[28px] xl:text-[44px] font-bold text-white tracking-[-1px] leading-tight">
            Stories & Insights
          </h2>
        </div>
        <Link
          href="/blog"
          className="text-white/50 hover:text-white text-sm font-medium transition-colors hidden xl:block"
        >
          View all →
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto">
        {/* Featured post — large card */}
        <Link href={`/blog/${featured.slug}`} className="block group mb-8">
          <div className="relative rounded-2xl overflow-hidden bg-[#141414] border border-white/5 xl:flex xl:h-[400px]">
            {/* Cover image */}
            <div className="relative h-[220px] xl:h-full xl:w-[55%] overflow-hidden">
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent xl:bg-gradient-to-r xl:from-transparent xl:to-[#141414]" />
            </div>

            {/* Content */}
            <div className="p-6 xl:p-10 xl:w-[45%] flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                {featured.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold uppercase tracking-wider text-[#5A45F9] bg-[#5A45F9]/10 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-[22px] xl:text-[28px] font-bold text-white leading-tight tracking-[-0.5px] mb-3 group-hover:text-[#5A45F9] transition-colors" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                {featured.title}
              </h3>
              <p className="text-white/50 text-[15px] leading-relaxed mb-6 line-clamp-3" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <span className="font-medium text-white/60">
                  {featured.author}
                </span>
                <span>·</span>
                <span>{formatDate(featured.publishedAt)}</span>
                <span>·</span>
                <span>{featured.readTime} min read</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Rest — grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {rest.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group block"
              >
                <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors">
                  {/* Cover */}
                  <div className="relative h-[180px] overflow-hidden">
                    <Image
                      src={blog.coverImage}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      {blog.tags.slice(0, 1).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold uppercase tracking-wider text-[#5A45F9] bg-[#5A45F9]/10 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-[17px] font-bold text-white leading-snug tracking-[-0.3px] mb-2 group-hover:text-[#5A45F9] transition-colors line-clamp-2" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                      {blog.title}
                    </h3>
                    <p className="text-white/40 text-[13px] leading-relaxed line-clamp-2 mb-4" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/30">
                      <span>{formatDate(blog.publishedAt)}</span>
                      <span>·</span>
                      <span>{blog.readTime} min read</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile view all */}
        <div className="mt-8 text-center xl:hidden">
          <Link
            href="/blog"
            className="text-[#5A45F9] text-sm font-semibold hover:underline"
          >
            View all posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
