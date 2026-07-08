import { ComponentType } from "react";

export type Page =
  | "home"
  | "services"
  | "jobs"
  | "about"
  | "upload-cv"
  | "hire-talent"
  | "consultation"
  | "contact"
  | "admin";

export interface ServiceItem {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}
