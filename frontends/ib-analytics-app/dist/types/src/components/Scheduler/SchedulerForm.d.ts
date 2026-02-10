import React from "react";
import { ReportSchedule } from "../../services/schedulerService";
interface Props {
    initialData: ReportSchedule | null;
    onSave: (data: ReportSchedule) => void;
    onCancel: () => void;
}
declare const SchedulerForm: React.FC<Props>;
export default SchedulerForm;
