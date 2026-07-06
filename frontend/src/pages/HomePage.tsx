import { useState } from "react";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { CardStack } from "@/shared/components/ui/Card";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Input } from "@/shared/components/ui/Input";
import { Modal } from "@/shared/components/ui/Modal";
import { Pagination } from "@/shared/components/ui/Pagination";
import { Select } from "@/shared/components/ui/Select";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { Stepper } from "@/shared/components/ui/Stepper";
import { toast } from "@/shared/components/ui/Toast";

const highlights = [
  "Componentes base com estados e acessibilidade",
  "API visual consistente para forms e feedback",
  "Padrões de foco e contraste já aplicados",
  "SPA pronta para autenticação e catálogo",
];

const steps = [
  { title: "Base", description: "Tailwind, router e integração local consolidados." },
  { title: "Design system", description: "Botões, campos, cards, feedback e navegação." },
  { title: "Auth", description: "Sessão e login entram na próxima fase." },
  { title: "Catálogo", description: "Listagem, detalhe e filtro virão em seguida." },
] as const;

export function HomePage() {
  const [currentPage, setCurrentPage] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <CardStack
          eyebrow={
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Fase 2</Badge>
              <Badge variant="info">Design system</Badge>
              <Badge variant="neutral">React + Tailwind v4</Badge>
            </div>
          }
          title="Componentes reutilizáveis prontos para o e-commerce."
          description="A base visual agora tem botões, campos, cards, feedback, paginação, modal e stepper com foco em consistência, acessibilidade e uso em desktop e mobile."
          footer={
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast.success("Toast funcionando", "Mensagem gerada a partir do design system.")}>Disparar toast</Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                Abrir modal
              </Button>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-spanish-green-200 bg-spanish-green-50/70 p-4">
                <p className="text-sm font-medium text-spanish-green-900">{item}</p>
              </div>
            ))}
          </div>
        </CardStack>

        <CardStack
          eyebrow={<Badge variant="neutral" className="bg-white/10 text-white ring-white/15">Base técnica</Badge>}
          title="Princípios aplicados"
          description="Foco visível, contraste forte, feedback imediato e layouts fluidos já fazem parte da linguagem do app."
          className="bg-spanish-green-900 text-spanish-green-50 shadow-lg shadow-spanish-green-950/10"
        >
          <div className="space-y-4">
            {[
              "Foco visível",
              "Contraste forte",
              "Feedback imediato",
              "Layouts fluidos",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="size-2 rounded-full bg-spanish-green-300" />
                <span className="text-sm text-spanish-green-100">{item}</span>
              </div>
            ))}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">Estado de carregamento</p>
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-white/15" />
                <Skeleton className="h-4 w-2/3 bg-white/15" />
                <Skeleton className="h-24 w-full bg-white/15" />
              </div>
            </div>
          </div>
        </CardStack>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <CardStack
          eyebrow={<Badge variant="info">Campos</Badge>}
          title="Controles base"
          description="Os campos já nascem com label, mensagem auxiliar, erro e sucesso."
          footer={
            <Button variant="ghost" size="sm" onClick={() => toast.info("Campos prontos", "Inputs e selects já estão disponíveis.")}>Testar feedback</Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="E-mail" type="email" placeholder="voce@exemplo.com" hint="Usado no login e cadastro." />
            <Select label="Categoria" defaultValue="eletronicos" hint="Exemplo de select estilizado.">
              <option value="eletronicos">Eletrônicos</option>
              <option value="informatica">Informática</option>
              <option value="casa">Casa</option>
            </Select>
            <Input label="CEP com erro" defaultValue="00000-000" error="CEP inválido." />
            <Checkbox label="Aceito receber atualizações" hint="Controle com label clicável e foco visível." />
          </div>
        </CardStack>

        <CardStack
          eyebrow={<Badge variant="warning">Feedback</Badge>}
          title="Estados visuais"
          description="Empty state, erro e sucesso compartilham linguagem visual consistente."
        >
          <div className="grid gap-4">
            <EmptyState
              tone="empty"
              title="Sem produtos no momento"
              description="Quando o catálogo não tiver itens, esta superfície mantém o usuário orientado."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <EmptyState
                tone="error"
                title="Falha ao carregar"
                description="Tente novamente após verificar a conexão."
                action={{
                  label: "Recarregar",
                  onClick: () => toast.warning("Ação simulada", "Recarregue a tela quando o backend estiver disponível."),
                }}
              />
              <EmptyState
                tone="success"
                title="Tudo certo"
                description="Usado para confirmações e conclusões de fluxo."
                action={{ label: "Ver exemplo", onClick: () => setIsModalOpen(true), variant: "secondary" }}
              />
            </div>
          </div>
        </CardStack>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <CardStack
          eyebrow={<Badge variant="neutral">Fluxo</Badge>}
          title="Stepper e paginação"
          description="Componentes de navegação e progresso usados em checkout, catálogo e pedidos."
        >
          <div className="space-y-6">
            <Stepper steps={steps} currentStep={1} />
            <Pagination currentPage={currentPage} totalPages={8} onPageChange={setCurrentPage} />
          </div>
        </CardStack>

        <CardStack
          eyebrow={<Badge variant="danger">Modal</Badge>}
          title="Sobreposição de contexto"
          description="O modal fecha com Escape e clique fora, sem depender de bibliotecas externas."
          footer={
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
              Abrir demonstração
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Escapa",
              "Backdrop",
              "Portal",
              "Acessível",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-spanish-green-200 bg-spanish-green-50/70 p-4">
                <p className="text-sm font-medium text-spanish-green-900">{item}</p>
              </div>
            ))}
          </div>
        </CardStack>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
        <CardStack
          eyebrow={<Badge variant="neutral">Resumo</Badge>}
          title="Ordem da entrega"
          description="A fase 2 deixa o app pronto para autenticação e fluxos de negócio."
        >
          <Stepper steps={steps} currentStep={1} />
        </CardStack>

        <CardStack
          eyebrow={<Badge variant="success">Status</Badge>}
          title="Preparado para a fase 3"
          description="A camada visual já entrega o alicerce que login, catálogo, carrinho e checkout precisam."
        >
          <div className="space-y-3 text-sm leading-6 text-spanish-green-700">
            <p>• Controles reutilizáveis já publicados em shared/components/ui.</p>
            <p>• Feedback visual padronizado para loading, vazio, erro e sucesso.</p>
            <p>• Layout responsivo com estados de foco consistentes.</p>
          </div>
        </CardStack>
      </div>

      <Modal
        open={isModalOpen}
        title="Demonstração do modal"
        description="Esse componente já está pronto para confirmação, detalhes de produto e formulários auxiliares."
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                toast.success("Modal confirmado", "O fluxo de demonstração foi concluído.");
                setIsModalOpen(false);
              }}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-spanish-green-700">
            Este modal usa portal, bloqueio de scroll e fechamento por Escape. Ele serve como base para confirmações de carrinho, filtros e ações críticas.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Overlay",
              "Keyboard",
              "Focus",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-spanish-green-200 bg-spanish-green-50 p-4 text-sm font-medium text-spanish-green-900">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
