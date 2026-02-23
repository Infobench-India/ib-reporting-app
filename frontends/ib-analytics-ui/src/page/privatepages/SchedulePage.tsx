import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, Form, Table, Badge } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useAppDispatch, useAppSelector, type RootState } from "../../store";
import ScheduleConfigService from "../../redux/features/apis/ScheduleConfigAPI";
import ShiftService from "../../redux/features/apis/shiftAPI";
import ShiftDropdown from "../../components/shiftDropdown";
import type { ParameterValue } from "../../types/customTypes";
import DynamicParameters from "../../components/machineCard/DynamicParameters";
import { useSystemConfigs } from "../../hooks/useSystemConfigs";
import MachineConfigService from "../../redux/features/apis/MachineConfigAPI";

/* ===================== TYPES ===================== */

interface Shift {
  id: string;
  shift: number;
  name: string;
  startTime?: Date;
  endTime?: Date;
}

interface Schedule {
  id?: string;
  name: string;
  reportType: string;
  scheduleMode: string;
  timezone: string;
  emailSubject?: string;
  recipients: string[];
  shifts: Shift[];
  schedule?: {
    scheduleDate: string | null;
  };
  parameters: {
    machineIds: string[];
    scheduleDate: string | null;
    toDate: string | null;
  };
  isActive: boolean;
}

/* ===================== PAGE ===================== */

const SchedulePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(
    (state: RootState) => state.scheduleConfigReducer
  );

  const [showModal, setShowModal] = useState(false);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    dispatch(ScheduleConfigService.getAll({}));
    dispatch(ScheduleConfigService.getAll({}));
  }, [dispatch]);

  useEffect(() => {
    if(!showModal)
    setEditSchedule(null);
  }, [showModal]);
  const schedules = useMemo<Schedule[]>(() => {
    return data?.docs ?? [];
  }, [data]);

  const handleDelete = (id?: string) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      dispatch(ScheduleConfigService.remove(id));
    }
  };

  const handleSave = (payload: Schedule) => {
    if (payload.id) {
      dispatch(
        ScheduleConfigService.update({ id: payload.id, data: payload })
      );
    } else {
      dispatch(ScheduleConfigService.create(payload));
    }
    setShowModal(false);
  };
useEffect(() => {
  console.log("Edit Schedule:", editSchedule);
}, [editSchedule]);

  const formatLocalDate = (utcDate: string | null | undefined): string => {
    if (!utcDate) return 'None';
    try {
      return new Date(utcDate).toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        // weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Schedule Configurations</h2>
        <Button onClick={() => setShowModal(true)}>Add Schedule</Button>
      </div>

      {loading && <p>Loading schedules...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && schedules.length === 0 && (
        <p className="text-muted">No schedules configured.</p>
      )}

      {schedules.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Report</th>
              <th>Mode</th>
              <th>Schedule Date Time</th>
              <th>Recipients</th>
              <th>Shifts</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.reportType}</td>
                <td>{s.scheduleMode}</td>
                <td>{formatLocalDate(s.schedule?.scheduleDate)}</td>
                <td>{s.recipients.join(", ") || <em>None</em>}</td>
                <td>
                  {s.shifts?.length ? (
                    s.shifts.map((sh) => (
                      <div key={sh.id}>
                        <strong>{sh.shift}</strong> – {sh.name}
                      </div>
                    ))
                  ) : (
                    <em>No shifts</em>
                  )}
                </td>
                <td>
                  <Badge bg={s.isActive ? "success" : "secondary"}>
                    {s.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    className="me-2"
                    onClick={() => {
                      setEditSchedule(s);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ScheduleModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditSchedule(null);
        }}
        onSave={handleSave}
        schedule={editSchedule}
      />
    </div>
  );
};

/* ===================== MODAL ===================== */

interface ModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (schedule: Schedule) => void;
  schedule: Schedule | null;
}

