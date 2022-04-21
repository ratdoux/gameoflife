import React, {useContext, useEffect, useLayoutEffect, useRef} from "react";
import "./Grid.css";





    const GridRendering = props => {

        const {once, doZoom ,draw, width, height, getPointerPosition} = props
        const canvasRef = useRef(null)

        useEffect(() => {

            const canvas = canvasRef.current
            const context = canvas.getContext('2d')
            draw(context)
        }, [draw])



        const zoomCallBack = (e) => {
            const canvas = canvasRef.current
            const context = canvas.getContext('2d')
            doZoom(e,context)
        }

        useLayoutEffect(() =>
        {
            if (typeof code_happened === 'undefined') {
                window.code_happened = true;
                const context = document.getElementById('canvas').getContext('2d');
                once(context)
            }
        })



        return <canvas id="canvas" ref={canvasRef} width={width} height={height} onClick={getPointerPosition} onWheel={zoomCallBack} style={{alpha:false}}/>
    }

export default GridRendering



