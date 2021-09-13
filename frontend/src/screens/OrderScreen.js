import React, { useEffect, useState } from "react";
import { Row, Col, ListGroup, Image, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { PayPalButton } from "react-paypal-button-v2";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from "../actions/orderActions";
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from "../constants/orderConstants";

function OrderScreen({ match, history }) {
  const orderId = match.params.id;
  const dispatch = useDispatch();

  const [sdkReady, setSdkReady] = useState(false);

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, error, loading } = orderDetails;

  const orderpay = useSelector((state) => state.orderpay);
  const { loading: loadingPay, success: successPay } = orderpay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  if (!loading && !error) {
    order.itemsPrice = order.orderItems
      .reduce((acc, item) => acc + item.price * item.qty, 0)
      .toFixed(2);

    order.TotalPrice = (
      Number(order.itemsPrice) +
      Number(order.taxPrice) +
      Number(order.shippingPrice)
    ).toFixed(2);
  }

  // ARJRiWf4wSIujdGCFg7E4gSRwbG__b8n8FrXFKXSL1majKnZBJ2wZulYEREInUiwwJBW4gQ7ar0_I9aa

  const addPayPalScript = () => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://www.paypal.com/sdk/js?client-id=ARJRiWf4wSIujdGCFg7E4gSRwbG__b8n8FrXFKXSL1majKnZBJ2wZulYEREInUiwwJBW4gQ7ar0_I9aa";
    script.async = true;
    script.onload = () => {
      setSdkReady(true);
    };
    document.body.appendChild(script);
  };

  async function LagfoPaymentHandler(e) {
    e.preventDefault();
    console.log("Lagfo payment");
    const json = { command_id: order._id, price: order.TotalPrice };

    try {
      // const config = {
      //   headers: {
      //     "Content-type": "application/json",
      //     Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIwMDAxLjAwMDYuODY4In0.aWIEppGR5Vye-UwJ-jQr12f7KQNIsoVE1rvTMPgpUuo`,
      //   },
      // };
      const res = axios.post("/api/orders/lagfoDetails/", json).then((res) => {
        // if status is OK, 200 or 201 redirect with react
        console.log("result is : ", res);
        // history.push("/your_success_path");
      });
    } catch (error) {
      console.log("THERES A FUCKIN ERROR : ", error);
    }
  }

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
    }
    if (
      !order ||
      successPay ||
      order._id !== Number(orderId) ||
      successDeliver
    ) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch(getOrderDetails(orderId));
    } else if (!order.isPaid) {
      if (!window.paypal) {
        addPayPalScript();
      } else {
        setSdkReady(true);
      }
    }
  }, [dispatch, order, orderId, successPay, successDeliver]);

  const successPaymentHandler = (paymentResult) => {
    dispatch(payOrder(orderId, paymentResult));
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <div>
      <h1>Order : {order._id} </h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong>
                {order.user.name}
              </p>
              <p>
                <strong>Email:</strong>
                <a href={`mailto:${order.user.email}`}>{order.user.email} </a>
              </p>
              <p>
                <strong>Shipping: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </p>

              {order.isDelivered ? (
                <Message variant="success">
                  Delivered on {order.deliveredAt.substring(0, 10)}
                </Message>
              ) : (
                <Message variant="warning">Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">
                  Paid on {order.paidAt.substring(0, 10)}
                </Message>
              ) : (
                <Message variant="warning">Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message variant="info">Your order is Empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link
                            to={`/product/${item.product}`}
                            style={{ textDecoration: "None" }}
                          >
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = $
                          {(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Items:</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Shipping:</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Tax:</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Total:</Col>
                  <Col style={{ color: "red" }}>${order.TotalPrice}</Col>
                </Row>
              </ListGroup.Item>

              <Button
                variant="outline-primary"
                className="mt-3"
                onClick={LagfoPaymentHandler}
              >
                Lagfo
              </Button>

              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  {!sdkReady ? (
                    <Loader />
                  ) : (
                    <PayPalButton
                      amount={order.TotalPrice}
                      onSuccess={successPaymentHandler}
                    />
                  )}
                </ListGroup.Item>
              )}
            </ListGroup>
            {loadingDeliver && <Loader />}
            {userInfo &&
              userInfo.isAdmin &&
              order.isPaid &&
              !order.isDelivered && (
                <ListGroup.Item>
                  <Button
                    type="button"
                    className="btn-block col-12"
                    onClick={deliverHandler}
                  >
                    Mark as Delivered
                  </Button>
                </ListGroup.Item>
              )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default OrderScreen;
