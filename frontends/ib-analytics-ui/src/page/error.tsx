import React from "react";

interface ErrorState {
  loading: boolean;
  error: any | null;
}

export class Error extends React.Component<any, ErrorState> {
  constructor(props: any) {
    super(props);
    this.state = {
      loading: false,
      error: "An unexpected error occurred.",
    };
  }

  render() {
    const { error } = this.state;

    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>{typeof error === 'string' ? error : 'An unexpected error occurred.'}</p>
        <button onClick={() => window.location.href = '/'}>Go Home</button>
      </div>
    );
  }
}

export default Error;
