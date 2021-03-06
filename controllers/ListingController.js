const Promise = require('bluebird')
const turbo = require('turbo360')({site_id:process.env.TURBO_APP_ID})
const resource = 'listing'

 /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	'Listing' is a generic entity with attributes that would be used in
	many startup databases. For example, every Listing has a profile
	attribute, description, image, name, price, and location. A Listing
	can be thought of as a "widget"
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


const slugify = function(text){
 	return text.toString().toLowerCase()
			.replace(/\s+/g, '-')           // Replace spaces with -
			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
			.replace(/\-\-+/g, '-')         // Replace multiple - with single -
			.replace(/^-+/, '')             // Trim - from start of text
			.replace(/-+$/, '');            // Trim - from end of text
}

module.exports = {
	get: (params) => {
		return new Promise((resolve, reject) => {
			// For search
			if (params.query) {
				let search = params.query.split(' ');
				turbo.fetch(resource, null)
				.then(data => {
					let listings = [];
					for (i=0; i<data.length; i++) {
						for (j=0; j<search.length; j++) {
							if ((data[i].keywords.toLowerCase().indexOf(search[j]) >= 0)) {
								if (listings.indexOf(data[i]) == -1) listings.push(data[i]);
							}
						}
					}
					resolve(listings);
				}).catch(err => { reject(err) })
				return;
			}

			turbo.fetch(resource, params)
			.then(data => {
				resolve(data)
			})
			.catch(err => {
				reject(err)
			})
		})
	},

	getById: (id) => {
		return new Promise((resolve, reject) => {
			turbo.fetchOne(resource, id)
			.then(data => {
				resolve(data)
			})
			.catch(err => {
				reject(new Error(resource + ' ' + id + ' not found'))
			})
		})
	},

	search: () => {
		return new Promise((resolve, reject) => {
			turbo.fetch
		})
	},

	post: (params) => {
		return new Promise((resolve, reject) => {
			if (params.slug == null)
				params['slug'] = slugify(params.name)
			
			turbo.create(resource, params)
			.then(data => {
				resolve(data)
			})
			.catch(err => {
				reject(err)
			})
		})
	},

	put: (id, params) => {
		return new Promise((resolve, reject) => {
			turbo.updateEntity(resource, id, params)
			.then(data => {
				resolve(data)
			})
			.catch(err => {
				reject(err)
			})
		})
	},

	delete: (id) => {
		return new Promise((resolve, reject) => {
			
		})
	}

}

