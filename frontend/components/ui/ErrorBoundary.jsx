import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-slate-800 font-body antialiased">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-rose-100 max-w-2xl w-full text-center space-y-6">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100/50 shadow-sm">
              <span className="material-symbols-outlined text-rose-500 text-4xl">error</span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-headline">Something went wrong</h1>
            <p className="text-slate-500 leading-relaxed font-medium">
              We encountered an unexpected error while rendering this page. The system administrator has been notified.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 text-left bg-slate-50 p-6 rounded-2xl overflow-auto border border-slate-200">
                <p className="font-mono text-sm text-rose-600 font-bold mb-2 break-words">
                  {this.state.error.toString()}
                </p>
                <pre className="font-mono text-[10px] text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <button 
              onClick={() => window.location.assign('/')}
              className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              Return to Catalog
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
