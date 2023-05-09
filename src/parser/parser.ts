import { DOMBuilder, FinishedElement } from "./DOMBuilder";
import { DOMCrawler } from "./DOMCrawler";

async function parse(string: string) {
    const builder = new DOMBuilder()
    const crawler = new DOMCrawler()
    const dom = await new Promise((resolve: (dom: FinishedElement<"mlt">) => void, reject) => {
        builder.on("end", (dom: FinishedElement<"mlt">) => {
            resolve(dom)
        }).on("error", (e) => reject(e))
        builder.parse(string)
    })
    return crawler.crawl(dom)
}

const document = `
<?xml version="1.0" encoding="utf-8"?>
<mlt>
    <producer out="500" id="producer_3">
        <property name="resource">test</property>
        <property name="mlt_service">avformat</property>
    </producer>
    <producer id="producer_1">
        <property name="resource">test</property>
        <property name="mlt_service">pixbuf</property>
    </producer>
    <producer in="0" out="200" id="producer_2">
        <property name="resource">test</property>
        <property name="mlt_service">pixbuf</property>
    </producer>
    <playlist id="playlist_2">
        <entry  producer="producer_1" in="0" out="100"/>
        <blank length="200"/>
        <entry  producer="producer_3"/>
    </playlist>
    <playlist id="playlist_1">
        <entry  producer="producer_1" in="0" out="500"/>
        <entry  producer="producer_2" in="110" out="300"/>
    </playlist>
    <tractor id="tractor_1">
        <multitrack id="multitrack_1">
            <track  producer="playlist_1"/>
            <track  producer="playlist_2" in="200" out="500"/>
        </multitrack>
        <filter id="filter_1">
            <property name="track">0</property>
            <property name="mlt_service">invert</property>
        </filter>
    </tractor>
    <tractor id="tractor_3">
        <multitrack id="multitrack_3">
            <playlist id="playlist_3">
                <entry  producer="tractor_1" in="0" out="2000"/>
                <entry  producer="producer_3"/>
            </playlist>
            <tractor in="100" out="500" id="tractor_2">
                <multitrack id="multitrack_2">
                    <track  producer="playlist_2"/>
                    <track  producer="tractor_1"/>
                    <track  producer="producer_1" in="500" out="1000"/>
                </multitrack>
                <transition in="200" out="300" id="transition_1">
                    <property name="a_track">0</property>
                    <property name="b_track">1</property>
                    <property name="mlt_service">composite</property>
                </transition>
            </tractor>
        </multitrack>
        <filter in="300" out="400" id="filter_1">
            <property name="track">0</property>
            <property name="mlt_service">invert</property>
        </filter>
        <transition id="transition_1">
            <property name="a_track">0</property>
            <property name="b_track">1</property>
            <property name="mlt_service">composite</property>
        </transition>
    </tractor>
</mlt>
`

parse(document).then((doc) => {
    console.log(JSON.stringify(doc, null, 4))
})