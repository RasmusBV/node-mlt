import * as MLT from '../external.js';
const root = new MLT.Root.Builder();
const producer1 = MLT.Producer.Image("Hej");
const producer2 = MLT.Producer.Video("Mel og vand", { in: 20, out: 1000 });
const producer3 = new MLT.Producer.Builder("pango").addProperty("markup", `<span size="600pt" font_family="impact">Top 10 ting nogensinde i verden</span>`).build();
const playlist1 = new MLT.Playlist.Builder()
    .addEntry(producer1, { in: 100, out: 200 })
    .addBlank(50)
    .addEntry(producer1, { in: 200, out: 500 })
    .addEntry(producer2)
    .build();
const playlist2 = new MLT.Playlist.Builder()
    .addEntry(producer2, { in: 200, out: 300 })
    .addBlank(800)
    .addEntry(producer3, { in: 0, out: 200 })
    .build();
const transition = new MLT.Transition.Builder("affine")
    .addProperty("ox", 200)
    .addProperty("oy", 200)
    .build();
const tractor = new MLT.Tractor.Builder()
    .addEntry(playlist1)
    .addEntry(playlist2)
    .addEntry(producer1)
    .addTransition(transition, playlist1, playlist2)
    .build();
const globalFilter1 = new MLT.Filter.Builder("invert").build();
root.addGlobalFilter(globalFilter1);
console.log(root.createDocument(tractor));
