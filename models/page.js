const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PageTextSchema = new Schema({
    data: {type: String, required: true},
    size: {type: String},
    color: {type: String}
},{timestamps: true})

const PageImageSchema = new Schema({
    name: String,
    path: String
},{timestamps: true})

const CarouselImageSchema = new Schema({
    name: String,
    path: String
},{timestamps: true})

const PageLinkSchema = new Schema({
    path: {type: String, required: true},
    text: {type: Schema.Types.ObjectId, ref: 'PageText'}
},{timestamps: true})

const PageCarouselItemSchema = new Schema({
    page: {type: Schema.Types.ObjectId, ref: "Page"},
    background: {type: Schema.Types.ObjectId, ref: 'CarouselImage'},
    header: {type: Schema.Types.ObjectId, ref: 'PageText'},
    description: {type: Schema.Types.ObjectId, ref: 'PageText'},
    link: {type: Schema.Types.ObjectId, ref: 'PageLink'}
},{timestamps: true})

const PageSectionSchema = new Schema({
    page: {type: Schema.Types.ObjectId, ref: "Page"},
    classes: [{type: String}],
    header: {type: Schema.Types.ObjectId, ref: 'PageText'},
    paragraphs: [{type: Schema.Types.ObjectId, ref: 'PageText'}],
    spans: [{type: Schema.Types.ObjectId, ref: 'PageText'}],
    links: [{type: Schema.Types.ObjectId, ref: 'PageLink'}],
    background: {type: Schema.Types.ObjectId, ref: "PageImage"},
    images: [{type: Schema.Types.ObjectId, ref: "PageImage"}]
},{timestamps: true})

const PageSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String},
    keywords: [{type: String}],
    title: {type: String, required: true},
    icon: {type: String, required: true},
    path: {type: String, required: true},
    subtitle: {type: String},
    banner: {type: Schema.Types.ObjectId, ref: 'PageImage'},
    header: {type: String},
    subheader: {type: String},
    carousel: [{type: Schema.Types.ObjectId, ref: 'PageCarouselItem'}],
    sections: [{type: Schema.Types.ObjectId, ref: 'PageSection'}]
},{timestamps: true})

const Page = mongoose.model('Page', PageSchema);
const PageImage = mongoose.model('PageImage', PageImageSchema);
const PageText = mongoose.model('PageText', PageTextSchema);
const PageLink = mongoose.model('PageLink', PageLinkSchema);
const PageSection = mongoose.model('PageSection', PageSectionSchema);
const CarouselImage = mongoose.model('CarouselImage', CarouselImageSchema);
const PageCarouselItem = mongoose.model('PageCarouselItem', PageCarouselItemSchema);


module.exports = {Page, PageImage, CarouselImage, PageSection, PageCarouselItem, PageLink, PageText}
