export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const isValidPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 11
}

export const isStrongPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) return { valid: false, message: 'Minimo 8 caracteres' }
  if (!/[A-Za-z]/.test(password)) return { valid: false, message: 'Deve conter letra' }
  if (!/\d/.test(password)) return { valid: false, message: 'Deve conter numero' }
  return { valid: true }
}
