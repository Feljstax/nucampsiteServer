//Define campsite schema and model in this file

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Loads new currency type into mongoose so it's available for the schemas to use
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

//Create schema for subdocument
const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

//Create main schema here
//1st argument is object that contains schema properties
//2nd argument is optional used for setting various confiig options
const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    //Add schema as a subdocument for main schema
    //This will allow every campsite document to be able to contain multiple comment documents stored within an array
    comments: [commentSchema]
}, {
    //gives createdAt and updatedAt properties
    timestamps: true
});

//Create a model using this Schema. 
//1st argument is always capitalized and singular collection name for model. Mongoose will look for campsites collection
//2nd argument is the schema
//It returns a constuctor function. Use it to instantiate objects (documents) for MongoDB
const Campsite = mongoose.model('Campsite', campsiteSchema);

module.exports = Campsite;

