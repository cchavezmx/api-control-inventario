const mongoose = require('mongoose')
const { Traslado, Flete, Flotilla, Rentas, Planes } = require('../models')
const { viewDocumentsCanceled, viewDocumentsNormal } = require('../util/aggregatios')

const Bussiness = mongoose.model('bussiness', new mongoose.Schema({
  name: {
    type: String
  },
  slug: {
    type: String
  }
})
)

// Mapea un body "plano" (como el que manda el frontend) al shape del schema:
//   - cost_breakdown <- casetas_*, operator_*, per_diem_*, gasoline_*, unit_rent_*
//   - pre_flight     <- pre_flight (ya viene anidado) o checklist_* sueltos
//   - plan           -> project_id
//   - is_active      default true
//   - type           default según corresponda
const mapDocumentBody = (type, body = {}) => {
  const toNumber = (v) => {
    if (v === '' || v === null || v === undefined) return 0
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  // Los importes finales los manda el wizard dentro de cost_breakdown
  // (docs/pdf-payload-spec.md §3.4). Sin default a 0: si no llegan, no se
  // guardan y el servicio de PDF usa su fallback para legacy.
  const toOptionalNumber = (v) => {
    if (v === '' || v === null || v === undefined) return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  // El wizard envía el desglose anidado en body.cost_breakdown; el shape
  // plano (body.casetas_amount, etc.) sigue soportado por compatibilidad.
  const cb = body.cost_breakdown && typeof body.cost_breakdown === 'object'
    ? body.cost_breakdown
    : {}

  const cost_breakdown = {
    casetas_amount:   toNumber(cb.casetas_amount ?? body.casetas_amount),
    casetas_unit:     cb.casetas_unit || body.casetas_unit || 'fijo',
    casetas_notes:    cb.casetas_notes || body.casetas_notes || '',
    operator_rate:    toNumber(cb.operator_rate ?? body.operator_rate),
    operator_unit:    cb.operator_unit || body.operator_unit || 'dia',
    operator_days:    toNumber(cb.operator_days ?? body.operator_days),
    per_diem_rate:    toNumber(cb.per_diem_rate ?? body.per_diem_rate),
    per_diem_unit:    cb.per_diem_unit || body.per_diem_unit || 'dia',
    per_diem_days:    toNumber(cb.per_diem_days ?? body.per_diem_days),
    gasoline_rate:    toNumber(cb.gasoline_rate ?? body.gasoline_rate),
    gasoline_unit:    cb.gasoline_unit || body.gasoline_unit || 'fijo',
    gasoline_km:      (cb.gasoline_unit || body.gasoline_unit) === 'km'
      ? toNumber(cb.gasoline_km ?? body.gasoline_km ?? body.recorrido_km)
      : toNumber(cb.gasoline_km ?? body.gasoline_km ?? 1),
    unit_rent_amount: toNumber(cb.unit_rent_amount ?? body.unit_rent_amount),
    unit_rent_period: cb.unit_rent_period || body.unit_rent_period || 'dia',
    unit_rent_unit:   cb.unit_rent_unit || body.unit_rent_unit || 'dia',
    unit_rent_qty:    toNumber(cb.unit_rent_qty ?? body.unit_rent_qty),
    profit_amount:    toNumber(cb.profit_amount ?? body.profit_amount),
    indirect_amount:  toNumber(cb.indirect_amount ?? body.indirect_amount),
    casetas_importe:   toOptionalNumber(cb.casetas_importe ?? body.casetas_importe),
    operator_importe:  toOptionalNumber(cb.operator_importe ?? body.operator_importe),
    per_diem_importe:  toOptionalNumber(cb.per_diem_importe ?? body.per_diem_importe),
    gasoline_importe:  toOptionalNumber(cb.gasoline_importe ?? body.gasoline_importe),
    unit_rent_importe: toOptionalNumber(cb.unit_rent_importe ?? body.unit_rent_importe),
    subtotal_amount:   toOptionalNumber(cb.subtotal_amount ?? body.subtotal_amount),
    base_amount:       toOptionalNumber(cb.base_amount ?? body.base_amount),
    iva_amount:        toOptionalNumber(cb.iva_amount ?? body.iva_amount),
    total_amount:      toOptionalNumber(cb.total_amount ?? body.total_amount)
  }

  const checklistItems = {
    extintor:         body.checklist_extintor ?? body.pre_flight?.items?.extintor ?? true,
    llanta_refaccion: body.checklist_llanta_refaccion ?? body.pre_flight?.items?.llanta_refaccion ?? true,
    herramientas:     body.checklist_herramientas ?? body.pre_flight?.items?.herramientas ?? true,
    gato:             body.checklist_gato ?? body.pre_flight?.items?.gato ?? true,
    cinturon:         body.checklist_cinturon ?? body.pre_flight?.items?.cinturon ?? true,
    documentos:       body.checklist_documentos ?? body.pre_flight?.items?.documentos ?? true,
    tarjetas:         body.checklist_tarjetas ?? body.pre_flight?.items?.tarjetas ?? true
  }

  const pre_flight = body.pre_flight && typeof body.pre_flight === 'object'
    ? {
        fuel_level:        toNumber(body.pre_flight.fuel_level ?? body.fuel_level ?? 50),
        cargo_description: body.pre_flight.cargo_description || body.cargo_description || '',
        items: {
          ...checklistItems,
          ...(body.pre_flight.items || {})
        },
        observaciones: body.pre_flight.observaciones || body.checklist_observaciones || ''
      }
    : {
        fuel_level:        toNumber(body.fuel_level ?? 50),
        cargo_description: body.cargo_description || '',
        items: checklistItems,
        observaciones: body.checklist_observaciones || ''
      }

  return {
    is_active:        body.is_active ?? true,
    type,
    request_date:     body.request_date || undefined,
    delivery_date:    body.delivery_date || undefined,
    vehicle:          body.vehicle || undefined,
    subject:          body.subject || undefined,
    driver:           body.driver || undefined,
    document_id:      body.document_id || undefined,
    project_id:       body.project_id || body.plan || undefined,
    kilometer_out:    toNumber(body.kilometer_out),
    kilometer_in:     toNumber(body.kilometer_in),
    fuel_level:       toNumber(body.fuel_level ?? pre_flight.fuel_level),
    fuel_card:        body.fuel_card || undefined,
    fuel_amount:      body.fuel_amount || undefined,
    recorrido_km:     body.recorrido_km || undefined,
    email_sent:       body.email_sent || undefined,
    subtotal_travel:  toNumber(body.subtotal_travel),
    bussiness_cost:   body.bussiness_cost || undefined,
    client:           body.client || undefined,
    link_googlemaps:  body.link_googlemaps || undefined,
    casetas:          body.casetas || undefined,
    tarjeta_deposito: body.tarjeta_deposito || undefined,
    isCancel_status:  body.isCancel_status ?? null,
    route:            body.route || undefined,
    description:      body.description || undefined,
    cost_breakdown,
    pre_flight,
    profit_pct:       toNumber(body.profit_pct ?? 8),
    indirect_pct:     toNumber(body.indirect_pct ?? 12),
    cargo_description: pre_flight.cargo_description,
    origin:           body.origin || '',
    destination:      body.destination || '',
    stops:            Array.isArray(body.stops) ? body.stops : [],
    cost_center:      body.cost_center || '',
    notes:            body.notes || '',
    payment_method:   body.payment_method || '',
    driver_address:   body.driver_address || ''
  }
}

module.exports = {
  mapDocumentBody,
  create: async (type, body) => {
    const payload = mapDocumentBody(type, body)
    switch (type) {
      case 'traslado':
        const traslado = new Traslado(payload)
        return await traslado.save()
      case 'flete':
        const flete = new Flete(payload)
        return await flete.save()
      case 'renta':
        const renta = new Rentas(payload)
        return await renta.save()
      default:
        const err = new Error(`Tipo de registro inválido: ${type}`)
        err.statusCode = 400
        throw err
    }
  },
  get: async (type) => {
    switch (type) {
      case 'traslado':
        const traslados = await Traslado.find({})
        return traslados
      case 'flete':
        const flotillas = await Flete.find({})
        return flotillas
      case 'renta':
        const rentas = await Rentas.find({})
        return rentas
    }
  },
  createVehiculo: async (body) => {
    const flotilla = new Flotilla(body)
    await flotilla.save()
    return flotilla
  },
  getEmpresas: async () => {
    const empresas = await Bussiness.find({})
    return empresas
  },
  createEmpresa: async (body) => {
    const empresa = new Bussiness({
      name: 'test',
      slug: 'test'
    })
    await empresa.save()
    return empresa
  },
  getDocumentsByIdBussiness: async ({ idBussines, query }) => {
    if (!mongoose.Types.ObjectId.isValid(idBussines)) {
      const err = new Error(`idBussines inválido: ${idBussines}`)
      err.statusCode = 400
      throw err
    }
    const aggCanceled = viewDocumentsCanceled(new mongoose.Types.ObjectId(idBussines))
    const aggNormal = viewDocumentsNormal(new mongoose.Types.ObjectId(idBussines))

    if (query === 'cancel') {
      const documents = await Bussiness.aggregate(aggCanceled)
      return documents
    }

    return await Bussiness.aggregate(aggNormal)
  },
  getVehicles: () => {
    const vehicles = Flotilla.find({}).sort({ createdAt: -1 })
    return vehicles
  },
  createPlan: async (body) => {
    const plan = new Planes(body)
    await plan.save()
    return plan
  },
  getPlanByObjectId: async (id) => {
    const plan = await Planes.find({ flotilla: id })
    return plan
  },
  getPlanesBySlug: async (slug) => {
    try {
      const vehicle = await Flotilla.find({ placas: slug })
      const planes = await Planes.find({ flotilla: vehicle[0]._id, isActive: true })
      return planes
    } catch (error) {
      throw new Error('No se encontró el vehículo')
    }
  },
  getDocument: async (id, type) => {
    switch (type) {
      case 'flete':
        const flotilla = await Flete.findById(id)
        return flotilla
      case 'traslado':
        const traslado = await Traslado.findById(id)
        return traslado
      case 'renta':
        const renta = await Rentas.findById(id)
        return renta
    }
  },
  getPlanesByPlacas: (placas) => {
    const agg = [
      {
        $match: {
          placas
        }
      }, {
        $lookup: {
          from: 'planes',
          localField: '_id',
          foreignField: 'flotilla',
          as: 'planes'
        }
      }, {
        $unwind: {
          path: '$planes'
        }
      }
    ]
    const planes = Flotilla.aggregate(agg)
    return planes
  },
  update: async (_id, body, type) => {
    const payload = mapDocumentBody(type, body)
    switch (type) {
      case 'flete':
        const flotilla = await Flete.findByIdAndUpdate(_id, { ...payload })
        return flotilla
      case 'traslado':
        const traslado = await Traslado.findByIdAndUpdate(_id, { ...payload })
        return traslado
      case 'renta':
        const renta = await Rentas.findByIdAndUpdate(_id, { ...payload })
        return renta
    }
  },
  getById: async (id, type) => {
    switch (type) {
      case 'flete':
        const flotilla = await Flete.findById(id)
          .populate('client', 'name slug')
          .populate('bussiness_cost', 'name slug')
        return flotilla
      case 'traslado':
        const traslado = await Traslado.findById(id)
          .populate('client', 'name slug')
          .populate('bussiness_cost', 'name slug')
        return traslado
      case 'renta':
        const renta = await Rentas.findById(id)
          .populate('client', 'name slug')
          .populate('bussiness_cost', 'name slug')
        return renta
    }
  },
  updateVehiculo: async (body) => {
    const flotilla = await Flotilla.findByIdAndUpdate(body._id, { ...body })
    return flotilla
  },
  updatePlanById: async (_id, body) => {
    const plan = await Planes.findByIdAndUpdate(_id, { ...body })
    return plan
  }
}
