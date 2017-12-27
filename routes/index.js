const turbo = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()
const controllers = require('../controllers')

const USER_NOT_LOGGED_IN = 'User%20Not%20Logged%20In'

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	This route handles various page requests. Pages are 
	organized into static and non-static pages. Static pages
	simply render HTML with no dynamic data. Non-static pages
	require dynamic data and typically make a Turbo request
	to fetch or update the necessary data.
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// add more static pages here if necessary
const staticPages = {
	landing: 'landing'
}

// this route loads the landing/home page. It is the primary
// promotional page for the app and should strongly accentuate
// the key value proposition as well as guide the visitor to
// a prominent call-to-action registration form:
router.get('/', (req, res) => {
    turbo.pageData('home')
    .then(static => {
    	if (!req.vertexSession || !req.vertexSession.user){ // user not logged in, redirect to error page:
			controllers.listing.get(req.query)
			.then(listings => {
				controllers.user.get(req.query)
				.then(featured => {
					res.render(static.template, {listings: listings, user: null, featured_hosts: featured, static: static})
				})
				.catch(err => {
					res.redirect('/error?message=' + err.message)
				})
			})
			.catch(err => {
				res.redirect('/error?message=' + err.message)
			})
			return
		}

		controllers.user.getById(req.vertexSession.user.id)
		.then(user => {
			controllers.listing.get(req.query)
			.then(listings => {
				controllers.user.get(req.query)
				.then(featured => {
					console.log(featured)
					res.render(static.template, {listings: listings, user: user, featured_hosts: featured, static: static})				
				})
				.catch(err => {
					res.redirect('/error?message=' + err.message)
				})
			})
			.catch(err => {
				res.redirect('/error?message=' + err.message)
			})
		})
		.catch(err => {
			res.redirect('/error?message=' + err.message)
		})

    })
    .catch(err => {
        res.redirect('/error?message=' + err)
    })
})

