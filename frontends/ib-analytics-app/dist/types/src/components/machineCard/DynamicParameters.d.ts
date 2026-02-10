import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import type { ParameterConfig, ParameterValue } from "../../types/customTypes";
interface Props {
    configs: ParameterConfig[];
    values: Record<string, ParameterValue>;
    onChange: (key: string, value: ParameterValue) => void;
    machines?: {
        id: string;
        name: string;
    }[];
}
declare const DynamicParameters: React.FC<Props>;
export default DynamicParameters;
