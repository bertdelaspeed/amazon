
from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from base.models import Product, Order, OrderItem, ShippingAddress,LagfoStuff

from base.serializers import ProductSerializer, OrderSerializer, LagfoPaymentSerializer

from rest_framework import status
from datetime import datetime
import json
import requests
from django.shortcuts import redirect
from django.http import HttpResponseRedirect



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addOrderItems(request):

    user = request.user
    data = request.data

    orderItems = data['orderItems']

    if orderItems and len(orderItems) == 0:
        return Response({'detail' : 'No Order Items'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # 1. create order
        order = Order.objects.create(
            user = user,
            paymentMethod = data['paymentMethod'],
            taxPrice = data['taxPrice'],
            shippingPrice = data['shippingPrice'],
            totalPrice = data['TotalPrice']
        )
        # 2. create shipping address
        shipping = ShippingAddress.objects.create(
            order = order,
            address = data['shippingAddress']['address'],
            city = data['shippingAddress']['city'],
            postalCode = data['shippingAddress']['postalCode'],
            country = data['shippingAddress']['country'],

        )
        # 3. create order items and set order to oderItem relationship
        for i in orderItems:
            product = Product.objects.get(_id=i['product'])

            item = OrderItem.objects.create(
                product = product,
                order = order,
                name = product.name,
                qty = i['qty'],
                price = i['price'],
                image = product.image.url,
            )
        # 4. update stock

            product.countInStock -= item.qty
            product.save()

        serializer = OrderSerializer(order, many=False)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrder(request):
    user = request.user
    orders = user.order_set.all()
    serializer = OrderSerializer(orders, many=True)
    return Response (serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getOrders(request):
    
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response (serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrderbyId(request, pk):

    user = request.user

    try:
        order = Order.objects.get(_id=pk)
        if user.is_staff or order.user == user:
            serializer = OrderSerializer(order, many=False)
            return Response(serializer.data)
        else:
            Response({'detail':'Not Authorized to view this order'}, status=status.HTTP_400_BAD_REQUEST)
    
    except:
        return Response({'detail':'Order does not exist'}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateOrderToPaid(request, pk):
    order = Order.objects.get(_id=pk)

    order.isPaid = True
    order.paidAt = datetime.now()
    order.save()
    
    return Response('Order was paid')


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateOrderToDelivered(request, pk):
    order = Order.objects.get(_id=pk)

    order.isDelivered = True
    order.deliveredAt = datetime.now()
    order.save()
    
    return Response('Order was delivered')


@api_view(['POST'])
def getPaymentDetails(request):
    data = request.data
    payment = LagfoStuff.objects.create(
        paymentDetails = data
    )
    serializer = LagfoPaymentSerializer(payment, many=False)
    last = LagfoStuff.objects.last()
    # details = json.dumps(last.paymentDetails)
    # print(details)
    details = (last.paymentDetails)
    print(details)
    print((details.keys()))
    print((details.values()))
    print('cmd id value :', details['command_id'])
    print('price id value :', details['price'])

    headers = {"Content-Type": "application/json","Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIwMDAxLjAwMDYuODY4In0.aWIEppGR5Vye-UwJ-jQr12f7KQNIsoVE1rvTMPgpUuo"}
    url = "https://apps.lagfo.com/v1/send/data/"
    payload = {"payment_data":{
        "command_id":details['command_id'],
        "price":details['price']},
        "data":{"return_url":"https://www.youtube.com/results?search_query=python+requests",
        "cancel_url":"https://jsonformatter.curiousconcept.com/#",
        "shop_code":1}}
    r = requests.post(url, headers=headers, json=payload)
    print('request made to lagfo result : ', r.text)
    result = r.text
    result=json.loads(result)
    print(type(result))
    print('status = ',result['status'])
    if result['status'] == 1:
        print ('payment token = ', result['payment_token'])
        # return HttpResponseRedirect('https://welcome.lagfo.com/payment/'+result['payment_token'])
        # print('LINK = https://welcome.lagfo.com/payment/'+result['payment_token'])
        return redirect('https://welcome.lagfo.com/payment/'+result['payment_token'])

    # jsonvalues = json.loads(last.paymentDetails)
    # print('the values ? ',jsonvalues)
    # return Response(serializer.data)
    
    


