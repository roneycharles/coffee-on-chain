import React from 'react';
import './App.css';
import Button from './button';
import Display from './display';
import { buttons } from './constants'
import Led from './leds'

//const TronWeb = require('tronweb')

const contractAddress = "TUXoGr8fosA5sdDAWBqt6KTmzUThjpGaYf"

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: (1316 / 1200),
      btnClick: -1,
      textLed: '',
      loading: true,
      tronWeb: {},
      myAddress: "",
      contract: null,
      products: [],
      machineID: ""
    }
    
    window.addEventListener("resize", this.updateWidthAndHeight);
  }


  componentDidMount() {
    const query = new URLSearchParams(this.props.location.search);
    const machineId = query.get('id')
    this.setState({
      loading: true,
      machineId
    })

    this.updateWidthAndHeight()
    
    this.setState({
      loading:true
    })

    this.loadPrices = setInterval( async () => {
      const { tronWeb, contract, machineId } = this.state;
      if (!tronWeb.loggedIn || contract == null) return;

      // get machine by id
      const machine = await contract.machineById(machineId).call();

      console.log("MACHINE", machine, machine.productCounts.toNumber());
      const products = [];
      for (let i=0; i< machine.productCounts.toNumber(); i++){
        const ret = await contract.getProductPriceAndName(machineId, i).call();
        products.push({
          index: i,
          name: ret.name,
          priceInTRX: ret.priceInTRX.toString(),
          priceInReal: ret.priceInReal.toString()
        })
      }
      console.log(products)
      this.setState({
        products
      });
    }, 5000);

    const loadWatcher = setInterval( async () => {
      if(window.tronWeb && window.tronWeb.ready) {            
          const installed = !!window.tronWeb;
          const tronWebState = {
              installed: installed,
              loggedIn: true,
          };
          const contract = await window.tronWeb.contract().at(contractAddress);
          this.setState({
              tronWeb: tronWebState,
              loading: false,
              myAddress: window.tronWeb.defaultAddress.base58,
              contract
          });
          clearInterval(loadWatcher);
      }
      if(this.state.tronWeb.loggedIn) {
          window.tronWeb.on('addressChanged', (address) => {
              console.log("Changed address", address)
              if(this.state.tronWeb.loggedIn){
                this.setState({
                    myAddress: address.base58
                });
                return;
              }
                

              this.setState({
                  tronWeb: {
                      ...this.state.tronweb,
                      installed: true,
                      loggedIn: true,
                  },
                  myAddress: address.base58
              });
          });
      }
    }, 500)
  }
  
  handleClickButton = async ({ id }) => {

    const { btnClick, contract, machineId } = this.state;
    if (id===100) {
      const { products } = this.state;
      if (btnClick<0) {
        alert("Select first")
        return
      }
      if (btnClick >= products.length) {
        alert("Invalid selection")
        return
      }
      const ret = await contract.pay(machineId, btnClick).send({
        callValue: parseInt(products[btnClick].priceInTRX),
        shouldPollResponse: true
      })
      console.log("Paid", ret)


      
      return
    }
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
    const { width, height, btnClick, myAddress, products } = this.state;

    const selectedPrice = (btnClick>=0 && btnClick<products.length)?products[btnClick].priceInReal:-1

    return (
      <div className="App">
        <div className="app-background" style={{ width, height }}>
          {buttons.map(button => (
            <Button key={button.id} onClick={() => this.handleClickButton(button)} top={button.top} left={button.left} width={button.width} height={button.height} active={btnClick === button.id ? true : false} component={button.component} />
          ))}
            <Led key={1} top={18} left={49} width={2.1} height={70} />
          <div className="app-display">
            <Display top={3.5} left={41.2} width={17.8} height={8.9} active={true} component={
              <div>
                <div className="app-display-title" >
                  Coffee on Chain
                </div>
                <div>
                {myAddress}
                </div>
                {
                  (selectedPrice>=0) &&
                  <div>
                    Valor: R${parseFloat(selectedPrice)/100}
                  </div>
                }
              </div>
            } />

          </div>
        </div>


      </div>
    );
  };
}

export default App;
