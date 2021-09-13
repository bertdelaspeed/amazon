from django.urls import path
from base.views import order_views as views



urlpatterns = [
    path('', views.getOrders, name='orders'),
    path('add/', views.addOrderItems, name='orders-add'),
    path('myorders/', views.getMyOrder, name='myorders'),
    path('lagfoDetails/', views.getPaymentDetails, name='lagfopayment'),


    path('<str:pk>/deliver/', views.updateOrderToDelivered, name='order-delivered'),
    
    path('<str:pk>/', views.getOrderbyId, name='user-order'),
    path('<str:pk>/pay/', views.updateOrderToPaid, name='pay'),
]