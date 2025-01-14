declare namespace Express {
  export interface Request {
    user?: {
      date_created: NativeDate;
      address?: string | null | undefined;
      api_key?: string | null | undefined;
    };
  }
}
