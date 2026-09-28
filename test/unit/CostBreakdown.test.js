const buildCostBreakdownSchema = require('../../models/CostBreakdown')

describe('CostBreakdownSchema', () => {
  it('declara los importes finales sin default (ausente ≠ 0)', () => {
    const schema = buildCostBreakdownSchema()
    const importeFields = [
      'casetas_importe',
      'operator_importe',
      'per_diem_importe',
      'gasoline_importe',
      'unit_rent_importe',
      'subtotal_amount',
      'base_amount',
      'iva_amount',
      'total_amount'
    ]

    importeFields.forEach((field) => {
      const path = schema.path(field)
      expect(path).toBeDefined()
      expect(path.options.default).toBeUndefined()
    })
  })
})