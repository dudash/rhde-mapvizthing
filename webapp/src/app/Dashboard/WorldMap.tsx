import * as React from 'react'
import { useState, useEffect } from 'react'
import { PageSection, Title } from '@patternfly/react-core'
import { Button, Tooltip } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import MinusCircleIcon from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import {
    Alert,
    AlertProps,
    AlertGroup,
    AlertActionCloseButton,
    AlertVariant,
    InputGroup
} from '@patternfly/react-core';
import { Label } from '@patternfly/react-core';
import { Badge } from '@patternfly/react-core';
import * as d3 from 'd3'
import { geoEqualEarth, geoAlbersUsa, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import { Feature, FeatureCollection, Geometry } from 'geojson'
import axios from 'axios'
import animationFrame from '../utils/animationFrame' 

const uuid = require('react-uuid')
// const vamapjson = require('@app/data/VA-51-virginia-counties.json'); // cb_2015_virginia_county_20m
const mapjson = require('@app/data/us-counties-10m.json'); //counties, states
const FLIGHTS_API_URL = process.env.REACT_APP_FLIGHT_API_SERVICE_URL || 'http://ads-b-service.local:30000/ads-b-states'
console.log("webapp is polling for flight data by talking to: " + FLIGHTS_API_URL);
const pointdata: { name: string; coordinates: [number, number] }[] = [
    { name: 'Dulles International Airport (IAD)', coordinates: [-77.45653879999998, 38.9531162] },
    { name: 'Reagan National Airport (DCA)', coordinates: [-77.035999856, 38.851329928] },
    { name: 'Thurgood Marshall Airport (BWI)', coordinates: [-76.667663996, 39.171832646] }
]

const scale: number = 15000
const cx: number = -3700
const cy: number = 620
var currentCx:number = cx
var currentCy:number = cy
var currentScale:number = scale

///
/// The main component
///
const WorldMap = (params) => {
    // const [altmapgeos, setAltMapGeos] = useState<[] | Array<Feature<Geometry | null>>>([])
    const [geographies, setGeographies] = useState<[] | Array<Feature<Geometry | null>>>([])
    const [moreGeographies, setMoreGeographies] = useState<[] | Array<Feature<Geometry | null>>>([])
    const [flightsData, setFlightsData] = useState<[] | Array<Feature<Geometry | null>>>([])
    const [refresh, setRefresh] = React.useState(0)
    var refreshTimer:number = 0

    ///
    /// Popup Alerts Component
    ///
    const [alerts, setAlerts] = React.useState<Partial<AlertProps>[]>([]);
    /// add an alert
    const addAlert = (title: string, variant: AlertProps['variant'], key: React.Key) => { setAlerts(prevAlerts => [...prevAlerts, { title, variant, key }]); };
    /// remove an alert
    const removeAlert = (key: React.Key) => { setAlerts(prevAlerts => [...prevAlerts.filter(alert => alert.key !== key)]); };    
    /// create Id for alert so we can distinguish them when they have the same text
    const getUniqueId = () => new Date().getTime();
    /// create an alert of Info type
    const addInfoAlert = (whatInfo: string) => { addAlert(whatInfo, 'info', getUniqueId()); };

    ///
    useEffect(() => {
        const mapFeatures: Array<Feature<Geometry | null>> = ((feature(mapjson, mapjson.objects.counties) as unknown) as FeatureCollection).features
        setGeographies(mapFeatures)

        const moreMapFeatures: Array<Feature<Geometry | null>> = ((feature(mapjson, mapjson.objects.states) as unknown) as FeatureCollection).features
        setMoreGeographies(moreMapFeatures)

        try {
            axios.get(FLIGHTS_API_URL).then((response) => {
                setFlightsData(response.data.states)
            });
        } catch (error) {
            console.error('error fetching flight data from external API service', error)
        }
    }, [])

    ///
    /// config the map projection here - we also put this into a viewbox in SVG form below
    ///
    const projection = geoAlbersUsa().scale(currentScale).translate([currentCx, currentCy])

    ///
    /// animations can go here - this times out very fast don't do much here or log anything
    ///
    animationFrame((args) => {
        refreshTimer += args.delta
        // if refresh timer is greater than 1/4 second, GET the data
        if (refreshTimer >= 0.25) {
            refreshTimer = 0
            try {
                axios.get(FLIGHTS_API_URL).then((response) => {
                    setFlightsData(response.data.states)
                });
            } catch (error) {
                console.error('error fetching flight data from external API service', error)
            }
            // console.log('refreshed data', args.delta)
            // console.log('flights count: ', flightsData.length)
        }
    })

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

    // Turn projection into a coordinate lat,lon
    function returnCoordinateValueWhenValid(point: [number, number], index: number) {
        const retVal: [number, number] | null = projection.invert(point)
        if (retVal?.length) {
            return retVal[index]
        }
        return 0
    }
    
    ///
    /// handle the click event for a marker
    ///
    const handleMarkerClick = (i: number) => {
        addInfoAlert(`Marker: ${pointdata[i].name}`)
    }

    ///
    /// handle the click event for a flight
    ///
    const handleFlightClick = (i: number) => {
        addInfoAlert(`Flight:${flightsData[i].callsign}, Heading:${flightsData[i].true_track}, LAT/LON:${flightsData[i].latitude},${flightsData[i].longitude}`)
    }

    ///
    /// function to zoom the map
    ///
    const zoomMap = (zoomIn: boolean) => {
        if (zoomIn) {
            currentScale = currentScale * 1.1
            currentCx = currentCx * 1.1
            currentCy = currentCy * 1.1
        } else {
            currentScale = currentScale * 0.9
            currentCx = currentCx * 0.9
            currentCy = currentCy * 0.9
        }
        projection.scale(currentScale).translate([-currentCx, -currentCy])
        setRefresh(refresh + 1)
    }

    // function to change the cursor when the mouse button is down
    const changeCursor = (e: any) => {
        if (e.buttons !== 1) { 
            document.body.style.cursor = 'default'
            return
        }
        document.body.style.cursor = 'grabbing'
    }

    // function to click and drag the map
    const dragMap = (e: any) => {
        // return is mouse button is not down
        if (e.buttons !== 1) { return }
        currentCx = currentCx + e.movementX
        currentCy = currentCy + e.movementY
        projection.scale(currentScale).translate([-currentCx, -currentCy])
        setRefresh(refresh + 1)
    }

    // fundtion to reset the map zoon
    const resetZoom = () => {
        currentScale = scale
        currentCx = cx
        currentCy = cy
        projection.scale(currentScale).translate([-currentCx, -currentCy])
        setRefresh(refresh + 1)
    }

    ///
    /// The component returns a map, which is in the form of a SVG
    ///
    return (
        <div className="map-container" onMouseMove={(e) => dragMap(e)} onMouseDown={(e) => changeCursor(e)} onMouseUp={(e) => changeCursor(e)}>
            <div className="map-controls">
                <React.Fragment>
                    <Badge key={1}>Flight Count {flightsData.length}</Badge>{' '}
                    <Button onClick={() => zoomMap(true)} icon={<PlusCircleIcon />} variant="tertiary">Zoom</Button>
                    <Button onClick={() => zoomMap(false)} icon={<MinusCircleIcon />} variant="tertiary">Zoom</Button>
                    <Button onClick={() => resetZoom()} variant="tertiary">Reset Map</Button>
                    <Tooltip content="Click and drag to move map. Single click on markers for info">
                        <Button component="a" isAriaDisabled href="https://pf4.patternfly.org/" target="_blank" variant="tertiary">
                            Click and drag to move map
                        </Button>
                    </Tooltip>
                </React.Fragment>
            </div>
            <AlertGroup isToast isLiveRegion>
                {alerts.map(({ key, variant, title }) => (
                <Alert
                    variant={AlertVariant[variant as keyof typeof AlertVariant]}
                    title={title}
                    timeout={7000}
                    actionClose={<AlertActionCloseButton title={title as string} variantLabel={`${variant} alert`} onClose={() => removeAlert(key as React.Key)} />} key={key}
                />
                ))}
            </AlertGroup>
            <svg width={window.innerWidth} height={window.innerHeight-200} viewBox={`0 0 800 450`}>
            {/* <svg width={scale * 3} height={scale * 3} viewBox="0 0 800 450"> */}
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
                            r={6}
                            fill="#E91E63"
                            stroke="#FFFFFF"
                            strokeWidth={1}
                            onClick={() => handleMarkerClick(i)}
                        />
                    ))}
                </g>
                <g>
                    {/* { flightsData.map((d, i) => (console.log(i, ' DATA', d) ))} */}
                    
                    {flightsData.map((d, i) => (
                        <svg className="airsvg" key={`marker-${uuid()}`}
                        x={returnProjectionValueWhenValid([d.longitude, d.latitude], 0)}
                        y={returnProjectionValueWhenValid([d.longitude, d.latitude], 1)}
                        width="30" height="30"
                        viewBox="0 0 512 512"
                        onClick={() => handleFlightClick(i)}
                        >
                        <g className="airsvg-g" transform={`rotate( ${d.true_track} )`}>
                            <path className="airsvg-path1" d="M256,0C114.614,0,0,114.614,0,256s114.614,256,256,256s256-114.614,256-256S397.386,0,256,0z M256,448c-105.867,0-192-86.133-192-192S150.133,64,256,64s192,86.133,192,192S361.867,448,256,448z"/>
                            <path className="airsvg-path2" d="M365.125,248.742v-28.946c0-4.176-3.414-7.59-7.59-7.59s-7.594,3.414-7.594,7.59v14.336l-0.07,6.594l-20.11-10.566v-28.613c0-4.176-3.418-7.594-7.594-7.594s-7.594,3.418-7.594,7.594v14.109l-0.07,6.485l-31.614-16.606l1.672-67c0-15.711-12.855-28.562-28.562-28.562c-15.711,0-28.562,12.851-28.562,28.562l1.672,67l-21.699,11.398l-9.989,5.164v-20.55c0-4.176-3.418-7.594-7.594-7.594c-4.176,0-7.59,3.418-7.59,7.594v28.613l-13.852,7.278l-6.332,3.242v-20.883c0-4.176-3.414-7.59-7.59-7.59c-4.18,0-7.594,3.414-7.594,7.59v28.946l-36.637,19.25v24.398l-0.043,6.734l0.043-0.011v0.164l96.934-26.676l23.453-6.414l2.469,98.938l-22.554,7.551c-3.164,1.058-5.297,4.019-5.297,7.355v14.23c0,5.336,5.262,9.078,10.301,7.332l37.918-13.141c1.649-0.57,3.438-0.57,5.082,0l37.918,13.141c5.043,1.746,10.301-1.996,10.301-7.332v-14.23c0-3.336-2.133-6.297-5.297-7.355l-22.554-7.551l2.004-80.16l0.504-18.809l94.554,26.024l25.637,7.102v-0.047l0.16,0.043v-31.286L365.125,248.742z"/>
                        </g>
                        </svg>
                    ))}
                </g>
            </svg>
        </div>
    )
}

export { WorldMap }
