import { useState, useEffect, useMemo } from "react";
import EventAPIService from "../../redux/features/apis/EventAPI";
import { useAppDispatch, type RootState } from "../../store";
import { connect, type ConnectedProps } from "react-redux";
import GlobalSearch from "../../common/customeTable/globalTableSearch";
import PaginationComponent from "../../common/customeTable/pagination";
import type { TableColumn } from "../../common/customeTable/nestedTable";
import NestedTable from "../../common/customeTable/nestedTable";
import '@fortawesome/fontawesome-free/css/all.min.css';
import DatePicker from "react-datepicker";
import { formatDateForAPI } from '../../util/dateHelpers';
import { setError } from "../../redux/errorSlice";
import Excel from "exceljs";
import { saveAs } from "file-saver";
interface IEVENT {
  shift: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  lineID: string;
  machineID: string;    
  machineName: string;
  eventStatus: string;
  eventCode: string;
  eventDuration: string;
  eventStartDate: any;
  eventEndDate: any;
  createdAt: any;
  updatedAt: any;
}

const mapStateToProps = (state: RootState) => ({
  data: state.eventsReducer.data,
  error: state.eventsReducer.error
});

const mapDispatchToProps = (dispatch: (arg0: any) => any) => ({
  getAllProp: (arg: any) => dispatch(EventAPIService.getAll(arg)),
  searchProp: (arg: any) => dispatch(EventAPIService.search(arg)),
});
// Combined props
const connector = connect(mapStateToProps, mapDispatchToProps);

// Props type
type PropsFromRedux = ConnectedProps<typeof connector>;

