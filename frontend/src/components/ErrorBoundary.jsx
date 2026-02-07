import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error in application:", error, errorInfo);
    }

    handleReset = () => {
        // Clear localStorage in case corrupt data caused the crash
        // But keep essential session if possible? Usually, crashes are due to state errors.
        // Let's try just a refresh first, if it persists, we can clear storage.
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-3xl font-black font-urbanist text-gray-900 tracking-tighter mb-4">
                            Something went wrong
                        </h1>

                        <p className="text-gray-500 mb-8 leading-relaxed">
                            The application encountered an unexpected error and had to stop. Don't worry, your data is safe.
                        </p>

                        <button
                            onClick={this.handleReset}
                            className="w-full bg-black text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Refresh Application
                        </button>

                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                            className="mt-6 text-sm text-gray-400 font-medium hover:text-gray-600 underline underline-offset-4"
                        >
                            Clear Session & Logout
                        </button>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 p-4 bg-gray-50 rounded-2xl text-left overflow-auto max-h-40">
                                <p className="text-[10px] font-mono text-red-500 break-all">
                                    {this.state.error?.toString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
