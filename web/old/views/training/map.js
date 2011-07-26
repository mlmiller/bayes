//our documents look something like {'class':'boy', 'property_1':val_1, ..., 'property_n':val_n}
function(doc) {
    if (doc && doc.class) { //tagged training data!
        for (key in doc) {
            if (typeof(doc[key])=="number"){
                emit( [doc.class, key], doc[key]);
            }
        }
    }
}