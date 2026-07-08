import { describe, expect, it } from "vitest";
import { router } from "./router";

type RouteNode = {
  path?: string;
  children?: RouteNode[];
  element?: { props?: { to?: string } };
};

function collectRoutes(nodes: RouteNode[] | undefined): RouteNode[] {
  if (!nodes) {
    return [];
  }

  return nodes.flatMap((node) => [node, ...collectRoutes(node.children)]);
}

const routes = collectRoutes(router.routes as unknown as RouteNode[]);

function routeByPath(path: string) {
  return routes.find((route) => route.path === path);
}

describe("router migration aliases", () => {
  it("redirects legacy routes to the commercial paths", () => {
    expect(routeByPath("catalogo")?.element?.props?.to).toBe("/products");
    expect(routeByPath("produto/:id")?.element?.props?.to).toBe("/products/:id");
    expect(routeByPath("carrinho")?.element?.props?.to).toBe("/cart");
    expect(routeByPath("cliente")?.element?.props?.to).toBe("/account/profile");
    expect(routeByPath("pedidos")?.element?.props?.to).toBe("/account/orders");
    expect(routeByPath("pedidos/:id")?.element?.props?.to).toBe("/account/orders/:id");
  });

  it("keeps the new routes mounted for the redesign flows", () => {
    [
      "login",
      "products",
      "products/:id",
      "cart",
      "checkout",
      "account",
      "account/profile",
      "account/orders",
      "account/orders/:id",
      "account/password",
    ].forEach((path) => {
      expect(routeByPath(path), path).toBeDefined();
    });
  });
});
