import * as React from 'react'
import { useState, useEffect } from 'react'
import { PageSection, Title } from '@patternfly/react-core'
import * as d3 from 'd3'
import { geoEqualEarth, geoAlbersUsa, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import { Feature, FeatureCollection, Geometry } from 'geojson'
const uuid = require('react-uuid')
import useDataApi from '../utils/useDataApi'

// const mapjson = require('@app/data/VA-51-virginia-counties.json'); // cb_2015_virginia_county_20m
const mapjson = require('@app/data/us-counties-10m.json'); //counties, states

const pointdata: { name: string; coordinates: [number, number] }[] = [
    { name: 'Farm', coordinates: [-77.560891, 38.967067] },
]
const aldieLat: number = 38.969463
const aldieLon: number = -77.559401
const scale: number = 1900
const cx: number = -400
const cy: number = -40
const WorldMap = (params) => {
    const [geographies, setGeographies] = useState<[] | Array<Feature<Geometry | null>>>([])
    const [moreGeographies, setMoreGeographies] = useState<[] | Array<Feature<Geometry | null>>>([])
    useEffect(() => {
        // const mapFeatures: Array<Feature<Geometry | null>> = ((feature(mapjson, mapjson.objects.cb_2015_virginia_county_20m) as unknown) as FeatureCollection).features

        const mapFeatures: Array<Feature<Geometry | null>> = ((feature(mapjson, mapjson.objects.counties) as unknown) as FeatureCollection).features
        setGeographies(mapFeatures)
        const moreMapFeatures: Array<Feature<Geometry | null>> = ((feature(mapjson, mapjson.objects.states) as unknown) as FeatureCollection).features
        setMoreGeographies(moreMapFeatures)
    }, [])

    const projection = geoAlbersUsa().scale(scale).translate([cx, cy])

    function returnProjectionValueWhenValid(point: [number, number], index: number) {
        const retVal: [number, number] | null = projection(point)
        if (retVal?.length) {
            return retVal[index]
        }
        return 0
    }

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
                        // onMouseEnter={() => setIsRotate(false)}
                        />
                    ))}
                </g>
            </svg>
        </>
    )
}

export { WorldMap }
