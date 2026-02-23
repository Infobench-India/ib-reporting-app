import React, { useState } from 'react';

import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  incrementIfOdd,
  selectCount,
} from '../../redux/features/counter/counterSlice';
import { RootState } from '../../store';
import { ConnectedProps, connect } from 'react-redux';
import TopNavBars from '../../components/navBars/topNavBars';
import Loader from '../../components/Loader';
import { navItems } from '../../constants/commonConstants';

// Map state to props
const mapStateToProps = (state: RootState) => ({
  count: state.counter.value,
  status: state.counter.status
});

const mapDispatchToProps = (dispatch: (arg0: any) => any) => ({
  decrement: () => dispatch(decrement()),
  increment: () => dispatch(increment()),
  incrementByAmount: (arg: number) => dispatch(incrementByAmount(arg)),
  incrementAsync: (arg: number) => dispatch(incrementAsync(arg)),
  incrementIfOdd: (arg: number) => dispatch(incrementIfOdd(arg))

});
// Combined props
const connector = connect(mapStateToProps, mapDispatchToProps);

// Props type
type PropsFromRedux = ConnectedProps<typeof connector>;

// Component props type
type CounterProps = PropsFromRedux;

// Counter component
function Counter({ status, count, decrement, increment, incrementByAmount, incrementAsync, incrementIfOdd }: CounterProps) {
  const [incrementAmount, setIncrementAmount] = useState<string>('2');

  const handleIncrementByAmount = () => {
    const amount = Number(incrementAmount) || 0;
    incrementByAmount(amount);
  };

  return (
    <div className="container-fluid">
      <TopNavBars navItems={navItems}></TopNavBars>
      <div className="row justify-content-center">
        <div className="col-md-auto">
          <button
            className="btn btn-primary mb-2"
            aria-label="Decrement value"
            onClick={decrement}
          >
            -
          </button>
        </div>
        <div className="col-md-auto">
          {status === "loading" ? (
            <Loader />
          ) : (
            <span>{count}</span>
          )}
        </div>
        <div className="col-md-auto">
          <button
            className="btn btn-primary mb-2"
            aria-label="Increment value"
            onClick={increment}
          >
            +
          </button>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-auto">
          <input
            type="number"
            className="form-control mb-2"
            aria-label="Set increment amount"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
          />
        </div>
        <div className="col-md-auto">
          <button
            className="btn btn-primary mb-2"
            onClick={handleIncrementByAmount}
          >
            Add Amount
          </button>
        </div>
        <div className="col-md-auto">
          <button
            className="btn btn-primary mb-2"
            onClick={() => incrementAsync(Number(incrementAmount))}
          >
            Add Async
          </button>
        </div>
        <div className="col-md-auto">
          <button
            className="btn btn-primary mb-2"
            onClick={() => incrementIfOdd(Number(incrementAmount))}
          >
            Add If Odd
          </button>
        </div>
      </div>
    </div>

  );
}

// Connect the component to Redux
export default connector(Counter);

