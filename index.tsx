
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fixed Error: "Property 'state' and 'props' does not exist on type 'ErrorBoundary'"
// Explicitly importing Component and using property initializers to ensure TypeScript correctly recognizes inherited properties.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Using property initializer for state to ensure it is correctly typed and recognized by the compiler
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    // Fixed: state is now recognized as inherited from Component
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-8 rounded-xl border-2 border-red-200 shadow-xl max-w-lg w-full">
            <h1 className="text-2xl font-black text-red-600 mb-4">¡Ups! Algo salió mal.</h1>
            <p className="text-gray-700 mb-4 font-medium">La aplicación ha encontrado un error crítico y no puede mostrarse.</p>
            <div className="bg-gray-900 text-white p-4 rounded-lg text-xs font-mono overflow-auto mb-6">
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    // Fixed: props is now recognized as inherited from Component
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
