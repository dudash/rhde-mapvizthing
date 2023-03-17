/*
Original author: Eli Elad Elrom, https://github.com/EliEladElrom/react-tutorials/blob/master/world-map-chart/src/hooks/AnimationFrame.tsx, 2023-03-17
License: MIT License
*/
import { useEffect, useRef } from 'react'

export default (callback: (arg0: ICallback) => void) => {
    const frame = useRef()
    const last = useRef(performance.now())
    const init = useRef(performance.now())

    const animate = () => {
        const now = performance.now()
        const time = (now - init.current) / 1000
        const delta = (now - last.current) / 1000
        callback({ time, delta })
        last.current = now
            ; ((frame as unknown) as IFrame).current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        ((frame as unknown) as IFrame).current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(((frame as unknown) as IFrame).current)
    })
}

interface ICallback {
    time: number
    delta: number
}

interface IFrame {
    current: number
}