// this template does not load unless the user is logged in.
// If not, it routes to the 'error' template with corrensponding
// error message. The 'dashboard' template is for updating
// user profile information and general user management functions:
router.get('/dashboard', (req, res) => {
	if (req.vertexSession == null){ // user not logged in, redirect to error page:
		res.redirect('/error?message=' + USER_NOT_LOGGED_IN)
		return
	}

	if (req.vertexSession.user == null){ // user not logged in, redirect to error page:
		res.redirect('/error?message=' + USER_NOT_LOGGED_IN)
		return
	}

	controllers.user.getById(req.vertexSession.user.id)
	.then(data => {
		res.render('dashboard', {user: data}) // user data passed in as "user" key for Mustache rendering
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

// Probably best to create a "dashboard" route
// and nest "listings" under that route
router.get('/dashboard/listings', (req, res) => {
	if (req.vertexSession == null){ // user not logged in, redirect to error page:
		res.redirect('/error?message=' + USER_NOT_LOGGED_IN)
		return
	}

	if (req.vertexSession.user == null){ // user not logged in, redirect to error page:
		res.redirect('/error?message=' + USER_NOT_LOGGED_IN)
		return
	}

	controllers.user.getById(req.vertexSession.user.id)
	.then(user => {

		controllers.listing.get({ owner: req.vertexSession.user.id })
		.then(data => {
			console.log('listings: ', data)
			res.render('dashboard_listings', {user: user, listings: data}) // user data passed in as "user" key for Mustache rendering
		})
		.catch(err => {
			res.redirect('/error?message=' + err.message)
		})
		
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

router.get('/profiles', (req, res) => {
	controllers.user.get(req.query)
	.then(data => {
		res.render('profiles', {profiles: data})
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

router.get('/profile/:username', (req, res) => {
	controllers.user.getById(req.vertexSession.user.id)
	.then(user => {
		controllers.user.get({username:req.params.username})
		.then(data => {
			if (data.length == 0){ // not found, throw error
				throw new Error('User not found.')
				return
			}

			const profile = data[0]
			controllers.listing.get({ owner: profile.id })
			.then(listings => {
				res.render('profile', {user: user, profile: profile, listings: listings})
			})
			.catch(err => {
				res.redirect('/error?message=' + err.message)
			})
		})
		.catch(err => {
			res.redirect('/error?message=' + err.message)
		})
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

// this page shows all blog posts currently on the app:
router.get('/blog', (req, res) => {
	controllers.post.get(req.query)
	.then(data => {
		res.render('blog', {posts: data})
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})


// this page shows and individual blog post specified by slug:
router.get('/post/:slug', (req, res) => {
	controllers.post.get({slug:req.params.slug})
	.then(data => {
		if (data.length == 0){ // not found, throw error
			throw new Error('Post not found.')
			return
		}

		const post = data[0]
		res.render('post', {post: post})
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

router.get('/listings', (req, res) => {
	if (!req.vertexSession || !req.vertexSession.user){ // user not logged in, redirect to error page:
		controllers.listing.get(req.query)
		.then(data => {
			res.render('listings', {listings: data, user: null})
		})
		.catch(err => {
			res.redirect('/error?message=' + err.message)
		})
		return
	}

	controllers.user.getById(req.vertexSession.user.id)
	.then(user => {
		controllers.listing.get(req.query)
		.then(data => {
			res.render('listings', {listings: data, user: user})
		})
		.catch(err => {
			res.redirect('/error?message=' + err.message)
		})
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

router.get('/listing/:slug', (req, res) => {

	if (!req.vertexSession || !req.vertexSession.user){ // user not logged in, redirect to error page:
		controllers.listing.get({slug:req.params.slug})
		.then(data => {
			if (data.length == 0){ // not found, throw error
				throw new Error('Listing not found.')
				return
			}

			const listing = data[0];
			controllers.user.getById(listing.owner)
			.then(user => {
				res.render('listing', {listing: listing, owner: user})
			})
			.catch(err => {
				res.redirect('error?message=' + err.message)
			})
		})
		.catch(err => {
			res.redirect('/error?message=' + err.message)
		})
		return
	}

	controllers.user.getById(req.vertexSession.user.id)
	.then(user => {
		controllers.listing.get({slug:req.params.slug})
		.then(data => {
			if (data.length == 0){ // not found, throw error
				throw new Error('Listing not found.')
				return
			}

			const listing = data[0];
			controllers.user.getById(listing.owner)
			.then(owner => {
				res.render('listing', {listing: listing, owner: owner, user: user})
			})
			.catch(err => {
				res.redirect('error?message=' + err.message)
			})
		})
		.catch(err => {
			res.redirect('/error?message=' + err.message)
		})
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})

})

router.get('/pricing', (req, res) => {
	if (!req.vertexSession || !req.vertexSession.user){ // user not logged in, redirect to error page:
		res.render('pricing', { user: null });
	}
	controllers.user.getById(req.vertexSession.user.id)
	.then(user => {
		res.render('pricing', { user: user });
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

router.get('/contact', (req, res) => {
	if (!req.vertexSession || !req.vertexSession.user){ // user not logged in, redirect to error page:
		res.render('contact', { user: null });
	}
	controllers.user.getById(req.vertexSession.user.id)
	.then(user => {
		res.render('contact', { user: user });
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

router.get('/about', (req, res) => {
	if (!req.vertexSession || !req.vertexSession.user){ // user not logged in, redirect to error page:
		res.render('about', { user: null });
	}
	controllers.user.getById(req.vertexSession.user.id)
	.then(user => {
		res.render('about', { user: user });
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})

router.get('/documentation', (req, res) => {
	if (!req.vertexSession || !req.vertexSession.user){ // user not logged in, redirect to error page:
		res.render('docs', { user: null });
	}
	controllers.user.getById(req.vertexSession.user.id)
	.then(user => {
		res.render('docs', { user: user });
	})
	.catch(err => {
		res.redirect('/error?message=' + err.message)
	})
})


// this page handles general errors. the error message is passed
// in as a query parameter with key "message" and rendered in the 
// template via Mustache templating:
router.get('/error', (req, res) => {
	res.render('error', {message: req.query.message})
})

// these are for static pages:
router.get('/:page', (req, res) => {
	const page = staticPages[req.params.page]
	if (page == null){
		res.render('error', {message: 'Page not found'})
		return
	}

	res.render(page, null)
})


module.exports = router
