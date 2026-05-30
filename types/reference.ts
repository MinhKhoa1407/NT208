export type ReferenceResult = {
  reference: string;

  doi?: string;

  title?: string;

  status:
    | "valid"
    | "invalid"
    | "retracted"
    | "not_found"
    | "lookup_failed";
};

