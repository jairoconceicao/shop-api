#!/usr/bin/env python3
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional


DONE_STATUSES = {
    "done",
    "completed",
    "complete",
    "concluido",
    "concluído",
    "finalizado",
    "implementado",
    "implemented",
}

PENDING_STATUSES = {
    "pending",
    "todo",
    "open",
    "pendente",
    "não iniciado",
    "nao iniciado",
    "backlog",
    "to do",
}


CHECKBOX_PATTERN = re.compile(
    r"^\[(?P<mark>[ xX])\]\s+(?P<id>TASK[-_ ]?(?P<number>\d+))\s*[:\-–—]\s*(?P<title>.+)$",
    re.IGNORECASE,
)

SECTION_HEADER_PATTERN = re.compile(
    r"^#{2,6}\s+(?P<id>TASK[-_ ]?(?P<number>\d+))\s*[:\-–—]\s*(?P<title>.+)$",
    re.IGNORECASE,
)

STATUS_PATTERN = re.compile(
    r"^Status:\s*(?P<status>.+)$",
    re.IGNORECASE,
)


@dataclass
class Task:
    id: str
    number: int
    title: str
    status: str
    content: str


def normalize_task_id(raw_id: str, number: int) -> str:
    return f"TASK-{number:03d}"


def normalize_status(status: Optional[str]) -> str:
    if not status:
        return "pending"

    return status.strip().lower()


def is_done_status(status: str) -> bool:
    return normalize_status(status) in DONE_STATUSES


def is_pending_status(status: str) -> bool:
    normalized = normalize_status(status)

    if normalized in DONE_STATUSES:
        return False

    if normalized in PENDING_STATUSES:
        return True

    # Status desconhecido será tratado como pendente para evitar perder tarefa.
    return True


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_checkbox_tasks(backlog_path: Path) -> List[Task]:
    tasks: List[Task] = []

    for line in read_text(backlog_path).splitlines():
        match = CHECKBOX_PATTERN.match(line.strip())

        if not match:
            continue

        mark = match.group("mark")
        number = int(match.group("number"))
        title = match.group("title").strip()
        task_id = normalize_task_id(match.group("id"), number)

        status = "done" if mark.lower() == "x" else "pending"

        tasks.append(
            Task(
                id=task_id,
                number=number,
                title=title,
                status=status,
                content=line.strip(),
            )
        )
    
    return tasks


def parse_section_tasks(backlog_path: Path) -> List[Task]:
    lines = read_text(backlog_path).splitlines()

    tasks: List[Task] = []
    current_header: Optional[re.Match] = None
    current_lines: List[str] = []

    def flush_current() -> None:
        nonlocal current_header, current_lines

        if not current_header:
            return

        number = int(current_header.group("number"))
        task_id = normalize_task_id(current_header.group("id"), number)
        title = current_header.group("title").strip()

        status = "pending"

        for line in current_lines:
            status_match = STATUS_PATTERN.match(line.strip())
            if status_match:
                status = normalize_status(status_match.group("status"))
                break

        tasks.append(
            Task(
                id=task_id,
                number=number,
                title=title,
                status=status,
                content="\n".join(current_lines).strip(),
            )
        )

    for line in lines:
        header_match = SECTION_HEADER_PATTERN.match(line)

        if header_match:
            flush_current()
            current_header = header_match
            current_lines = [line]
        elif current_header:
            current_lines.append(line)

    flush_current()

    return tasks


def parse_backlog(backlog_path: Path) -> List[Task]:
    """
    Tenta primeiro o formato com seções:

        ## TASK-001 - Título
        Status: Pending

    Se não encontrar, tenta formato checkbox:

        - [ ] TASK-001: Título
        - [x] TASK-002: Título
    """
    section_tasks = parse_section_tasks(backlog_path)

    if section_tasks:
        return section_tasks

    return parse_checkbox_tasks(backlog_path)


