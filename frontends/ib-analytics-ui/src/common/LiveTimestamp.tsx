import React, { useEffect, useState } from 'react';


const prettyAge = (iso?: string) => {
if (!iso) return 'never';
const delta = Date.now() - new Date(iso).getTime();
if (delta < 5000) return 'just now';
if (delta < 60000) return `${Math.round(delta / 1000)}s ago`;
if (delta < 3600000) return `${Math.round(delta / 60000)}m ago`;
return `${Math.round(delta / 3600000)}h ago`;
};


const LiveTimestamp: React.FC<{ iso?: string }> = ({ iso }) => {
const [, setTick] = useState(0);
useEffect(() => {
const t = setInterval(() => setTick(n => n + 1), 5000);
return () => clearInterval(t);
}, []);


return <small className="text-muted">{prettyAge(iso)}</small>;
};


export default LiveTimestamp;