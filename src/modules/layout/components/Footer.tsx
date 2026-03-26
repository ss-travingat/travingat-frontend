export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800">
      <div className="px-5 py-12 md:px-12 md:py-14 xl:px-24 xl:py-16 xl:flex xl:justify-between xl:items-start">
        {/* Left side: Logo, contact, social */}
        <div>
          {/* Logo & Contact */}
          <div className="mb-10 xl:mb-8">
            <h2 className="text-[32px] font-bold text-white mb-6">travingat</h2>
            <div className="space-y-2">
              <a href="mailto:connect@travingat.com" className="block text-[14px] text-gray-400 hover:text-white transition-colors">
                connect@travingat.com
              </a>
              <a href="tel:+1826725005" className="block text-[14px] text-gray-400 hover:text-white transition-colors">
                +1 826 725 005
              </a>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-6 mb-12 xl:mb-0">
          {/* Facebook */}
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <svg width="13" height="23" viewBox="0 0 13 23" fill="currentColor">
              <path d="M8.5 13H11.5L13 7H8.5V4.5C8.5 3.12 8.5 2 11 2H13V0.14C12.58 0.097 10.94 0 9.22 0C5.64 0 3.5 1.82 3.5 5.16V7H0V13H3.5V23H8.5V13Z" />
            </svg>
          </a>
          {/* Instagram */}
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="18" cy="6" r="1" fill="currentColor" />
            </svg>
          </a>
          {/* YouTube */}
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.507a2.786 2.786 0 00-.766-1.27 3.05 3.05 0 00-1.338-.742C19.518 4 11.994 4 11.994 4a76.624 76.624 0 00-9.39.47 3.16 3.16 0 00-1.338.76c-.37.356-.638.795-.766 1.277A29.09 29.09 0 000 12a29.09 29.09 0 00.5 5.493 2.786 2.786 0 00.766 1.27 3.05 3.05 0 001.338.742c1.883.494 9.39.494 9.39.494a76.8 76.8 0 009.402-.494 3.05 3.05 0 001.338-.742 2.786 2.786 0 00.766-1.27A29.09 29.09 0 0024 12a29.09 29.09 0 00-.5-5.493zM9.602 15.424V8.577L15.862 12l-6.26 3.424z" />
            </svg>
          </a>
          {/* TikTok */}
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <svg width="20" height="23" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 00-.81-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.51a8.27 8.27 0 004.76 1.49V6.55a4.83 4.83 0 01-1-.14z" />
            </svg>
          </a>
          {/* X (Twitter) */}
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <svg width="23" height="21" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
        </div>

        {/* Right side: Nav links + copyright */}
        <div>
        {/* Navigation links */}
        <div className="flex gap-16 xl:gap-[100px] mb-12">
          <div className="space-y-3">
            <a href="#" className="block text-[14px] text-gray-400 hover:text-white transition-colors">About us</a>
            <a href="#" className="block text-[14px] text-gray-400 hover:text-white transition-colors">Featured profiles</a>
            <a href="#" className="block text-[14px] text-gray-400 hover:text-white transition-colors">Blog</a>
            <a href="#" className="block text-[14px] text-gray-400 hover:text-white transition-colors">Join waiting list</a>
          </div>
          <div className="space-y-3">
            <a href="#" className="block text-[14px] text-gray-400 hover:text-white transition-colors">Contact us</a>
            <a href="#" className="block text-[14px] text-gray-400 hover:text-white transition-colors">Careers</a>
            <a href="#" className="block text-[14px] text-gray-400 hover:text-white transition-colors">Showreel</a>
            <a href="#" className="block text-[14px] text-gray-400 hover:text-white transition-colors">Invest</a>
          </div>
        </div>

        {/* Copyright */}
        <div>
          <p className="text-[12px] text-gray-500 mb-2">©Copyrights 2025 travingat.</p>
          <div className="flex gap-4">
            <a href="#" className="text-[12px] text-gray-500 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-[12px] text-gray-500 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-[12px] text-gray-500 hover:text-white transition-colors">Policy</a>
          </div>
        </div>
        </div>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-4 pt-2">
        <div className="w-[139px] h-[5px] bg-gray-600 rounded-full" />
      </div>
    </footer>
  );
}
