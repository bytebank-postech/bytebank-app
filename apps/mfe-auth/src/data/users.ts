const USERS = [
  {
    id: '1',
    name: 'Usuário ByteBank',
    email: 'usuario@bytebank.com',
    password: 'senha123',
  },
]

export function findUserByEmailAndPassword(email?: string, password?: string) {
  return USERS.find(
    (candidate) => candidate.email === email && candidate.password === password
  )
}