def filter_pending_tasks(
    tasks: List[Task],
    start_task: Optional[int],
    end_task: Optional[int],
    limit: Optional[int],
) -> List[Task]:
    filtered = [task for task in tasks if is_pending_status(task.status)]

    if start_task is not None:
        filtered = [task for task in filtered if task.number >= start_task]

    if end_task is not None:
        filtered = [task for task in filtered if task.number <= end_task]

    filtered.sort(key=lambda task: task.number)

    if limit is not None:
        filtered = filtered[:limit]

    return filtered


def run_command(
    command: List[str],
    cwd: Path,
    log_file: Optional[Path] = None,
    env: Optional[dict] = None,
    allow_failure: bool = False,
) -> int:
    print(f"\n$ {' '.join(command)}")

    process = subprocess.Popen(
        command,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env,
    )

    assert process.stdout is not None

    with (log_file.open("a", encoding="utf-8") if log_file else open(os.devnull, "w")) as log:
        for line in process.stdout:
            print(line, end="")
            log.write(line)

    return_code = process.wait()

    if return_code != 0 and not allow_failure:
        raise RuntimeError(f"Comando falhou com exit code {return_code}: {' '.join(command)}")

    return return_code


def capture_command(command: List[str], cwd: Path) -> str:
    result = subprocess.run(
        command,
        cwd=str(cwd),
        text=True,
        encoding="utf-8",
        errors="replace",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"Comando falhou: {' '.join(command)}\n"
            f"STDOUT:\n{result.stdout}\n"
            f"STDERR:\n{result.stderr}"
        )

    return result.stdout.strip()


def ensure_tool_exists(tool_name: str) -> None:
    if shutil.which(tool_name) is None:
        raise RuntimeError(f"Ferramenta não encontrada no PATH: {tool_name}")


def ensure_git_clean(repo_dir: Path) -> None:
    status = capture_command(["git", "status", "--porcelain"], repo_dir)

    if status:
        raise RuntimeError(
            "O repositório possui mudanças não commitadas.\n"
            "Faça commit, stash ou descarte as alterações antes de iniciar."
        )


def git_current_branch(repo_dir: Path) -> str:
    return capture_command(["git", "branch", "--show-current"], repo_dir)


def git_has_changes(repo_dir: Path) -> bool:
    status = capture_command(["git", "status", "--porcelain"], repo_dir)
    return bool(status)


def build_prompt(task: Task, backlog_file: Path, validation_commands: List[str]) -> str:
    validations_text = "\n".join(f"- {cmd}" for cmd in validation_commands) or "- Não informado"

    return f"""
Você está trabalhando em uma tarefa isolada do projeto.

Tarefa atual:
{task.id} - {task.title}

Conteúdo da tarefa no backlog:
---
{task.content}
---

Arquivo de backlog:
{backlog_file}

Regras obrigatórias:
- Crie um novo contexto para esta tarefa.
- Implemente somente a tarefa {task.id}.
- Não implemente tarefas futuras.
- Respeite a arquitetura existente do projeto.
- Mantenha alterações pequenas e coesas.
- Atualize ou crie testes quando necessário.
- Atualize o arquivo de backlog marcando a tarefa {task.id} como concluída.
- Não crie commit. O commit será feito pelo script orquestrador.
- Não faça alterações cosméticas fora do escopo.

Comandos de validação esperados:
{validations_text}

Ao final, responda resumidamente:
1. Arquivos alterados
2. Testes criados ou atualizados
3. Validações executadas ou recomendadas
4. Riscos, pendências ou observações
""".strip()


def detect_validation_commands(repo_dir: Path) -> List[str]:
    commands: List[str] = []

    if (repo_dir / "package.json").exists():
        commands.append("npm test")
        commands.append("npm run build")

    if list(repo_dir.glob("*.sln")):
        commands.append("dotnet build")
        commands.append("dotnet test")

    if (repo_dir / "pom.xml").exists():
        commands.append("mvn test")

    if (repo_dir / "build.gradle").exists() or (repo_dir / "build.gradle.kts").exists():
        gradlew = "gradlew.bat" if os.name == "nt" else "./gradlew"
        commands.append(f"{gradlew} test")

    if (repo_dir / "go.mod").exists():
        commands.append("go test ./...")

    if (repo_dir / "pyproject.toml").exists():
        commands.append("python -m pytest")

    return commands


