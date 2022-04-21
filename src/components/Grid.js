import "./Grid.css";
import {useState, useEffect, useRef} from "react";
import GridRendering from "./GridRendering";

export default function (props) {
    const cells = [];
    const {help, about} = props;

    const cellS = 3.5;
    const cellSizeParam = 3;
    const [zoom, setZoom] = useState(cellS);
    const [windowParameters, setWindowParameters] = useState({
        cellSize: zoom,
        gridSizeWidth: Math.floor(window.innerWidth/cellSizeParam),
        gridSizeHeight: Math.floor(window.innerHeight/cellSizeParam),
    });



    const gridSizeWidth = windowParameters.gridSizeWidth;
    const gridSizeHeight = windowParameters.gridSizeHeight;
    const cellSize = windowParameters.cellSize;

    const width = (window.innerWidth/cellS+cellS)*cellSizeParam+150;
    const height = (window.innerHeight/cellS)*cellSizeParam;


    let nextStateData = Array(gridSizeWidth).fill().map(function () {
        return new Array(gridSizeHeight).fill(false)
    });



    //gridState is the state of our current grid of cells
    const [gridState, setGridState] = useState(nextStateData);
    const [delay, setDelay] = useState(1000);
    const [isRunning, setIsRunning] = useState(true);
    const [cellParameters, setCellParameters] = useState({
        aloneNumber: 2,
        suffocateNumber: 3,
        bornNumber: 3
    });
    const [infoState, setInfoState] = useState({
        help: true,
        about: true
    });

    const [originStates, setOriginStates] = useState({
        x : 0,
        y : 0,
        scale : 1
    });

    function changeCell(x, y, changeTo) {
        setGridState(prev => ({
                    ...prev,
                    [x]: {
                        ...prev[x], [y]: changeTo
                    }
                }
            )
        );
    }

    //calculate cell, mutates nextStateData with the next state of the cells
    function calculateCell(x, y) {
        let aliveNeighbours = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) {
                    continue;
                }
                if (gridState[(x + i + gridSizeWidth) % gridSizeWidth][(y + j + gridSizeHeight) % gridSizeHeight]) {
                    aliveNeighbours++;
                }
            }
        }
        if (gridState[x][y]) {
            if (aliveNeighbours < cellParameters.aloneNumber || aliveNeighbours > cellParameters.suffocateNumber) {
                nextStateData[x][y] = false;
            } else {
                nextStateData[x][y] = true;

            }

        } else {
            if (aliveNeighbours === cellParameters.bornNumber) {
                nextStateData[x][y] = true;

            } else {
                nextStateData[x][y] = false;
            }

        }

    }


    //calculate next state, calls calculateCell for every cell on the Grid, which updates nextStateData
    function calculateNextState() {
        for (let i = 0; i < gridSizeWidth; i++) {
            for (let j = 0; j < gridSizeHeight; j++) {
                calculateCell(i, j);
            }
        }
        //updates gridState with the updated nextStateData
        setGridState(nextStateData);

        //nextStateData purge
        nextStateData = Array(gridSizeWidth).fill().map(function () {
            return new Array(gridSizeHeight).fill(false)
        });

    }

    function useInterval(callback, delay) {
        const savedCallback = useRef();

        // Remember the latest callback.
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        // Set up the interval.
        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }

    useInterval(() => {
            calculateNextState();
    }, !isRunning ? delay : null);


    function changeCellParameters(event) {
        setCellParameters(prevState => ({
            ...prevState,
            [event.target.className]: parseInt(event.target.value)
        }));
    }

      function changeInfoParameters(event) {
          setInfoState(prevState => ({
              ...prevState,
              [event.target.className]: !prevState[event.target.className]
          }))
      }


  const helpStyle = {
      Active : {display:"block",
          animation: "blink 0.17s"},
      Inactive: {display:"none"},
  };

  const aboutStyle = {
      Active : {display:"block",
          animation: "blink 0.17s"},
      Inactive: {display:"none"},
  };

  //className="grid" style={gridStyle}



    function drawCell(x, y, ctx){
        ctx.fillStyle = "#4AF626";
        ctx.fillRect(x*cellSizeParam,y*cellSizeParam,cellSizeParam,cellSizeParam);
    }



    const draw = (ctx) => {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < gridSizeWidth; i++) {
            for (let j = 0; j < gridSizeHeight; j++) {
                if (gridState[i][j]) {
                    drawCell(i, j, ctx);
                }
            }
        }

        ctx.fill();
    };
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);



    function doZoom(e,context)
    {

        setOriginStates({
            x: context.width/2,
            y: context.height/2,
        })

        const rect = e.target.getBoundingClientRect();
        const point2D = {x: e.clientX - rect.left,
            y: e.clientY - rect.top}
        let scale = originStates.scale;

        const origin = {x:originStates.x,
            y:originStates.y
        };


        function scaleAt(x, y, scaleBy) {  // at pixel coords x, y scale by scaleBy
            scale *= scaleBy;
            origin.x = x - (x - origin.x) * scaleBy;
            origin.y = y - (y - origin.y) * scaleBy;

            origin.x = clamp(origin.x, -Number.MAX_SAFE_INTEGER, 0);
            origin.y = clamp(origin.y, -Number.MAX_SAFE_INTEGER, 0);
            scale = clamp(scale, 1, Number.MAX_SAFE_INTEGER);

        }
        const zoomBy = 1.08;                    // zoom in amount
        e.deltaY < 0 ? scaleAt(point2D.x, point2D.y, zoomBy) : scaleAt(point2D.x, point2D.y, 1 / zoomBy);
        context.setTransform(scale, 0, 0, scale, origin.x, origin.y)

        draw(context)

        setOriginStates({
            x: origin.x,
            y: origin.y,
            scale: scale
        })
    }

    function doZoomOnce(context)
    {
        // zoom in amount
        context.setTransform(5, 0, 0, 5, -window.innerWidth, -window.innerHeight);
        setOriginStates({
            x: -window.innerWidth,
            y: -window.innerHeight,
            scale: 5
        })
        draw(context)
    }

    function toWorld(x, y) {  // convert to world coordinates
        x = (x - originStates.x) / originStates.scale;
        y = (y - originStates.y) / originStates.scale;
        return {x, y};
    }

    function getPointerPosition(e)
    {
        const rect = e.target.getBoundingClientRect();
        const point2D = {x: e.clientX - rect.left,
            y: e.clientY - rect.top}
        const temp = toWorld(point2D.x, point2D.y);
        const x = Math.floor(temp.x/cellSizeParam);
        const y = Math.floor(temp.y/cellSizeParam);
        const cellAlive = gridState[x][y];
        changeCell(x, y, !cellAlive);
    }



