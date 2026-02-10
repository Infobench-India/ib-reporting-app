import React from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  REPORT_PARAMETER_CONFIG
} from "../../constants/commonConstants";
import type { ParameterConfig, ParameterValue } from "../../types/customTypes";

interface Props {
  configs: ParameterConfig[];
  values: Record<string, ParameterValue>;
  onChange: (key: string, value: ParameterValue) => void;
  machines?: { id: string; name: string }[];
}

const DynamicParameters: React.FC<Props> = ({
  configs,
  values,
  onChange,
  machines = [],
}) => {
  return (
    <>
      {configs.map((param) => {
        const value = values[param.key];

        switch (param.type) {
          case "text":
            return (
              <Form.Group key={param.key} className="mb-3">
                <Form.Label>{param.label}</Form.Label>
                <Form.Control
                  value={(value as string) ?? ""}
                  onChange={(e) =>
                    onChange(param.key, e.target.value)
                  }
                />
              </Form.Group>
            );

          case "number":
            return (
              <Form.Group key={param.key} className="mb-3">
                <Form.Label>{param.label}</Form.Label>
                <Form.Control
                  type="number"
                  value={value ? value.toString() : ""}
                  onChange={(e) =>
                    onChange(param.key, Number(e.target.value))
                  }
                />
              </Form.Group>
            );

          case "boolean":
            return (
              <Form.Check
                key={param.key}
                className="mb-3"
                type="switch"
                label={param.label}
                checked={Boolean(value)}
                onChange={(e) =>
                  onChange(param.key, e.target.checked)
                }
              />
            );

          case "date":
          case "datetime":
            return (
              <Form.Group key={param.key} className="mb-3">
                <Form.Label>{param.label}</Form.Label>
                <br />
                <DatePicker
                  selected={value ? new Date(value as string) : null}
                  onChange={(date) =>
                    onChange(
                      param.key,
                      date ? date.toISOString() : null
                    )
                  }
                  showTimeSelect={param.type === "datetime"}
                  dateFormat={
                    param.type === "datetime"
                      ? "yyyy-MM-dd HH:mm"
                      : "yyyy-MM-dd"
                  }
                />
              </Form.Group>
            );

          case "multi-select":
            return (
              <Form.Group key={param.key} className="mb-3">
                <Form.Label>{param.label}</Form.Label>
                <Form.Select
                  multiple
                  value={(value as string[]) ?? []}
                  onChange={(e) =>
                    onChange(
                      param.key,
                      Array.from(
                        e.target.selectedOptions
                      ).map((o) => o.value)
                    )
                  }
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            );

          default:
            return null;
        }
      })}
    </>
  );
};

export default DynamicParameters;
