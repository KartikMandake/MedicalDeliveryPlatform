import { Link } from 'react-router-dom';

export default function AgentNavBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 h-16 shadow-sm border-b border-slate-200/50">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-extrabold text-green-800 tracking-tight font-headline">MediLink Dispatch</Link>
        <div className="hidden md:flex items-center bg-[#f2f4f7] rounded-xl px-4 py-2 w-96 gap-3 focus-within:ring-2 focus-within:ring-[#0d631b]/20 transition-all">
          <span className="material-symbols-outlined text-slate-400">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400" placeholder="Search deliveries, medical facilities..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-green-50 rounded-full transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-green-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">emergency</span>
        </button>
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold font-headline text-slate-900">Agent ID: 4829</p>
            <p className="text-[10px] font-medium text-[#0d631b] uppercase tracking-wider">Active Duty</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-[#f2f4f7] overflow-hidden border-2 border-[#a3f69c]">
            <img className="w-full h-full object-cover" alt="Agent profile picture portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkhr8MopUheLCpmlZpzkhjLOqO0UaXbCN1qIhR4-hcPERtq8NTCYK1cvCTNocQjPJhnEa1eRNDkS9bH2rtJCkHxJaGqZq9MTvLjgE30s1-8IPKtOs74LzfBgFLlf7ug_qDUa9twqMCzqDxWG6Nfnio9aQljoL7TAbm2bchnF8JEJWoIhaG9aAX5CzL1dkjiqzjVZN-LjOWTJsyO9wSpBF5IZMfIVMw90za-OX9qQKclmjg5QzcG2w_1pLBuEMmiRgLUlWngAB9vdXV"/>
          </button>
        </div>
      </div>
    </header>
  );
}
