const { get } = require("lodash");

const { InvoiceStorage } = require("../models");
const empresaLogos = [
  {
    _id: "626e223ffe9887654db63c37",
    name: "Instalaciones Tecnológicas Aplicadas",
    slug: "ita",
  },
  {
    _id: "626e22ebfe9887654db63c38",
    name: "Inmobiliaria Eguel",
    slug: "eguel",
  },
  {
    _id: "626e2305fe9887654db63c39",
    name: "Instalaciones y Técnica",
    slug: "ite",
  },
  {
    _id: "626e2324fe9887654db63c3a",
    name: "Canalizaciòn y Soporteria",
    slug: "csm",
  },
  {
    _id: "62a75bab9ec0343efa92406e",
    name: "Inmobiliaria del Reino",
    slug: "reino",
  },
  {
    _id: "62a75bbf9ec0343efa92406f",
    name: "Iglesia del 3er día",
    slug: "I3D",
  },
  {
    _id: "688a680660a6125c3c242759",
    name: "Industrial Connect",
    slug: "ICONNECT",
  },
];

module.exports = {
  createInvoice: (body, query) => {
    const {
      name,
      razonsocial,
      codigopostalRcf,
      phone,
      email,
      cotizar,
      carrito,
      total,
      date,
      rfc,
    } = body;
    const { folio } = query;

    const cantidadString = (precio) =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(precio);
    const dateFormat = (date) =>
      new Intl.DateTimeFormat("es-MX", { dateStyle: "full" }).format(
        new Date(date),
      );
    const direccionCompleta = `${body.direccionRfc}, ${body.alcaldiaRfc}, ${body.estadoRfc}, ${body.ciudadRfc}`;

    const carritoMap = carrito.map((item) => {
      return `<tr>
          <td>${item.cantidad}</td>
          <td>${item.title}</td>
          <td>${cantidadString(item.precio)}</td>
          <td>${
            item?.foto && `<img src="${item.foto}" class="fotoMini"}></img>`
          }</td>
        </tr>  
        `;
    });

    const envioCotizar = `
    <tr>
      <td>1</td>
      <td>Cotizar servicio de envio al codigo postal: ${codigopostalRcf}</td>
      <td>*Por Cotizar</td>
      <td></td>
    </tr>  
      `;
    const cotizacionNull = '<tr class="d-none"></tr>';

    let cotizacion;
    if (cotizar) {
      cotizacion = envioCotizar;
    } else if (!cotizar) {
      cotizacion = cotizacionNull;
    }

    const web = `
    <!doctype html>
    <html lang="en">
      <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-wEmeIV1mKuiNpC+IOBjI7aAzPcEZeedi5yW5f2yOq55WWLwNGmvvx4Um1vskeMj0" crossorigin="anonymous">
    
        <style>
          
          .fotoMini{
            height: 50px;
            width: auto;
    
          }
    
    
          .back{
            width: 100%;
          }
    
          .invoice-wrapper{
            margin: 20px auto;
            width: 100%;
            
          }
          .invoice-top{
            background-color: #fafafa;
            padding: 40px 60px;
          }
    
          .invoice-top-left{
            margin-top: 10px;
            
          }
          .invoice-top-left h2 , .invoice-top-left h6{
            line-height: 1.5;
            font-family: 'Montserrat', sans-serif;
          }
          .invoice-top-left h4{
            margin-top: 30px;
            font-size: 12px;
            font-family: 'Montserrat', sans-serif;
          }
          .invoice-top-left h5{
            line-height: 1.4;
            font-size: 12px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 400;
          }
          .client-company-name{
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 0;
          }
          .client-address{
            font-size: 14px;
            margin-top: 5px;
            color: rgba(0,0,0,0.75);
          }
    
    
          .invoice-top-right h2 , .invoice-top-right h6{
            text-align: right;
            line-height: 1.5;
            font-family: 'Montserrat', sans-serif;
          }
          .invoice-top-right h5{
            line-height: 1.4;
              font-family: 'Montserrat', sans-serif;
              font-weight: 400;
              text-align: right;
              margin-top: 0;
          }
          .our-company-name{
            font-size: 16px;
              font-weight: 600;
              margin-bottom: 0;
          }
          .our-address{
            font-size: 13px;
            margin-top: 0;
            color: rgba(0,0,0,0.75);
          }
    
          .logo-wrapper{ 
            overflow: auto;
            display: flex;
            justify-content: flex-end;
            
          }
    
          .invoice-bottom{
            background-color: #ffffff;
            padding: 40px 60px;
            position: relative;
          }
          .invoice-title{
            font-size: x-large;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            
          }
    
          .invoice-bottom-left{
            width: 100%;
            display: flex;
            flex-direction: row;
            
          }
    
          .invoice-bottom-left > h5{
            font-family: 'Montserrat', sans-serif;
            width: 100px;
          }
          
          .invoice-bottom-left > h4{
            font-family: 'Montserrat', sans-serif;
            width: 100%;
          }
          .invoice-bottom-left h4{
            font-weight: 400;
            font-size: large;
          }
          .terms{
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            margin-top: 40px;
          }
          .divider{
            margin-top: 50px;
              margin-bottom: 5px;
          }
    
          
          .invoice-bottom-bar{
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 26px;
            background-color: #3B5998;
          }
    
          .invoice-datos-cliente{
            font-size: medium;
          }
    
          .invoice-button-send {
            
              border: none;
              border-radius: 4px;
              font-weight: bold;
              width: 12rem;
              padding: 0.86rem;
              color: #ffffff;
              border: 1px solid slategrey;
              background-color: rgb(223, 80, 80);  
          }
    
          .invoice-button-send:hover{
            color: rgb(223, 80, 80);
            border: 1px solid rgb(223, 80, 80);;
            background-color: white;  
          }
    
          .invoice-date{
            text-align: right;
            text-transform: uppercase;
            font-size: small;
            font-weight: bold;
          }
          
        </style>
    
    
    
      </head>
      <body>
        
        <section class="back">
          
          <div class="container-xl">
            <div>
              <div >
                <div class="invoice-wrapper">
                  <div class="invoice-top">
                    <div class="row">
                      <div class="col-6">
                        <div class="invoice-top-left">
                          <!-- <h2 class="client-company-name">Instalaciónes Tecnólogicas Aplicadas <br/> S.A. de C.V.</h2>
                          <h6 class="client-address">La Montaña, 28 A, CP: 53340 <br/>México</h6> -->
                          <h3 class="font-weight-bold">Datos del Cliente</h3>
                          <h5>${razonsocial}</h5> 
                          <h5>${rfc}</h5>
                          <h6>Atención: ${name}</h6>
                          <span class="invoice-datos-cliente">${email}<br/>${direccionCompleta} C.P.: ${codigopostalRcf}<br />${phone}</span>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="invoice-top-right">
                          <h2 class="our-company-name">Grupo Intecsa</h2>
                          <h6 class="our-address">grupointeca.com, <br/>contacto@grupointecsa.com<br/>CDMX - México</h6>
                            <h6 class="text-right">+52 55701197</h6>
                          <div class="logo-wrapper">
                            <img src="https://grupointecsa.com/web-logo.webp" class="img-responsive pull-right logo" alt="Logo del invoice"/>
                            
                          </div>
                            <div>
                              <p class="mt-3 w-100 invoice-date">${dateFormat(
                                date,
                              )}</p>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="invoice-bottom">
                    <div class="row">
                      <div class="col-12">
                        <h5 class="invoice-title">Cotización</h5>
                      </div>
                      <div class="clearfix"></div>
        
                      <div class="col-12">
                          <h5>Folio: <p>${folio}</p></h5>
                          
                      </div>
                      <div class="col-offset-1 col-12 col-9 w-100">
                        <div class="invoice-bottom-right tabla--content">
                          <table class="table">
                            <thead>
                              <tr>
                                <th>Cantidad</th>
                                <th>Descripción</th>
                                <th>Precio</th>
                                <th>Imagen</th>
                              </tr>
                            </thead>
                            <tbody>                                
                              <tr>
                              ${carritoMap}
                              </tr>
                              <tr>
                              ${cotizacion}
                              </tr>
                            </tbody>
                            <thead>
                              <tr>
                                <th>Total</th>
                                <th></th>
                                <th></th>
                                <th>${cantidadString(total)}</th>
                                
                              </tr>
                            </thead>
                          </table>
                          <h4 class="terms">Terminos</h4>
                          <ul>
                            <li>El total de está cotización puede tener partidas pendientes de cotizar o los precios pueden cambiar sin previo aviso</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
            </div>
            </div>
      
        <!-- Optional JavaScript; choose one of the two! -->
    
        <!-- Option 1: Bootstrap Bundle with Popper -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-p34f1UUtsS3wqzfto5wAAmdvj+osOnFyQFpp4Ua3gs/ZVWx6oOypYoCJhGGScy+8" crossorigin="anonymous"></script>
    
        <!-- Option 2: Separate Popper and Bootstrap JS -->
        
        <!--
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.min.js" integrity="sha384-lpyLfhYuitXl2zRZ5Bn2fqnhNAKOAaM/0Kr9laMspuaMiZfGmfwRNFh8HlMy49eQ" crossorigin="anonymous"></script>
        -->
      </body>
    </html>
    `;

    return web;
  },
  saveInvoice: async (payload) => {
    const genFolioIncremental = await new Promise((resolve) => {
      resolve(InvoiceStorage.countDocuments());
    }).then((res) => {
      const data = {
        ...payload,
        folio: `W-${Math.floor(Math.random() * 1000)}-${res + 1}`,
      };
      return data;
    });

    const saveInfoInvoiceData = (data) =>
      new Promise((resolve) => {
        resolve(InvoiceStorage(data).save());
      }).then((res) => res);

    const query = await Promise.all([genFolioIncremental])
      .then((res) => {
        return saveInfoInvoiceData(res[0]);
      })
      .then((res) => res);

    return query;
  },

  getInvoiceId: (id) => InvoiceStorage.findById(id),
  flotillaInvoice: (data, flotillasData, getMapImage) => {
    // destructuring data
    const dateFormat = (date) =>
      new Intl.DateTimeFormat("es-MX", { dateStyle: "full" }).format(
        new Date(date),
      );
    const {
      type,
      email_sent,
      client,
      _id,
      request_date,
      delivery_date,
      driver,
      route,
      kilometer_out,
      kilometer_in,
      fuel_level,
      document_id,
      project_id,
      fuel_card,
      folio,
      description,
      vehicle,
      bussiness_cost,
      createdAt,
      updatedAt,
      subtotal_travel = 0,
      //
      fuel_amount,
      recorrido_km = "0",
      subject,
      link_googlemaps,
      casetas,
      tarjeta_deposito,
    } = data;

    const { modelo, placas, planes } = flotillasData[0];
    const currentEmpresa = empresaLogos.find(
      (empresa) => empresa._id === bussiness_cost.toString(),
    ).name;
    const currentClient = empresaLogos.find(
      (empresa) => empresa._id.toString() === client.toString(),
    ).name;
    const cantidadString = (precio) =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(precio);
    const casetasBody = casetas
      ? `
      <br/>
      <h5>
        Casetas
      </h5>
      <table class="table">
        <thead>
          <tr>
            <th>Costo casetas</th>                                
            <th>TARJETA / BANCO</th>
          </tr>
        </thead>
        <tbody>
          <td>${cantidadString(
            parseFloat(casetas),
          )}</td>                              
          <td>${tarjeta_deposito}</td>
        </tbody>
      </table>      
    `
      : "";

    const invoicePDF = `
    <!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-wEmeIV1mKuiNpC+IOBjI7aAzPcEZeedi5yW5f2yOq55WWLwNGmvvx4Um1vskeMj0" crossorigin="anonymous">

    <style>

      h5{
        background-color: #f5f5f5;
      }
      
      .fotoMini{
        height: 50px;
        width: auto;

      }
      .back{
        width: 100%;
      }

      .invoice-wrapper{
        margin: 20px auto;
        width: 100%;
        
      }
      .invoice-top{
        background-color: #fafafa;
        padding: 40px 60px;
      }

      .invoice-top-left{
        margin-top: 10px;
        
      }
      .invoice-top-left h2 , .invoice-top-left h6{
        line-height: 1.5;
        font-family: 'Montserrat', sans-serif;
      }
      .invoice-top-left h4{
        margin-top: 30px;
        font-size: 12px;
        font-family: 'Montserrat', sans-serif;
      }
      .invoice-top-left h5{
        line-height: 1.4;
        font-size: 12px;
        font-family: 'Montserrat', sans-serif;
        font-weight: 400;
      }
      .client-company-name{
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 0;
      }
      .client-address{
        font-size: 14px;
        margin-top: 5px;
        color: rgba(0,0,0,0.75);
      }


      .invoice-top-right h2 , .invoice-top-right h6{
        text-align: right;
        line-height: 1.5;
        font-family: 'Montserrat', sans-serif;
      }
      .invoice-top-right h5{
        line-height: 1.4;
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
          text-align: right;
          margin-top: 0;
      }
      .our-company-name{
        font-size: 16px;
          font-weight: 600;
          margin-bottom: 0;
      }
      .our-address{
        font-size: 13px;
        margin-top: 0;
        color: rgba(0,0,0,0.75);
      }

      .logo-wrapper{ 
        overflow: auto;
        display: flex;
        justify-content: flex-end;
        
      }

      .invoice-bottom{
        background-color: #ffffff;
        padding: 40px 60px;
        position: relative;
      }
      .invoice-title{
        font-size: x-large;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        
      }

      .invoice-bottom-left{
        width: 100%;
        display: flex;
        flex-direction: row;
        
      }

      .invoice-bottom-left > h5{
        font-family: 'Montserrat', sans-serif;
        width: 100px;
      }
      
      .invoice-bottom-left > h4{
        font-family: 'Montserrat', sans-serif;
        width: 100%;
      }
      .invoice-bottom-left h4{
        font-weight: 400;
        font-size: large;
      }
      .terms{
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        margin-top: 40px;
      }
      .divider{
        margin-top: 50px;
          margin-bottom: 5px;
      }

      
      .invoice-bottom-bar{
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 26px;
        background-color: #3B5998;
      }

      .invoice-datos-cliente{
        font-size: medium;
      }

      .invoice-button-send {
        
          border: none;
          border-radius: 4px;
          font-weight: bold;
          width: 12rem;
          padding: 0.86rem;
          color: #ffffff;
          border: 1px solid slategrey;
          background-color: rgb(223, 80, 80);  
      }

      .invoice-button-send:hover{
        color: rgb(223, 80, 80);
        border: 1px solid rgb(223, 80, 80);;
        background-color: white;  
      }

      .invoice-date{
        text-align: right;
        text-transform: uppercase;
        font-size: small;
        font-weight: bold;
      }

      .flex-end {
        display: flex;        
        flex-direction: column;
        align-items: flex-end;
      }

      .recorrido {
        margin-top: 300px;
      }
      
    </style>



  </head>
  <body>
    
    <section class="back">
      
      <div class="container-xl">
        <div>
          <div >
            <div class="invoice-wrapper">
              <div class="invoice-top">
                <div class="row">
                  <div class="col-6">
                    <div class="invoice-top-left">
                      <h3>RECURSOS LOGÍSTICA</h3>
                      <h3 class="invoice-title">${type.toUpperCase()}</h3>
                      <h3>${currentEmpresa || ""}</h3>                   
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="invoice-top-right">
                      <h2 class="our-company-name">Grupo Intecsa</h2>
                      <div class="logo-wrapper">                        
                      </div>
                      <div>
                          <h2>Folio: ${folio}</h2>
                          <p class="mt-3 w-100 invoice-date">${dateFormat(
                            createdAt,
                          )}</p>
                      </div>
                      <br />
                      <div class="flex-end">
                        <span>
                          Fecha de solicitud: 
                          <span class="mt-3 invoice-date">${dateFormat(
                            request_date,
                          )}</span>
                        </span>
                        <span>
                          Fecha de disperción
                          <span class="mt-3 invoice-date">${dateFormat(
                            delivery_date,
                          )}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="invoice-bottom">                  
                <div class="row">
                  <div class="col-12">                        
                  </div>
                  <div class="clearfix"></div>

                  <br/>
                  <div>
                      <h4>Cliente: ${currentClient || ""}</h4>
                      <h5>${subject || ""}</h5>
                  </div>

                  <br/>
                  <div class="col-offset-1 col-12 col-9 w-100">

                    <div class="invoice-bottom-right tabla--content">
                    <br />
                      <h5>
                        Datos Vehiculo
                      </h5>
                      <table class="table">
                        <thead>
                          <tr>
                            <th>Vehiculo</th>
                            <th>Placas</th>
                            <th>Chofer</th>
                            <th>Tarjeta Gas</th>
                            <th>Carga de Gas</th>
                          </tr>
                        </thead>
                        <tbody>                              
                          <td>${modelo}</td>
                          <td>${placas}</td>
                          <td>${driver}</td>
                          <td>${fuel_card}</td>
                          <td>${cantidadString(parseFloat(fuel_amount))}</td>
                        </tbody>
                      </table> 
                      <br />                          
                      <h5>
                          Datos de Ruta
                      </h5>
                      <table class="table">
                        <thead>
                          <tr>
                            <th>Recorrido</th>
                            <th>Km Salida</th>
                            <th>Gas Salida</th>
                            <th>Distancia Recorrido</th>
                          </tr>
                        </thead>
                        <tbody>
                          <td>${route}</td>
                          <td>${kilometer_out || ""}</td>
                          <td>${fuel_level || ""}%</td>
                          <td>${recorrido_km || ""} KM aprox</td>
                        </tbody>
                      </table>    
                      ${casetasBody}
                      <br/>                                         
                      <h5>
                          Plan del Vehiculo
                      </h5>
                      <table class="table">
                        <thead>
                          <tr>
                            <th>Nombre del plan</th>                                
                            <th>Costo unitario</th>
                            <th>Subtotal del recorrido</th>
                          </tr>
                        </thead>
                        <tbody>
                          <td>${
                            description?.planDescription
                          }</td>                              
                          <td>$ ${
                            description?.planPrice
                          }</td>                              
                          <td>${cantidadString(
                            parseFloat(subtotal_travel || 0),
                          )}</td>
                        </tbody>
                      </table>                          
                    <br />
                      <h5>
                          Observaciones
                      </h5>
                      <table class="table">
                        <thead>
                          <tr>                                
                            <th>Google maps</th>
                            <th>Salida de almacén <br/> (ADMIN/COMERCIAL)</th>
                            <th>Proyecto</th>
                          </tr>
                        </thead>
                        <tbody>                          
                          <td>
                            <a target="_blank" href="${
                              link_googlemaps || "#"
                            }">Ver recorrido</a>
                          </td>
                          <td>${document_id || ""}</td>
                          <td>${project_id || ""}</td>
                        </tbody>
                    </table>    
                    <div class="recorrido">
                      <h5>
                        Recorrido
                      </h5>                      
                      <img                       
                        src="${"data:image/png;base64," + getMapImage}" 
                        alt="mapa de google" 
                      />
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
        </div>
        </div>
  
    <!-- Optional JavaScript; choose one of the two! -->

    <!-- Option 1: Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-p34f1UUtsS3wqzfto5wAAmdvj+osOnFyQFpp4Ua3gs/ZVWx6oOypYoCJhGGScy+8" crossorigin="anonymous"></script>

    <!-- Option 2: Separate Popper and Bootstrap JS -->
    
    <!--
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.min.js" integrity="sha384-lpyLfhYuitXl2zRZ5Bn2fqnhNAKOAaM/0Kr9laMspuaMiZfGmfwRNFh8HlMy49eQ" crossorigin="anonymous"></script>
    -->
  </body>
</html>    

    `;
    return invoicePDF;
  },

  vehicleData: (data, flotillasData) => {
    // destructuring data
    const dateFormat = (date) =>
      new Intl.DateTimeFormat("es-MX", { dateStyle: "full" }).format(
        new Date(date),
      );
    const {
      type,
      email_sent,
      client,
      _id,
      request_date,
      delivery_date,
      driver,
      route,
      kilometer_out,
      kilometer_in,
      fuel_level,
      document_id,
      project_id,
      fuel_card,
      folio,
      description,
      vehicle,
      bussiness_cost,
      createdAt,
      updatedAt,
      subtotal_travel = 0,
      //
      fuel_amount,
      recorrido_km = "0",
      subject,
      link_googlemaps,
      casetas,
      tarjeta_deposito,
      cost_breakdown,
      pre_flight,
      profit_pct,
      indirect_pct,
      cargo_description,
      origin,
      destination,
      stops,
      cost_center,
      notes,
      payment_method,
      driver_address,
    } = data;

    // Forzar cost_breakdown a objeto plano (Mongoose subdocuments no siempre serializan bien)
    const plainCostBreakdown = cost_breakdown
      ? (cost_breakdown.toObject ? cost_breakdown.toObject() : JSON.parse(JSON.stringify(cost_breakdown)))
      : {};

    console.log('[PDFServices.vehicleData] cost_breakdown raw:', cost_breakdown);
    console.log('[PDFServices.vehicleData] cost_breakdown plain:', plainCostBreakdown);

    let flotillaData = {
      modelo: "Sin modelo",
      placas: "Sin placas",
      planes: "Sin planes",
    };

    if (flotillasData.length > 0) {
      flotillaData = flotillasData[0];
    }

    const currentEmpresa =
      empresaLogos.find((empresa) => empresa._id === bussiness_cost.toString())
        ?.name || "Empresa no encontrada";
    const currentClient =
      empresaLogos.find(
        (empresa) => empresa._id.toString() === client.toString(),
      )?.name || "Cliente no encontrado";
    const cantidadString = (precio) =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(precio);
    const formatMoney = (value) => {
      const num = parseFloat(value);
      if (!Number.isFinite(num)) return "";
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(num);
    };
    const toNumber = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };

    const rawSubtotal = parseFloat(subtotal_travel || 0);

    // Normalizar montos finales de utilidad e indirectos (reusados en snapshot y cost_breakdown)
    const finalProfitAmount =
      (data?.profit_amount || plainCostBreakdown.profit_amount || 0) > 0 ||
      rawSubtotal === 0
        ? (data?.profit_amount || plainCostBreakdown.profit_amount || 0)
        : Math.round(rawSubtotal * ((profit_pct ?? 8) / 100) * 100) / 100;

    const finalIndirectAmount =
      (data?.indirect_amount || plainCostBreakdown.indirect_amount || 0) > 0 ||
      rawSubtotal === 0
        ? (data?.indirect_amount || plainCostBreakdown.indirect_amount || 0)
        : Math.round(rawSubtotal * ((indirect_pct ?? 12) / 100) * 100) / 100;

    // Snapshot: totales por concepto, listos para renderizar en el PDF service sin recalcular
    const casetasTotal = toNumber(plainCostBreakdown.casetas_amount);
    const operatorTotal =
      toNumber(plainCostBreakdown.operator_rate) *
      toNumber(plainCostBreakdown.operator_days);
    const perDiemTotal =
      toNumber(plainCostBreakdown.per_diem_rate) *
      toNumber(plainCostBreakdown.per_diem_days);
    const gasolineTotal =
      plainCostBreakdown.gasoline_unit === "km"
        ? toNumber(plainCostBreakdown.gasoline_rate) *
          toNumber(plainCostBreakdown.gasoline_km)
        : toNumber(plainCostBreakdown.gasoline_rate);
    const unitRentTotal =
      toNumber(plainCostBreakdown.unit_rent_amount) *
      toNumber(plainCostBreakdown.unit_rent_qty);

    const conceptsSubtotal =
      casetasTotal + operatorTotal + perDiemTotal + gasolineTotal + unitRentTotal;
    const grandTotal = rawSubtotal + finalProfitAmount + finalIndirectAmount;

    const lineItems = [
      {
        label: "Casetas",
        unit_price: toNumber(plainCostBreakdown.casetas_amount),
        qty:
          plainCostBreakdown.casetas_unit === "fijo"
            ? 1
            : toNumber(plainCostBreakdown.casetas_days || 1),
        unit: plainCostBreakdown.casetas_unit || "fijo",
        notes: plainCostBreakdown.casetas_notes || "",
        total: casetasTotal,
      },
      {
        label: "Operador",
        unit_price: toNumber(plainCostBreakdown.operator_rate),
        qty: toNumber(plainCostBreakdown.operator_days),
        unit: plainCostBreakdown.operator_unit || "dia",
        notes: plainCostBreakdown.operator_notes || "",
        total: operatorTotal,
      },
      {
        label: "Per diem",
        unit_price: toNumber(plainCostBreakdown.per_diem_rate),
        qty: toNumber(plainCostBreakdown.per_diem_days),
        unit: plainCostBreakdown.per_diem_unit || "dia",
        notes: plainCostBreakdown.per_diem_notes || "",
        total: perDiemTotal,
      },
      {
        label: "Gasolina",
        unit_price: toNumber(plainCostBreakdown.gasoline_rate),
        qty:
          plainCostBreakdown.gasoline_unit === "km"
            ? toNumber(plainCostBreakdown.gasoline_km)
            : toNumber(plainCostBreakdown.gasoline_km || 1),
        unit: plainCostBreakdown.gasoline_unit || "fijo",
        notes: plainCostBreakdown.gasoline_notes || "",
        total: gasolineTotal,
      },
      {
        label: "Renta de unidad",
        unit_price: toNumber(plainCostBreakdown.unit_rent_amount),
        qty: toNumber(plainCostBreakdown.unit_rent_qty),
        unit: plainCostBreakdown.unit_rent_unit || "dia",
        period: plainCostBreakdown.unit_rent_period || "dia",
        notes: plainCostBreakdown.unit_rent_notes || "",
        total: unitRentTotal,
      },
    ];

    const snapshotTotals = {
      concepts_subtotal: conceptsSubtotal,
      subtotal_travel: rawSubtotal,
      profit_amount: finalProfitAmount,
      indirect_amount: finalIndirectAmount,
      grand_total: grandTotal,
    };

    return {
      _id,
      __v: data?.__v ?? 0,
      is_active: data?.is_active ?? true,
      type: type.toUpperCase(),
      isCancel_status: data?.isCancel_status || "",
      currentEmpresa: currentEmpresa.toUpperCase(),
      bussiness_cost: bussiness_cost?.toString?.() || bussiness_cost || '',
      client: client?.toString?.() || client || '',
      folio,
      created_day: dateFormat(createdAt),
      updatedAt,
      request_day: dateFormat(request_date),
      delivery_day: dateFormat(delivery_date),
      currentClient: currentClient.toUpperCase(),
      subject,
      email_sent: email_sent || [],
      vehicle: {
        name: flotillaData.modelo,
        placas: flotillaData.placas,
        unit_code: vehicle || flotillaData.placas || '',
        driver,
        driver_address: driver_address || '',
        fuel_card,
        fuel_amount: formatMoney(fuel_amount),
      },
      route,
      kilometer_out: parseInt(kilometer_out || 0),
      kilometer_in: parseInt(kilometer_in || 0),
      fuel_level: fuel_level || 0,
      recorrido_km,
      subtotal_travel: formatMoney(subtotal_travel),
      description: {
        link_googlemaps,
        project_id,
        document_id,
        planPrice: formatMoney(subtotal_travel),
        planDescription: description?.planDescription || "Sin descripción",
        planName: description?.planName || description?.planDescription || "Sin descripción",
        idSlug: description?.idSlug || '',
        flotilla: description?.flotilla || '',
        isActive: description?.isActive ?? true,
        planCreatedAt: description?.createdAt || '',
        planUpdatedAt: description?.updatedAt || '',
        planVersion: description?.__v ?? 0
      },
      cost_breakdown: {
        ...plainCostBreakdown,
        casetas_unit: plainCostBreakdown.casetas_unit || 'fijo',
        casetas_notes: plainCostBreakdown.casetas_notes || '',
        operator_unit: plainCostBreakdown.operator_unit || 'dia',
        per_diem_unit: plainCostBreakdown.per_diem_unit || 'dia',
        gasoline_unit: plainCostBreakdown.gasoline_unit || 'fijo',
        unit_rent_unit: plainCostBreakdown.unit_rent_unit || 'dia',
        unit_rent_qty: plainCostBreakdown.unit_rent_qty || 0,
        // El subtotal real en modo desglose es la suma de conceptos, no subtotal_travel.
        profit_amount: finalProfitAmount,
        indirect_amount: finalIndirectAmount
      },
      snapshot_mode: true,
      line_items: lineItems,
      totals: snapshotTotals,
      pre_flight: pre_flight
        ? (pre_flight.toObject ? pre_flight.toObject() : JSON.parse(JSON.stringify(pre_flight)))
        : {},
      profit_pct: profit_pct ?? 8,
      indirect_pct: indirect_pct ?? 12,
      cargo_description: cargo_description || '',
      subtotal_travel_raw: parseFloat(subtotal_travel || 0),
      origin: origin || '',
      destination: destination || '',
      stops: stops || [],
      cost_center: cost_center || '',
      notes: notes || '',
      tarjeta_deposito: tarjeta_deposito || '',
      casetas: casetas || '',
      payment_method: payment_method || '',
    };
  },
};
