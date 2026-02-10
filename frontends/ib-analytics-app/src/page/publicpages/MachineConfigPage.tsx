import React from "react";
import MachineConfigList from "../../components/machineCard/MachineConfigList";

const MachineConfigPage: React.FC = () => {
  return (
    <div className="container-fluid mt-4">
      <MachineConfigList onEdit={(config) => console.log("edit", config)} />
    </div>
  );
};

export default MachineConfigPage;
