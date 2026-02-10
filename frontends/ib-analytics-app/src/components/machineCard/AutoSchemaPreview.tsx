import React from 'react';
import { Card, Table } from 'react-bootstrap';


const AutoSchemaPreview: React.FC<{ sample: Record<string, any> }> = ({ sample }) => {
const rows = Object.keys(sample || {}).map(k => ({ k, v: sample[k], t: typeof sample[k] }));
return (
<Card>
<Card.Body>
<Card.Title>Detected Fields</Card.Title>
<Table size="sm" bordered>
<thead>
<tr><th>Field</th><th>Type</th><th>Example</th></tr>
</thead>
<tbody>
{rows.map(r => (
<tr key={r.k}><td>{r.k}</td><td>{r.t}</td><td><code>{JSON.stringify(r.v)}</code></td></tr>
))}
</tbody>
</Table>
</Card.Body>
</Card>
);
};


export default AutoSchemaPreview;