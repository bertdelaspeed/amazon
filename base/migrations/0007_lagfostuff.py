# Generated by Django 3.2.2 on 2021-07-16 09:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0006_review_createdat'),
    ]

    operations = [
        migrations.CreateModel(
            name='LagfoStuff',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('paymentDetails', models.JSONField()),
            ],
        ),
    ]