# Contribuindo com o ByteBank

## Fluxo de branches

- `main` — produção, nunca commitar direto
- `develop` — branch de integração, nunca commitar direto
- `feat/nome-da-feature` — branch de desenvolvimento

### Exemplo

```bash
git checkout develop
git checkout -b feat/home-page
```

## Padrão de commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

| Tipo       | Quando usar                       |
| ---------- | --------------------------------- |
| `feat`     | Nova funcionalidade               |
| `fix`      | Correção de bug                   |
| `style`    | Formatação, sem mudança de lógica |
| `refactor` | Refatoração de código             |
| `chore`    | Configurações, dependências       |
| `docs`     | Documentação                      |

### Exemplos

```bash
git commit -m "feat: add transaction list page"
git commit -m "fix: correct balance calculation"
git commit -m "docs: update README"
```

## Pull Requests

- Sempre abra PR de `feat/*` → `develop`
- Nunca abra PR direto pra `main`
