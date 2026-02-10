
import queryString from "query-string";

export const parseURLQuery = (
  search: string,
  location?: any
): string | string[] => {
  // Use @reach/router to retrieve the `query` (?query=123) from the client's URL.
  // Parse out `flow`, which is used to verify the client has actually started the flow.
  const params = queryString.parse((location && location.search) || "");
  const result = params[search] as string | string[];
  return result;
};
