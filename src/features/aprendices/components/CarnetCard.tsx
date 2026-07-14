import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import type { Aprendice } from '@/types'

interface CarnetCardProps {
  aprendiz: Aprendice
  onReady?: () => void
}

export function CarnetCard({ aprendiz, onReady }: CarnetCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, `SENA:${aprendiz.documento}`, {
        width: 120,
        margin: 1,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      }).then(() => {
        onReady?.()
      }).catch(() => {
        onReady?.()
      })
    }
  }, [aprendiz.documento, onReady])

  const getInitials = (nombre: string, apellido: string) =>
    `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()

  return (
    <div
      ref={cardRef}
      className="carnet-card w-[260px] rounded-2xl bg-white shadow-lg overflow-hidden border border-gray-200 select-none"
      data-documento={aprendiz.documento}
    >
      <div className="h-2 bg-gradient-to-r from-[#003366] via-[#FECA1B] to-[#CE1126]" />

      <div className="px-5 pt-5 pb-3 text-center">
        <div className="mx-auto mb-3 w-24 h-24 rounded-full overflow-hidden bg-[#F1F5F9] border-2 border-[#E2E8F0] flex items-center justify-center">
          {aprendiz.foto ? (
            <img
              src={aprendiz.foto}
              alt={`${aprendiz.nombre} ${aprendiz.apellido}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-[#64748B]">
              {getInitials(aprendiz.nombre, aprendiz.apellido)}
            </span>
          )}
        </div>

        <div className="text-[#0F172A] font-bold text-[16px] leading-tight">
          {aprendiz.nombre} {aprendiz.apellido}
        </div>
        <div className="text-[#64748B] text-[11px] font-medium mt-0.5">
          {aprendiz.tipo_documento?.toUpperCase()}: {aprendiz.documento}
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 pt-3 pb-4">
        <div className="flex justify-center gap-6 text-center text-[11px] text-[#475569]">
          <div>
            <span className="font-semibold text-[#0F172A] block text-xs">Ficha</span>
            {aprendiz.ficha}
          </div>
          <div>
            <span className="font-semibold text-[#0F172A] block text-xs">Centro</span>
            {aprendiz.centro?.length > 15 ? aprendiz.centro.slice(0, 15) + '…' : aprendiz.centro}
          </div>
        </div>
      </div>

      <div className="flex justify-center pb-3">
        <div className="bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
          <canvas ref={canvasRef} width={120} height={120} className="block" />
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="text-[8px] text-center text-[#94A3B8] uppercase tracking-[0.15em] font-semibold leading-tight">
          Servicio Nacional de Aprendizaje<br />SENA
        </div>
      </div>
    </div>
  )
}
