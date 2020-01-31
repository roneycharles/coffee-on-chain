import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Button, InputGroup, Form, ListGroup } from 'react-bootstrap';

import Loader from '../loader';
import './styles.css';


const contractAddress = "TCDxRZh6JH4wYQUxQqPNEVvpzwgTBXkJTy"

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      tronWeb: {},
      myAddress: "",
      contract: null,
      products: [],
      form: {
        machineId: "",
        machineName: "",
        productName: "",
        productPrice: "",
        productUseReal: "",
        realRatio: 0,
      },
      machine: {},
      selectedProductId: -1,
      selectedProduct: {
        counter: 0,
        price: "",
        name: "",
        enable: false,
        useRealRatio: false
      }
    }
  }


  componentDidMount() {
    const query = new URLSearchParams(this.props.location.search);
    const machineId = query.get('id')
    const { form } = this.state;

    this.setState({
      loading: true,
      form: {
        ...form,
        machineId
      }
    })

    const loadWatcher = setInterval(async () => {
      if (window.tronWeb && window.tronWeb.ready) {
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
      if (this.state.tronWeb.loggedIn) {
        window.tronWeb.on('addressChanged', (address) => {
          console.log("Changed address", address)
          if (this.state.tronWeb.loggedIn) {
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

  handleUpdate = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    const { form } = this.state;
    this.setState({
      form: {
        ...form,
        [name]: value
      }
    })
  }

  handleCheckBoxUpdate = (event) => {
    const name = event.target.name;
    const value = event.target.checked;
    const { form } = this.state;
    this.setState({
      form: {
        ...form,
        [name]: value
      }
    })
  }

  handleUpdateProduct = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    const { selectedProduct } = this.state;
    this.setState({
      selectedProduct: {
        ...selectedProduct,
        [name]: value
      }
    })
  }
  

  handleUpdateProductCheckbox = (event) => {
    const name = event.target.name;
    const value = event.target.checked;
    const { selectedProduct } = this.state;
    this.setState({
      selectedProduct: {
        ...selectedProduct,
        [name]: value
      }
    })
  }

  registerMachine = async () => {
    const { tronWeb, contract, form } = this.state;
    if (!tronWeb.loggedIn || contract == null) {
      alert("TronWeb/Contract not loaded!")
      return
    };
    try {
      const resp = await contract.registerMachine(form.machineName).send({
        shouldPollResponse: true
      })
      console.log(resp)  
      alert("Registered! Machine ID: " + resp.id)
    } catch (error) {
      alert("Error")
      console.log(error)
    }
  }

  loadMachineInfo = async () => {
    const { tronWeb, contract, form } = this.state;
    if (!tronWeb.loggedIn || contract == null) {
      alert("TronWeb/Contract not loaded!")
      return
    };

    try {
      // get machine by id
      const machine = await contract.machineById(form.machineId).call();

      console.log("MACHINE", machine, machine.productCounts.toNumber());
      const products = [];
      for (let i=0; i< machine.productCounts.toNumber(); i++){
        const ret = await contract.getProductPriceAndName(form.machineId, i).call();
        console.log(ret)
        products.push({
          index: i,
          name: ret.name,
          priceInTRX: ret.priceInTRX.toString(),
          priceInReal: ret.priceInReal.toString()
        })
      }
      this.setState({
          machine,
          products,
          selectedProductId: -1,
          selectedProduct: {
            counter: 0,
            price: "",
            name: "",
            enable: false,
            useRealRatio: false
          }
        });
    } catch (error) {
      alert("Error")
      console.log(error)
    }
  }

  registerProduct = async () => {
    const { tronWeb, contract, form } = this.state;
    if (!tronWeb.loggedIn || contract == null) {
      alert("TronWeb/Contract not loaded!")
      return
    };
    try {
      const resp = await contract.addProduct(
        form.machineId,
        form.productName,
        form.productPrice,
        form.productUseReal
      ).send({
        shouldPollResponse: true
      })
      console.log(resp) 
      if (resp.success) 
        alert("Product Registered!")
      else {
        throw new Error("Error registering product")
      }
    } catch (error) {
      alert("Error")
      console.log(error)
    }
  }

  getProductInfo = async(selectedProductId)=>{
    const { tronWeb, contract, form } = this.state;
    if (!tronWeb.loggedIn || contract == null) {
      alert("TronWeb/Contract not loaded!")
      return
    };
    try {
      const resp = await contract.getProduct(
        form.machineId,
        selectedProductId
      ).call()
      this.setState({
        selectedProductId,
        selectedProduct: {
          ...resp,
          price: resp.price.toString(),
          counter: resp.counter.toString(),        }
      })
    } catch (error) {
      alert("Error")
      console.log(error)
    }
  }

  changeProductName = async () => {
    const { tronWeb, contract, form, selectedProduct, selectedProductId, products } = this.state;
    if (selectedProductId<0 || selectedProductId >= products.length ) {
      alert("Index error, please select first!")
      return
    };
    if (!tronWeb.loggedIn || contract == null) {
      alert("TronWeb/Contract not loaded!")
      return
    };
    try {
      const resp = await contract.changeProductName(form.machineId, selectedProductId, selectedProduct.name).send({
        shouldPollResponse: true
      })
      console.log(resp)  
      alert("Name updated")
    } catch (error) {
      alert("Error")
      console.log(error)
    }
  }

  changeProductStatus = async () => {
    const { tronWeb, contract, form, selectedProduct, selectedProductId, products } = this.state;
    if (selectedProductId<0 || selectedProductId >= products.length ) {
      alert("Index error, please select first!")
      return
    };
    if (!tronWeb.loggedIn || contract == null) {
      alert("TronWeb/Contract not loaded!")
      return
    };
    try {
      const resp = await contract.changeProductStatus(form.machineId, selectedProductId, !selectedProduct.enable).send({
        shouldPollResponse: true
      })
      console.log(resp)  
      alert("Status updated")
    } catch (error) {
      alert("Error")
      console.log(error)
    }
  }

  resetProductCounter = async () => {
    const { tronWeb, contract, form, selectedProductId, products } = this.state;
    if (selectedProductId<0 || selectedProductId >= products.length ) {
      alert("Index error, please select first!")
      return
    };
    
    if (!tronWeb.loggedIn || contract == null) {
      alert("TronWeb/Contract not loaded!")
      return
    };
    try {
      const resp = await contract.resetProductCounter(form.machineId, selectedProductId).send({
        shouldPollResponse: true
      })
      console.log(resp)  
      alert("Counter reset success")
    } catch (error) {
      alert("Error")
      console.log(error)
    }
  }

  adjustPrice = async () => {
    const { tronWeb, contract, form, selectedProductId, selectedProduct, products } = this.state;
    if (selectedProductId<0 || selectedProductId >= products.length ) {
      alert("Index error, please select first!")
      return
    };
    
    if (!tronWeb.loggedIn || contract == null) {
      alert("TronWeb/Contract not loaded!")
      return
    };
    try {
      const resp = await contract.adjustPrice(
        form.machineId,
        selectedProductId,
        selectedProduct.price,
        selectedProduct.useRealRatio,
      ).send({
        shouldPollResponse: true
      })
      console.log(resp)  
      alert("Price updated")
    } catch (error) {
      alert("Error")
      console.log(error)
    }
  }


  render() {
    const { loading, form, machine, selectedProduct, selectedProductId, products } = this.state;

    return (
      <div className="AppAdmin">
        {loading && <Loader />}

        <Container>
          <Row>
            <Col className="Box">
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>Machine Name:</InputGroup.Text>
                </InputGroup.Prepend>
                <input type="text"
                  name="machineName"
                  className="form-control"
                  placeholder="Machine Name"
                  value={form.machineName}
                  onChange={this.handleUpdate}
                />
              </InputGroup>

              <Button 
                className="actionButton"
                variant="outline-primary"
                onClick={this.registerMachine}
                >
                Register
              </Button>
            </Col>
            <Col className="Box">
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>Machine ID:</InputGroup.Text>
                </InputGroup.Prepend>
                <input type="text"
                  name="machineId"
                  className="form-control"
                  placeholder="Machine ID"
                  value={form.machineId}
                  onChange={this.handleUpdate}
                />
              </InputGroup>

              <Button 
                className="actionButton"
                variant="outline-primary"
                onClick={this.loadMachineInfo}
                >
                Load Machine Info
              </Button>
            </Col>
          </Row>

          <Row>
            <Col className="Box">
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>Machine ID:</InputGroup.Text>
                </InputGroup.Prepend>
                <input type="text"
                  name="machineId"
                  className="form-control"
                  placeholder="Machine ID"
                  value={form.machineId}
                  onChange={this.handleUpdate}
                  style={{ marginRight: "10px" }}
                />

                <InputGroup.Prepend>
                  <InputGroup.Text id="machineId">Product Name:</InputGroup.Text>
                </InputGroup.Prepend>
                <input type="text"
                  name="productName"
                  className="form-control"
                  placeholder="Product Name"
                  value={form.productName}
                  onChange={this.handleUpdate}
                  style={{ marginRight: "10px" }}
                />

                <InputGroup.Prepend>
                  <InputGroup.Text id="machineId">Price:</InputGroup.Text>
                </InputGroup.Prepend>
                <input type="number"
                  name="productPrice"
                  className="form-control"
                  placeholder="Product Price"
                  value={form.productPrice}
                  onChange={this.handleUpdate}
                  style={{ marginRight: "10px" }}
                />

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <Form.Check
                    type="checkbox"
                    name="productUseReal"
                    checked={form.productUseReal}
                    onChange={this.handleCheckBoxUpdate}
                    label="Price in Real" />
                </div>
              </InputGroup>

              <Button
                className="actionButton"
                variant="outline-primary"
                onClick={this.registerProduct}
              >
                Register Product
              </Button>
            </Col>
          </Row>

          <Row className="BoxRow" style={{marginTop: "10px"}}>
            <Col className="Box">
              Machine Name: {machine.name}
              <ListGroup as="ul" style={{marginTop: "10px"}}>
              {products.map( (product, i) => {
                return (
                  <ListGroup.Item as="li" 
                    active={i===selectedProductId}
                    key={product.index}
                    onClick={()=>this.getProductInfo(i)}
                  >
                    {product.name}
                  </ListGroup.Item>
                )
              })}
              </ListGroup>
            </Col>

            <Col className="Box">
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>Product Name:</InputGroup.Text>
                </InputGroup.Prepend>
                <input type="text"
                  name="name"
                  className="form-control"
                  placeholder="Product Name"
                  value={selectedProduct.name}
                  onChange={this.handleUpdateProduct}
                />
              </InputGroup>

              <Button
                className="actionButton"
                variant="outline-primary"
                onClick={this.changeProductName}
              >
                Change Name
              </Button>

              <InputGroup style={{ marginTop: "10px" }}>
                <InputGroup.Prepend>
                  <InputGroup.Text>Product Pirce:</InputGroup.Text>
                </InputGroup.Prepend>
                <input type="text"
                  name="price"
                  className="form-control"
                  placeholder="Product Price"
                  value={selectedProduct.price}
                  onChange={this.handleUpdateProduct}
                />
              </InputGroup>

              <InputGroup style={{ marginTop: "10px" }}>
                    <Form.Check
                    type="checkbox"
                    name="useRealRatio"
                    checked={selectedProduct.useRealRatio}
                    onChange={this.handleUpdateProductCheckbox}
                    label="Price in Real" />
              </InputGroup>

              <Button
                className="actionButton"
                variant="outline-primary"
                onClick={this.adjustPrice}
              >
                Change Price
              </Button>

              <Button
                className="actionButton"
                variant={selectedProduct.enable?"outline-danger":"outline-success"}
                onClick={this.changeProductStatus}
              >
                {selectedProduct.enable?"Disable":"Enable"}
              </Button>

              <InputGroup style={{ marginTop: "10px" }}>
                <InputGroup.Prepend>
                  <InputGroup.Text>Product Counter:</InputGroup.Text>
                </InputGroup.Prepend>
                <input type="text"
                  name="price"
                  readOnly
                  className="form-control"
                  placeholder="Product Price"
                  value={selectedProduct.counter}
                  onChange={this.handleUpdateProduct}
                />
              </InputGroup>

              <Button
                className="actionButton"
                variant="outline-primary"
                onClick={this.resetProductCounter}
              >
                Reset counter
              </Button>

              
            </Col>
          </Row>



        </Container>


      </div>
    )
  }
}

export default Admin