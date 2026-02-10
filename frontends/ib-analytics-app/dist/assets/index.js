import { importShared } from './__federation_fn_import.js';
import App, { j as jsx, a as jsxs, F as Fragment, u as useAppDispatch, b as useAppSelector, s as selectErrorMessage, c as selectErrorType, d as clearError, e as store } from './__federation_expose_App.js';
import { r as reactDomExports } from './index3.js';

const style = '';

const {createContext,Component,createElement,useContext,useState: useState$1,useMemo,forwardRef} = await importShared('react');


const ErrorBoundaryContext = createContext(null);

const initialState = {
  didCatch: false,
  error: null
};
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.state = initialState;
  }
  static getDerivedStateFromError(error) {
    return {
      didCatch: true,
      error
    };
  }
  resetErrorBoundary() {
    const {
      error
    } = this.state;
    if (error !== null) {
      var _this$props$onReset, _this$props;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      (_this$props$onReset = (_this$props = this.props).onReset) === null || _this$props$onReset === void 0 ? void 0 : _this$props$onReset.call(_this$props, {
        args,
        reason: "imperative-api"
      });
      this.setState(initialState);
    }
  }
  componentDidCatch(error, info) {
    var _this$props$onError, _this$props2;
    (_this$props$onError = (_this$props2 = this.props).onError) === null || _this$props$onError === void 0 ? void 0 : _this$props$onError.call(_this$props2, error, info);
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      didCatch
    } = this.state;
    const {
      resetKeys
    } = this.props;

    // There's an edge case where if the thing that triggered the error happens to *also* be in the resetKeys array,
    // we'd end up resetting the error boundary immediately.
    // This would likely trigger a second error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call of cDU after the error is set.

    if (didCatch && prevState.error !== null && hasArrayChanged(prevProps.resetKeys, resetKeys)) {
      var _this$props$onReset2, _this$props3;
      (_this$props$onReset2 = (_this$props3 = this.props).onReset) === null || _this$props$onReset2 === void 0 ? void 0 : _this$props$onReset2.call(_this$props3, {
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: "keys"
      });
      this.setState(initialState);
    }
  }
  render() {
    const {
      children,
      fallbackRender,
      FallbackComponent,
      fallback
    } = this.props;
    const {
      didCatch,
      error
    } = this.state;
    let childToRender = children;
    if (didCatch) {
      const props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary
      };
      if (typeof fallbackRender === "function") {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = createElement(FallbackComponent, props);
      } else if (fallback !== undefined) {
        childToRender = fallback;
      } else {
        throw error;
      }
    }
    return createElement(ErrorBoundaryContext.Provider, {
      value: {
        didCatch,
        error,
        resetErrorBoundary: this.resetErrorBoundary
      }
    }, childToRender);
  }
}
function hasArrayChanged() {
  let a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));
}

var createRoot;

var m = reactDomExports;
{
  createRoot = m.createRoot;
  m.hydrateRoot;
}

const ErrorHandler$1 = '';

const {useState} = await importShared('react');
function ErrorHandler({ error, resetErrorBoundary }) {
  const [showDetails, setShowDetails] = useState(false);
  const handleClickReset = () => {
    try {
      resetErrorBoundary();
    } catch (err) {
      console.error("Error resetting error boundary:", err);
    }
  };
  return jsx("div", { className: "error-handler-container", "data-testid": "ErrorHandler", children: jsxs("div", { className: "error-handler-card", children: [jsxs("svg", { className: "error-handler-icon", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsx("circle", { cx: "12", cy: "12", r: "10" }), jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })] }), jsx("h2", { className: "error-handler-title", children: "Oops! Something went wrong" }), jsx("p", { className: "error-handler-message", children: "We encountered an unexpected error. Please try again or contact support if the problem persists." }), jsxs("div", { className: "error-handler-details", children: [jsxs("div", { className: "error-handler-details-title", onClick: () => setShowDetails(!showDetails), children: [jsx("span", { children: "Error Details" }), jsx("span", { children: showDetails ? "▼" : "▶" })] }), showDetails && jsxs("div", { className: "error-handler-details-content", children: [error.message, error.stack && jsxs(Fragment, { children: ["\n\n", error.stack] })] })] }), jsxs("div", { className: "error-handler-actions", children: [jsx("button", { className: "btn btn-primary", onClick: handleClickReset, children: "Try Again" }), jsx("button", { className: "btn btn-secondary", onClick: () => window.location.href = "/", children: "Go to Home" })] })] }) });
}

const ToastNotifications$1 = '';

const {useEffect} = await importShared('react');
const ToastNotifications = () => {
  const dispatch = useAppDispatch();
  const errorMessage = useAppSelector(selectErrorMessage);
  const errorType = useAppSelector(selectErrorType);
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5e3);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, dispatch]);
  const handleClose = () => {
    dispatch(clearError());
  };
  const getIcon = () => {
    switch (errorType) {
      case "success":
        return jsxs("svg", { className: "toast-icon", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }), jsx("polyline", { points: "22 4 12 14.01 9 11.01" })] });
      case "error":
        return jsxs("svg", { className: "toast-icon", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsx("circle", { cx: "12", cy: "12", r: "10" }), jsx("line", { x1: "15", y1: "9", x2: "9", y2: "15" }), jsx("line", { x1: "9", y1: "9", x2: "15", y2: "15" })] });
      case "warning":
        return jsxs("svg", { className: "toast-icon", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), jsx("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), jsx("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" })] });
      default:
        return jsxs("svg", { className: "toast-icon", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsx("circle", { cx: "12", cy: "12", r: "10" }), jsx("line", { x1: "12", y1: "16", x2: "12", y2: "12" }), jsx("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })] });
    }
  };
  if (!errorMessage)
    return null;
  return jsx("div", { className: "toast-notifications-container", children: jsxs("div", { className: `toast-notification toast-${errorType || "info"}`, children: [getIcon(), jsx("div", { className: "toast-content", children: jsx("p", { className: "toast-message", children: errorMessage }) }), jsx("button", { className: "toast-close", onClick: handleClose, "aria-label": "Close notification", children: jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }), jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })] }) }), jsx("div", { className: "toast-progress" })] }) });
};

const {Provider} = await importShared('react-redux');
const container = document.getElementById("root");
const root = createRoot(container);
root.render(jsx(Provider, { store, children: jsxs(ErrorBoundary, { FallbackComponent: ErrorHandler, children: [jsx(ToastNotifications, {}), jsx(App, {})] }) }));
