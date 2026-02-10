import { useState, useEffect, useMemo } from "react";
import ResultAPIService from "../../redux/features/apis/ResultAPI";
import { useAppDispatch, useAppSelector, type RootState } from "../../store";
import { connect, type ConnectedProps } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "../../common/ConfirmationModal";
import FormModal from "../../common/customeTable/formModal";
import GlobalSearch from "../../common/customeTable/globalTableSearch";
import PaginationComponent from "../../common/customeTable/pagination";
import type { TableColumn } from "../../common/customeTable/nestedTable";
import NestedTable from "../../common/customeTable/nestedTable";
import Excel from "exceljs";
import { saveAs } from "file-saver";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateForAPI } from "../../util/dateHelpers";
import DatePicker from "react-datepicker";
import { useSystemConfigs } from "../../hooks/useSystemConfigs";
import Modal from "react-modal";
import "../../scss/style.scss";

Modal.setAppElement("#root");
interface IResult {
  resultid: any;
  vin: string;
  sku: string;
  model: string;
  color: string;
  createdAt: any;
  updatedAt: any;
}

const mapStateToProps = (state: RootState) => {
  return {
    data: state.resultsReducer.data,
    error: state.resultsReducer.error,
  };
};

interface Styles {
  content?: React.CSSProperties;
  overlay?: React.CSSProperties;
}

const customStyles: Modal.Styles = {
  content: {
    width: "1100px",
    margin: "auto",
    height: "600px",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
  },
  overlay: {
    position: "fixed", // ✅ this is required for full-screen overlay
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // optional: dimmed background
    zIndex: 1000,
  },
};

const mapDispatchToProps = (dispatch: (arg0: any) => any) => ({
  getAllProp: (arg: any) => dispatch(ResultAPIService.getAll(arg)),
  updateProp: (arg: any) => dispatch(ResultAPIService.update(arg)),
  removeProp: (arg: any) => dispatch(ResultAPIService.remove(arg)),
  searchProp: (arg: any) => dispatch(ResultAPIService.search(arg)),
});
// Combined props
const connector = connect(mapStateToProps, mapDispatchToProps);

// Props type
type PropsFromRedux = ConnectedProps<typeof connector>;

