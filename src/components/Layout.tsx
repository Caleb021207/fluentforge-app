
import { ReactNode } from "react";
import NewLayout from "./layout/NewLayout";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <NewLayout>{children}</NewLayout>;
};

export default Layout;
