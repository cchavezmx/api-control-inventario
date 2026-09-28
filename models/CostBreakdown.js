const mongoose = require('mongoose')
const { Schema } = mongoose

// Desglose de costos del documento (traslado / flete / renta).
// Los importes finales (*_importe, subtotal_amount, base_amount, iva_amount,
// total_amount) llegan ya calculados desde el wizard y NO llevan default a
// propósito: si llegan a faltar, el documento no los guarda y el servicio
// de PDF debe usar su fallback para legacy. Un default en 0 haría que un
// mapeo olvidado se guardara como $0.00 en silencio.
const costBreakdownFields = {
    casetas_amount:   { type: Number, default: 0 },
    casetas_unit:     { type: String, default: 'fijo' },
    casetas_notes:    { type: String, default: '' },
    operator_rate:    { type: Number, default: 0 },
    operator_unit:    { type: String, default: 'dia' },
    operator_days:    { type: Number, default: 0 },
    per_diem_rate:    { type: Number, default: 0 },
    per_diem_unit:    { type: String, default: 'dia' },
    per_diem_days:    { type: Number, default: 0 },
    gasoline_rate:    { type: Number, default: 0 },
    gasoline_unit:    { type: String, default: 'km' },
    gasoline_km:      { type: Number, default: 0 },
    unit_rent_amount: { type: Number, default: 0 },
    unit_rent_period: { type: String, enum: ['dia', 'semana', 'mes'], default: 'dia' },
    unit_rent_unit:   { type: String, default: 'dia' },
    unit_rent_qty:    { type: Number, default: 0 },
    profit_amount:    { type: Number, default: 0 },
    indirect_amount:  { type: Number, default: 0 },
    // Importes finales calculados por el wizard (docs/pdf-payload-spec.md §3.4)
    casetas_importe:   { type: Number },
    operator_importe:  { type: Number },
    per_diem_importe:  { type: Number },
    gasoline_importe:  { type: Number },
    unit_rent_importe: { type: Number },
    subtotal_amount:   { type: Number },
    base_amount:       { type: Number },
    iva_amount:        { type: Number },
    total_amount:      { type: Number }
}

// Fábrica: cada modelo compila su propia instancia de Schema para evitar
// compartir estado entre Traslado, Flete y Rentas.
module.exports = function buildCostBreakdownSchema () {
    return new Schema(costBreakdownFields, { _id: false })
}