import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from './redux/features/counter/counterSlice';
import breakdownsReducer from './redux/features/slices/breakdownSlice';
import configGridsReducer from './redux/features/slices/configGridSlice';
import configReducer from './redux/features/slices/configSlice'
import eventsReducer from './redux/features/slices/eventSlice';
import partScansReducer from './redux/features/slices/partScanSlice';
import resultsReducer from './redux/features/slices/resultSlice';
import skudatasReducer from './redux/features/slices/skuSlice';
import stationsReducer from './redux/features/slices/stationSlice';
import toolsReducer from './redux/features/slices/toolsSlice';
import systemConfigsReducer from './redux/features/slices/systemConfigsSlice';
import machineConfigReducer from './redux/features/slices/machineConfigSlice';
import scheduleConfigReducer from './redux/features/slices/scheduleSlice';
import shiftReducer from './redux/features/slices/shiftSlice';
import authReducer from './redux/auth/authSlice';
import errorReducer from './redux/errorSlice';
import stageConfigsReducer from './redux/features/slices/configSlice';
import dashboardReducer from './redux/features/slices/dashboardSlice';
import reportConfigReducer from './redux/features/slices/reportConfigSlice';
import sqlReportReducer from './redux/features/slices/sqlReportSlice';
import reportHistoryReducer from './redux/features/slices/reportHistorySlice';
import sqlSchedulerReducer from './redux/features/slices/sqlSchedulerSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';


const hostStore = (window as any).__HOST_STORE__;
const injectReducer = (window as any).__INJECT_REDUCER__;
let store = hostStore;
if (hostStore === undefined) {
  store = configureStore({
    reducer: {
      counter: counterReducer,
      breakdownsReducer: breakdownsReducer,
      configGridsReducer: configGridsReducer,
      configReducer: configReducer,
      stageConfigsReducer: stageConfigsReducer,
      eventsReducer: eventsReducer,
      partScansReducer: partScansReducer,
      resultsReducer: resultsReducer,
      skudatasReducer: skudatasReducer,
      stationsReducer: stationsReducer,
      toolsReducer: toolsReducer,
      authReducer: authReducer,
      error: errorReducer,
      systemConfigsReducer: systemConfigsReducer,
      machineConfigReducer: machineConfigReducer,
      scheduleConfigReducer: scheduleConfigReducer,
      shiftReducer: shiftReducer,
      dashboardReducer: dashboardReducer,
      reportConfigReducer: reportConfigReducer,
      sqlReportReducer: sqlReportReducer,
      reportHistoryReducer: reportHistoryReducer,
      sqlSchedulerReducer: sqlSchedulerReducer,
    },
  });
}
else {
  injectReducer("counter", counterReducer);
  injectReducer("breakdownsReducer", breakdownsReducer);
  injectReducer("configReducer", configReducer);
  injectReducer("configGridsReducer", configGridsReducer);
  injectReducer("stageConfigsReducer", stageConfigsReducer);
  injectReducer("eventsReducer", eventsReducer);
  injectReducer("partScansReducer", partScansReducer);
  injectReducer("resultsReducer", resultsReducer);
  injectReducer("skudatasReducer", skudatasReducer);
  injectReducer("stationsReducer", stationsReducer);
  injectReducer("toolsReducer", toolsReducer);
  injectReducer("authReducer", authReducer);
  injectReducer("error", errorReducer);
  injectReducer("systemConfigsReducer", systemConfigsReducer);
  injectReducer("machineConfigReducer", machineConfigReducer);
  injectReducer("scheduleConfigReducer", scheduleConfigReducer);
  injectReducer("shiftReducer", shiftReducer);
  injectReducer("dashboardReducer", dashboardReducer);
  injectReducer("reportConfigReducer", reportConfigReducer);
  injectReducer("sqlReportReducer", sqlReportReducer);
  injectReducer("reportHistoryReducer", reportHistoryReducer);
  injectReducer("sqlSchedulerReducer", sqlSchedulerReducer);

  store = hostStore;
}
export type AppDispatch = typeof hostStore extends undefined ? typeof store.dispatch : typeof hostStore.dispatch;
export type RootState = ReturnType<typeof hostStore extends undefined ? typeof store.getState : typeof hostStore.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export { store };
