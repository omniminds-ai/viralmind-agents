export interface GenericModelMessage {
  role?: string;
  content: any;
  tool_call_id?: string;
  tool_use_id?: string;
}
