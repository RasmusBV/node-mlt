"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MLT = __importStar(require("../external.js"));
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
