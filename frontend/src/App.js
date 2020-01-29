import React from 'react';
import './App.css';
import Button from './button';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: (1316 / 1200)
    }
    window.addEventListener("resize", this.updateWidthAndHeight);
    this.btn1 = {
      left: 462,
      top: 234
    }
  }

  componentDidMount() {
    this.updateWidthAndHeight()
  }

  updateWidthAndHeight = () => {
    const { ratio } = this.state;
    let width = window.innerWidth;
    let height = width / ratio;
    if (window.innerHeight<height) {
      height = window.innerHeight;
      width = window.innerHeight * ratio
    }
    this.setState({
      width,
      height
    });
  };

  render() {
    const { width, height } = this.state;
    
    return (
      <div className="App">
        <div className="app-background" style={{ width, height }}>
          <Button top={19} left={27} width={21} height={14.5} active={false}/>
          <Button top={36} left={27} width={21} height={14.5} active={false}/>

        </div>

      </div>
    );
  };
}

export default App;
