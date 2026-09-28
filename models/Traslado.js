const mongoose = require('mongoose');
const { Schema } = mongoose

const buildCostBreakdownSchema = require('./CostBreakdown')

const CostBreakdownSchema = buildCostBreakdownSchema()

const PreFlightSchema = new Schema({
    fuel_level:        { type: Number, min: 0, max: 100, default: 50 },
    cargo_description: { type: String, default: '' },
    items: {
        extintor:         { type: Boolean, default: true },
        llanta_refaccion: { type: Boolean, default: true },
        herramientas:     { type: Boolean, default: true },
        gato:             { type: Boolean, default: true },
        cinturon:         { type: Boolean, default: true },
        documentos:       { type: Boolean, default: true },
        tarjetas:         { type: Boolean, default: true }
    },
    observaciones: { type: String, default: '' }
}, { _id: false })

const TrasladoSchema = new Schema({
    is_active: {
        type: Boolean,
    }, 
    folio: {
        type: Number,
        default: 10,
    },
    type: {
        type: String,
        default: 'traslado',
    },
    request_date: {
        type: Date,        
    },
    delivery_date: {
        type: Date,
    }, 
    vehicle: {
        type: String,
    },
    subject: {
        type: String,
    },
    driver: {
        type: String,
    }, 
    document_id: {
        type: String,
    }, 
    project_id: {
        type: String,
    }, 
    kilometer_out: {
        type: Number,
    }, 
    kilometer_in: {
        type: Number,
    }, 
    fuel_level: {
        type: Number,
        default: 50,
    },
    fuel_card: {
        type: String,
    },
    fuel_amount: {
        type: String,
    },
    recorrido_km: {
        type: String,
    },
    email_sent: {
        type: Array,
    },
    subtotal_travel: {
        type: Number,
        default: 0,
    },
    bussiness_cost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bussiness',
    },
    route: {
        type: JSON,
    },
    description: {
        type: JSON,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bussiness',
    },
    link_googlemaps: {
        type: String,
    },
    casetas: {
        type: String
    },
    tarjeta_deposito: {
        type: String
    },
    isCancel_status: {
        type: String,
        default: null,
    },
    cost_breakdown: {
        type: CostBreakdownSchema,
        default: () => ({})
    },
    pre_flight: {
        type: PreFlightSchema,
        default: () => ({})
    },
    profit_pct: {
        type: Number,
        default: 8,
    },
    indirect_pct: {
        type: Number,
        default: 12,
    },
    cargo_description: {
        type: String,
        default: '',
    },
    origin: {
        type: String,
        default: '',
    },
    destination: {
        type: String,
        default: '',
    },
    stops: {
        type: [String],
        default: [],
    },
    cost_center: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
    payment_method: {
        type: String,
        default: '',
    },
    driver_address: {
        type: String,
        default: '',
    }
}, { timestamps: true })

TrasladoSchema.pre('save', async function (next) {
    // count the number of traslado set nuew folio
    this.folio = await Traslado.find({
        bussiness_cost: this.bussiness_cost,
    }).countDocuments() + 1
    next()
    
})

// prev folio consecutive
const Traslado = mongoose.model('Traslado', TrasladoSchema)

module.exports = {
    Traslado
}