const shippo = require('shippo')(process.env.SHIPPO_KEY);
const db = require('../models');
const Shipment = db.Shipment;
const AppSetting = db.AppSetting;
const CartItem = db.CartItem;
const Product = db.Product;

exports.validateAddress = async(req, res, next) => {
    //validate the to address
    const toAddress = shippo.address.create({
        name: req.body.name,
        street1: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        country: req.body.country,
        validate: true
    });
    if(toAddress.validation_results.is_valid){
        //receiving address is valid
        return res.status(200).send({
            statusMessage: 'Address valid.',
            shippoAddressId: toAddress.object_id
        });
    }else{
        return res.status(400).json({
            type: 'Error',
            statusMessage: 'The address provided is invalid.'
        });
    }
}

exports.calculateShippingRates = async(req, res, next) => {
    //find the cheapest and the fastest options
    try{
        const fromAddress = await AppSetting.findOne({
            attributes: ['id', 'shippoId'],
            where: {
                category: 'from_address'
            },
            raw: true
        });
        //add padding 2 inches to each parcel dimension
        const parcelLength = Number(res.locals.packageDimensions.maxLength) + 2;
        const parcelWidth = Number(res.locals.packageDimensions.maxWidth) + 2;
        const parcelHeight = Number(res.locals.packageDimensions.totalHeight) + 2;
        //create a parcel
        const parcel = shippo.parcel.create({
            length: parcelLength,
            width: parcelWidth,
            height: parcelHeight,
            distance_unit: "in",
            weight: Number(res.locals.packageDimensions.weight),
            mass_unit: "oz"
        });
        //create a shipment
        const shipment = shippo.shipment.create({
            address_from: fromAddress.shippoId,
            address_to: req.body.toAddressShippoId,
            parcel: parcel,
            async: true
        });
        //retrieve rates for the shipment
        const rates = shippo.shipment.rates(shipment.object_id);
        return res.status(200).json({
            rates,
            statusMessage: 'Shipment rates retrieved.'
        });
    }catch(e){
        console.error(e);
        next(e);
    }
}

exports.generateShippingLabel = async(req, res, next) => {
    try{
        //check if any items are deliverable
        const deliverableCartItemCount = await CartItem.count({
            col: 'id',
            include: [{
                model: Product,
                attributes: [],
                where: {
                    deliverable: true
                }
            }]
        });
        if(deliverableCartItemCount > 0){
            //get the shipment rate
            const rate = await shippo.shipment.retrieve(req.body.rateId);
            //add amount to the order
            res.locals.order.total += rate.amount;
            //create a shipment object for this order
            const shipment = await Shipment.create({
                orderId: res.locals.order.id,
                shipmentId: rate.shipment,
                rateId: req.body.rateId,
                transactionId: transaction.object_id
            });
        }
        next();
    }catch(e){
        next(e);
    }
}