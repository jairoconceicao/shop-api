import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("announces errors assertively", () => {
    const html = renderToStaticMarkup(
      <EmptyState
        tone="error"
        title="Falha ao carregar"
        description="Tente novamente em instantes."
        action={{ label: "Recarregar", onClick: () => {} }}
      />,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="assertive"');
    expect(html).toContain("Recarregar");
  });

  it("keeps empty states polite", () => {
    const html = renderToStaticMarkup(
      <EmptyState title="Sem itens" description="A vitrine está vazia no momento." />,
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
  });
});