def split_shell_command(command: str) -> List[str]:
    """
    Mantém compatibilidade simples entre Windows e Unix.

    Para comandos compostos, prefira passar explicitamente:
      --validate-cmd "dotnet build"
      --validate-cmd "dotnet test"
    """

    if os.name == "nt":
        return ["powershell", "-NoProfile", "-Command", command]

    return ["bash", "-lc", command]


def run_validations(repo_dir: Path, commands: List[str], log_file: Path) -> None:
    if not commands:
        print("Nenhum comando de validação configurado/detectado.")
        return

    for command in commands:
        run_command(split_shell_command(command), cwd=repo_dir, log_file=log_file)


def run_codex(
    repo_dir: Path,
    task: Task,
    prompt: str,
    logs_dir: Path,
    codex_bin: str,
    sandbox: str,
    approval_policy: str,
    model: Optional[str],
    profile: Optional[str],
    use_json: bool,
    ephemeral: bool,
) -> None:
    prompt_file = logs_dir / f"{task.id}.prompt.md"
    output_file = logs_dir / f"{task.id}.codex.log"

    prompt_file.write_text(prompt, encoding="utf-8")

    command = [
        f"{codex_bin} -a {approval_policy}",
        "exec",
        "--cd",
        str(repo_dir),
        "--sandbox",
        sandbox,
    ]

    if use_json:
        command.append("--json")

    if ephemeral:
        command.append("--ephemeral")

    if model:
        command.extend(["--model", model])

    if profile:
        command.extend(["--profile", profile])

    command.append(prompt)

    run_command(command, cwd=repo_dir, log_file=output_file)


def create_branch(repo_dir: Path, branch_name: str) -> None:
    run_command(["git", "checkout", "-b", branch_name], cwd=repo_dir)


def checkout_branch(repo_dir: Path, branch_name: str) -> None:
    run_command(["git", "checkout", branch_name], cwd=repo_dir)


def delete_branch(repo_dir: Path, branch_name: str) -> None:
    run_command(["git", "branch", "-d", branch_name], cwd=repo_dir)


def create_commit(repo_dir: Path, message: str) -> None:
    run_command(["git", "add", "."], cwd=repo_dir)
    run_command(["git", "commit", "-m", message], cwd=repo_dir)


