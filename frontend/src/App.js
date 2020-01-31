import React from 'react';
import './App.css';
import Button from './button';
import Display from './display';
import { buttons } from './constants'

//const TronWeb = require('tronweb')

const contractAddress = "TAizHsUbdDK7XL2QUqdjLxNkvgxNZB5Qbs"
const machineID = "0x0b30a05d1748322d148bc8000bdf22c077759ad42ad3766b27a99830a200f97d"

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
      products: []
    }
    
    window.addEventListener("resize", this.updateWidthAndHeight);
  }


  componentDidMount() {
    this.updateWidthAndHeight()
    
    this.setState({
      loading:true
    })

    this.loadPrices = setInterval( async () => {
      const { tronWeb, contract } = this.state;
      if (!tronWeb.loggedIn || contract == null) return;

      const products = [];
      for (let i=0; i< 8; i++){
        const ret = await contract.getProductPriceAndName(machineID, i).call();
        products.push({
          index: i,
          name: ret.name,
          price: ret.price.toString()
        })
      }
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

    const { btnClick, contract } = this.state;
    if (id===9) {
      const { products } = this.state;
      if (btnClick<0) {
        alert("Select first")
        return
      }
      if (btnClick >= products.length) {
        alert("Invalid selection")
        return
      }
      const ret = await contract.pay(machineID, btnClick).send({
        callValue: products[btnClick].price,
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
    
    const selectedPrice = (btnClick>0 && btnClick<products.length)?products[btnClick].price:-1

    return (
      <div className="App">
        <div className="app-background" style={{ width, height }}>
          {buttons.map(button => (
            <Button key={button.id} onClick={() => this.handleClickButton(button)} top={button.top} left={button.left} width={button.width} height={button.height} active={btnClick === button.id ? true : false} component={button.component} />
          ))}
          <div className="app-display">
            <Display top={3.5} left={41.2} width={17.8} height={8.9} active={true} component={
              <div>
                <div>
                CoffeeOnChain
                </div>
                <div>
                {myAddress}
                </div>
                {
                  (selectedPrice>=0) &&
                  <div>
                    Valor: R${selectedPrice}
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
