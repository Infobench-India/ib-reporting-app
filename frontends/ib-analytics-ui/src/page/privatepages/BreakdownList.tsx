import { useState, useEffect, useMemo } from "react";
import BreakDownAPIService from "../../redux/features/apis/BreakdownAPI";
import { useAppDispatch, type RootState } from "../../store";
import { connect, type ConnectedProps } from "react-redux";
import GlobalSearch from "../../common/customeTable/globalTableSearch";
import PaginationComponent from "../../common/customeTable/pagination";
import type { TableColumn } from "../../common/customeTable/nestedTable";
import NestedTable from "../../common/customeTable/nestedTable";
import Excel from "exceljs";
import { saveAs } from "file-saver";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "react-datepicker/dist/react-datepicker.css";
import { formatDateForAPI } from '../../util/dateHelpers';
import DatePicker from "react-datepicker";
import Modal from "react-modal";
import "../../scss/style.scss"

Modal.setAppElement("#root");
interface IBreakDown {
  id:any;
  iname: string;
  stage: string;
  bypassdate: any;
  bypasstime: string;
  bypassuser: string;
  activedate: any;
  activetime: string;
  activeuser: string;
  createdAt: any;
  updatedAt: any;
}

const mapStateToProps = (state: RootState) => {
  return {
    data: state.breakdownsReducer.data,
    error: state.breakdownsReducer.error
  };
};

const mapDispatchToProps = (dispatch: (arg0: any) => any) => ({
  getAllProp: (arg: any) => dispatch(BreakDownAPIService.getAll(arg)),
  updateProp: (arg: any) => dispatch(BreakDownAPIService.update(arg)),
  removeProp: (arg: any) => dispatch(BreakDownAPIService.remove(arg)),
  searchProp: (arg: any) => dispatch(BreakDownAPIService.search(arg)),
});
// Combined props
const connector = connect(mapStateToProps, mapDispatchToProps);

// Props type
type PropsFromRedux = ConnectedProps<typeof connector>;

// Component props type
type Props = PropsFromRedux;
function BreakdownList({ data, getAllProp, updateProp, removeProp, searchProp }: Props) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({
    key: "id",
    direction: 'asc',
  });
  const [globalFilteredData, setGlobalFilteredData] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1);
  const initialDateFrom = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  })();
  const [dateFrom, setDateFrom] = useState<Date | null>(initialDateFrom);
  const [dateTo, setDateTo] = useState<Date | null>(new Date());
  const [isDownloading, setIsDownloading] = useState(false);
  const limit = 50;

  const sortedData = useMemo(() => {
    let sortableData: IBreakDown[] = [];
    if (data?.docs?.length) {
      sortableData = [...data.docs];
    }
    if (sortConfig?.key !== null) {
      sortableData?.sort((a, b) => {
        if (a[sortConfig.key as keyof IBreakDown] < b[sortConfig.key as keyof IBreakDown]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof IBreakDown] > b[sortConfig.key as keyof IBreakDown]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const saveExcel = async () => {
    setIsDownloading(true);
    try {
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("BreakDowns");

      // Define columns for Excel
      worksheet.columns = [
        { header: "ToolName", key: "iname", width: 20 },
        { header: "Stage", key: "stage", width: 15 },
        { header: "ByPassDate", key: "bypassdate", width: 15 },
        { header: "ByPassUser", key: "bypassuser", width: 15 },
        { header: "ActiveDate", key: "activedate", width: 15 },
        { header: "ByPassDuration", key: "bypassduration", width: 15 },
        { header: "ActiveUser", key: "activeuser", width: 15 },
        { header: "Created At", key: "createdAt", width: 20 },
        { header: "Updated At", key: "updatedAt", width: 20 }
      ];

      // Add data rows
      data?.docs?.forEach((item: IBreakDown) => {
        worksheet.addRow({
          iname: item.iname,
          stage: item.stage,
          bypassdate: item.bypassdate,
          bypasstime: item.bypasstime,
          bypassuser: item.bypassuser,
          activedate: item.activedate,
          activetime: item.activetime,
          activeuser: item.activeuser,
          createdAt: new Date(item.createdAt).toLocaleString(),
          updatedAt: new Date(item.updatedAt).toLocaleString()
        });
      });

      // Style header row
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `breakdowns_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

 

  const columns: TableColumn[] = [
    { label: "ToolName", key: "iname", dataType: 'text', isEditable: true, isDisabled: false },
    { label: "Stage", key: "stage", dataType: 'text', isEditable: true, isDisabled: false },
    { label: "ByPassDate", key: "bypassdate", dataType: 'text', isEditable: true, isDisabled: false,render: (row) => formatDate(row.bypassdate), },
    { label: "ByPassUser", key: "bypassuser", dataType: 'text', isEditable: true, isDisabled: false },
    { label: "ActiveDate", key: "activedate", dataType: 'text', isEditable: true, isDisabled: false ,render: (row) => formatDate(row.activedate),},
    { label: "ByPassDuration", key: "bypassduration", dataType: 'text', isEditable: true, isDisabled: false },
    { label: "ActiveUser", key: "activeuser", dataType: 'text', isEditable: true, isDisabled: false },
  ];
  const handleDateFilter = () => {
    const params = {
      q: globalFilteredData,
      dateFrom: formatDateForAPI(dateFrom),
      dateTo: formatDateForAPI(dateTo),
      page: 1,
      limit,
      sort:
        sortConfig.key && sortConfig.direction
          ? `${sortConfig.key} ${sortConfig.direction.toUpperCase()}`
          : undefined,
    };
    searchProp(params);
  };

  const clearDateFilter = () => {
    setDateFrom(null);
    setDateTo(null);
    searchProp({
      q: globalFilteredData,
      page: 1,
      limit,
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

  useEffect(() => {
  console.log("API Response Data:", data); // Add this line
  if (data?.docs?.length) {
    console.log("Formatted Data for Table:", data.docs);
  }
}, [data]);

  useEffect(() => {
    const params = {
      q: globalFilteredData,
      dateFrom: formatDateForAPI(dateFrom),
      dateTo: formatDateForAPI(dateTo),
      page: currentPage,
      limit,
      sort: sortConfig.key && sortConfig.direction
        ? `${sortConfig.key} ${sortConfig.direction.toUpperCase()}`
        : undefined
    };
    searchProp(params);
  }, [currentPage]);

  useEffect(() => {
    searchProp({ q: globalFilteredData })
  }, [globalFilteredData])
  return (
    <div className="skuImage mt-5">
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
        <p className="msg m-1 text-center">Total Breakdown : {data?.pagination?.totalItems || 0}</p>
        <div className="mt-2 mb-2 d-flex justify-content-end">
          <button
            id="exportButton"
            className="btn btn-outline-secondary"
            type="button"
            onClick={saveExcel}
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
        {data?.pagination?.totalPages > 0 && <PaginationComponent
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={data?.pagination?.itemsPerPage ? data.pagination?.itemsPerPage : 0}
          totalPages={data?.pagination?.totalPages ? data.pagination?.totalPages : 0}
        ></PaginationComponent>}
      </>
    </div>
  );
};
export default connector(BreakdownList);