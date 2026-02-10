import { useState, useEffect, useMemo } from "react";
import ShiftAPIService from "../../redux/features/apis/shiftAPI";
import { useAppDispatch, type RootState } from "../../store";
import { connect, type ConnectedProps } from "react-redux";
import ConfirmationModal from "../../common/ConfirmationModal";
import AddFormModal from "../../common/customeTable/addFormModal";
import FormModal from "../../common/customeTable/formModal";
import GlobalSearch from "../../common/customeTable/globalTableSearch";
import PaginationComponent from "../../common/customeTable/pagination";
import type { TableColumn } from "../../common/customeTable/table";
import NestedTable from "../../common/customeTable/nestedTable";
import Authorization from "../../common/Authorization";
import { useSystemConfigs } from "../../hooks/useSystemConfigs";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { setError } from "../../redux/errorSlice";
import saveAs from "file-saver";
import Excel from "exceljs";
interface Shift {
  id: string;
  uuid: string;
  shift: string;
  name: string;
  startTime: string;
  endTime: string;
}

const mapStateToProps = (state: RootState) => ({
  data: state.shiftReducer.data,
  error: state.shiftReducer.error
});

const mapDispatchToProps = (dispatch: (arg0: any) => any) => ({
  getAllProp: (arg: any) => dispatch(ShiftAPIService.getAll(arg)),
  createProp: (arg: any) => dispatch(ShiftAPIService.create(arg)),
  updateProp: (arg: any) => dispatch(ShiftAPIService.update(arg)),
  removeProp: (arg: any) => dispatch(ShiftAPIService.remove(arg)),
});
// Combined props
const connector = connect(mapStateToProps, mapDispatchToProps);

// Props type
type PropsFromRedux = ConnectedProps<typeof connector>;

// Component props type
type Props = PropsFromRedux;
function ShiftList({ data, error, getAllProp, createProp, updateProp, removeProp }: Props) {

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({
    key: "createdAt",
    direction: 'asc',
  });
  const [globalFilteredData, setGlobalFilteredData] = useState<any>([])
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [openAddRowModal, setOpenAddRowModal] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const { models, type, rolePolicy } = useSystemConfigs();

  const sortedData = useMemo(() => {
    let sortableData: Shift[] = [];
    if (data?.docs?.length) {
      sortableData = [...data.docs];
    }
    if (sortConfig?.key !== null) {
      sortableData?.sort((a, b) => {
        if (a[sortConfig.key as keyof Shift] < b[sortConfig.key as keyof Shift]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof Shift] > b[sortConfig.key as keyof Shift]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentItemsToDelete, setCurrentItemsToDelete] = useState<any>();
  const dispatch = useAppDispatch();
  const handleEdit = (row: Shift) => {
    setEditRow(row);
  };

  const handleDelete = () => {
    removeProp(currentItemsToDelete);
    setModalOpen(false);
    setCurrentItemsToDelete(null);
  };

  const handleSave = (updatedRow: any) => {
    // Extract the ID from the original editRow, not from updatedRow
    const id = editRow?.uuid;

    if (!id) {
      console.error('No ID found for update');
      return;
    }

    // The updatedRow should already be filtered to only contain editable fields
    // But just to be safe, let's create a clean payload
    const cleanPayload: any = {};

    // Only include fields that are actually editable according to columns
    columns.forEach(column => {
      if (column.isEditable && updatedRow[column.key] !== undefined) {
        cleanPayload[column.key] = updatedRow[column.key];
      }
    });

    // Send the update with only editable fields
    updateProp({
      id,
      data: cleanPayload
    });

    setEditRow(null);
  };

  const handleAdd = (addRow: Shift) => {
    const { id, ...addRow1 } = addRow
    createProp({ ...addRow1, iuser: "system" });
    setOpenAddRowModal(false);
  };

  function formatDate(dateString: string): string {
    if (!dateString) return "";
    const createdAt = new Date(dateString);
    const date = createdAt.toLocaleString(); // User's local time
    return date;
  }

  const columns: TableColumn[] = [
    { label: "Shift", key: "shift", dataType: 'text', isEditable: true, isDisabled: false },
    { label: "Name", key: "name", dataType: 'text', isEditable: true, isDisabled: false },
    { label: "Start Time", key: "startTime", dataType: 'date', isEditable: true, isDisabled: false, render: (row: any) => formatDate(row.startTime) },
    { label: "End Time", key: "endTime", dataType: 'date', isEditable: true, isDisabled: false, render: (row: any) => formatDate(row.endTime) },
    {
      label: "BreakTimes", key: "breakTimes", dataType: 'nested', isEditable: true, isDisabled: false,
      isNestedTable: true,
      getNestedData: (row: any) => row.breakTimes,
      nestedColumns: [
        { label: "Break Name", key: "name", dataType: 'text', isEditable: true, isDisabled: false },
        { label: "Start Time", key: "startTime", dataType: 'date', isEditable: true, isDisabled: false, render: (row: any) => formatDate(row.startTime) },
        { label: "End Time", key: "endTime", dataType: 'date', isEditable: true, isDisabled: false, render: (row: any) => formatDate(row.endTime) },
      ]
    },

    {
      label: 'Actions',
      key: 'actions',
      dataType: 'jsx',
      isEditable: false,
      isDisabled: false,
      render: (row: any) => (
        <>
          <div className="d-flex justify-content-center gap-3">
            <i
              className="fa-regular fa-pen-to-square"
              style={{ color: 'blue', cursor: 'pointer', fontSize: '1rem' }}
              onClick={() => handleEdit(row)}
            ></i>
            <i
              className="fa-solid fa-trash"
              style={{ color: 'red', cursor: 'pointer', fontSize: '1rem' }}
              onClick={() => {
                setModalOpen(!isModalOpen);
                setCurrentItemsToDelete(row.uuid);
              }}
            ></i>
          </div>
        </>
      ),
    },
  ];
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

  return (
    <div className="skuImage mt-5">
      <div className="d-flex flex-row justify-content-between m-1" >
        <Authorization action="addShift" policy={rolePolicy}>
          <button type="button" className="btn btn-primary m-1" onClick={() => setOpenAddRowModal(!openAddRowModal)}>
            Add Shift
          </button>
        </Authorization>
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
      {editRow && (
        <FormModal
          editRow={editRow}
          setEditRow={setEditRow}
          handleSave={handleSave}
          columns={columns}
          modalHeight="700px"
          modalWidth="400px"
          modalMarginTop="150px"
        ></FormModal>
      )}
      {openAddRowModal && (
        <AddFormModal
          setIsColseModal={setOpenAddRowModal}
          handleAdd={handleAdd}
          columns={columns}
          modelHeader="Shift Registration"
          modalHeight="700px"
          modalWidth="400px"
          modalMarginTop="150px"
        ></AddFormModal>
      )}
      {isModalOpen &&
        (
          <ConfirmationModal
            isOpen={isModalOpen}
            toggle={() => {
              setModalOpen(!isModalOpen);
              setDeleteError([]);
            }}
            onConfirm={handleDelete}
            errors={deleteError}
          />
        )
      }
    </div>
  );
};
export default connector(ShiftList);