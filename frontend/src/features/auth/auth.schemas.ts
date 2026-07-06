import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail.").email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha.").min(6, "A senha precisa ter pelo menos 6 caracteres."),
  rememberSession: z.boolean().default(true),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
