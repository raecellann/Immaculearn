import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-4">There was an error loading this component.</p>
              <details className="text-left text-xs text-gray-500 mb-4">
                <summary>Error details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                  {this.state.error && this.state.error.toString()}
                </pre>
              </details>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
