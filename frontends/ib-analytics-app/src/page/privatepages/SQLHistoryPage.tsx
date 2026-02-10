import React from "react";
import ExecutionHistory from "../../components/Scheduler/ExecutionHistory";

const SQLHistoryPage: React.FC = () => {
    return (
        <div className="container-fluid p-4">
            <h4>SQL Report Execution History</h4>
            <ExecutionHistory />
        </div>
    );
};

export default SQLHistoryPage;
