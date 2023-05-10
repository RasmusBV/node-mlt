# **Node-MLT**
A Package for generating and executing XML Documents for the [MLT Multimedia Framework](https://www.mltframework.org/ "MLT Multimedia Framework").

# **Disclaimer**
I am **not** an expert on the MLT Framework, far from. I have had a hard time finding up-to-date documentation for the MLT Framework as a whole, so this is my best attempt at creating a package for generating valid XML Documents. 

This package is still in early development, and this is my first npm package so expect more features, improvements and documentation in the future.

Finally, feel free to leave leave a message [here](https://github.com/RasmusBV/node-mlt/issues "RasmusBV/node-mlt/issues") if you have any suggestions or bug reports.

# **Basic Usage**
## **Document Creation**
### Creating a Playlist consisting of 2 Producers
```TypeScript
import { MLT } from 'node-mlt'

// Creating 2 producers
const firstProducer = new MLT.Producer("color", {resource: "orange"})

const secondProducer = MLT.Producer.Image("/path/to/image")

// Placing them within a Playlist
const playlist = new MLT.Playlist([{
    element: firstProducer,
    timestamp: {in: 0, out: 200}
}, {
    element: secondProducer,
    timestamp: {in: 0, out: 300}
}])
```

### Applying a Filter to that playlist using a Tractor
```TypeScript
// Placing the Playlist within the Multitrack of a Tractor
const tractor = new MLT.Tractor([{
    element: playlist
}])

// Creating a Filter
const greyscaleFilter = new MLT.Filter("grayscale")

// Adding the Filter to the Playlist within the Tractor
tractor.addFilter(greyscaleFilter, playlist)
```

### Creating a Consumer and adding everything to a Document
```TypeScript
// Creating a Consumer
const consumer = MLT.Consumer.Video("path/to/save/video")

// Generating a Document with the Tractor as the root
const document = new MLT.Document()
    .addRoot(tractor)
    .addConsumer(consumer)
```
## **Document options**
### **Executing a document directly with the melt commandline utility**
```TypeScript
MLT.melt(document)
```
*This is only possible if the melt CLI is installed*
### **Saving a document in an XML file**
```TypeScript
document.saveAsXMLDocument("path/to/save/document.xml")
```

### **Generating a string containing the XML for the document**
```TypeScript
document.generateDocumentString()
```