// Component props type
type Props = PropsFromRedux;
function ResultsList({
  data,
  getAllProp,
  updateProp,
  removeProp,
  searchProp,
}: Props) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({
    key: "id",
    direction: "asc",
  });
  const [globalFilteredData, setGlobalFilteredData] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editRow, setEditRow] = useState<any | null>(null);
  const initialDateFrom = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  })();
  const [dateFrom, setDateFrom] = useState<Date | null>(initialDateFrom);
  const [dateTo, setDateTo] = useState<Date | null>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  //  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardData, setCardData] = useState<any>({});
  const limit = 50;
  const { conveyorStageRanges } = useSystemConfigs();
  type Resultx = {
    conveyor: string;
    stage: string;
    [key: string]: any; // fallback for other properties
  };

  const sortedData = useMemo(() => {
    let sortableData: IResult[] = [];
    if (data?.docs?.length) {
      // sortableData = [...data.docs];
      // Deep copy and calculate stageLabel
      sortableData = data.docs.map((doc: Resultx) => {
        const range = conveyorStageRanges[doc.conveyor];
        const stage = parseInt(doc.stage);
        return {
          ...doc,
          stageLabel: range ? stage - range.start + 1 : null,
        };
      });
    }
    if (sortConfig?.key !== null) {
      sortableData?.sort((a, b) => {
        if (
          a[sortConfig.key as keyof IResult] <
          b[sortConfig.key as keyof IResult]
        ) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (
          a[sortConfig.key as keyof IResult] >
          b[sortConfig.key as keyof IResult]
        ) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  //   const saveExcel = async () => {
  //     setIsDownloading(true);
  //     try {
  //       const workbook = new Excel.Workbook();
  //       const worksheet = workbook.addWorksheet("Results");

  //       // Define columns for Excel
  //       worksheet.columns = [
  //         { header: "VIN", key: "vin", width: 20 },
  //         { header: "Version", key: "version", width: 15 },
  //         { header: "SKU", key: "sku", width: 15 },
  //         { header: "Model", key: "model", width: 15 },
  //         { header: "Color", key: "color", width: 15 },
  //         { header: "Created At", key: "createdAt", width: 20 },
  //         { header: "Updated At", key: "updatedAt", width: 20 },
  //         { header: "Part Stage", key: "partStage", width: 15 },
  //         { header: "Part Name", key: "partName", width: 20 },
  //         { header: "Part Result", key: "partResult", width: 15 },
  //         { header: "Scanned Part", key: "scannedPart", width: 20 },
  //         { header: "Tool Stage", key: "toolStage", width: 15 },
  //         { header: "Tool Name", key: "toolName", width: 20 },
  //         { header: "Tool Result", key: "toolResult", width: 15 },
  //         { header: "Tool Torque", key: "toolTorque", width: 15 },
  //         { header: "Tool Angle", key: "toolAngle", width: 15 },
  //       ];

  //       // Loop through docs and flatten nested arrays
  //     data?.docs?.forEach((item: any) => {
  //   // 1️⃣ Add parts
  //   item.parts?.forEach((part: any) => {
  //     worksheet.addRow({
  //       vin: item.vin,
  //       version: item.version,
  //       sku: item.sku,
  //       model: item.model,
  //       color: item.color,
  //       createdAt: new Date(item.createdAt).toLocaleString(),
  //       updatedAt: new Date(item.updatedAt).toLocaleString(),
  //       partStage: part?.stage || "",
  //       partName: part?.iname || "",
  //       partResult: part?.result || "",
  //       scannedPart: part?.scannedPart || "",
  //       toolStage: "", // leave empty
  //       toolName: "",
  //       toolResult: "",
  //       toolTorque: "",
  //       toolAngle: "",
  //     });
  //   });

  //   // 2️⃣ Add tools
  //   item.tools?.forEach((tool: any) => {
  //     worksheet.addRow({
  //       vin: item.vin,
  //       version: item.version,
  //       sku: item.sku,
  //       model: item.model,
  //       color: item.color,
  //       createdAt: new Date(item.createdAt).toLocaleString(),
  //       updatedAt: new Date(item.updatedAt).toLocaleString(),
  //       partStage: "", // leave empty
  //       partName: "",
  //       partResult: "",
  //       scannedPart: "",
  //       toolStage: tool?.stage || "",
  //       toolName: tool?.iname || "",
  //       toolResult: tool?.result || "",
  //       toolTorque: tool?.torque || "",
  //       toolAngle: tool?.angle || "",
  //     });
  //   });
  // });

  //       // Style header row
  //       worksheet.getRow(1).eachCell((cell) => {
  //         cell.font = { bold: true };
  //         cell.fill = {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "FFD3D3D3" },
  //         };
  //         cell.border = {
  //           top: { style: "thin" },
  //           left: { style: "thin" },
  //           bottom: { style: "thin" },
  //           right: { style: "thin" },
  //         };
  //       });

  //       // Generate Excel file
  //       const buffer = await workbook.xlsx.writeBuffer();
  //       saveAs(
  //         new Blob([buffer]),
  //         `results_${new Date().toISOString().split("T")[0]}.xlsx`
  //       );
  //     } catch (error) {
  //       console.error("Download failed:", error);
  //     } finally {
  //       setIsDownloading(false);
  //     }
  //   };

  const [isModalOpen, setModalOpen] = useState(false);
  const [currentItemsToDelete, setCurrentItemsToDelete] = useState<any>();

  const closeModal = () => {
    setModalOpen(false);
    setCardData(null);
  };
  const handleEdit = (row: IResult) => {
    setEditRow(row);
  };

  const handleCardClick = (preData: React.SetStateAction<{}>) => {
    setCardData(preData);
    setModalOpen(true);
    // setIsPreviewModalOpen(true);
    // You can now use rowData which contains the data of the clicked row
  };

  const handleDelete = () => {
    removeProp(currentItemsToDelete);
    setModalOpen(false);
    setCurrentItemsToDelete(null);
  };

  const handleSave = (updatedRow: IResult) => {
    const { resultid, ...data } = updatedRow;
    updateProp({ resultid, data });
    setEditRow(null);
  };

  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.resultsReducer);

  const handleDownload = () => {
  setIsDownloading(true);
  
  dispatch(
    ResultAPIService.exportResults({
      q: globalFilteredData || "",
      dateFrom: formatDateForAPI(dateFrom),
      dateTo: formatDateForAPI(dateTo),
      sort:
        sortConfig.key && sortConfig.direction
          ? `${sortConfig.key} ${sortConfig.direction.toUpperCase()}`
          : undefined,
    })
  ).finally(() => {
    setIsDownloading(false);
  });
};

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

  const columns: TableColumn[] = [
    {
      label: "Vin",
      key: "vin",
      dataType: "text",
      isEditable: true,
      isDisabled: false,
    },
    {
      label: "Version",
      key: "version",
      dataType: "text",
      isEditable: true,
      isDisabled: false,
    },
    {
      label: "SKU",
      key: "sku",
      dataType: "text",
      isEditable: true,
      isDisabled: false,
    },
    {
      label: "Model",
      key: "model",
      dataType: "text",
      isEditable: true,
      isDisabled: false,
    },
    {
      label: "Type",
      key: "type",
      dataType: "text",
      isEditable: true,
      isDisabled: false,
    },
    {
      label: "Created At",
      key: "createdAt",
      dataType: "date",
      isEditable: false,
      isDisabled: false,
      render: (row) => formatDate(row.createdAt),
    },
    {
      label: "Updated At",
      key: "updatedAt",
      dataType: "date",
      isEditable: false,
      isDisabled: false,
      render: (row) => formatDate(row.updatedAt),
    },
    {
      label: "Tools",
      key: "tools",
      dataType: "nested",
      isEditable: false,
      isDisabled: false,
      isNestedTable: true,
      getNestedData: (row) => row.tools,
      nestedColumns: [
        {
          label: "Stage",
          key: "stage",
          dataType: "text",
          isEditable: false,
          isDisabled: false,
        },
        {
          label: "Name",
          key: "iname",
          dataType: "text",
          isEditable: false,
          isDisabled: false,
        },
        // { label: 'Station Id', key: 'stationid', dataType: 'text', isEditable: false },
        {
          label: "Result",
          key: "result",
          dataType: "text",
          isEditable: false,
          isDisabled: false,
        },
        {
          label: "Torque",
          key: "torque",
          dataType: "text",
          isEditable: false,
          isDisabled: false,
          isHide: true,
        },
        {
          label: "Angle",
          key: "angle",
          dataType: "text",
          isEditable: false,
          isDisabled: false,
          isHide: true,
        },
      ],
    },
    {
      label: "Parts",
      key: "parts",
      dataType: "nested",
      isEditable: false,
      isDisabled: false,
      isNestedTable: true,
      getNestedData: (row) => row.parts,
      nestedColumns: [
        {
          label: "Stage",
          key: "stage",
          dataType: "text",
          isEditable: false,
          isDisabled: false,
        },
        {
          label: "Name",
          key: "iname",
          dataType: "text",
          isEditable: false,
          isDisabled: false,
        },
        // { label: 'Station Id', key: 'stationid', dataType: 'text', isEditable: false },
        {
          label: "Result",
          key: "result",
          dataType: "text",
          isEditable: false,
          isDisabled: false,
        },
        {
          label: "Scanned Part",
          key: "scannedPart",
          dataType: "text",
          isEditable: false,
          isDisabled: false,
          isHide: true,
        },
      ],
    },
    {
      label: " PV Card",
      key: "card",
      dataType: "jsx",
      isEditable: false,
      isDisabled: false,
      render: (row: React.SetStateAction<{}>) => (
        <div>
          <span onClick={() => handleCardClick(row)}>
            <FontAwesomeIcon icon={faCreditCard} style={{ fontSize: "20px" }} />
          </span>
        </div>
      ),
    },
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
    <div className="skuImage mt-5">
      <div className="d-flex justify-content-between align-items-center w-100">
        <div className="d-flex gap-2 justify-content-start">
          <div>
            <label className="form-label labelSpacingEvent">
              From<span className="colonSpacing">:</span>
            </label>
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
            <label className="form-label labelSpacingEvent">
              To<span className="colonSpacing">:</span>
            </label>
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

      <div className="d-flex flex-row justify-content-between m-1">
        <p className="msg m-1 text-center">
          Total Results : {data?.pagination?.totalItems || 0}
        </p>
        <div className="mt-2 mb-2 d-flex justify-content-end">
          <button
            id="exportButton"
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleDownload}
            disabled={isDownloading || loading}
          >
            {isDownloading ? "Exporting..." : "Download"}
          </button>
        </div>
      </div>
      <>
        <NestedTable data={sortedData} columns={columns} />
        {data?.pagination?.totalPages > 0 && (
          <div className="d-flex totalPages-content-center mt-3">
            <PaginationComponent
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={data?.pagination?.itemsPerPage || 0}
              totalPages={data?.pagination?.totalPages || 0}
            />
          </div>
        )}
      </>

      {/* {editRow && (
        <FormModal
          editRow={editRow}
          setEditRow={setEditRow}
          handleSave={handleSave}
          columns={columns}
        ></FormModal>
      )}
      {isModalOpen &&
        (
          <ConfirmationModal
            isOpen={isModalOpen}
            toggle={() => setModalOpen(!isModalOpen)}
            onConfirm={handleDelete}
          />
        )
      } */}
      <div>
        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            style={customStyles}
          >
            <button className="clsbtn" onClick={closeModal}>
              X
            </button>
            {/* rowData, tooldb, closeModal, isModalOpen */}
            {/* <Pv
              rowData={cardData}
              closeModal={closeModal}
              isModalOpen={isModalOpen}
            /> */}
          </Modal>
        )}
      </div>
    </div>
  );
}
export default connector(ResultsList);