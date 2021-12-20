import React, {useState, useEffect} from 'react'

function TextEditor(props:any){
    return (
    <div className="field" id={props.id}>
        <label>{props.title}</label>
        <input id={props.id} className="ui input" type={props.type} placeholder={props.placeholder} min={props.min} max={props.max} value={props.value} onChange={props.onChangeValue}/>
    </div>
	)
};

export default TextEditor