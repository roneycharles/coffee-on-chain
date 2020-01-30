import React from 'react';
import './App.css';
import Button from './button';
import Display from './display';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: (1316 / 1200),
      btnClick: -1,
      textLed: ''
    }
    window.addEventListener("resize", this.updateWidthAndHeight);
    this.btn1 = {
      left: 462,
      top: 234
    }

    this.buttons = [{
      id: 1,
      top: 19,
      left: 27,
      width: 21,
      height: 14.5
    },
    {
      id: 2,
      top: 36,
      left: 27,
      width: 21,
      height: 14.5
    },
    {
      id: 3,
      top: 52.7,
      left: 27,
      width: 21,
      height: 14.5
    },
    {
      id: 4,
      top: 69.5,
      left: 27,
      width: 21,
      height: 14.5
    },
    {
      id: 5,
      top: 19,
      left: 52,
      width: 21,
      height: 14.5
    },
    {
      id: 6,
      top: 36,
      left: 52,
      width: 21,
      height: 14.5
    },
    {
      id: 7,
      top: 52.7,
      left: 52,
      width: 21,
      height: 14.5
    },
    {
      id: 8,
      top: 69.5,
      left: 52,
      width: 21,
      height: 14.5,
    },
    {
      id: 9,
      top: 32,
      left: 82,
      width: 14,
      height: 8,
      component: (<><br></br><li>Confirmar</li></>)
    }
    ];
  }


  componentDidMount() {
    this.updateWidthAndHeight()
  }

  componentDidUpdate() {

  }

  handleClickButton({ id }) {

    const { btnClick } = this.state;

    if (btnClick === id) {
      return this.setState({ btnClick: -1 })
    }

    this.setState({ btnClick: id })
  }


  updateWidthAndHeight = () => {
    const { ratio } = this.state;
    let width = window.innerWidth;
    let height = width / ratio;
    if (window.innerHeight < height) {
      height = window.innerHeight;
      width = window.innerHeight * ratio
    }
    this.setState({
      width,
      height
    });
  };

  render() {
    const { width, height, btnClick } = this.state;

    return (
      <div className="App">
        <div className="app-background" style={{ width, height }}>
          {this.buttons.map(button => (
            <Button onClick={() => this.handleClickButton(button)} top={button.top} left={button.left} width={button.width} height={button.height} active={btnClick == button.id ? true : false} component={button.component} />
          ))}
          <div className="app-display">
            <Display top={3.5} left={41.2} width={17.8} height={8.9} active={true} component={"CoffeeOnChain"} />

          </div>

          {/* 
          <Button onClick={() => this.setState({ btnClick: 1 })} top={19} left={27} width={21} height={14.5} active={this.state.btnClick === 1 ? true : false} />
          <Button onClick={() => this.setState({ btnClick: 2 })} top={36} left={27} width={21} height={14.5} active={this.state.btnClick === 2 ? true : false} />
          <Button onClick={() => this.setState({ btnClick: 3 })} top={52.7} left={27} width={21} height={14.5} active={this.state.btnClick === 3 ? true : false} />
          <Button onClick={() => this.setState({ btnClick: 4 })} top={69.5} left={27} width={21} height={14.5} active={this.state.btnClick === 4 ? true : false} />
          <Button onClick={() => this.setState({ btnClick: 5 })} top={19} left={52} width={21} height={14.5} active={this.state.btnClick === 5 ? true : false} />
          <Button onClick={() => this.setState({ btnClick: 6 })} top={36} left={52} width={21} height={14.5} active={this.state.btnClick === 6 ? true : false} />
          <Button onClick={() => this.setState({ btnClick: 7 })} top={52.7} left={52} width={21} height={14.5} active={this.state.btnClick === 7 ? true : false} />
          <Button onClick={() => this.setState({ btnClick: 8 })} top={69.5} left={52} width={21} height={14.5} active={this.state.btnClick === 8 ? true : false} /> */}
        </div>


      </div>
    );
  };
}

export default App;
