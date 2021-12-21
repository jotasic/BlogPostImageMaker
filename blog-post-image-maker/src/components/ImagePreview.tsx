import * as svgjs from '@svgdotjs/svg.js';

function ImagePreview(props:any) {

  return (
        <div className="field ui center aligned grid" >
        <svg height={props.imageHeight} width={props.imageWidth}>
          <rect width="100%" height="100%" fill={props.imageColor}/>
          <text dominant-baseline="middle" text-anchor="middle"/>
            This browser doesn't support svg 🙅‍♂️
        </svg>
      </div>
    )
}

export default ImagePreview