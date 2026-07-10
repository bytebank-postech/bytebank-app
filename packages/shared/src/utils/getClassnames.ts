export function getClassnames(
  ...args: Array<string | undefined | boolean | null>
) {
  return args.filter(Boolean).join(' ')
}
