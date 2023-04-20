import { Service } from "../nodes";
import { Filter, Transition, Consumer } from "../external";

const simpleService = new Service("service", "test", {})

function simpleXMLGenerator(service: Service<string>, mlt_service: string) {
    return [
                `<${service.name} id="${service.id.id}">`,
                [ 
                    `<property name="mlt_service">${mlt_service}</property>` 
                ],
                `</${service.name}>`
            ]
}


const simpleXMLResult = simpleXMLGenerator(simpleService, "test")
test("Simple Service", () => {
    expect(simpleService.getXML({})).toEqual(simpleXMLResult)
})

const filter = new Filter("affine", {})
const filterXMLResult = simpleXMLGenerator(filter, "affine")
const transition = new Transition("affine", {})
const transitionXMLResult = simpleXMLGenerator(transition, "affine")
const consumer = new Consumer("avformat", {})
const consumerXMLResult = simpleXMLGenerator(consumer, "avformat")

test("All Services", () => {
    expect(filter.getXML({})).toEqual(filterXMLResult)
    expect(transition.getXML({})).toEqual(transitionXMLResult)
    expect(consumer.getXML({})).toEqual(consumerXMLResult)
})