return (
    <div className="gridContainer">
        <div className="gridFixer">
          <div>
              <GridRendering once={doZoomOnce} doZoom={doZoom} draw={draw} gridState={gridState} width={width} height={height} getPointerPosition={getPointerPosition} />
          </div>
        </div>


      <div className="navBar">

          <div className="misc">
              <button className="help" onClick={(e) => changeInfoParameters(e)}>Help</button>

              <button className="about" onClick={(e) => changeInfoParameters(e)}>About</button>

          </div>

          <div className="textContainer">
              <p className="helpText" style={ infoState.help ? helpStyle.Inactive : helpStyle.Active }>
                  {help}
              </p>
              <p className="aboutText" style={ infoState.about ? aboutStyle.Inactive : aboutStyle.Active }>
                  {about}
              </p>
          </div>

        <button className ="reset-button" onClick={() => setGridState(Array(gridSizeWidth).fill(Array(gridSizeHeight).fill(false)))}>Reset</button>
        <button className="run-button" onClick={() => setIsRunning(false)}>Run</button>
        <button className="stop-button" onClick={() => setIsRunning(true)}>Pause</button>


        <div className="speed.slidercontainer">
            <p>Simulation Speed</p>
            <input className="slider" type="range" min="5" max="1000" value={delay} onChange={(e) => setDelay(parseInt(e.target.value))} />
        </div>

          <div>
              <p>Alone</p>
              <input className="aloneNumber" onInput={event => changeCellParameters(event)} value = {cellParameters.aloneNumber} type="number"/>
          </div>
          <div>
              <p>Crowded</p>
              <input className="suffocateNumber" onInput={event => changeCellParameters(event)} value = {cellParameters.suffocateNumber} type="number"/>
          </div>

          <div className="div-bornNumber">
              <p>Birth</p>
              <input className="bornNumber" onInput={event => changeCellParameters(event)} value = {cellParameters.bornNumber} type="number"/>
          </div>

      </div>
    </div>
);


}
