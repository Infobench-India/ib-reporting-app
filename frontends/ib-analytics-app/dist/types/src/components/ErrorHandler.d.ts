import './ErrorHandler.scss';
interface Props {
    error: Error;
    resetErrorBoundary: () => void;
}
export default function ErrorHandler({ error, resetErrorBoundary }: Props): import("react/jsx-runtime").JSX.Element;
export {};
