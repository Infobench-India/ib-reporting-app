import React, { useEffect, useState, useRef } from 'react';
import { Container, Button, Form, InputGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_REACT_APP_AUTH_API_URL || 'http://localhost:3051/api/auth';
export default function Activation() {
  const [machineId, setMachineId] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/activation/machine-id`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setMachineId(data.machineId || ''))
      .catch((err) => {
        toast.error('Failed to fetch Machine ID');
        setMachineId('');
      });
  }, []);

  function copyToClipboard() {
    if (!machineId) return;
    navigator.clipboard?.writeText(machineId).then(() => {
      toast.success('Machine ID copied to clipboard');
    });
  }

  async function uploadLicense(e: React.FormEvent) {
    e.preventDefault();
    const files = fileRef.current?.files;
    if (!files || files.length === 0) { 
      toast.error('No file selected');
      return;
    }
    const form = new FormData();
    form.append('license', files[0]);
    const toastId = toast.loading('Uploading license...');
    try {
      const res = await fetch(`${API_BASE_URL}/activation`, { method: 'POST', body: form, credentials: 'include' });
      if (res.ok) {
        toast.success('License uploaded and activated', { id: toastId });
        fileRef.current!.value = '';
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(`Activation failed: ${err.reason || err.error || res.status}`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(`Upload error: ${err.message || err}`, { id: toastId });
    }
  }

  return (
    <Container className="py-5">
      <h3>Application Activation</h3>

      <div className="mb-4">
        <label className="form-label">Machine ID</label>
        <InputGroup>
          <Form.Control readOnly value={machineId} />
          <Button variant="outline-secondary" onClick={copyToClipboard}>Copy</Button>
        </InputGroup>
        <div className="form-text">Provide this Machine ID to the vendor to generate a license file.</div>
      </div>

      <Form onSubmit={uploadLicense}>
        <Form.Group controlId="licenseFile" className="mb-3">
          <Form.Label>Upload activation.lic</Form.Label>
          <Form.Control type="file" accept=".lic,.json,text/plain" ref={fileRef} />
        </Form.Group>
        <Button type="submit">Upload & Activate</Button>
      </Form>
    </Container>
  );
}