def merge_branch(repo_dir: Path, branch_name: str, task_id: str) -> None:
    run_command(
        ["git", "merge", "--no-ff", branch_name, "-m", f"merge: integrar {task_id}"],
        cwd=repo_dir,
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Orquestrador Python para executar tasks Markdown com Codex CLI."
    )

    parser.add_argument("--repo", required=True, help="Diretório do repositório.")
    parser.add_argument("--backlog", default="BACKLOG.md", help="Arquivo Markdown de backlog.")

    parser.add_argument("--from-task", type=int, default=None, help="Número inicial da task.")
    parser.add_argument("--to-task", type=int, default=None, help="Número final da task.")
    parser.add_argument("--limit", type=int, default=None, help="Quantidade máxima de tasks.")

    parser.add_argument("--base-branch", default="main", help="Branch base.")
    parser.add_argument("--branch-prefix", default="codex", help="Prefixo das branches.")

    parser.add_argument("--codex-bin", default="codex", help="Binário do Codex CLI.")
    parser.add_argument("--sandbox", default="workspace-write", choices=["read-only", "workspace-write", "danger-full-access"])
    parser.add_argument("--approval-policy", default="never", choices=["untrusted", "on-request", "never"])
    parser.add_argument("--model", default=None, help="Modelo a ser usado pelo Codex CLI.")
    parser.add_argument("--profile", default=None, help="Profile do Codex CLI.")

    parser.add_argument("--no-json", action="store_true", help="Não usar saída JSONL do Codex.")
    parser.add_argument("--no-ephemeral", action="store_true", help="Persistir sessão do Codex.")

    parser.add_argument("--validate-cmd", action="append", default=[], help="Comando de validação. Pode repetir.")
    parser.add_argument("--skip-validations", action="store_true", help="Não rodar validações.")
    parser.add_argument("--dry-run", action="store_true", help="Apenas listar tasks pendentes.")
    parser.add_argument("--no-commit", action="store_true", help="Não criar commit.")
    parser.add_argument("--no-merge", action="store_true", help="Não fazer merge para a branch base.")
    parser.add_argument("--keep-branches", action="store_true", help="Não remover branches após merge.")

    args = parser.parse_args()

    repo_dir = Path(args.repo).resolve()
    backlog_file = (repo_dir / args.backlog).resolve()
    logs_dir = repo_dir / ".codex-runs"

    logs_dir.mkdir(parents=True, exist_ok=True)

    if not repo_dir.exists():
        raise RuntimeError(f"Repositório não encontrado: {repo_dir}")

    if not backlog_file.exists():
        raise RuntimeError(f"Backlog não encontrado: {backlog_file}")

    ensure_tool_exists("git")
    ensure_tool_exists(args.codex_bin)

    tasks = parse_backlog(backlog_file)
    pending_tasks = filter_pending_tasks(
        tasks=tasks,
        start_task=args.from_task,
        end_task=args.to_task,
        limit=args.limit,
    )

    if not pending_tasks:
        print("Nenhuma task pendente encontrada para os filtros informados.")
        return 0

    print("Tasks pendentes encontradas:")
    for task in pending_tasks:
        print(f"- {task.id}: {task.title} [{task.status}]")

    if args.dry_run:
        return 0

    ensure_git_clean(repo_dir)

    original_branch = git_current_branch(repo_dir)

    if original_branch != args.base_branch:
        checkout_branch(repo_dir, args.base_branch)

    validations = args.validate_cmd or detect_validation_commands(repo_dir)

    for task in pending_tasks:
        branch_name = f"{args.branch_prefix}/{task.id.lower()}"

        print("\n" + "=" * 80)
        print(f"Executando {task.id}: {task.title}")
        print("=" * 80)

        ensure_git_clean(repo_dir)

        checkout_branch(repo_dir, args.base_branch)
        create_branch(repo_dir, branch_name)

        task_log_file = logs_dir / f"{task.id}.validation.log"

        prompt = build_prompt(
            task=task,
            backlog_file=backlog_file,
            validation_commands=validations,
        )

        try:
            run_codex(
                repo_dir=repo_dir,
                task=task,
                prompt=prompt,
                logs_dir=logs_dir,
                codex_bin=args.codex_bin,
                sandbox=args.sandbox,
                approval_policy=args.approval_policy,
                model=args.model,
                profile=args.profile,
                use_json=not args.no_json,
                ephemeral=not args.no_ephemeral,
            )

            if not args.skip_validations:
                run_validations(repo_dir, validations, task_log_file)

            if not git_has_changes(repo_dir):
                print(f"Nenhuma alteração detectada para {task.id}.")
                checkout_branch(repo_dir, args.base_branch)
                continue

            if not args.no_commit:
                create_commit(
                    repo_dir,
                    f"feat({task.id}): implementar tarefa do backlog",
                )

            if not args.no_merge:
                checkout_branch(repo_dir, args.base_branch)
                merge_branch(repo_dir, branch_name, task.id)

                if not args.keep_branches:
                    delete_branch(repo_dir, branch_name)

            print(f"{task.id} concluída com sucesso.")

        except Exception as error:
            print(f"\nErro ao executar {task.id}: {error}", file=sys.stderr)
            print("A branch da task foi preservada para investigação.")
            return 1

    checkout_branch(repo_dir, args.base_branch)

    print("\nBloco de tasks concluído.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nExecução interrompida pelo usuário.", file=sys.stderr)
        raise SystemExit(130)