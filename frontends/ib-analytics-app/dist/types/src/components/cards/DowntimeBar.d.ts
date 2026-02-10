interface DowntimeCause {
    name: string;
    minutes: number;
    color: string;
}
interface DowntimeAnalysisProps {
    totalMinutes: number;
    causes?: DowntimeCause[];
}
declare const DowntimeBar: React.FC<DowntimeAnalysisProps>;
export default DowntimeBar;
