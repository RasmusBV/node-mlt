import { Service } from "../nodes";
import { Filter, Transition, Consumer } from "../external";

const simpleService = new Service("service", "test", {})

function simpleXMLGenerator(service: Service, mlt_service: string) {
    return [
                `<${service.node.name} id="${service.node.id.id}">`,
                [ 
                    `<property name="mlt_service">${mlt_service}</property>` 
                ],
                `</${service.node.name}>`
            ]
}

const simpleXMLResult = simpleXMLGenerator(simpleService, "test")
test("Simple Service", () => {
    expect(simpleService.node.getXML({})).toEqual(simpleXMLResult)
})

const filter = new Filter("affine", {})
const filterXMLResult = simpleXMLGenerator(filter, "affine")
const transition = new Transition("affine", {})
const transitionXMLResult = simpleXMLGenerator(transition, "affine")
const consumer = new Consumer("avformat", {})
const consumerXMLResult = simpleXMLGenerator(consumer, "avformat")

test("All Services", () => {
    expect(filter.node.getXML({})).toEqual(filterXMLResult)
    expect(transition.node.getXML({})).toEqual(transitionXMLResult)
    expect(consumer.node.getXML({})).toEqual(consumerXMLResult)
})

