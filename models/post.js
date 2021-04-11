const mongoose = require('mongoose')
const marked = require('marked')
const slugify = require('slugify')
const createDomPurifier = require('dompurify')
const { JSDOM } = require('jsdom') 
const dompurify = createDomPurifier(new JSDOM().window) 

const postSchema = new mongoose.Schema(
	{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        }, 
        content: {
            type: String,
            required: true
        },
        publishedDate: {
            type: Date,
            default: Date.now
        },
        slug: {
            type: String,
            required: true,
            unique: true
        }, 		    
        sanitizedHtml: {
	        type: String,
	        required: true
        }
	}
)

postSchema.pre('validate', function (next) {
    if(this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true})
    }

    if(this.content) {
        this.sanitizedHtml = dompurify.sanitize(marked(this.content))
    }

    next()
})

module.exports = mongoose.model('Post', postSchema)