import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import ColorEditor from './components/ColorEditor';
import TextEditor from './components/TextEditor';
import ImagePreview from './components/ImagePreview';

interface ImageProps {
  [key: string]: string;
  imageWidth: string,
  imageHeight: string,
  imageColor: string,
  contents: string,
  fontSize: string,
  fontColor: string,
}

function App() {
  const [imageProps, setImageProps] = useState<ImageProps|any>({});

  useEffect(() => {

    const  :ImageProps = {
      imageWidth: "800",
      imageHeight: "400",
      imageColor: "#ffffff",
      contents: "",
      fontSize: "36",
      fontColor: "#ffffff",
    }

    for(const key in props) {
      props[key] = localStorage.getItem(key) || props[key];
      setImageProps(props);
    }
  }, []);

  const onChangeValue = (e:React.ChangeEvent<HTMLInputElement>) => {
    const {id, value} = e.currentTarget;

    if(!value) return;
    const props = {...imageProps};

    props[id] = value;
    setImageProps(props);
    localStorage.setItem(id, value);
  }

  return (
    <div className="App">
      <header className="ui center aligned basic segment">
        <h1 className="ui header">Simple Blog Post Image Maker</h1>
        <p><a href="https://hits.seeyoufarm.com"><img
                    src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fjotasic.github.io%2FBlogPostImageMaker%2F&count_bg=%2379C83D&title_bg=%23555555&icon=github.svg&icon_color=%23E7E7E7&title=hits&edge_flat=false" /></a>
        </p>
      </header>
      <h3 className="ui horizontal divider header">
      <i className="pencil icon"></i>Text</h3>

      <div className="field" id="textContentsArea">
        <input type="text" id="contents" value={imageProps.contents} onChange={onChangeValue}></input>
      </div>
      <h3 className="ui horizontal divider header"> <i className="font icon"></i>Font</h3>
        <div className=" equal width fields">
          <TextEditor id="fontSize" value={imageProps.fontSize} onChangeValue={onChangeValue} title="size" type="number" placeholder="Font Size" min="10" max="100"/>
          <ColorEditor id="fontColor" value={imageProps.fontColor} onChangeValue={onChangeValue}/>
        </div>

        <h3 className="ui horizontal divider header">
            <i className="image outline icon"></i>
            Background
        </h3>

        <div className="equal width fields" id="imageOptionArea">
        <TextEditor id="imageWidth" value={imageProps.imageWidth} onChangeValue={onChangeValue} title="Width" type="number" placeholder="Font Size" min="100" max="1000"/>
        <TextEditor id="imageHeight" value={imageProps.imageHeight} onChangeValue={onChangeValue} title="Height" type="number" placeholder="Font Size" min="100" max="1000"/>
        <ColorEditor id="imageColor" value={imageProps.imageColor} onChangeValue={onChangeValue}/>
        </div>

        <h3 className="ui horizontal divider header">
            <i className="image icon"></i>
            Preview
        </h3>
        <ImagePreview imageProps={imageProps}/>

        <div className="field ui center aligned grid" id="previewArea">
        </div>
        <div className="fields">
            <div className="field">
                <button id="downloadImageButton" className="ui button animated fade">
                    <div className=" visible content">Download
                    </div>
                    <div className="hidden content"/>
                        <i className="download icon"></i>
                </button>
            </div>
            <div className="field">
                <button id="copyImageToClipboardButton" className="ui button animated fade">
                    <div className="visible content">Copy</div>
                    <div className="hidden content"/>
                        <i className="copy icon"></i>
                </button>
            </div>
        </div>
        <div id="snackbar">snackbar Message</div>
        <footer className="ui center aligned basic segment">
          <a href="https://github.com/jotasic/BlogPostImageMaker/">Code</a> • Made by <a
        href="https://velog.io/@burnkim61">taewoo kim</a> • Powered By <a href="https://github.com">Github</a>
        </footer>
      </div>
        
    );
  }

export default App;
