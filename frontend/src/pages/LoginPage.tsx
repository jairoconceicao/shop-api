import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { CardStack } from "@/shared/components/ui/Card";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";

export function LoginPage() {
  return (
    <CardStack
      className="mx-auto w-full max-w-2xl"
      eyebrow={<Badge variant="info">Fase 3</Badge>}
      title="Login"
      description="A autenticação entra na próxima fase, mas o formulário já usa os componentes base."
      footer={
        <>
          <Button variant="secondary" type="button">
            Esqueci minha senha
          </Button>
          <Button type="button">Entrar</Button>
        </>
      }
    >
      <form className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="E-mail" type="email" placeholder="voce@exemplo.com" hint="Use o mesmo e-mail do cadastro." />
          <Select label="Acesso" defaultValue="cliente">
            <option value="cliente">Cliente</option>
            <option value="admin">Administração</option>
          </Select>
        </div>
        <Input label="Senha" type="password" placeholder="••••••••" />
        <Checkbox label="Manter minha sessão ativa" hint="Persistência será ativada quando a fase 3 entrar." />
        <p className="text-sm leading-6 text-spanish-green-700">
          Quando a autenticação estiver ativa, este formulário consumirá Zod, Zustand e o client HTTP da API.
        </p>
      </form>
    </CardStack>
  );
}