const ScheduleModal: React.FC<ModalProps> = ({
  show,
  onClose,
  onSave,
  schedule,
}) => {
  const dispatch = useAppDispatch();
  const availableShifts = useAppSelector(
    (s: RootState) => s.shiftReducer.data?.docs ?? []
  );
    const machines = useAppSelector((state: RootState) => state.machineConfigReducer.data);
  const { REPORT_PARAMETER_CONFIG, reportTypes, scheduleModeOptions } = useSystemConfigs();
  const [form, setForm] = useState<Schedule>({
    name: "",
    reportType: "",
    scheduleMode: "",
    timezone: "Asia/Kolkata",
    emailSubject: "",
    recipients: [],
    shifts: [],
    isActive: true,
    parameters: {
      machineIds: [],
      scheduleDate: null,
      toDate: null,
    },
  });

  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [parameterConfig, setParameterConfig] = useState(REPORT_PARAMETER_CONFIG[form.reportType] ?? []);


  const updateParameter = (
    key: string,
    value: ParameterValue
  ) => {
    setForm({
      ...form,
      parameters: {
        ...form.parameters,
        [key]: value,
      },
    });
  };
  useEffect(() => {
    dispatch(ShiftService.getAll({}));
    dispatch(MachineConfigService.listConfigs({ }));
  }, [dispatch]);
    useEffect(() => {
      if(form.reportType)
      setParameterConfig(REPORT_PARAMETER_CONFIG[form.reportType] || []);
    },[
form.reportType])
  useEffect(() => {
    if (schedule) {
      setForm(schedule);
      setScheduleDate(
        schedule.schedule?.scheduleDate
          ? new Date(schedule.schedule.scheduleDate)
          : null
      );
    }
  }, [schedule]);
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const addRecipient = () => {
    if (
      emailInput &&
      /\S+@\S+\.\S+/.test(emailInput) &&
      !form.recipients.includes(emailInput)
    ) {
      setForm({
        ...form,
        recipients: [...form.recipients, emailInput],
      });
      setEmailInput("");
    }
  };

  const save = () => {
    onSave({
      ...form,
      schedule: {
        scheduleDate: scheduleDate?.toISOString() ?? null
      },
    });
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{schedule ? "Edit" : "Add"} Schedule</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="reportType">
            <Form.Label>Report Type</Form.Label>
            <Form.Select
              name="reportType"
              value={form.reportType}
              onChange={(e) => {
                setForm({ ...form, reportType: e.target.value });
                setParameterConfig(REPORT_PARAMETER_CONFIG[e.target.value] || []);
              }
              }
            >
              {reportTypes.map((rt: any) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}

            </Form.Select>
          </Form.Group>
          <Form.Group controlId="scheduleMode">
            <Form.Label>Schedule Mode</Form.Label>
            <Form.Select
              name="scheduleMode"
              value={form.scheduleMode}
              onChange={(e) => {
                setForm({ ...form, scheduleMode: e.target.value });
              }
              }
            >
              {scheduleModeOptions.map((rt: any) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}

            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email Subject</Form.Label>
            <Form.Control
              value={form.emailSubject}
              onChange={(e) =>
                setForm({ ...form, emailSubject: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Recipients</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <Button onClick={addRecipient}>Add</Button>
            </div>
            <div className="mt-2">
              {form.recipients.map((r) => (
                <Badge
                  bg="secondary"
                  key={r}
                  className="me-2"
                  onClick={() =>
                    setForm({
                      ...form,
                      recipients: form.recipients.filter((x) => x !== r),
                    })
                  }
                >
                  {r} ×
                </Badge>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Schedule Date</Form.Label>
            <DatePicker
              selected={scheduleDate}
              onChange={setScheduleDate}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
            />
          </Form.Group>
          {parameterConfig.length > 0 && (
            <>
              <hr />
              <h5>Report Parameters</h5>

              <DynamicParameters
                configs={parameterConfig}
                values={form.parameters}
                onChange={updateParameter}
                machines={machines?.docs} // from API
              />
            </>
          )}
          <Form.Group className="mb-2">
            <Form.Label>Select Shifts</Form.Label>
            <ShiftDropdown
              selectedOptionsProps={form.shifts}
              onSelect={(v) => {
                if(!Array.isArray(v))
                  v = [v];
                setForm({ ...form, shifts: v })
              }}
            />
          </Form.Group>
          <Form.Check
            className="mt-3"
            type="switch"
            label="Active"
            checked={form.isActive}
            onChange={(e) =>
              setForm({ ...form, isActive: e.target.checked })
            }
          />
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={!form.name || !form.recipients.length}
          onClick={save}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SchedulePage;
