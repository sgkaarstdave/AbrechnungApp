export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      trainers: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "trainer" | "admin";
          rate_per_hour: string;
          iban: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["trainers"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["trainers"]["Row"]>;
      };
    };
    Views: never;
    Functions: never;
    Enums: {
      role: "trainer" | "admin";
    };
  };
}
