import { LeadStatus, LeadSource } from '@/types'

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'Novo', [LeadStatus.CONTACTED]: 'Contatado',
  [LeadStatus.QUALIFIED]: 'Qualificado', [LeadStatus.PROPOSAL]: 'Proposta',
  [LeadStatus.NEGOTIATION]: 'Negociacao', [LeadStatus.WON]: 'Ganho',
  [LeadStatus.LOST]: 'Perdido', [LeadStatus.INACTIVE]: 'Inativo'
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-blue-100 text-blue-800',
  [LeadStatus.CONTACTED]: 'bg-yellow-100 text-yellow-800',
  [LeadStatus.QUALIFIED]: 'bg-green-100 text-green-800',
  [LeadStatus.PROPOSAL]: 'bg-purple-100 text-purple-800',
  [LeadStatus.NEGOTIATION]: 'bg-orange-100 text-orange-800',
  [LeadStatus.WON]: 'bg-emerald-100 text-emerald-800',
  [LeadStatus.LOST]: 'bg-red-100 text-red-800',
  [LeadStatus.INACTIVE]: 'bg-gray-100 text-gray-800'
}

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  [LeadSource.MANUAL]: 'Manual', [LeadSource.WHATSAPP]: 'WhatsApp',
  [LeadSource.WEBSITE]: 'Website', [LeadSource.FACEBOOK]: 'Facebook',
  [LeadSource.GOOGLE]: 'Google', [LeadSource.REFERRAL]: 'Indicacao',
  [LeadSource.IMPORT]: 'Importacao', [LeadSource.OTHER]: 'Outro'
}
