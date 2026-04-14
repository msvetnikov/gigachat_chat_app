import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch() {
        // Intentionally empty: errors are handled by the fallback UI.
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div role="alert">Произошла ошибка при отображении.</div>
            );
        }

        return this.props.children;
    }
}
