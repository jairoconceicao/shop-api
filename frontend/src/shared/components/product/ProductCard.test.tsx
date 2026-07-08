import { MemoryRouter } from "react-router-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductCard } from "./ProductCard";

const product = {
  id: 42,
  title: "Notebook Gamer",
  imageUrl: "https://example.com/notebook.jpg",
  price: 2999.9,
  stock: 3,
};

describe("ProductCard", () => {
  it("renders an accessible commercial link", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ProductCard product={product} to="/products/42" />
      </MemoryRouter>,
    );

    expect(html).toContain('aria-label="Notebook Gamer por');
    expect(html).toContain('Abrir detalhes do produto."');
    expect(html).toContain("Frete grátis");
    expect(html).toContain("Últimas unidades");
  });
});
