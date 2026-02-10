interface UtilizationBarProps {
    data: {
        quality: number;
        breakdownTime: number;
        shiftTime: number;
    };
}
declare const UtilizationBar: React.FC<UtilizationBarProps>;
export default UtilizationBar;
