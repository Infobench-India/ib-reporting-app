import React from "react";
interface ErrorState {
    loading: boolean;
    error: any | null;
}
export declare class Error extends React.Component<any, ErrorState> {
    constructor(props: any);
    componentDidMount(): Promise<void>;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};
