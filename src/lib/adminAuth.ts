import jwt from 'jsonwebtoken'

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded.role === 'admin'
  } catch {
    return false
  }
}

export function getAdminFromToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
  } catch {
    return null
  }
}