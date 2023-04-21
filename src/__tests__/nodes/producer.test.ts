import { Producer } from "../../external";
import { getId } from "./helper";

const simpleProducer = new Producer("pixbuf", {resource: "test"})
const simpleXMLResult = [
    `<producer id="${getId(simpleProducer)}">`,
    [
        `<property name="resource">${"test"}</property>`,
        '<property name="mlt_service">pixbuf</property>'
    ],
    '</producer>'
]
test('Simple Producer', () => {
    expect(simpleProducer.node.getXML({})).toEqual(simpleXMLResult)
})


const imageProducer = Producer.Image("test")
const imageXMLResult = [
    `<producer id="${getId(imageProducer)}">`,
    [
        `<property name="resource">${"test"}</property>`,
        '<property name="mlt_service">pixbuf</property>'
    ],
    '</producer>'
  ]

test('Image Producer', () => {
    expect(imageProducer.node.getXML({})).toEqual(imageXMLResult)
})

const propertyProducer = Producer.Image("test")
propertyProducer.pushProperty("test", 1)
const propertyXMLResult = [
    `<producer id="${getId(propertyProducer)}">`,
    [
        `<property name="resource">${"test"}</property>`,
        '<property name="mlt_service">pixbuf</property>',
        '<property name="test">1</property>'
    ],
    '</producer>'
]
test('Producer addProperty', () => {
    expect(propertyProducer.node.getXML({})).toEqual(propertyXMLResult)
})

const ProducerLinkXMLResult = [ `<test  producer="${getId(propertyProducer)}"/>` ]
test('Producers Should Link', () => {
    expect(propertyProducer.node.getXML({}, "test")).toEqual(ProducerLinkXMLResult)
})