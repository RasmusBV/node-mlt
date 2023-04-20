import { Producer } from "../external";
import { resolve, join } from 'path'

const testcard = resolve(join(__dirname, "Test_card.png"))
const simpleProducer = new Producer("pixbuf", {resource: testcard})
const simpleXMLResult = [
    `<producer id="${simpleProducer.id.id}">`,
    [
        `<property name="resource">${testcard}</property>`,
        '<property name="mlt_service">pixbuf</property>'
    ],
    '</producer>'
]
test('Simple Producer', () => {
    expect(simpleProducer.getXML({})).toEqual(simpleXMLResult)
})


const imageProducer = Producer.Image(testcard)
const imageXMLResult = [
    `<producer id="${imageProducer.id.id}">`,
    [
        `<property name="resource">${testcard}</property>`,
        '<property name="mlt_service">pixbuf</property>'
    ],
    '</producer>'
  ]

test('Image Producer', () => {
    expect(imageProducer.getXML({})).toEqual(imageXMLResult)
})

const propertyProducer = Producer.Image(testcard)
propertyProducer.addProperty("test", 1)
const propertyXMLResult = [
    `<producer id="${propertyProducer.id.id}">`,
    [
        `<property name="resource">${testcard}</property>`,
        '<property name="mlt_service">pixbuf</property>',
        '<property name="test">1</property>'
    ],
    '</producer>'
]
test('Producer addProperty', () => {
    expect(propertyProducer.getXML({})).toEqual(propertyXMLResult)
})

const ProducerLinkXMLResult = [ `<test  producer="${propertyProducer.id.id}"/>` ]
test('Producer Linking', () => {
    expect(propertyProducer.getXML({}, "test")).toEqual(ProducerLinkXMLResult)
})