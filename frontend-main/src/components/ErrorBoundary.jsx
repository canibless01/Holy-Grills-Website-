import React from 'react';
import { Flame, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary — catches render-time crashes so a broken component
 * shows a friendly reload prompt instead of a permanent blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cocoa-50 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-2xl flame-gradient flex items-center justify-center shadow-xl mb-4">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-xl text-cocoa-800 mb-1">Something went wrong</h1>
          <p className="text-sm text-cocoa-400 mb-6 max-w-xs">
            The grill hit a snag loading this page. A quick reload usually fixes it.
          </p>
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full flame-gradient text-white font-bold text-sm shadow-md"
          >
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}