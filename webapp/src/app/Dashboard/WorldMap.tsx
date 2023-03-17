import * as React from 'react'
import { useState, useEffect } from 'react'
import { PageSection, Title } from '@patternfly/react-core'
import * as d3 from 'd3'
import { geoEqualEarth, geoAlbersUsa, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import { Feature, FeatureCollection, Geometry } from 'geojson'
const uuid = require('react-uuid')
import useDataApi from '@app/utils/useDataApi'

const vamapjson = require('@app/data/VA-51-virginia-counties.json'); // cb_2015_virginia_county_20m
const mapjson = require('@app/data/us-counties-10m.json'); //counties, states
const flightsapiurl = 'TBD-RICH' // TODO set this from ENV and dynamically somehow

const pointdata: { name: string; coordinates: [number, number] }[] = [
    { name: 'Farm', coordinates: [-77.560891, 38.967067] },
]

const aldieLat: number = 38.969463
const aldieLon: number = -77.559401
const scale: number = 1900
const cx: number = -400
const cy: number = -40
///
/// The main component
///
const WorldMap = (params) => {
    const [geographies, setGeographies] = useState<[] | Array<Feature<Geometry | null>>>([])
    const [moreGeographies, setMoreGeographies] = useState<[] | Array<Feature<Geometry | null>>>([])
    const [flightsData, setFlightsData] = useState<[] | Array<Feature<Geometry | null>>>([])
    
    const fdjson:any = useDataApi(flightsapiurl, [])  // call out to external URL to get flights data

    useEffect(() => {
        // this might be a better vecor map but it's not rendering at the moment - need to validate the json
        //const vamapFeatures: Array<Feature<Geometry | null>> = ((feature(mapjson, vamapjson.objects.cb_2015_virginia_county_20m) as unknown) as FeatureCollection).features
        const mapFeatures: Array<Feature<Geometry | null>> = ((feature(mapjson, mapjson.objects.counties) as unknown) as FeatureCollection).features
        setGeographies(mapFeatures)

        const moreMapFeatures: Array<Feature<Geometry | null>> = ((feature(mapjson, mapjson.objects.states) as unknown) as FeatureCollection).features
        setMoreGeographies(moreMapFeatures)

        if (fdjson.objects) {
            const fd: Array<Feature<Geometry | null>> = ((feature(mapjson, fdjson.objects.flights) as unknown) as FeatureCollection).features
            setFlightsData(fd)
        }   
        
        // alternativecode to featch from flights API service
        // fetch(flightsapiurl).then((response) => {
        //     if (response.status !== 200) {
        //         // eslint-disable-next-line no-console
        //         console.log(`Houston we have a problem: ${response.status}`)
        //         return
        //     }
        //     response.json().then((returnedData) => {
        //         const fd: Array<Feature<Geometry | null>> = ((feature(returnedData, flight.objects) as unknown) as FeatureCollection).features
        //         setFlightsData(fd)
        //     })
        // })

    }, [])

    //
    // config the map projection here
    ///
    const projection = geoAlbersUsa().scale(scale).translate([cx, cy])

    ///
    /// Turn coordinate into a projection cx,cy
    ///
    function returnProjectionValueWhenValid(point: [number, number], index: number) {
        const retVal: [number, number] | null = projection(point)
        if (retVal?.length) {
            return retVal[index]
        }
        return 0
    }

    ///
    /// The component returns a map, which is in the form of a SVG
    ///
    return (
        <>
            <svg width={scale * 3} height={scale * 3} viewBox="0 0 800 450">
                <g>
                    {(moreGeographies as []).map((d, i) => (
                        <path
                            key={`path-${uuid()}`}
                            d={geoPath().projection(projection)(d) as string}
                            fill={`rgba(38,50,56,${(1 / (moreGeographies ? moreGeographies.length : 0)) * i})`}
                            stroke="aliceblue"
                            strokeWidth={0.5}
                        />
                    ))}
                </g>
                <g>
                    {(geographies as []).map((d, i) => (
                        <path
                            key={`path-${uuid()}`}
                            d={geoPath().projection(projection)(d) as string}
                            fill={`rgba(38,50,56,${(1 / (geographies ? geographies.length : 0)) * i})`}
                            stroke="aliceblue"
                            strokeWidth={0.5}
                        />
                    ))}
                </g>
                <g>
                    {pointdata.map((d, i) => (
                        <circle
                            key={`marker-${uuid()}`}
                            cx={returnProjectionValueWhenValid(d.coordinates, 0)}
                            cy={returnProjectionValueWhenValid(d.coordinates, 1)}
                            r={3}
                            fill="#E91E63"
                            stroke="#FFFFFF"
                        // onClick={() => handleMarkerClick(i)}
                        />
                    ))}
                </g>
                <g>
                    {flightsData.map((d, i) => (
                        <svg className="airsvg" key={`marker-${uuid()}`} 
                        x={returnProjectionValueWhenValid(d.coordinates, 0)}
                        y={returnProjectionValueWhenValid(d.coordinates, 1)}
                        width="10" height="10"
                        viewBox="0 0 512 512"
                        >
                        <g className="airsvg-g" transform="rotate(45)">
                            <path className="airsvg-path1" d="M256,0C114.614,0,0,114.614,0,256s114.614,256,256,256s256-114.614,256-256S397.386,0,256,0z M256,448c-105.867,0-192-86.133-192-192S150.133,64,256,64s192,86.133,192,192S361.867,448,256,448z"/>
                            <path className="airsvg-path2" d="M365.125,248.742v-28.946c0-4.176-3.414-7.59-7.59-7.59s-7.594,3.414-7.594,7.59v14.336l-0.07,6.594l-20.11-10.566v-28.613c0-4.176-3.418-7.594-7.594-7.594s-7.594,3.418-7.594,7.594v14.109l-0.07,6.485l-31.614-16.606l1.672-67c0-15.711-12.855-28.562-28.562-28.562c-15.711,0-28.562,12.851-28.562,28.562l1.672,67l-21.699,11.398l-9.989,5.164v-20.55c0-4.176-3.418-7.594-7.594-7.594c-4.176,0-7.59,3.418-7.59,7.594v28.613l-13.852,7.278l-6.332,3.242v-20.883c0-4.176-3.414-7.59-7.59-7.59c-4.18,0-7.594,3.414-7.594,7.59v28.946l-36.637,19.25v24.398l-0.043,6.734l0.043-0.011v0.164l96.934-26.676l23.453-6.414l2.469,98.938l-22.554,7.551c-3.164,1.058-5.297,4.019-5.297,7.355v14.23c0,5.336,5.262,9.078,10.301,7.332l37.918-13.141c1.649-0.57,3.438-0.57,5.082,0l37.918,13.141c5.043,1.746,10.301-1.996,10.301-7.332v-14.23c0-3.336-2.133-6.297-5.297-7.355l-22.554-7.551l2.004-80.16l0.504-18.809l94.554,26.024l25.637,7.102v-0.047l0.16,0.043v-31.286L365.125,248.742z"/>
                        </g>
                        </svg>
                    ))}
                </g>
            </svg>
        </>
    )
}

export { WorldMap }
