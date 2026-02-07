import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F4F4F4] flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-[#8B95A1]" />
          </div>
          <h1 className="text-xl font-bold text-[#191F28] mb-2">앗, 문제가 발생했어요</h1>
          <p className="text-sm text-[#8B95A1] mb-8">잠시 후 다시 시도해주세요.</p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 bg-primary text-white rounded-[12px] font-bold text-sm hover:brightness-105 transition-all"
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
