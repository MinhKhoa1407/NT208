export type DOIStatus =
  | "valid"
  | "invalid"
  | "retracted";

export type DOIResult = {
  doi: string;

  title?: string;

  status: DOIStatus;
};

