import { type ConnectedProps } from "react-redux";
import '@fortawesome/fontawesome-free/css/all.min.css';
declare const connector: import("react-redux").InferableComponentEnhancerWithProps<{
    data: any;
    error: any;
} & {
    getAllProp: (arg: any) => any;
    createProp: (arg: any) => any;
    updateProp: (arg: any) => any;
    removeProp: (arg: any) => any;
}, {}>;
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux;
declare function ShiftList({ data, error, getAllProp, createProp, updateProp, removeProp }: Props): import("react/jsx-runtime").JSX.Element;
declare const _default: import("react-redux").ConnectedComponent<typeof ShiftList, {
    context?: import("react").Context<import("react-redux").ReactReduxContextValue<any, import("redux").UnknownAction> | null> | undefined;
    store?: import("redux").Store | undefined;
}>;
export default _default;
