const searchAndFilter = function(req, res, next){

    let query;

    
    if(req.query.hasOwnProperty('price') &&  req.query.hasOwnProperty('priceSort') && req.query.hasOwnProperty('priceRange')){
        
        let productPrice = parseInt(req.query.price) ;
        let priceSort = req.query.priceSort;
        let priceRange = req.query.priceRange;
        if(req.query.priceRange === 'gt' || req.query.priceRange === 'lt'){
            priceRange = '$'+req.query.priceRange
            
        }else{
            priceRange = '$gt';
        }
        if(req.query.priceSort === 'asc' || req.query.priceSort === 'dsc'){
            priceSort = req.query.priceSort;
        }else{
            priceSort = 'asc';
        }

        // price $gt 
        query = { price: { priceRange: productPrice } };

    }

    const price = req.query.hasOwnProperty('price') ? parseInt(req.query.price) : 1;
    const priceSort = req.query.hasOwnProperty('priceSort') ? parseInt(req.query.priceSort) : 1;
    const stock = req.query.hasOwnProperty('stock') ? parseInt(req.query.stock) : 5;
    const stockSort = req.query.hasOwnProperty('price') ? parseInt(req.query.stockSort) : 1;
    req.page = page;
    req.pageSize = pageSize;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 5;
    req.page = page;
    req.pageSize = pageSize;

    next();
}



module.exports = searchAndFilter;