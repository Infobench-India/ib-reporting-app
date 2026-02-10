import { FlowMethodConfig } from "@ory/kratos-client";
export interface AuthPageState {
    /**
     * HTML `<Form>` configuration as dictated by the Kratos instance.
     *
     * This value will entirely depend on the format of your `identity.schema.json`.
     */
    authFormConfig?: FlowMethodConfig;
    authFormFieldValue?: {
        [key: string]: string;
    };
    errorMessage?: string;
}
export declare const assertResponse: (res: any) => 0 | 1;
