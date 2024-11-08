export interface FunnelProps<T> {
    context: T;
    history: {
        push: (step: string, context: T) => void;
        replace: (step: string, context: T) => void;
    };
}