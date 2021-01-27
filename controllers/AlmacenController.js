const { AlmacenServices } = require('../services')


module.exports = {
    create: async(req, res) =>  {
        
        try {

            const productData = await AlmacenServices.create(req.body)
            console.log(productData)

            if(productData){
                return res.status(200).json({ message: productData })
            }
        } catch (error) {
            res.status(400).json({ message: error })
        }
    },
    insertMany: async(req, res) =>  {
        
        try {
            
            console.log(req.body)
            const manyProductos = await AlmacenServices.insertMany(req.body)

            if(manyProductos){
                return res.status(200).json({ message: 'success' })
            }
        } catch (error) {
            res.status(400).json({ message: error })
        }
    },
    getAllProdutos: async(_, res) => {

        try {
            
            const allProductos = await AlmacenServices.getAllProductos()
            
            if(allProductos){
                return res.status(200).json({ productos: allProductos })
            }

        } catch (error) {
            res.status(400).json({ message: error })
        }
    },
    findByQueryText: async(req, res) => {

        // TODO: se puede crear una mejor busqueda, con varios valores, para esto hay que tener un arreglo y meterlo en la query
            const { text } = req.query
        
        try {

            const response = await AlmacenServices.findByQueryText(text)

            if(response)
            res.status(200).json({ message: response })

        } catch (error) {
            res.status(400).json({ message: error })
        }
    }


}