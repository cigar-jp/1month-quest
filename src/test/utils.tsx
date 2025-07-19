import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { AuthProvider } from "@/contexts/auth-context";

// テスト用のカスタムレンダー
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };