import React, { userState, useEffect, useState } from "react";
import { Form, Button, Col } from "react-bootstrap";

import FormContainer from "../components/FormContainer";
import CheckoutSteps from "../components/CheckoutSteps";
import { useDispatch, useSelector } from "react-redux";
import { savePaymentMethod } from "../actions/cartActions";

function PaymentScreen({ history }) {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const dispatch = useDispatch();

  const [paymentMethod, setPaymentMethod] = useState("PayPal");

  if (!shippingAddress.address) {
    history.push("/shipping");
  }

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    history.push("/placeorder");
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as="legend">Select Method</Form.Label>
          <Col>
            <Form.Check
              type="radio"
              label="PayPal or Credit Card"
              id="paypal"
              name="paymentMethod"
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
          </Col>
          <Col>
            <Form.Check
              type="radio"
              label="Lagfo"
              id="lagfo"
              name="paymentMethod"
              onChange={() => setPaymentMethod("Lagfo")}
            ></Form.Check>
          </Col>
        </Form.Group>

        <Button type="submit" variant="primary">
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
}

export default PaymentScreen;
