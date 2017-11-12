var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Schema_Image = new Schema({
	url : String,
	public_id : String,
	name: String,
	created_at : Date,
	updated_at : Date
});

Schema_Image.pre('save',function(next){
	var cur = new Date().toISOString()
	this.updated_at = cur;
	if(!this.created_at){
		this.created_at = cur;
		next();
	}
});

module.exports = mongoose.model('Image', Schema_Image);
