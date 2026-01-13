import React from "react";
import { toast } from "@/hooks/use-toast";

type Props = {
  children: React.ReactNode;
  onError?: (err: Error) => void;
};

type State = {
  hasError: boolean;
  error?: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught an error:", error, info);
    try {
      if (this.props.onError) this.props.onError(error);
      else toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    } catch (e) {
      // swallow
    }
  }

  render() {
    if (this.state.hasError) {
      // Render nothing — the parent onError handler should handle closing UI or showing messages.
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
