import React from 'react';
import { Card } from 'react-bootstrap';
import { MachineSummary } from '../../types';
import LiveTimestamp from '../../common/LiveTimestamp';
import MachineStatusBadge from './MachineStatusBadge';


interface Props {
    machine: MachineSummary;
    onClick: (m: MachineSummary) => void;
}


const MachineCard: React.FC<Props> = ({ machine, onClick }) => {
    return (
        <Card className="mb-3 shadow-sm" role="button" onClick={() => onClick(machine)}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <Card.Title className="mb-1">{machine.name}</Card.Title>
                        <div className="text-muted small">{JSON.stringify(machine)}</div>
                    </div>
                    <div className="text-end">
                        <MachineStatusBadge status={machine.status} />
                    </div>
                </div>


                <div className="mt-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="mb-0">{machine.value ?? '—'}</h4>
                        <LiveTimestamp iso={machine.lastUpdated} />
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};


export default MachineCard;