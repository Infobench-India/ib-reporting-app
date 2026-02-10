import React from 'react';
import { ConnectedProps } from 'react-redux';
declare const connector: import("react-redux").InferableComponentEnhancerWithProps<{
    count: any;
    status: any;
} & {
    decrement: () => any;
    increment: () => any;
    incrementByAmount: (arg: number) => any;
    incrementAsync: (arg: number) => any;
    incrementIfOdd: (arg: number) => any;
}, {}>;
type PropsFromRedux = ConnectedProps<typeof connector>;
type CounterProps = PropsFromRedux;
declare function Counter({ status, count, decrement, increment, incrementByAmount, incrementAsync, incrementIfOdd }: CounterProps): import("react/jsx-runtime").JSX.Element;
declare const _default: import("react-redux").ConnectedComponent<typeof Counter, {
    context?: React.Context<import("react-redux").ReactReduxContextValue<any, import("redux").UnknownAction> | null> | undefined;
    store?: import("redux").Store | undefined;
}>;
export default _default;
