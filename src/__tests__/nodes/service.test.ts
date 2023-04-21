import { Service } from "../../nodes";
import { Filter, Transition, Consumer } from "../../external";
import { getId } from "./helper";

const simpleService = new Service("service", "test", {})

function simpleXMLGenerator(service: Service, name: string, mlt_service: string) {
    return [
                `<${name} id="${getId(service)}">`,
                [ 
                    `<property name="mlt_service">${mlt_service}</property>` 
                ],
                `</${name}>`
            ] as [string, string[], string]
}

const simpleXMLResult = simpleXMLGenerator(simpleService, "service", "test")
test("Simple Service", () => {
    expect(simpleService.node.getXML({})).toEqual(simpleXMLResult)
})

const filter = new Filter("affine", {})
const filterXMLResult = simpleXMLGenerator(filter, "filter", "affine")
const transition = new Transition("affine", {})
const transitionXMLResult = simpleXMLGenerator(transition, "transition", "affine")
const consumer = new Consumer("avformat", {})
const consumerXMLResult = simpleXMLGenerator(consumer, "consumer", "avformat")

test("All Services", () => {
    expect(filter.node.getXML({})).toEqual(filterXMLResult)
    expect(transition.node.getXML({})).toEqual(transitionXMLResult)
    expect(consumer.node.getXML({})).toEqual(consumerXMLResult)
})

const propertyService = new Service("service", "test", {})
propertyService.pushProperty("test", 1)
const propertyXMLResult = simpleXMLGenerator(propertyService, "service", "test")
propertyXMLResult[1].push('<property name="test">1</property>')
test("Service addProperty", () => {
    expect(propertyService.node.getXML({})).toEqual(propertyXMLResult)
})
test("Services Should Not Link", () => {
    expect(propertyService.node.getXML({})).toEqual(propertyXMLResult)
})