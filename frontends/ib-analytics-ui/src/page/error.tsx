import React from "react";

import { AuthPublicAPI } from "../services";
import { parseURLQuery } from "../util";
import { FrontendApiGetFlowErrorRequest } from "@ory/client";

interface ErrorState {
  loading: boolean;
  error: any | null;
}

export class Error extends React.Component<any, ErrorState> {
  constructor(props: any) {
    super(props);
    this.state = {
      loading: true,
      error: null,
    };
  }

  async componentDidMount() {
    try {
      const query = parseURLQuery("id", this.props.location) as string;


      const queryString: FrontendApiGetFlowErrorRequest = {
        id: query,
      };

      const res = await AuthPublicAPI.getFlowError(queryString);
      this.setState({ loading: false, error: res });
    } catch (err) {
      console.error("Error fetching data:", err);
      this.setState({ loading: false, error: "Error fetching data" });
    }
  }

  render() {
    const { loading, error } = this.state;

    if (loading) {
      return <p>Loading...</p>;
    }

    return <p>{JSON.stringify(error)}</p>;
  }
}
