const FlotillasService = require('../../services/FlotillasService')

// Casos de aceptación del handoff del desglose PDF (docs del repo
// control-fletes): el wizard manda los montos finales dentro de
// cost_breakdown y la API los persiste tal cual (el PDF no recalcula).
describe('FlotillasService.mapDocumentBody — importes finales', () => {
  // Caso #1: renta 40 día × $430, utilidad 8%, indirectos 12%, IVA 16%
  const wizardPayload = {
    subtotal_travel: 17200,
    profit_pct: 8,
    indirect_pct: 12,
    cost_breakdown: {
      unit_rent_amount: 430,
      unit_rent_unit: 'dia',
      unit_rent_qty: 40,
      unit_rent_period: 'dia',
      casetas_importe: 0,
      operator_importe: 0,
      per_diem_importe: 0,
      gasoline_importe: 0,
      unit_rent_importe: 17200,
      subtotal_amount: 17200,
      profit_amount: 1376,
      indirect_amount: 2064,
      base_amount: 20640,
      iva_amount: 3302.40,
      total_amount: 23942.40
    }
  }

  it('mapea los montos finales desde el payload anidado del wizard', () => {
    const payload = FlotillasService.mapDocumentBody('renta', wizardPayload)
    const cb = payload.cost_breakdown

    expect(cb.unit_rent_amount).toBe(430)
    expect(cb.unit_rent_qty).toBe(40)
    expect(cb.unit_rent_importe).toBe(17200)
    expect(cb.subtotal_amount).toBe(17200)
    expect(cb.profit_amount).toBe(1376)
    expect(cb.indirect_amount).toBe(2064)
    expect(cb.base_amount).toBe(20640)
    expect(cb.iva_amount).toBe(3302.40)
    expect(cb.total_amount).toBe(23942.40)
  })

  it('importes finales ausentes quedan undefined (no 0) para que el PDF use su fallback legacy', () => {
    const payload = FlotillasService.mapDocumentBody('renta', {
      unit_rent_amount: 430,
      unit_rent_qty: 40
    })
    const cb = payload.cost_breakdown

    expect(cb.unit_rent_amount).toBe(430)
    expect(cb.subtotal_amount).toBeUndefined()
    expect(cb.iva_amount).toBeUndefined()
    expect(cb.total_amount).toBeUndefined()
  })

  it('sigue soportando el shape plano (compatibilidad con clientes legacy)', () => {
    // Caso #2: operador 14 días × $839.22
    const payload = FlotillasService.mapDocumentBody('renta', {
      operator_rate: 839.22,
      operator_days: 14,
      operator_importe: 11749.08,
      profit_amount: 1376
    })
    const cb = payload.cost_breakdown

    expect(cb.operator_rate).toBe(839.22)
    expect(cb.operator_days).toBe(14)
    expect(cb.operator_importe).toBe(11749.08)
    expect(cb.profit_amount).toBe(1376)
  })

  // Caso #3: gasolina fija con gasoline_km > 0 y unidad ≠ km
  it('gasolina fija conserva su importe aunque venga gasoline_km', () => {
    const payload = FlotillasService.mapDocumentBody('renta', {
      gasoline_rate: 500,
      gasoline_unit: 'fijo',
      gasoline_km: 320,
      gasoline_importe: 500
    })
    const cb = payload.cost_breakdown

    expect(cb.gasoline_unit).toBe('fijo')
    expect(cb.gasoline_importe).toBe(500)
  })
})

describe('FlotillasService.mapDocumentBody', () => {
  it('gasolina fija debe guardar gasoline_km=1 aunque venga recorrido_km', () => {
    const payload = FlotillasService.mapDocumentBody('renta', {
      gasoline_rate: 2500,
      gasoline_unit: 'fijo',
      recorrido_km: 420
    })

    expect(payload.cost_breakdown.gasoline_km).toBe(1)
    expect(payload.cost_breakdown.gasoline_unit).toBe('fijo')
  })

  it('gasolina por km puede fallback a recorrido_km cuando no hay gasoline_km', () => {
    const payload = FlotillasService.mapDocumentBody('renta', {
      gasoline_rate: 5,
      gasoline_unit: 'km',
      recorrido_km: 420
    })

    expect(payload.cost_breakdown.gasoline_km).toBe(420)
    expect(payload.cost_breakdown.gasoline_unit).toBe('km')
  })

  it('gasolina por km respeta gasoline_km explicito', () => {
    const payload = FlotillasService.mapDocumentBody('renta', {
      gasoline_rate: 5,
      gasoline_unit: 'km',
      gasoline_km: 100,
      recorrido_km: 420
    })

    expect(payload.cost_breakdown.gasoline_km).toBe(100)
  })

  it('valores vacíos o no numéricos se normalizan a 0', () => {
    const payload = FlotillasService.mapDocumentBody('flete', {
      casetas_amount: '',
      operator_rate: null,
      gasoline_rate: 'no-numero'
    })

    expect(payload.cost_breakdown.casetas_amount).toBe(0)
    expect(payload.cost_breakdown.operator_rate).toBe(0)
    expect(payload.cost_breakdown.gasoline_rate).toBe(0)
  })
})
