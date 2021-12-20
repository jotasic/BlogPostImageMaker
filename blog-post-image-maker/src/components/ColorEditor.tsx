function ColorEditor(props:any){

  return (
	<div className="field">
		<label>Color</label>
		<input className="ui input" type="color" id={props.id} value={props.value} onChange={props.onChangeValue}/>
		<label id={props.id}>{props.value}</label>
		<button className="ui button animated fade" id="imageColorPasteButton">
			<div className="visible content">붙여넣기</div>
			<div className="hidden content"/>
				<i className="paste icon"></i>
		</button>
	</div>
	)
};

export default ColorEditor