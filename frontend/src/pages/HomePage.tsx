import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { catalogFeature, getCatalogPage, type CatalogPageData } from "@/features/catalog";
import { useAuthStore } from "@/features/auth/auth.store";
import { ProductCard } from "@/shared/components/product/ProductCard";

const categories = ["Celulares", "Games", "Informática", "Casa", "Áudio", "Acessórios"];

function HomeSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-3/5" />
          <Skeleton className="h-5 w-4/5" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const sessionToken = useAuthStore((state) => state.session?.token ?? null);
  const [pageData, setPageData] = useState<CatalogPageData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(sessionToken));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!sessionToken) {
        setPageData(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getCatalogPage(1, 8, sessionToken);
        if (!active) {
          return;
        }

        setPageData(data);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar a vitrine.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [sessionToken]);

  const featuredProducts = useMemo(() => pageData?.items.slice(0, 4) ?? [], [pageData]);

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-spanish-green-200 bg-[radial-gradient(circle_at_top_right,_rgba(108,127,101,0.16),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(243,246,244,0.94))]">
          <CardHeader className="gap-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">Oferta da semana</Badge>
              <Badge variant="success">Compra rápida</Badge>
              <Badge variant="info">SPA comercial</Badge>
            </div>
            <CardTitle className="max-w-3xl text-4xl leading-tight sm:text-5xl">
              Tudo para comprar mais rápido, comparar melhor e finalizar sem atrito.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base">
              A home apresenta a vitrine principal, atalhos de navegação e os produtos em destaque que já
              existem na API, sem exigir reescrita de backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => navigate(catalogFeature.routes.list)}>Ver catálogo</Button>
            <Button variant="outline" onClick={() => navigate("/login")}>Entrar na conta</Button>
          </CardContent>
        </Card>

        <Card className="border-spanish-green-200 bg-spanish-green-900 text-spanish-green-50">
          <CardHeader>
            <Badge variant="neutral" className="bg-white/10 text-white ring-white/15">
              Destaques
            </Badge>
            <CardTitle className="text-white">Benefícios da experiência comercial</CardTitle>
            <CardDescription className="text-spanish-green-100">
              Busca visível, cartão de produto claro e navegação pronta para mobile.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              "Busca central e atalhos fixos no topo.",
              "Carrinho e pedidos sempre acessíveis no mobile.",
              "Fluxos protegidos preservando os contratos atuais.",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm leading-6 text-spanish-green-50">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Card key={category} className="bg-white">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-spanish-green-500">Categoria</p>
                <p className="mt-1 text-base font-semibold text-spanish-green-950">{category}</p>
              </div>
              <Badge variant="neutral">Explorar</Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      {error ? (
        <EmptyState
          tone="error"
          title="Não foi possível carregar a vitrine"
          description={error}
          action={{ label: "Ir para o catálogo", onClick: () => navigate(catalogFeature.routes.list), variant: "secondary" }}
        />
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-spanish-green-500">Produtos em destaque</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-spanish-green-950">Vitrine pronta para compra</h2>
          </div>
          <Button variant="outline" onClick={() => navigate(catalogFeature.routes.list)}>Ver todos os produtos</Button>
        </div>

        {featuredProducts.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} to={catalogFeature.routes.detail(product.id)} ctaLabel="Comprar" />
            ))}
          </div>
        ) : (
          <Card className="bg-white">
            <CardContent className="p-6">
              <p className="text-sm leading-6 text-spanish-green-700">
                Faça login para ver os produtos em destaque vindos da API e acessar os fluxos protegidos.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
