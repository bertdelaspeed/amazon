# Generated by Django 3.2.2 on 2021-05-17 08:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0004_rename_numreviewes_product_numreviews'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='image',
            field=models.ImageField(blank=True, default='/sample.jpg', null=True, upload_to=''),
        ),
    ]
