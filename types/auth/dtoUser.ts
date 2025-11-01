export interface dtoUserInfor {
  id: string | bigint;
  code: string;
  userName: string;
  password?: string;
  role?: "STUDENT" | "VERIFIER" | "GUEST";
}