// Component props type
type Props = PropsFromRedux;
function EventsList({ data, error, getAllProp, searchProp }: Props) {

  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({
    key: "createdAt",
    direction: 'asc',
  });
  const initialDateFrom = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  })();
  const [globalFilteredData, setGlobalFilteredData] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dateFrom, setDateFrom] = useState<Date | null>(initialDateFrom);
  const [dateTo, setDateTo] = useState<Date | null>(new Date());
  const [isDownloading, setIsDownloading] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentItemsToDelete, setCurrentItemsToDelete] = useState<any>();

  const limit = 50;

  const toggleRow = (rowId: string | number) => {
    setExpandedRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };
  const handleEdit = (row: IEVENT) => {
    setEditRow(row);
  };
  

  const sortedData = useMemo(() => {
    let sortableData: IEVENT[] = [];
    if (data?.docs) {
      sortableData = [...data.docs];
    }
    if (sortConfig?.key !== null) {
      sortableData?.sort((a, b) => {
        if (a[sortConfig.key as keyof IEVENT] < b[sortConfig.key as keyof IEVENT]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof IEVENT] > b[sortConfig.key as keyof IEVENT]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);
  const dispatch = useAppDispatch();

  // const saveExcel = async () => {
  //     setIsDownloading(true);
  //     try {
  //       const workbook = new Excel.Workbook();
  //       const worksheet = workbook.addWorksheet("Results");
  
  //       // Define columns for Excel
  //       worksheet.columns = [
  //         { header: "LineID", key: "lineID", width: 15 },
  //         { header: "MachineID", key: "machineID", width: 15 },
  //         { header: "MachineName", key: "machineName", width: 15 },
  //         { header: "EventCode", key: "eventCode", width: 15 },
  //         { header: "EventStatus", key: "eventStatus", width: 15 },
  //         { header: "EventDuration", key: "eventDuration", width: 15 },
  //         { header: "Shift", key: "shift", width: 10 },
  //         { header: "ShiftName", key: "shiftName", width: 15 },
  //         { header: "StartTime", key: "startTime", width: 20 },
  //         { header: "EndTime", key: "endTime", width: 20 },
  //         { header: ""}
  //         { header: "Created At", key: "createdAt", width: 20 },
  //         { header: "Updated At", key: "updatedAt", width: 20 }
  //       ];
  
  //       // Add data rows
  //       data?.docs?.forEach((item: IEVENT) => {
  //         worksheet.addRow({
  //           id: item.id,
  //           userId: item.userId,
  //           userTraits: item.userTraits,
  //           model: item.model,
  //           action: item.action,
  //           createdAt: new Date(item.createdAt).toLocaleString(),
  //           updatedAt: new Date(item.updatedAt).toLocaleString()
  //         });
  //       });
  
  //       // Style header row
  //       worksheet.getRow(1).eachCell((cell) => {
  //         cell.font = { bold: true };
  //         cell.fill = {
  //           type: 'pattern',
  //           pattern: 'solid',
  //           fgColor: { argb: 'FFD3D3D3' }
  //         };
  //         cell.border = {
  //           top: { style: 'thin' },
  //           left: { style: 'thin' },
  //           bottom: { style: 'thin' },
  //           right: { style: 'thin' }
  //         };
  //       });
  
  //       // Generate Excel file
  //       const buffer = await workbook.xlsx.writeBuffer();
  //       saveAs(new Blob([buffer]), `results_${new Date().toISOString().split('T')[0]}.xlsx`);
  //     } catch (error) {
  //       console.error("Download failed:", error);
  //     } finally {
  //       setIsDownloading(false);
  //     }
  //   };


  const handleDateFilter = () => {
      const params = {
        q: globalFilteredData,
        dateFrom: formatDateForAPI(dateFrom),
        dateTo: formatDateForAPI(dateTo),
        page: 1,
        limit,
        sort: sortConfig.key && sortConfig.direction
          ? `${sortConfig.key} ${sortConfig.direction.toUpperCase()}`
          : undefined
      };
      searchProp(params);
    };
  
    const clearDateFilter = () => {
      setDateFrom(null);
      setDateTo(null);
      searchProp({
        q: globalFilteredData,
        page: 1,
        limit
      });
    };
    function formatDate(dateString: string): string {
    if (!dateString) return "";
    const createdAt = new Date(dateString);
    const date = createdAt.toLocaleString(); // User's local time
    // const yyyy = date.getFullYear();
    // const mm = String(date.getMonth() + 1).padStart(2, "0");
    // const dd = String(date.getDate()).padStart(2, "0");
    // const hh = String(date.getHours()).padStart(2, "0");
    // const mi = String(date.getMinutes()).padStart(2, "0");
    // const ss = String(date.getSeconds()).padStart(2, "0");
    return date;
  }

  const columns: TableColumn[] = [
  { label: "LineID", key: "lineID", dataType: 'text', isEditable: true, isDisabled: true },
  { label: "MachineID", key: "machineID", dataType: 'text', isEditable: true, isDisabled: false },
  { label: "MachineName", key: "machineName", dataType: 'text', isEditable: false, isDisabled: false },
  { label: "EventStatus", key: "eventStatus", dataType: 'text', isEditable: false, isDisabled: false },
  { label: "EventCode", key: "eventCode", dataType: 'text', isEditable: false, isDisabled: false },
  { label: "EventDuration", key: "eventDuration", dataType: 'text', isEditable: false, isDisabled: false },
  { label: "Shift", key: "shift", dataType: 'number', isEditable: false, isDisabled: false },
  { label: "ShiftName", key: "shiftName", dataType: 'text', isEditable: false, isDisabled: false },
  { label: "Event Start Date", key: "eventStartDate", dataType: 'date', isEditable: false, isDisabled: false, render: (row: any) => formatDate(row.eventStartDate) },
  { label: "Event End Date", key: "eventEndDate", dataType: 'date', isEditable: false, isDisabled: false, render: (row: any) => formatDate(row.eventEndDate) },
  {
      label: "BreakTimes", key: "breakTimes", dataType: 'nested', isEditable: true, isDisabled: false,
      isNestedTable: true,
      getNestedData: (row: any) => row.breakTimes,
      nestedColumns: [
        { label: "Break Name", key: "name", dataType: 'text', isEditable: true, isDisabled: false },
        { label: "Start Time", key: "startTime", dataType: 'date', isEditable: true, isDisabled: false, render: (row: any) => formatDate(row.startTime) },
        { label: "End Time", key: "endTime", dataType: 'date', isEditable: true, isDisabled: false, render: (row: any) => formatDate(row.endTime) },
      ]
    }
];
  useEffect(() => {
    if (currentPage !== 1) {
      const params = {
        q: globalFilteredData,
        dateFrom: formatDateForAPI(dateFrom),
        dateTo: formatDateForAPI(dateTo),
        page: currentPage,
        limit,
        sort:
          sortConfig.key && sortConfig.direction
            ? `${sortConfig.key} ${sortConfig.direction.toUpperCase()}`
            : undefined,
      };
      searchProp(params);
    }
  }, [currentPage]);

  useEffect(() => {
      getAllProp({
        page: currentPage
      })
    }, [currentPage])
  
    useEffect(() => {
      getAllProp({ limit: 50 })
    }, [])
  
    useEffect(() => {
      if (error)
        dispatch(setError(error));
    }, [error])
  
  
 useEffect(() => {
    const params = {
      q: globalFilteredData,
      dateFrom: formatDateForAPI(dateFrom),
      dateTo: formatDateForAPI(dateTo),
      page: currentPage,
      limit,
      sort:
        sortConfig.key && sortConfig.direction
          ? `${sortConfig.key} ${sortConfig.direction.toUpperCase()}`
          : undefined,
    };
    searchProp(params);
  }, [globalFilteredData]);

  return (
    <div className="eventImage mt-5">
      <div className="d-flex justify-content-between align-items-center w-100">
      <div className="d-flex gap-2 justify-content-start">
                <div>
                  <label className="form-label labelSpacingEvent">From<span className="colonSpacing">:</span></label>
                  <DatePicker
                    selected={dateFrom}
                    onChange={(date: Date | null) => setDateFrom(date)}
                    selectsStart
                    startDate={dateFrom}
                    endDate={dateTo}
                    className="form-control"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Start date"
                    isClearable
                  />
                </div>
                <div>
                  <label className="form-label labelSpacingEvent">To<span className="colonSpacing">:</span></label>
                  <DatePicker
                    selected={dateTo}
                    onChange={(date: Date | null) => setDateTo(date)}
                    selectsEnd
                    startDate={dateFrom}
                    endDate={dateTo}
                    className="form-control"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="End date"
                    isClearable
                  />
                </div>
                <div className="d-flex gap-2 align-items-end">
                  <button
                    className="btn btn-primary applyFilter"
                    onClick={handleDateFilter}
                    disabled={!dateFrom && !dateTo}
                  >
                    Apply Filter
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={clearDateFilter}
                    disabled={!dateFrom && !dateTo}
                  >
                    Clear
                  </button>
                </div>
              </div>
      <div className="mt-3 d-flex justify-content-end">
        <GlobalSearch
          data={data?.docs as any[]}
          setFilteredData={setGlobalFilteredData}
        />
      </div>
      </div>
      <div className="d-flex flex-row justify-content-between m-1" >
        <p className="msg m-1 text-center">Total Results : {data?.pagination?.totalItems || 0}</p>
        <div className="mt-2 mb-2 d-flex justify-content-end">
          <button
            id="exportButton"
            className="btn btn-outline-secondary"
            type="button"
            // onClick={saveExcel}
            disabled={isDownloading || !data?.docs?.length}
          >
            {isDownloading ? "Exporting..." : "Download"}
          </button>
        </div>
      </div>
      <><NestedTable
        data={sortedData}
        columns={columns}
      />
      {data?.pagination?.totalPages > 0 && (
      <div className="d-flex justify-content-center mt-3">
        <PaginationComponent
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={data?.pagination?.itemsPerPage || 0}
          totalPages={data?.pagination?.totalPages || 0}
        />
      </div>
        )}
      </>
    </div>
  );
};
export default connector(EventsList);