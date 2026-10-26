import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Reproduce the deployment environment without Supabase build variables.
vi.stubEnv("VITE_SUPABASE_URL", "");
vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
const { default: App } = await import("@/App");

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("startup without backend configuration", () => {
  it("renders the public site instead of failing during module initialization", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /إرسال الطلب/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "info@connectsys.cloud" })).toBeInTheDocument();
  });

  it("shows an unavailable message when signing in, without hanging or granting access", async () => {
    window.history.replaceState({}, "", "/admin/login");
    render(<App />);
    fireEvent.change(await screen.findByLabelText("البريد الإلكتروني"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText("كلمة المرور"), {
      target: { value: "test-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "تسجيل الدخول" }));
    expect(await screen.findByText("خدمة تسجيل الدخول غير متاحة حالياً")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/admin/login");
  });
});
