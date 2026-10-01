"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

interface Props {
  children: React.ReactNode;
  /** Optional fallback UI override */
  fallback?: React.ReactNode;
}

/**
 * Error boundary for the 3D office canvas and WebXR system.
 * Prevents Three.js / WebXR failures from crashing the entire page.
 * Preserves the HTML room directory fallback per Phase I requirements.
 */
export class OfficeErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message ?? "An unexpected 3D rendering error occurred.",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for debugging without crashing
    console.error("[OfficeErrorBoundary] 3D scene error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/60 p-10 text-center gap-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertCircle className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-rose-900">
              3D Workspace Unavailable
            </h3>
            <p className="mt-1 text-xs text-rose-700 leading-relaxed max-w-sm">
              The 3D office view could not be initialized.{" "}
              {this.state.errorMessage && (
                <span className="font-mono">{this.state.errorMessage}</span>
              )}{" "}
              Use the room directory below to navigate spaces.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Retry 3D View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
