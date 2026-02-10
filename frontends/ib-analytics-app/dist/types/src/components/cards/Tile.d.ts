import { FC, ReactNode } from "react";
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
declare const Tile: FC<TileProps>;
export default Tile;
