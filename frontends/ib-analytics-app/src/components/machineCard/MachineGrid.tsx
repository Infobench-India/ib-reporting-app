import React, { useState } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import MachineCard from './MachineCard';
import MachineDetailsModal from './MachineDetailsModal';
import { useSocket } from '../../hooks/useSocket';


const MachineGrid: React.FC = () => {
    // const { machines } = useMachines();
    const [selected, setSelected] = useState(null as any);

const [machines, setMachines] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

useSocket({
    listenAllMachines: true,
    onMachineAdded: (data) => {
        console.log("New machine discovered:", data);
        setMachines((prev) => [...prev, data.configDoc]);
    },
    onMachineEvent: (machineId, event) => {
        console.log(`Event for machine ${machineId}:`, event);
        setMachines((prev) => {
            const machineExists = prev.some((m) => m.machineId === machineId);
            if (!machineExists) {
                return [...prev, { machineId, ...event }];
            }
            return prev.map((m) => {
                if (m.machineId === machineId) {
                    return Object.assign({}, m, event);
                }
                return m;
            });
        });
        setEvents((prev) => [...prev, { machineId, event }]);
    }
});
    return (
        <Container fluid>
            <Row className="g-3">
                {machines.map(m => (
                    <Col key={m.id} xs={12} sm={6} md={4} lg={3}> 
                            <MachineCard machine={m} onClick={() => setSelected(m)} />
                     
                    </Col>
                ))}
            </Row>


            {selected && (
                <MachineDetailsModal machine={selected} show={!!selected} onHide={() => setSelected(null)} />
            )}
        </Container>
    );
};


export default MachineGrid;