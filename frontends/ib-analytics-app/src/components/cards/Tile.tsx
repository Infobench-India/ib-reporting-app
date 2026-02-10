// components/Tile.tsx - Animated version with Productivity act/plan display
import { FC, ReactNode, useState, useEffect } from "react";
import { Card, CardBody, ProgressBar } from "react-bootstrap";
import { kpiConfigs, defaultKPIConfig } from "./kpiConfig";

interface TileProps {
  title: string;
  value: string | number;
  sub: string;
  icon: ReactNode;
  target?: number;
  lastValue?: number | string;
  planProd?: number | string;
  actProd?: number | string;
  kpiKey?: string;
}

const getStatus = (
  title: string,
  value: number,
  target?: number
): { variant: string; label: string; progress: number } => {
  let progress = value;
  let max = 100;

  if (title.includes("OEE") || title.includes("Productivity")) {
    progress = value as number;
    max = 100;
  } else if (title.includes("UPH") && target) {
    progress = Math.round(((value as number) / target) * 100);
    max = 100;
  }

  if (progress >= 90)
    return { variant: "success", label: "Excellent", progress };
  if (progress >= 80) return { variant: "success", label: "Healthy", progress };
  if (progress >= 70) return { variant: "warning", label: "Good", progress };
  if (progress >= 60) return { variant: "warning", label: "Fair", progress };
  return { variant: "danger", label: "Critical", progress };
};

const getProgressValue = (
  title: string,
  value: number,
  target?: number
): number => {
  if (title.includes("OEE") || title.includes("Productivity")) {
    return value;
  }
  if ((title.includes("UPH") || title.includes("UPH")) && target) {
    return Math.round((value / target) * 100);
  }
  return value;
};

const getStatusFromConfig = (kpiName: string, progress: number) => {
  const config = kpiConfigs[kpiName] || defaultKPIConfig;

  for (const threshold of config.thresholds) {
    if (progress >= threshold.min) {
      return {
        variant: threshold.variant,
        label: threshold.label,
        progress,
      };
    }
  }

  return {
    variant: config.default.variant,
    label: config.default.label,
    progress,
  };
};

const Tile: FC<TileProps> = ({
  title,
  value,
  sub,
  icon,
  target,
  lastValue,
  planProd,
  actProd,
  kpiKey,
}) => {
  const numericValue =
    typeof value === "number"
      ? value
      : parseFloat(value.toString().replace("%", "").replace(" (N)", "")) || 0;

  const lastNumericValue =
    lastValue !== undefined
      ? typeof lastValue === "number"
        ? lastValue
        : parseFloat(
            lastValue.toString().replace("%", "").replace(" Nos", "")
          ) || 0
      : 0;

  // const { variant, label, progress } = getStatus(title, numericValue, target);

  const progress = getProgressValue(title, numericValue, target);
  const { variant, label } = getStatusFromConfig(kpiKey || title, progress);

  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedLastValue, setAnimatedLastValue] = useState(0);

  useEffect(() => {
    
          setAnimatedValue(numericValue);
          
            setAnimatedLastValue(lastNumericValue);

  }, [numericValue, progress, lastValue, lastNumericValue]);

  const bgGradient = {
    success: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
    warning: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    danger: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)",
  }[variant];

  const displayValue = title.includes("UPH")
    ? `${Math.floor(animatedValue)} Nos`
    : `${Math.floor(animatedValue)}${
        value.toString().includes("%") ? "%" : ""
      }`;

  const displayLastValue =
    lastValue !== undefined
      ? title.includes("UPH")
        ? `${Math.floor(animatedLastValue)} Nos`
        : `${Math.floor(animatedLastValue)}${
            typeof lastValue === "string" && lastValue.includes("%") ? "%" : ""
          }`
      : "-";

  // Show actProd / planProd only for Productivity tile when both values exist
  const showProdRatio =
    title === "Productivity" && actProd !== undefined && planProd !== undefined;

  return (
    <Card
      className="h-100 border-0 overflow-hidden shadow-lg rounded-4 position-relative tile-compact"
      // style={{ transition: "all 0.4s ease", animationDelay: "0.2s" }}
    >
      {/* Gradient Background */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 opacity-90"
        style={{ background: bgGradient, zIndex: 0 }}
      />

      {/* Subtle Overlay Pattern */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)",
          zIndex: 1,
        }}
      />

      <CardBody
        className="py-2 px-3 d-flex flex-column justify-content-between position-relative"
        style={{ zIndex: 2 }}
      >
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between m-0">
          <div>
            <h4
              className="text-white text-uppercase fw-bold mb-1"
              style={{ fontSize: "1.0rem", letterSpacing: "0.0em" }}
            >
              {title}
            </h4>
            <p
              className="text-white opacity-75 mb-0"
              style={{ fontSize: "1.05rem" }}
            >
              {sub}
              <br></br>
              {showProdRatio && (
                <>
                  {" "}
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                    }}
                  >
                    [ Actual : {actProd} / Plan : {planProd} ]
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="rounded-4 p-1">
            <div className="text-white" style={{ fontSize: "3.5rem", lineHeight: 1 }}>
              {icon}
            </div>
          </div>
        </div>

        {/* Animated Large Value + Last Shift */}
        <div className="mb-1 d-flex justify-content-between align-items-end">
          <h1
            className="fw-bold text-white m-0"
            style={{ fontSize: "3.2rem", lineHeight: "1" }}
          >
            {displayValue}
          </h1>

          {lastValue !== undefined && (
            <div className="text-end">
              <span
                className="fw-semibold text-white-50 me-2"
                style={{ fontSize: "1.0rem" }}
              >
                Last Shift:
              </span>
              <span
                className="text-white fw-bold"
                style={{ fontSize: "1.5rem" }}
              >
                {displayLastValue}
              </span>
            </div>
          )}
        </div>

        {/* Animated Progress Bar + Status */}
        <div>
          <ProgressBar
            now={animatedProgress}
            variant={variant}
            className="mb-2 rounded-pill shadow-sm"
            style={{ height: "12px", backgroundColor: "rgba(255,255,255,0.2)" }}
          />
          <div className="d-flex justify-content-between align-items-center">
            <span
              className="text-white fw-semibold opacity-90"
              style={{ fontSize: "1.1rem" }}
            >
              {label}
            </span>
            <span
              className="text-white opacity-70"
              style={{ fontSize: "1rem" }}
            >
              {displayValue} Achieved
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Tile;
